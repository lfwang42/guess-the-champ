import React from 'react'
import { useState } from 'react'
import "./Modal.css"
import { Typography, Button, Card } from '@mui/material';

export default function Modal(props) {

    const [modal, setModal] = useState(true);
    const [tmpRoom, setTmpRoom] = useState("")
    const [tmpName, setTmpName] = useState("")

    const toggleModal = () => {
        setModal(!modal)
    }

    function handleChangeRoom(event) {
        let tmpRoom = event.target.value;
        setTmpRoom(tmpRoom);
        props.changeRoom(tmpRoom);
    }

    function handleChangeName(event) {
        let tmpName = event.target.value;
        setTmpName(tmpName);
        props.changeName(tmpName);
    }

    return (
        <>
            {modal && (
                <div className="modal">
                    <div className='overlay'></div>
                    <div className='modal-content'>
                    
                        <div className="info">
                            <div className="input-row">
                            <input
                                className="room-num"
                                type="text"
                                placeholder="Room Number..."
                                onChange={handleChangeRoom}
                            />
                            <input
                                className="username"
                                type="text"
                                placeholder="Name"
                                onChange={handleChangeName}
                            />
                            </div>
                            <div className="button-row">
                                <Button className="join-button" color="secondary" variant="contained" onClick={props.joinRoom}>
                                Join Room
                                </Button>
                            </div>
                        </div>

                        <h2>Start Button</h2>
                        <Button color="secondary" variant='contained' onClick={() => { props.startBtn(); toggleModal();}} >START</Button>
                    </div>
                </div>
            )}
        </>
    )
}
