import "./App.css";
import io from "socket.io-client";
import Chat from './components/Chat'
import { useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  //Room State
  const [room, setRoom] = useState("");
  // Messages States
  const [name, setName] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  return (
    <div className="canvasAndChat">
      <canvas className='canvas'>
        CANVAS
      </canvas>
      <div className="messege">
        <input
          type="text"
          placeholder="Room Number..."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Name"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <button onClick={joinRoom}> Join Room</button>
        <Chat socket={socket} name={name} room={room}/>
      </div>
    </div>
  );
}

export default App;

/*
import './App.css';
import NameForm from './components/NameForm';
import MessageForm from './components/MessageForm';
import io from 'socket.io-client'
const socket = io.connect('http://localhost:3001/');

function App() {
  const sendMessage = () => {
      socket.emit
  }
  return (
    <div className="App">
      <input placeholder='Message...'/>
      <button onClick={sendMessage}>Send Message </button>
    </div>
  );
}

export default App;
*/
