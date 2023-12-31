import "./App.css";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData} from './SocketInterfaces'

import Chat from './components/Chat'
import { useState } from "react";
import { useTimer } from 'react-timer-hook';
import { ImagePixelated } from "react-pixelate"
import React from 'react'
import { Typography, Button, Card } from '@mui/material';
import ButtonAppBar from "./components/Navbar";
import Scoreboard from "./components/Scoreboard"
import Modal from "./components/Modal";


const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3001/");

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
      if (pixels >= 5) {
        setPixels(pixels - 5);
      }
    } });

    return (
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: '70px'}}>
          <span>{minutes}</span>:<span>{seconds}</span>
        </div>
        {/* <Button color="secondary" variant='contained' onClick={pause}>Pause</Button>
        <Button color="primary" variant='contained' onClick={resume}>Resume</Button>
        <Button color="warning" variant='contained' onClick={() => {
          // Restarts to 1 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 60);
          restart(time)
        }}>Restart</Button> */}
      </div>
    );
  }




  //Room State
  const [room, setRoom] = useState("");
  // Messages States
  const [name, setName] = useState("");

  const [userNames, setUserNames] = useState([]);

  const [randChamp, setRandChamp] = useState("");

  const [start, setStart] = useState(false);

  const [modal, setModal] = useState(true);

  const joinRoom = () => {
    if (room !== "" && name !== "") {
      const roomData = {
        room: room,
        user: name
      };
      socket.emit("join_room", roomData);
    }
  };

  const startGame = () => {
    if (room !== "" && name !== "") {
      const startData = {
        room: room,
        user: name
      };
      socket.emit("start_pressed", startData);
    }
  };

  // React.useEffect(() => {
  //   socket.on("start_game", () => {
  //     setModal(false)
  //   })
  // }, [])

  const time = new Date();
  time.setSeconds(time.getSeconds() + 5);

  React.useEffect(() => {
    socket.on("champion_url", (url) => {
      setRandChamp(url)
    })
  }, [])

  // React.useEffect(() => {
  //   socket.on("user_list", (names) => {
  //     //console.log(names)
  //     setUserNames(names)
  //   })
  // }, [])

  React.useEffect(() => {
    socket.on("start_game", (x) => {
      console.log(x)
      setStart(true)
    })
  }, [])

  React.useEffect(() => {
    socket.on("scores", (x) => {
      setUserNames(x)
    })
  }, [])

  function handleStateRoom(newValue) {
    setRoom(newValue)
  }

  function handleStateName(newValue) {
    setName(newValue)
  }

  const allNames = userNames.map((n) => <li>{n.name} {n.score}</li>)

  return (
    <div>
      <Modal start={start} joinRoom={joinRoom} startBtn={startGame} changeRoom = {handleStateRoom} changeName = {handleStateName}/>
      <ButtonAppBar />
      <div className="score-canvas-chat">

        <div className="scoreboard">
          ScoreBoard
          <ul>{allNames}</ul>
          {/* <div className='scoreboard-card'><Scoreboard/></div> */}
        </div>

        {start ? 
          <div className='canvas'>
            <h2 className="round">Round __ of __</h2>
            <MyTimer className="timer" expiryTimestamp={time} />
            <ImagePixelated padding={30} src={randChamp} width={810} height={478} fillTransparencyColor={"grey"} pixelSize={pixels}/>
          </div>
          :
          <div></div>
        }
        <div className="info-chat">
          <div className="chat">
            <div>
              CHATBOX
              <div className="whole-chat">
                <Chat socket={socket} name={name} room={room}/>
              </div>
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


/* <div className="info">
  <div className="input-row">
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
  </div>
    <div className="button-row">
      <Button className="join-button" color="secondary" variant="contained" onClick={joinRoom}>
        Join Room
      </Button>
    </div>
</div> */