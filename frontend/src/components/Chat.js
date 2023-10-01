import React from 'react'

export default function Chat({socket, name, room}) {
  const [message, setMessage] = React.useState("");
  const [messageList, setMessageList] = React.useState([]);

  const sendMessage = async () => {
    if (message !== "") {
      const messageData = {
        room: room,
        author: name,
        message: message
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
    }
  };

  React.useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    
  }, [socket]);

  return (
    <div>
      <div className='chat-body'>
        {messageList.map((m) => {
          return ( 
            <div className='message-content'>
              <div>
                <div className='message-body'>
                  <h3>{m.message}</h3>
                </div>
                <div className='metadata'>
                  <p>{m.author}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <input 
        onChange={(event) => setMessage(event.target.value)} 
        placeholder='Message...'/>
        <button onClick={sendMessage}>SEND MESSAGE</button>
      </div>
    </div>
  )
}
