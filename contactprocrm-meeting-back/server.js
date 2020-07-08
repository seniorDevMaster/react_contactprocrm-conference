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
var username, password, meeting_id, return_url
var uname = "admin"
var pwd = "Lokesh09876"

webrtcApp.get('/crmmeeting', function(req, res){
   // const { meeting_id, return_url, username, password } = req.body
   
   // Store datas from PHP backend
   if (username === uname && password === pwd) {
      var meetingIDs = meeting_id.split("-")
      
      // chance.word() + '-' + chance.hash().substring(0, 8);

      var join_url = 'https://chat.contactprocrm.com/join?room=' + username + meetingIDs[2] + meetingIDs[3]
      res.send(join_url);
   }
})
// Catch all to handle all other requests that come into the app.
webrtcApp.use('*', (req, res) => {
  res.status(404).json({ msg: 'Not Found' })
})

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('crmcontact.db');


username = "admin"
password = "Lokesh09876"
meeting_id = "107e1d63-34e3-cd9f-6da8-5d4272218021"
return_url = "https://crm.contactprocrm.com/index.php?entryPoint=WebRTC&action=history"

db.serialize(function() {
   db.run("CREATE TABLE if not exists meeting (dt TEXT, meeting_id TEXT, return_url TEXT)");

   db.get("SELECT COUNT(*) as cnt FROM meeting WHERE meeting_id=?", [meeting_id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row.cnt == 0) {
         var stmt = db.prepare("INSERT INTO meeting VALUES (?,?,?)");
         var date = new Date();
         var cur_date = date.toLocaleTimeString();
         stmt.run(cur_date, meeting_id, return_url);
         stmt.finalize();
      } else {
         console.log('duplicate meeting id: ', meeting_id)
      }
      return true
   });
   
   db.each("SELECT dt, meeting_id, return_url FROM meeting", function(err, row) {
      console.log("User id : "+row.dt, row.meeting_id, row.return_url);
   });
});

// db.close();

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
var rooms = []
var resData = []

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
   if (roomName != 'default') {
      if (!rooms[roomName]){
         console.error('ERROR!!!', roomName, rooms)
      }else{
         if (rooms[roomName].owner === connectionObj.socket.id) {
            var duration = Math.floor((Date.now() - rooms[roomName].enterTime ) / 1000);
            resData = {meeting_id: meeting_id, duration: duration, chat: rooms[roomName].chat, file: rooms[roomName].file}

            delete rooms[roomName];
            console.log("Owner exit.", roomName, rooms, resData);
            connectionObj.events.emitDefault("easyrtcMsg", connectionObj, {msgType:'close', targetRoom: roomName}, callback);
         }
      }
   }
   connectionObj.events.emitDefault("roomLeave", connectionObj, roomName, callback);
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParam, callback){
   if (roomName != 'default') {
      if(!rooms[roomName]){
         rooms[roomName] = {enterTime: Date.now(), owner: connectionObj.socket.id, chat: [], file: []};
      }
   }
   connectionObj.events.emitDefault("roomJoin", connectionObj, roomName, roomParam, callback);
});

 