/**
 * @file tuber-time web server.
 * @version 2.0.0
 */

'use strict';

var easyrtc = require('open-easyrtc');
var express = require('express');
var io = require('socket.io');
var bodyParser = require('body-parser')
const request = require('request')
const cors = require('cors')

var webServer = null;
var webrtcApp = express();

const corsOpts = {
   origin: '*',
   methods: [
     'GET',
     'POST',
   ],
   allowedHeaders: [
     'Content-Type',
   ],
};

webrtcApp.use(cors(corsOpts));
webrtcApp.use(function(req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();
});

webrtcApp.use(bodyParser.urlencoded({ extended: false }))
webrtcApp.use(bodyParser.json())
// Set up routes for static resources
webrtcApp.use('/', express.static(__dirname + '/public'));
webrtcApp.use('/room', express.static(__dirname + '/public'));
webrtcApp.use('/login', express.static(__dirname + '/public'));
webrtcApp.use('/join', express.static(__dirname + '/public'));
webrtcApp.use('/js', express.static(__dirname + '/public/js'));
webrtcApp.use('/static', express.static(__dirname + '/public/static'));
webrtcApp.use('/static/css', express.static(__dirname + '/public/static/css'));
webrtcApp.use('/static/js', express.static(__dirname + '/public/static/js'));
webrtcApp.use('/static/media', express.static(__dirname + '/public/static/media'));

var pwd = "Lokesh09876"
var rooms = {}

webrtcApp.get('/crmmeeting/joinurl', function(req, res){
   // const { meeting_id, return_url, username, password } = req.body
   const meeting_id = '107e1d63-34e3-cd9f-6da8-5d4272218021'
   const return_url = 'https://crm.contactprocrm.com/index.php?entryPoint=WebRTC&action=history&username=admin'
   const username = "admin"
   const password = "Lokesh09876"

   // Store datas from PHP backend
   if (password === pwd) {
      var meetingIDs = meeting_id.split("-")    
      
      var room_name = username + '-' + meetingIDs[1] + meetingIDs[2] + meetingIDs[3]
      // var sub_url = username + meeting_id.replace(/-/g, '')
      var create_url = 'https://chat.contactprocrm.com/login?room=' + room_name + '&username=' + username
      var join_url = 'https://chat.contactprocrm.com/join?room=' + room_name

      rooms[room_name] = {meeting_id: meeting_id, return_url: return_url, enterRoom: false, chat: [], file: [], child: []}
      console.log('rooms on joinUrl--------------:', rooms)
      
      res.send({create_url: create_url, join_url: join_url});
   }
})

webrtcApp.post('/checkValidRoom', function(req, res) {
   const { type, roomName } = req.body

   if( type == 0) { //0: owner, 1: user
      if (rooms[roomName]) {
         res.send(true)
         rooms[roomName].enterRoom = true
      }
      else
         res.send(false)
   } else {
      if (rooms[roomName] && rooms[roomName].enterRoom)
         res.send({ status: 0}) // room & owner available
      else if (rooms[roomName] && !rooms[roomName].enterRoom)
         res.send({ status: 1}) // room available & owner not available
      else 
         res.send({ status: 2}) // room not available & owner not available
   }
})

// Catch all to handle all other requests that come into the app.
webrtcApp.use('*', (req, res) => {
  res.status(404).json({ msg: 'Not Found' })
})

// By default the listening server port is 8080 unless set by nconf or Heroku
// var serverPort = 3000;
var serverPort = 3222;

webServer = require('http').createServer(webrtcApp).listen(serverPort);
console.log("Http server is running on Port: " + serverPort)
var socketServer = io.listen(webServer, { 'log level': 0 });


// Set up easyrtc specific options
easyrtc.setOption('demosEnable', false);

// Use appIceServers from settings.json if provided. The format should be the same
// as that used by easyrtc (http://easyrtc.com/docs/guides/easyrtc_server_configuration.php)
easyrtc.setOption('appIceServers', [
    {
       'url': 'turn:turn.contactprocrm.com:3478',"username":"bruno","credential":"crmsite"
    },
    {
       'url': 'turn:csturn.contactprocrm.com:3478',"username":"bruno","credential":"crmsite"
    }
]);
easyrtc.listen(webrtcApp, socketServer);

/// Chating
const saveMsgContent = (peerId, peerName, roomName, content)=>{
   const retMessage = {username:peerName, message: content.message, time: content.time}
   const retFile = {username:peerName, content: content.message, time: content.time, name: content.title}
   
   if(rooms[roomName]){
      content.title ? rooms[roomName].file.push(retFile) : rooms[roomName].chat.push(retMessage)
   }
}

easyrtc.events.on("easyrtcMsg", function(connectionObj, message, callback) {
   switch(message.msgType){
      case 'save_message_content':
         saveMsgContent(message.msgData.clientId, message.msgData.clientName, message.msgData.roomName, message.msgData.content);
      
      return true
   }
   connectionObj.events.emitDefault("easyrtcMsg", connectionObj, message, callback);
});

easyrtc.events.on("roomLeave", function(connectionObj, roomName, callback){
   connectionObj.events.emitDefault("roomLeave", connectionObj, roomName, callback);

   if (roomName != 'default') {
      if (!rooms[roomName]){
         console.error('ERROR!!!', roomName, rooms)
      }else{
         console.log('roomLeave -------------------------', rooms, roomName)
         if (rooms[roomName].owner === connectionObj.socket.id) {
            var duration = Math.floor((Date.now() - rooms[roomName].enterTime ) / 1000);

            if (!rooms[roomName]) {
              console.error('ERROR!!! Join URL first.')
              return;
            }

            const exithistory = {meeting_id: rooms[roomName].meeting_id, duration: duration, chat: rooms[roomName].chat, file: rooms[roomName].file}
            console.log('history -------------------------', rooms, roomName, exithistory)
            
            for(const childConnectionObj of rooms[roomName].child){
               childConnectionObj.disconnect(()=>{});
            }
            // delete rooms[roomName];
            
            request.post(rooms[roomName].return_url, {
               json: {
                  reqData: exithistory
               }
            }, (error, res, body) => {
               if (error) {
                  console.error(error)
                  return
               }
               rooms[roomName].enterRoom = false
               rooms[roomName].chat = []
               rooms[roomName].file = []
               rooms[roomName].child = []
               // delete rooms[roomName];
            })
         }
      }
   }
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParam, callback){
   if (roomName != 'default') {
      console.log('join rooms: before: ', roomName, rooms)
      if(!rooms[roomName])
         return

      if(rooms[roomName].enterRoom && rooms[roomName].child.length === 0) {
         rooms[roomName].enterTime = Date.now()
         rooms[roomName].owner = connectionObj.socket.id
         rooms[roomName].chat = []
         rooms[roomName].file = []
         rooms[roomName].child.push(connectionObj); // means owner
         // rooms[roomName] = {enterTime: Date.now(), enterRoom: true, owner: connectionObj.socket.id, chat: [], file: [], child: []};
      }
      console.log('join rooms: after: ', roomName, rooms)
   }
   connectionObj.events.emitDefault("roomJoin", connectionObj, roomName, roomParam, callback);
});

 