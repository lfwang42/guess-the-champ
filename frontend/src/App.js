import "./App.css";
import io from "socket.io-client";
import Chat from './components/Chat'
import { useState } from "react";
import { useTimer } from 'react-timer-hook';
import { ImagePixelated } from "react-pixelate"
import src from "./img1.png"
import React from 'react'
import { Typography, Button, Card } from '@material-ui/core';
import ButtonAppBar from "./components/Navbar";

const socket = io.connect("http://localhost:3001");


function App() {


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
        <Button color="secondary" variant='contained' onClick={pause}>Pause</Button>
        <Button color="primary" variant='contained' onClick={resume}>Resume</Button>
        <Button color="warning" variant='contained' onClick={() => {
          // Restarts to 1 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 60);
          restart(time)
        }}>Restart</Button>
      </div>
    );
  }




  //Room State
  const [room, setRoom] = useState("");
  // Messages States
  const [name, setName] = useState("");

  const [randChamp, setRandChamp] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  const time = new Date();
  time.setSeconds(time.getSeconds() + 5);

  React.useEffect(() => {
    socket.on("champion_url", (url) => {
      setRandChamp(url)
    })
  }, [])

  console.log(randChamp)

  return (
    <div>
      <ButtonAppBar />

      <div className="score-canvas-chat">

        <div className="scoreboard">
          ScoreBoard
        </div>

        <div className='canvas'>
          <MyTimer expiryTimestamp={time} />
          <div className='image-champ'><ImagePixelated  src={randChamp} width={810} height={478} fillTransparencyColor={"grey"} pixelSize={pixels}/></div>
          
        </div>

        <div className="info-chat">

          <div className="info">
            <input
              className="room-num"
              type="text"
              placeholder="Room Number..."
              onChange={(event) => {
                setRoom(event.target.value);
              }}
            />
            <input
              className="username"
              type="text"
              placeholder="Name"
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
            <button className="join-button" onClick={joinRoom}> Join Room</button>
          </div>

          <div className="chat">
            <div>
              CHATBOX
              <Chat socket={socket} name={name} room={room}/>
            </div>
          </div>

        </div>

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
