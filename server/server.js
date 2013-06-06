klass = require('klass');
var level = require('../level.js');
var utils = require('../utils.js');
var io = require('socket.io').listen(8001);
//io.set("log level",1); //disable debug logging

nicknames = new Array();

//make level
var gameLevel = generateRectRooms(100,100,20);


io.sockets.on('connection', function (socket) {
  function sendLevel() {
    var ccx = 0;
    var ccy = 0;

    function sendChunk() {
      var chunk = gameLevel.getChunk(ccx*chunkSize,ccy*chunkSize,chunkSize,chunkSize);
      socket.emit("chunk",chunk);
      
      ccx+=1;
      if (ccx>gameLevel.getWidth()/chunkSize) {ccx=0; ccy+=1;}
      if (ccy>gameLevel.getHeight()/chunkSize) {
        clearInterval(intv);
        socket.emit("ready");
      }
    }
    var intv = setInterval(sendChunk,20); //begin transmitting level
  }

  socket.on('setnick', function (name) {
    if (nicknames.indexOf(name)<0) {
      socket.set('nickname', name, function () {
        nicknames.push(name);
        sendLevel();
      });
    }
    else {
      socket.emit("kick",{reason: "Nickname in use, choose another."});
      socket.disconnect();
    }
  });

  socket.on('msg', function (msg) {
    socket.get('nickname', function (err, name) {
      console.log('msg (' + name + "): " + msg.content);
      socket.broadcast.emit("msg",{player: name, content: msg.content}); //echo message to all players
    });
  });
});