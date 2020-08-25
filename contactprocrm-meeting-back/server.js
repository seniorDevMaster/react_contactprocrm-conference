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
const path = require('path');

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
webrtcApp.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
   res.setHeader('Access-Control-Allow-Credentials', true);
   next();
});

webrtcApp.use(bodyParser.urlencoded({ extended: false }))
webrtcApp.use(bodyParser.json())
// Set up routes for static resources
// webrtcApp.use('/', express.static(__dirname + '/public'));
// webrtcApp.use('/room', express.static(__dirname + '/public'));
// webrtcApp.use('/login', express.static(__dirname + '/public'));
// webrtcApp.use('/join', express.static(__dirname + '/public'));
// webrtcApp.use('/js', express.static(__dirname + '/public/js'));
// webrtcApp.use('/static', express.static(__dirname + '/public/static'));
// webrtcApp.use('/static/css', express.static(__dirname + '/public/static/css'));
// webrtcApp.use('/static/js', express.static(__dirname + '/public/static/js'));
// webrtcApp.use('/static/media', express.static(__dirname + '/public/static/media'));

webrtcApp.use(express.static(path.join(__dirname, 'public')));
webrtcApp.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

class Global {
   static password = "Lokesh09876"
   static rooms = {}
   // Listening server port
   static serverPort = 3000
   static makeRoomNameFrom(username, meetingId) {
      const meetingIDs = meetingId.split("-")
      return username + '-' + meetingIDs[1] + meetingIDs[2] + meetingIDs[3]
   }
   static makeOwnerUrl(roomName, userName) {
      return 'https://chat.contactprocrm.com/#/login?room=' + roomName + '&username=' + userName
   }
   static makeJoinerUrl(roomName) {
      return 'https://chat.contactprocrm.com/#/join?room=' + roomName
   }
}
class RoomInfo {
   constructor(meeting_id, accessDate, return_url, create_url, join_url, enter_room, owner = '', enterTime = '', chat = [], file = [], child = []) {
      this.meeting_id = meeting_id;
      this.accessDate = accessDate;
      this.return_url = return_url;
      this.create_url = create_url;
      this.join_url = join_url;
      this.enter_room = enter_room;
      this.owner = owner;
      this.enterTime = enterTime;
      this.chat = chat;
      this.file = file;
      this.child = child;
   }
}

class Debug {
   static MODE = 'DEBUG' // 'PRODUCTION', 'FILE'
   static log(main, detail = '') {
      // if (Debug.MODE === 'DEBUG') console.log(main + "\t", detail);
   }
   static err(main, detail = '') {
      // if (Debug.MODE === 'DEBUG') console.error(main + "\t", detail);
   }

}
class Sqlite {
   static _sqlite = null
   // Static function to create instance if not exists and return its instance.
   static getInstance() {
      if (!Sqlite._sqlite) {
         Sqlite._sqlite = new Sqlite()
      }
      return Sqlite._sqlite;
   }

   // Load sqlite3 library and open database
   constructor() {
      this.sqlite3 = require('sqlite3').verbose();
      Debug.log("SQLite: open database.");
      this.db = new this.sqlite3.Database('crmcontact.db', function (err) {
         Debug.err('  Failed in opening database.', err)
      });
   }

   // Initialize Sqlite (migaration and load saved data)
   init() {
      Debug.log("SQLite: initialize.");
      this.migration();
      this.loadData();
   }
   // Migration Sqlite. Function to create data table if it is not exists.
   migration() {
      Debug.log("SQLite: execute migration.");
      this.db.run("CREATE TABLE if not exists meeting (meeting_id TEXT PRIMARY KEY, access_date TEXT,  return_url TEXT, create_url TEXT, join_url TEXT, room_name TEXT, enter_room TEXT)",
         function (err) {
            if (err) Debug.err('  Failed in migration database.', err)
         }
      );
   }

   // Load initial value
   loadData() {
      Debug.log("SQLite: load initial data.");
      this.db.each("SELECT meeting_id, access_date, return_url, create_url, join_url, room_name, enter_room FROM meeting",
         function (err, row) {
            if (err) {
               Debug.err(' Failed in load initial data.', err)
            } else {
               Global.rooms[row.room_name] = { meeting_id: row.meeting_id, access_date: row.access_date, return_url: row.return_url, create_url: row.create_url, join_url: row.join_url, enter_room: row.enter_room, owner: '', enterTime: '', chat: [], file: [], child: [] }
               Debug.log(' Initial room data.', Global.rooms[row.room_name])
            }
         }
      );
   }

   // Create room
   createRoom(meeting_id, return_url, create_url, join_url, room_name) {
      Debug.log('SQLite: create room.', { meeting_id, return_url, create_url, join_url, room_name })
      const stmt = this.db.prepare("INSERT INTO meeting VALUES (?,?,?,?,?,?,?)");
      const cur_date = new Date().toLocaleTimeString();
      stmt.run(meeting_id, cur_date, return_url, create_url, join_url, room_name, 'leave');
      stmt.finalize();
      Global.rooms[room_name] = new RoomInfo(meeting_id, cur_date, return_url, create_url, join_url, 'leave')
   }

   ownerStatus(roomName, status) {
      Debug.log('SQLite: enter owner.', roomName)
      this.db.run("UPDATE meeting SET enter_room=?, owner=? WHERE room_name=?",
         [
            status,
            roomName,
            roomName
         ],
         function (err) {
            if (err) {
               return Debug.err('SQLite:  Failed in entering owner', err.message);
            }
         }
      );
   }
}
Sqlite.getInstance().init()

webrtcApp.post('/crmmeeting/joinurl', function (req, res) {
   const { meeting_id, return_url, username, password } = req.body
   if (password === Global.password) {
      // make variables from request.
      var room_name = Global.makeRoomNameFrom(username, meeting_id)
      var create_url = Global.makeOwnerUrl(room_name, username)
      var join_url = Global.makeJoinerUrl(room_name)
      // Save room info to Sqlite database
      Sqlite.getInstance().createRoom(meeting_id, return_url, create_url, join_url, room_name)
      // response to client
      res.send({ room_name: room_name, create_url: create_url, join_url: join_url });
   }
})

webrtcApp.post('/checkValidRoom', function (req, res) {
   const { type, roomName } = req.body
   const [TYPE_OWNER, TYPE_USER] = [0, 1]
   switch (type) {
      case TYPE_OWNER:
         if (Global.rooms[roomName]) {
            Global.rooms[roomName].enter_room = 'enter'
            Global.rooms[roomName].owner = roomName;
            Sqlite.getInstance().ownerStatus(roomName, 'enter');
            res.send(true)
         } else {
            res.send(false)
         }
         break;
      case TYPE_USER:
         // room & owner available
         if (Global.rooms[roomName] && Global.rooms[roomName].enter_room === 'enter') res.send({ status: 0 }) 
         // room available & owner not available
         if (Global.rooms[roomName] && Global.rooms[roomName].enter_room === 'leave') res.send({ status: 1 }) 
         // room not available & owner not available
         if (!Global.rooms[roomName]) res.send({ status: 2 }) 
         break;
   }
})

// Catch all to handle all other requests that come into the app.
webrtcApp.use('*', (req, res) => {
   res.status(404).json({ msg: 'Not Found' })
})

webServer = require('http').createServer(webrtcApp).listen(Global.serverPort);
Debug.log("Http server is running on Port: " + Global.serverPort)
const socketServer = io.listen(webServer, { 'log level': 0 });

// Set up easyrtc specific options
easyrtc.setOption('demosEnable', false);

// Use appIceServers from settings.json if provided. The format should be the same
// as that used by easyrtc (http://easyrtc.com/docs/guides/easyrtc_server_configuration.php)
easyrtc.setOption('appIceServers', [
   {
      'url': 'turn:turn.contactprocrm.com:3478', "username": "bruno", "credential": "crmsite"
   },
   {
      'url': 'turn:csturn.contactprocrm.com:3478', "username": "bruno", "credential": "crmsite"
   },
   {
      'url': 'turn:india.contactprocrm.com:3478', "username": "bruno", "credential": "brunoedward"
   }
]);
easyrtc.listen(webrtcApp, socketServer);

/// Chating
const saveMsgContent = (peerName, roomName, content) => {
   const retMessage = { username: peerName, message: content.message, time: content.time }
   const retFile = { username: peerName, content: content.message, time: content.time, name: content.title }

   if (Global.rooms[roomName]) {
      content.title ? Global.rooms[roomName].file.push(retFile) : Global.rooms[roomName].chat.push(retMessage)
   }
}

easyrtc.events.on("easyrtcMsg", function (connectionObj, message, callback) {
   switch (message.msgType) {
      case 'save_message_content':
         saveMsgContent( message.msgData.clientName, message.msgData.roomName, message.msgData.content);
         // saveMsgContent(message.msgData.clientId, message.msgData.clientName, message.msgData.roomName, message.msgData.content);

         return true
   }
   connectionObj.events.emitDefault("easyrtcMsg", connectionObj, message, callback);
});

// Owner leave the Room via socket.io
easyrtc.events.on("roomLeave", function (connectionObj, roomName, callback) {  
   connectionObj.events.emitDefault("roomLeave", connectionObj, roomName, callback);
   if (roomName != 'default') {
      if (!Global.rooms[roomName]) {
         Debug.err(' RoomLeave. ', roomName)
      } else {
         // if (Global.rooms[roomName].owner === roomName) {
         if (Global.rooms[roomName].owner === roomName && Global.rooms[roomName].child[0].socket.id === connectionObj.socket.id) {
            var duration = Math.floor((Date.now() - Global.rooms[roomName].enterTime) / 1000);

            const exithistory = { meeting_id: Global.rooms[roomName].meeting_id, duration: duration, chat: Global.rooms[roomName].chat, 
                                    file: Global.rooms[roomName].file }
            // console.log(' Chatting History: ', roomName, Global.rooms[roomName], exithistory)

            for (const childConnectionObj of Global.rooms[roomName].child) {
               childConnectionObj.disconnect(() => { });
            }

            request.post(Global.rooms[roomName].return_url, {
               json: {
                  reqData: exithistory
               }
            }, (err, res, body) => {
               if (err) {
                  Debug.err(' Failed in sending room history. ', err)
                  return
               }

               Global.rooms[roomName].enter_room = 'leave'
               Global.rooms[roomName].owner = ''
               Global.rooms[roomName].chat = []
               Global.rooms[roomName].file = []
               Global.rooms[roomName].child = []
               // Sqlite.getInstance().ownerStatus(roomName, 'leave');
            })
         }
      }
   }
});

// Owner Join the Room via socket.io
easyrtc.events.on("roomJoin", function (connectionObj, roomName, roomParam, callback) {  // Owner create the Room
   if (roomName != 'default') {
      if (!Global.rooms[roomName])
         return

      if (Global.rooms[roomName].child.length === 0) {
         Global.rooms[roomName].enterTime = Date.now()
         Global.rooms[roomName].owner = roomName
         Global.rooms[roomName].chat = []
         Global.rooms[roomName].file = []
         Global.rooms[roomName].child.push(connectionObj); // means owner
      }
      // console.log(' All data after joining to room', Global.rooms[roomName].child, Global.rooms[roomName].child[0].socket.id)
   }
   connectionObj.events.emitDefault("roomJoin", connectionObj, roomName, roomParam, callback);
});