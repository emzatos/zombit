var io = require('socket.io').listen(1337);

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
});