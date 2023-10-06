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
    socketId: socket.toString(),
    name: name,
    score: 0,
    guessed: false,
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
        timer: undefined,
        round_start: undefined,
        round: 0,
        answered: 0
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
    console.log(rooms.get(data.room).users);
    io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)

  });


  socket.on("chat_message", (data) => {
    console.log(`Message received from ${socket.id}`);
    // console.log(data);
    //console.log(champions[rooms.get(data.room).champion].name.toString().toLowerCase());
    console.log(`Message: ${data.message.toString().toLowerCase()}`)
    if (rooms.get(data.room).round_start !== undefined && data.message.toString().toLowerCase() == champions[rooms.get(data.room).champion].name.toString().toLowerCase()) {
      if (handle_guess(rooms.get(data.room))) {
        io.to(data.room).emit("system_message", `${data.author} guessed the answer!.`);
        console.log("correct answer");
      }
      
    }
    else {
      socket.to(data.room).emit("receive_message", data);
    }
  });

  function unpixelate(room) {
    io.to(room).emit("depixel");
  }

  function handle_guess(room) {
    
    for (let i = 0; i < room.users.length; i++) {
      const currentId = room.users[i].socketId;
      console.log(`message from ${socket.id}, current user socket id ${currentId}`);
      if (currentId == socket.id.toString()) {
        if (room.users[i].guessed == false) {
          const date = new Date();
          var diff = Math.abs(date - room.round_start);
          room.users[i].score += parseInt((60000 - diff) / 60);
          console.log(`User ${room.users[i].name} has ${room.users[i].score} points.`);
          //update # of ppl who have guessed correctly
          room.answered += 1
          check_round_end(room);
          return true;
        }
        else {
          console.log(`User ${room.users[i].name} has already guessed correctly this round.`);
          return false;
        }
      }
      
    }
    return false;
  }

  function check_round_end(room) {
    if (room.answered == room.users.length) {
      console.log('all users guessed (check_round_end)');
      next_round(room);
    }
  }

  //assumes caller already checked that next round should advance
  function next_round(room) {
    room.champion = Math.floor(Math.random() * champions.length);
    console.log(champions[room.champion].name)
    room.round_start = new Date();
    clearTimeout(room.timer);
    sendScores(room);
    room.timer = setTimeout(next_round, 10000, room);
    room.round += 1;
    io.to(room.name).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[room.champion].url}_0.jpg`)
    console.log(`Round ${room.round} started`);
  }

  function sendScores(room) { 
    //emit users and their scores
    // console.log("yo")
    // console.log(room)
    // io.to(room).emit("scores", rooms.get(data.room).users.map((user) => ({name: user.name, score: user.score})))
  }

  //takes in room not room #
  function resetGame(room) {
    for (let user in room.users) {
      user.score = 0;
    }
    room.round = 0;
    room.answered = 0;
    room.timer = undefined;
    room.round_start = undefined;
  }

  socket.on("start_pressed", (data) => {
    var room = data.room;
    console.log(room);
    if (rooms.get(room).timer !== undefined) {
      clearTimeout(rooms.get(room).timer);
    }
    
    resetGame(rooms.get(room));
    rooms.get(room).round_start = new Date();
    rooms.get(room).timer = setTimeout(next_round, 10000, room);
    rooms.get(room).round = 1;
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