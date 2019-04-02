//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var twilio = require("twilio");
var fs = require("fs");
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var tc;

if (process.env.TW_ACCSID){
  tc = twilio(process.env.TW_ACCSID,process.env.TW_AUTH);
}
else {
  var twilioCreds = fs.readFileSync("account.creds","utf8").split("\n");
  tc = twilio(twilioCreds[0], twilioCreds[1]);
}


router.use("/public",express.static(path.resolve(__dirname, 'public')));
router.use("/",express.static(path.resolve(__dirname, 'pages')));

var messages = [];

var sockets = [];

var numbers =  new Set();

var userNumber = "";

io
.of("/dashboard")
.on('connection', function (socket) {
    
    tc.messages.each(function(m){
      numbers.add(m.to).add(m.from);
      let dir = m.direction.split("-")[0];
      let dateSent = m.dateSent.getTime();
      
      if (userNumber === ''){
        
        if (dir == "outbound"){
          userNumber = m.from;
        }
        else {
          userNumber = m.to
        }
        socket.emit('userNumber',userNumber);
      }
      var data = {
        to: m.to,
        from: m.from,
        text: m.body,
        dir: dir,
        dateSent: dateSent 
      };
      socket.emit('message',data);
      socket.emit('numbers',Array.from(numbers));

      
      
    });
    
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('message', function (msg) {
      var text = String(msg.body || '');

      if (!text){
        return;
      }
      sendTextMsg(msg,socket);
      console.log(`to ${msg.to} \t from ${msg.from} \t body \n${text}`);
    });
    
});

io
.of("/blast")
.on("connection", function(socket) {
  if (userNumber == ""){
    tc.message.each( (m) => {
      if (userNumber == ""){
        if (m.direction == "inbound") {
          userNumber = m.to;
        }
        else {
          userNumber = m.from;
        }
      }
    });
    socket.emit("userNumber",userNumber);
  }
  else {
    socket.emit("userNumber",userNumber);
  }
  
  socket.on('message', function (msg) {
    var text = String(msg.body || '');

    if (!text){
      return;
    }
    
    sendTextMsg(msg,socket);
    console.log(`to ${msg.to} \t from ${msg.from} \t body \n${text}`);
    
  });

  

});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

function sendTextMsg(msg,socket){
  tc.messages.create({
      to: msg.to,
      from: msg.from,
      body: msg.body
    })
    .then((m) => {
      console.log(m.sid);
      socket.emit("messageSent",m.sid);
    })
    .done();
}
