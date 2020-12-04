const express = require('express');
const app = express();
const path = require('path')
const favicon = require('serve-favicon');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidv4} = require('uuid');
const { Socket } = require('dgram');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))) ;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId);
      socket.on('message', message => {
        io.to(roomId).emit('createMessage', message)
      });

      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })

    })
})


server.listen(3030);