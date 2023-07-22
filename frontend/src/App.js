import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  //Room State
  const [room, setRoom] = useState("");

  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const sendMessage = () => {
    socket.emit("send_message", { message, room });
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageReceived(data.message);
    });
  }, [socket]);

  return (
    <div className="canvasAndChat">
      <canvas className='canvas'>
        CANVAS
      </canvas>
      <div className="messege">
        <input
          placeholder="Room Number..."
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <button onClick={joinRoom}> Join Room</button>
        <input
          placeholder="Message..."
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
        <button onClick={sendMessage}> Send Message</button>
        <h1> Message:</h1>
        {messageReceived}
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
