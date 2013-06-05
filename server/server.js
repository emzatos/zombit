klass = require('klass');
var level = require('../level.js');
var utils = require('../utils.js');
var io = require('socket.io').listen(8001);

//make level
var gameLevel = generateRectRooms(100,100,20);

//temp
var ccx = 0;
var ccy = 0;

io.sockets.on('connection', function (socket) {
  
  socket.on('setnick', function (name) {
    socket.set('nickname', name, function () {
      socket.emit('ready');
    });
  });

  socket.on('msg', function (msg) {
    socket.get('nickname', function (err, name) {
      console.log('Msg recv from ' + name + ": " + msg.content);
    });
  });
  
  var tileUpdates = setInterval(function() {
	var chunk = gameLevel.getChunk(ccx*chunkSize,ccy*chunkSize,chunkSize,chunkSize);
	socket.emit("chunk",chunk);
	
	ccx+=1;
	if (ccx>gameLevel.getWidth()/chunkSize) {ccx=0; ccy+=1;}
	if (ccy>gameLevel.getHeight()/chunkSize) {
		ccx=0; 
		ccy=0;
		gameLevel = generateNoise(100,100,[WALL,FLOOR,FLOOR,FLOOR,FLOOR]);
	}
  },10);
});