import React from 'react';

export default function Chat({ socket, name, room }) {
  const [message, setMessage] = React.useState('');
  const [messageList, setMessageList] = React.useState([]);
  const chatBodyRef = React.useRef(null);

  const sendMessage = async () => {
    if (message !== '') {
      const messageData = {
        room: room,
        author: name,
        message: message,
        type: 'user'
      };

      await socket.emit('chat_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage(''); // Clear the input field after sending
    }
  };

  React.useEffect(() => {
    socket.on('chat_message', (data) => {
      //setMessageList((list) => [...list, data.author + ": " + data.message])
      setMessageList((list) => [...list, data]);
      chatBodyRef.current.scrollBottom = chatBodyRef.current.scrollHeight; // Scroll to the bottom when a new message arrives
    });
  }, [socket]);

  const mapMessage = messageList.map((m, index) => {
    if (m.type === "system") {
      return (
        <div key={index} className='message-content'>
          <div className='metadata'>
            <p className='each-message'>{m.message}</p>
          </div>
        </div>
      )
    } else {
      return (
        <div key={index} className='message-content'>
          <div className='metadata'>
            <p className='each-message'>{m.author} : {m.message}</p>
          </div>
        </div>
      )
    }
  })

  return (
    <div className='chat-and-send'>
      <div className='chat-body' ref={chatBodyRef}>
        {mapMessage}
      </div>
      <div className='send-message'>
        <input
          type='text'
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder='Message...'
        />
        <button onClick={sendMessage}>SEND MESSAGE</button>
      </div>
    </div>
  );
}