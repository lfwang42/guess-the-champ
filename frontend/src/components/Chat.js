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
      };

      await socket.emit('chat_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage(''); // Clear the input field after sending
    }
  };

  React.useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
      chatBodyRef.current.scrollBottom = chatBodyRef.current.scrollHeight; // Scroll to the bottom when a new message arrives
    });
  }, [socket]);

  return (
    <div className='chat-and-send'>
      <div className='chat-body' ref={chatBodyRef}>
        {messageList.map((m, index) => (
          <div key={index} className='message-content'>
            <div>
              <div className='message-body'>
                <h3>{m.message}</h3>
              </div>
              <div className='metadata'>
                <p>{m.author}</p>
              </div>
            </div>
          </div>
        ))}
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