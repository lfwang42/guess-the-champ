import "./App.css";
import io from "socket.io-client";
import Chat from './components/Chat'
import { useState } from "react";
import { useTimer } from 'react-timer-hook';
import { ImagePixelated } from "react-pixelate"
import src from "./img1.png"

const socket = io.connect("http://localhost:3001");





function App() {
  //Room State
  const [room, setRoom] = useState("");
  // Messages States
  const [name, setName] = useState("");

  const [pixels, setPixels] = useState(20)  

  function MyTimer({ expiryTimestamp }) {
    const {
      totalSeconds,
      seconds,
      minutes,
      hours,
      days,
      isRunning,
      start,
      pause,
      resume,
      restart,
    } = useTimer({ expiryTimestamp, onExpire: () => {
      console.log("hi");
      if (pixels >= 5) {
        setPixels(pixels - 5);
      }
    } });
  
  
    return (
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: '100px'}}>
          <span>{minutes}</span>:<span>{seconds}</span>
        </div>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button onClick={() => {
          // Restarts to 1 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 60);
          restart(time)
        }}>Restart</button>
      </div>
    );
  }
  

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const time = new Date();
  time.setSeconds(time.getSeconds() + 5);

  return (
    <div className="canvasAndChat">
      {/* <canvas className='canvas'>
        CANVAS
      </canvas> */}
      <MyTimer expiryTimestamp={time} />
      <ImagePixelated src={src} width={500} height={300} fillTransparencyColor={"grey"} pixelSize={pixels}/>
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
