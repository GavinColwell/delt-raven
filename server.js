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


router.use(express.static(path.resolve(__dirname, 'client')));

var messages = [];

var sockets = [];

var numbers =  new Set();

var userNumber = "";

io.on('connection', function (socket) {
    
    tc.messages.each(function(m){
      numbers.add(m.to).add(m.from);
      let dir = m.direction.split("-")[0];
      if (userNumber === '' && dir == 'outbound'){
        userNumber = m.from;
      }
      var data = {
        to: m.to,
        from: m.from,
        text: m.body,
        dir: dir
      };
      socket.emit('message',data);
      socket.emit('numbers',Array.from(numbers));
      socket.emit('userNumber',userNumber);
      
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
      console.log(`to ${msg.to} \t from ${msg.from} \t body \n${text}`);
    });
    
  });

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
