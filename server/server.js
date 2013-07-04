console.log("");
console.log("      d88888D  .d88b.  .88b  d88. d8888b. d888888b d888888b ");
console.log("      YP  d8' .8P  Y8. 88'YbdP`88 88  `8D   `88'   `~~88~~' ");
console.log("         d8'  88    88 88  88  88 88oooY'    88       88    ");
console.log("        d8'   88    88 88  88  88 88~~~b.    88       88    ");
console.log("       d8' db `8b  d8' 88  88  88 88   8D   .88.      88    ");
console.log("      d88888P  `Y88P'  YP  YP  YP Y8888P' Y888888P    YP    ");
console.log("");

mpActive = true; //shut up

klass = require('klass');
microtime = require('microtime');
//console.log("klass OK");
CircularJSON = require('circular-json');
//console.log("circular-json OK");
var entity = require('../entity.js');
//console.log("entity OK");
var level = require('../level.js');
//console.log("level OK");
var utils = require('../utils.js');
//console.log("utils OK");
var ftrig = require('../fasttrig.js');
//console.log("fasttrig OK");
var game = require('../server/game.js');
//console.log("game OK");


io = require('socket.io').listen(8001);
io.set("log level",1); //disable debug logging

nicknames = [];

io.sockets.on('connection', function (socket) {
  socket.keys = new Array(2048);

  //create a player
  socket.player = new Player(20,20,"Player",socket);
  socket.player.inv.push(new Pistol());
  socket.player.inv.push(new AssaultRifle());
  socket.player.inv.push(new Typhoon());
  socket.player.inv.push(new Gauss());
  socket.player.inv.push(new WoodenBat());
  
  console.dir(socket.player);
  console.log(" ---> ");
  console.dir(socket.player.serializable());

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
        socket.get('nickname', function(err, name) {
          socket.broadcast.emit("info", {display: true, content: name+" has joined the game!"});
        });
      }
    }
    var intv = setInterval(sendChunk,20); //begin transmitting level
  }

  socket.on('setnick', function (name) {
    if (nicknames.indexOf(name)<0) {
	  if (name.length<12) {
		  socket.set('nickname', name, function () {
			nicknames.push(name);
			//socket.emit("entity",CircularJSON.stringify(socket.player, safeJSON));
			//socket.emit("newent",makeNewent(socket.player));
			socket.player.name = name;
			socket.emit("entity",socket.player.serializable());
			socket.emit("playerind",socket.player.arrIndex);
			//console.dir(entities);
			sendLevel();
		  });
	  }
	  else {
		socket.emit("kick",{reason: "Nickname too long, must be less than 12 characters."});
		socket.disconnect();
	  }
    }
    else {
      socket.emit("kick",{reason: "Nickname in use, choose another."});
      socket.disconnect();
    }
  });

  socket.on('input', function(input) {
    if (input.type == INPUT_KB) {
      socket.keys[input.code] = input.val;
      console.log("Input: "+input.code+" to "+input.val);
    }
    else if (input.type == INPUT_MOUSE) {
	  if (input.btn) {
		socket.mouseLeft = input.state;
	  }
	  else if (input.facing) {
		socket.player.facing = input.facing;
	  }
	  else if (input.x && input.y) {
		socket.mouseX = input.x;
		socket.mouseY = input.y;
	  }
    }
    else {
      console.log("Unsupported input.");
    }
  });

  socket.on('disconnect', function() {
    socket.get('nickname', function(err, name) {
      socket.broadcast.emit("info", {display: true, content: name+" has left the game."});

      var ind = nicknames.indexOf(name);
      nicknames.splice(ind,1);
    });
  });

  socket.on('msg', function (msg) {
    socket.get('nickname', function (err, name) {
      console.log('msg (' + name + "): " + msg.content);
      socket.broadcast.emit("msg",{player: name, content: msg.content}); //echo message to all players
    });
  });
});