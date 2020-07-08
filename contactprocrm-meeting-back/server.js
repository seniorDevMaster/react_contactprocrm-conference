/**
 * @file tuber-time web server.
 * @version 2.0.0
 */

'use strict';

var easyrtc = require('open-easyrtc');
var express = require('express');
var fs = require('fs');
var Handlebars = require('handlebars');
var io = require('socket.io');
const request = require('request')

var webServer = null;
var webrtcApp = express();

var debugMode = false;
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
// webrtcApp.get('/', function(req, res){
//     res.send('Maciel Backend Server is Running.');
// });
var meetingId, returnUrl
var joinInfo = {}
var uname = "admin"
var pwd = "Lokesh09876"
var rooms = {}

// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('crmcontact.db');
// var resData = {}
// var joinUrl = []
// db.serialize(function() {
//    db.run("CREATE TABLE if not exists meeting (dt TEXT, meeting_id TEXT, return_url TEXT)");
   
//    db.get("SELECT COUNT(*) as cnt FROM meeting WHERE meeting_id=?", [meeting_id], (err, row) => {
//       if (err) {
//         return console.error(err.message);
//       }
//       if (row.cnt == 0) {
//          var stmt = db.prepare("INSERT INTO meeting VALUES (?,?,?)");
//          var date = new Date();
//          var cur_date = date.toLocaleTimeString();
//          stmt.run(cur_date, meeting_id, return_url);
//          stmt.finalize();
//       } else {
//          console.log('duplicate meeting id: ', meeting_id)
//       }
//       return true
//    });

//    db.each("SELECT dt, meeting_id, return_url FROM meeting", function(err, row) {
//       console.log("User id : "+row.dt, row.meeting_id, row.return_url);
//    });
// });


webrtcApp.get('/crmmeeting/joinurl', function(req, res){
   const { meeting_id, return_url, username, password } = req.body

   // const meeting_id = '107e1d63-34e3-cd9f-6da8-5d4272218021'
   // const return_url = 'https://crm.contactprocrm.com/index.php?entryPoint=WebRTC&action=history&username=admin'
   // const username = "admin"
   // const password = "Lokesh09876"

   meetingId = meeting_id
   returnUrl = return_url
   // Store datas from PHP backend
   if (username === uname && password === pwd) {
      var meetingIDs = meeting_id.split("-")    
      var sub_url = username + meetingIDs[2] + meetingIDs[3]

      joinInfo[sub_url] = {meeting_id: meeting_id, return_url: return_url}
      console.log('joinInfo--------------:', joinInfo)
      
      var join_url = 'https://chat.contactprocrm.com/join?room=' + sub_url
      res.send(join_url);
   }
})
// db.close();

// webrtcApp.get('/crmmeeting/gethistory', function(req, res){
//    // const { username, password, meeting_id, return_url } = req.body
//    const username = "admin"
//    const password = "Lokesh09876"
//    const meeting_id = '107e1d63-34e3-cd9f-6da8-5d4272218021'
//    const return_url = 'https://crm.contactprocrm.com/index.php?entryPoint=WebRTC&action=history&username=admin'

//    // meeting_id: meetingId, return_url: returnUrl

//    // Store datas from PHP backend
//    if (username === uname && password === pwd) {
//       var meetingIDs = meeting_id.split("-")    
//       var sub_url = username + meetingIDs[2] + meetingIDs[3]
//       console.log('Get history: ', sub_url, resData)

//       resData[sub_url].meeting_id = meeting_id
//       resData[sub_url].return_url = return_url

//       res.send(resData[sub_url]);

//       delete resData[sub_url];
//    }
// })
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
   
   content.title ? rooms[roomName].file.push(retFile) : rooms[roomName].chat.push(retMessage)
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
   console.log("roomLeave called", roomName, connectionObj)
   if (roomName != 'default') {
      if (!rooms[roomName]){
         console.error('ERROR!!!', roomName, rooms)
      }else{
         if (rooms[roomName].owner === connectionObj.socket.id) {
            var duration = Math.floor((Date.now() - rooms[roomName].enterTime ) / 1000);
            // const exithistory = {meeting_id: meetingId, return_url: returnUrl, duration: duration, chat: rooms[roomName].chat, file: rooms[roomName].file}
            // resData[roomName] = exithistory
            
            for(const childConnectionObj of rooms[roomName].child){
               childConnectionObj.disconnect(()=>{});
            }
            delete rooms[roomName];
            
            const exithistory = {meeting_id: joinInfo[roomName].meeting_id, duration: duration, chat: rooms[roomName].chat, file: rooms[roomName].file}
            request.post(joinInfo[roomName].return_url, {
               json: {
                  reqData: exithistory
               }
            }, (error, res, body) => {
               if (error) {
                  console.error(error)
                  return
               }
               console.log(`statusCode: ${res.statusCode}`)
               console.log(body)
               delete joinInfo[roomName];
            })
            // console.log("Owner exit.", connectionObj, roomName, callback, connectionObj.getApp().room);
            // connectionObj.getApp().deleteRoom(roomName, callback);
            // return;
            // connectionObj.events.emitDefault("easyrtcMsg", connectionObj, {msgType:'close', targetRoom: roomName}, null, next);
            // connectionObj.events.emit("easyrtcMsg", connectionObj, {msgType:'close', targetRoom: roomName}, callback);
         }
      }
   }

   // connectionObj.removeConnection(callback);// .events.emitDefault("roomLeave", connectionObj, roomName, callback, next);
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParam, callback){
   if (roomName != 'default') {
      if(!rooms[roomName]){
         rooms[roomName] = {enterTime: Date.now(), owner: connectionObj.socket.id, chat: [], file: [], child: []};
      }
      rooms[roomName].child.push(connectionObj);
      console.log('join rooms: ', roomName, rooms)
   }
   connectionObj.events.emitDefault("roomJoin", connectionObj, roomName, roomParam, callback);
});

 