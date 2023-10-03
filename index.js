// import champions from "./champions.js"
// const champions = require("lol-champions");
const {v4: uuidv4 } = require("uuid");
const util = require("util");
const data = require("./champions.js");
const champions = data.champions
// console.log(champions)
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const answer = "jhin";
app.use(cors());

const server = http.createServer(app);


var rooms = new Map();

function joinRoom(socket, name, room) {
  const user = {
    socketId: socket,
    name: name,
    score: 0
  }
  room.users.push(user);
  console.log(room.users);
}


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

console.log(uuidv4());

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    var selectedChamp = 0;
    socket.join(data.room);
    if (!rooms.has(data.room)) {
      selectedChamp = Math.floor(Math.random() * champions.length);
      console.log(champions[selectedChamp].name)
      io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)

      const room = {
        id: uuidv4(),
        name: data.room,
        users: [],
        champion: selectedChamp,
        timer: undefined
      };
      rooms.set(data.room, room);
      joinRoom(socket.id, data.user, room);
      
    }
    else {
      selectedChamp = rooms.get(data.room).champion;
      console.log(champions[selectedChamp].name)
      io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)
      joinRoom(socket.id, data.user, rooms.get(data.room));
    }

  
    const users = rooms.get(data.room).users.map((user) => ({name: user.name, score: user.score}))
    io.to(data.room).emit("user_list", users)
    console.log(`User ${socket.id} username ${data.user} has joined room ${data.room}`)
    console.log(users)
    io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)

  });


  socket.on("send_message", (data) => {
    // console.log(data);
    //console.log(champions[rooms.get(data.room).champion].name.toString().toLowerCase());
    console.log(`Message: ${data.message.toString().toLowerCase()}`)
    if (data.message.toString().toLowerCase() == champions[rooms.get(data.room).champion].name.toString().toLowerCase()) {
      io.to(data.room).emit("system_message", `${data.author} guessed the answer!`);
      console.log("correct answer");
    }
    else {
      socket.to(data.room).emit("chat_message", data);
    }
  });

  function unpixelate(room) {
    io.to(room).emit("depixel");
  }

  socket.on("start_game", (room) => {
    if (typeof rooms.get(room).timer !== 'undefined') {
      clearInterval(rooms.get(room).timer);
    }

    //call the function "unpixelate" every 10 seconds which just emits to the room 
    rooms.get(room).timer = setInterval(unpixelate, 10000);
    io.to(room).emit("start_game");
  });

});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});


/*
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000/'
  },
});
const cors = require('cors')

app.use(cors());

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

server.listen(3001, () => {
  console.log('listening on *:3001');
});
*/