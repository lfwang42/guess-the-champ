const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (user, msg) => {
    console.log('message: ' + user + ": " + msg);
    socket.broadcast.emit('chat message', user, msg);
  });
  socket.on('username change', (oldUser, user) => {
    console.log('user ' + oldUser + " changed name to " + user);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});