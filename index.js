const {v4: uuidv4 } = require("uuid");
const util = require("util");
const data = require("./champions.js");
const champions = data.champions
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);
const max_users = 4;
const round_limit = 3;

//users are stored in hashmaps of socket.id => UserInfo
class UserInfo {
  constructor(name) {
    this.name = name;
    this.score = 0;
    this.guessed = false;
  }
}

var rooms = new Map();

function joinRoom(socketId, name, room) {

  const user_info = new UserInfo(name);
  room.users.set(socketId, user_info);
  console.log(room.users);
  console.log(`User ${socketId} username ${name} has joined room ${room.name}`)
}

function leaveRoom(socketId, room) {
  console.log(room);
  if (room.users.has(socketId)) {
    room.users.delete(socketId);
    //delete empty rooms.
    if (room.users.size == 0) {
      delete_room(room);
    }
    else {
      //assign new host if old one left.
      if (rooms.host == socketId) {
        revoke_host(socketId, room);
        const newHost = room.users.keys().next().value;
        grant_host(newHost, room);
      }
      //check if next round should start (i.e. if user was last one who had not guessed) and start if it should
      check_round_end(room);
    }
    console.log(`User ${socketId} leaving room ${room.name}`);
  }
}

function delete_room(room) {
  clearTimeout(room.timer);
  rooms.delete(room.name);
  console.log(`deleted room ${room.name}`);
}

function check_round_end(room) {
  if (room.answered == room.users.length) {
    console.log('all users guessed (check_round_end)');
    next_round(room);
  }
}

//assumes caller already checked that next round should advance
function next_round(room) {
  if (room.round == round_limit) {
    clearTimeout(room.timer);
    sendScores(room);
    console.log(`room ${room.name} reached final round.`);
  }
  else {
    room.round += 1;
    room.champion = Math.floor(Math.random() * champions.length);
    room.round_start = new Date();
    clearTimeout(room.timer);
    sendScores(room);
    [...room.users.keys()].forEach((key) => {
      room.users.get(key).guessed = false;
    });
    room.timer = setTimeout(next_round, 20000, room);
    io.to(room.name).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[room.champion].url}_0.jpg`)
    console.log(`Round ${room.round} started`);
  }
}

function sendScores(room) { 
  //emit users and their scores
  const users = Array.from(room.users.values()).map((user) => ({name: user.name, score: user.score}))
  io.to(room.name).emit("scores", users)
}

function revoke_host(id, room) {
  if (room.host != undefined) {
    room.host = undefined;
    io.to(id).emit("revoke_host");
    console.log(`${id} revoked host of room ${room.name}`);
  }
  else {
    console.log(`Room${room.name} already has no host.`);
  }
}


function grant_host(id, room) {
  if (room.host == undefined) {
    room.host = id;
    io.to(id).emit("grant_host");
    console.log(`${room.host} granted host of room ${room.name}`);
  }
  else {
    console.log(`Room${room.name} already has host ${room.host}`);
  }
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


  socket.on("disconnecting", () => {
    const left_rooms = socket.rooms;
    //remove user from all game rooms they are in.
    for (let value of left_rooms) {
      if (rooms.has(value)) {
        leaveRoom(socket.id, rooms.get(value));
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });

  socket.on("join_room", (data) => {
    var selectedChamp = 0;
    if (!rooms.has(data.room)) {
      socket.join(data.room);
      selectedChamp = Math.floor(Math.random() * champions.length);
      console.log(champions[selectedChamp].name)
      io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)

      const room = {
        id: uuidv4(),
        name: data.room,
        users: new Map(),
        champion: selectedChamp,
        timer: undefined,
        round_start: undefined,
        round: 0,
        answered: 0,
        host: undefined,
      };
      rooms.set(data.room, room);
      grant_host(socket.id, room);
    }
    if (rooms.get(data.room).users.size == max_users) {
      console.log("room full");
    }
    else {
      socket.join(data.room);
      selectedChamp = rooms.get(data.room).champion;
      io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)
      joinRoom(socket.id, data.user, rooms.get(data.room));
      const users = Array.from(rooms.get(data.room).users.values()).map((user) => ({name: user.name, score: user.score}))
      io.to(data.room).emit("user_list", users)
      console.log(`User ${socket.id} username ${data.user} has joined room ${data.room}`)
      //console.log(rooms.get(data.room).users);
      io.to(data.room).emit("champion_url", `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[selectedChamp].url}_0.jpg`)
    }
  });


  socket.on("chat_message", (data) => {
    console.log(`Message received from ${socket.id}`);
    // console.log(data);
    //console.log(champions[rooms.get(data.room).champion].name.toString().toLowerCase());
    console.log(`Message: ${data.message.toString().toLowerCase()}`)
    if (rooms.get(data.room).round_start !== undefined && data.message.toString().toLowerCase() == champions[rooms.get(data.room).champion].name.toString().toLowerCase()) {
      if (handle_guess(rooms.get(data.room))) {
        const message = {
          room: data.room,
          author: "system",
          message: `${data.author} guessed the answer!.`,
          type: 'system',
        };
        io.to(data.room).emit("chat_message", message);
        console.log("correct answer");
      }
    }
    else {
      socket.to(data.room).emit("chat_message", data);
    }
  });

  socket.on("change_host", (data) => {
    if (socket.id == data.sender_id) {
      rooms.get(data.room).host = data.newHost;
    }
  });

  function unpixelate(room) {
    io.to(room).emit("depixel");
  }

  function handle_guess(room) {
    if (room.users.get(socket.id).guessed == false) {
      const date = new Date();
      var diff = Math.abs(date - room.round_start);
      room.users.get(socket.id).score += parseInt((60000 - diff) / 60);
      room.users.get(socket.id).guessed = true;
      console.log(`User ${room.users.get(socket.id).name} has ${room.users.get(socket.id).score} points.`);
      //update # of ppl who have guessed correctly
      room.answered += 1
      check_round_end(room);
      return true;
    }
    else {
      console.log(`User ${room.users.get(socket.id).name} has already guessed correctly this round.`);
      return false;
    }
  }

  

  

  //takes in room 
  function resetGame(room) {
    for (let user in room.users.values()) {
      user.score = 0;
      user.guessed = false;
    }
    room.round = 0;
    room.answered = 0;
    room.timer = undefined;
    room.round_start = undefined;
    sendScores(room);
  }

  socket.on("start_pressed", (data) => {
    var room = data.room;
    if (rooms.get(room).timer !== undefined) {
      clearTimeout(rooms.get(room).timer);
    }
    
    resetGame(rooms.get(room));
    rooms.get(room).round_start = new Date();
    rooms.get(room).timer = setTimeout(next_round, 10000, rooms.get(room));
    rooms.get(room).round = 1;
    io.to(room).emit("start_game");
  });

});


server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
