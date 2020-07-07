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
var uname, username, pwd, password, meeting_id, return_url
// var join_sub_url
// var join_sub_urls = []
webrtcApp.get('/crmmeeting', function(req, res){
   // const { meeting_id, return_url, username, password } = req.body

   // Store datas from PHP backend
   if (username === uname && password === pwd) {
      var meetingIDs = meeting_id.split("-")
      // join_sub_url = username + meetingIDs[0]
      // join_sub_urls.push(join_sub_url)
      // console.log('join_sub_url: ', join_sub_url, join_sub_urls)

      var join_url = 'https://chat.contactprocrm.com/join?room=' + username + meetingIDs[0]
      res.send(join_url);
   }
})
// Catch all to handle all other requests that come into the app.
webrtcApp.use('*', (req, res) => {
  res.status(404).json({ msg: 'Not Found' })
})

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('crmcontact.db');

uname = "admin"
username = "admin"
pwd = "Lokesh09876"
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
var msgContent = {}
var messageContent = []
var rooms = []

const saveMsgContent = (peerId, peerName, roomName, content)=>{
   const retContent = {name:peerName, message: content.message, time: content.time, title: content.title}
   
   messageContent.push(retContent);
   msgContent.roomName = messageContent
}

easyrtc.events.on("easyrtcMsg", function(connectionObj, message, callback, next) {
   switch(message.msgType){
      case 'save_message_content':
         const content = saveMsgContent(message.msgData.clientId, message.msgData.clientName, message.msgData.roomName, message.msgData.content);
         callback({msgType:'set_message_content', msgData: content})
         return true;
   }
  connectionObj.events.emitDefault("easyrtcMsg", connectionObj, message, callback, next);
});

easyrtc.events.on("roomLeave", function(connectionObj, roomName, callback){
   if (roomName != 'default') {
      connectionObj.events.emitDefault("easyrtcMsg", connectionObj, {msgType:'close', targetRoom: roomName}, callback);
      
      const exitRoom = rooms.filter((room)=>room.name == roomName)
      console.log('exitRoom: ', exitRoom)
      exitRoom['exittime'] = connectionObj.socket.handshake.time
      console.log('roomLeave: exit room:----- ', exitRoom, msgContent)
      
      rooms = rooms.filter((room)=>room.name !== roomName)
      console.log('roomLeave: rooms:----- ', rooms)
   }
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParam, callback){
   if (roomName != 'default') {
      const roomInfo = {name: roomName, entertime: connectionObj.socket.handshake.time}
      rooms.push(roomInfo)

      rooms = Array.from(new Set(rooms.map(a => a.name)))
      .map(name => {
         return rooms.find(a => a.name === name)
      })
      
      console.log('roomJoin :', rooms)
   }
   connectionObj.events.emitDefault("roomJoin", connectionObj, roomName, roomParam, callback);
 });