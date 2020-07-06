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

webrtcApp.get('/crmmeeting', function(req, res){
   const { meeting_id, return_url, username, password } = req.body
   res.send('Maciel Backend Server is Running.');
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
var msgContent = []
const saveMsgContent = (peerId, peerName, content)=>{
   const retContent = {name:peerName, message: content.message, time: content.time}
   msgContent.push(retContent);
}

easyrtc.events.on("easyrtcMsg", function(connectionObj, message, callback, next) {
   switch(message.msgType){
      case 'save_message_content':
         const content = saveMsgContent(message.msgData.clientId, message.msgData.clientName, message.msgData.content);
         console.log('msgContent: ',msgContent, connectionObj)
         callback({msgType:'set_message_content', msgData: content})
         return true;
   }
  connectionObj.events.emitDefault("easyrtcMsg", connectionObj, message, callback, next);
});

var sqlite3 = require('sqlite3').verbose();
var file = "hr";
var db = new sqlite3.Database(file);
db.all("SELECT first_name,last_name FROM employees", function(err, rows) {
        rows.forEach(function (row) {
            console.log(row.first_name, row.last_name);
        })
	});	
db.close();