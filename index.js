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


// var newChamps = [];
// console.log(champions.length);
// for (var i = 0; i < champions.length; i++) {
//   console.log(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[i].url}_0.jpg`)
//   // console.log(champions[i].url);
// }


// console.log(util.inspect(newChamps, { maxArrayLength: null}))

var rooms = new Map();

// user = {
//   id : "socketid",
//   score: 
// }

// room = {
//   id: "blah",
//   users: [socketids],

// }

function joinRoom(socket, room) {
  room.sockets.push(socket);
  console.log(room.sockets);
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

    if (!rooms.has(data)) {
      selectedChamp = Math.floor(Math.random() * champions.length);
      console.log(champions[selectedChamp].name)
      socket.to(data).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)
      const room = {
        id: uuidv4(),
        name: data,
        sockets: [],
        champion: selectedChamp
      };
      joinRoom(socket.id, room);
      rooms.set(data, room);
    }
    else {
      selectedChamp = rooms[data].champion;
      console.log(champions[selectedChamp].name)
      socket.to(data).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)
      joinRoom(socket.id, rooms[data]);

    }
    socket.join(data);
    console.log([...rooms.entries()]);
    
    console.log(`User ${socket.id} has joined room ${data}`)
  });


  socket.on("send_message", (data) => {
    // console.log(data);
    if (data.message.toString().toLowerCase() == answer) {
      socket.to(data.room).emit("receive_message", "Player guessed the answer!");
      console.log("answer");
    }
    else {
      socket.to(data.room).emit("receive_message", data);
    }
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