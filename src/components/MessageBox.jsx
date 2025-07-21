import React, { useEffect, useState } from 'react';
import socket from '../socket';

function MessageBox({ listingId, senderId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('joinRoom', listingId);

    fetch(`http://localhost:5000/api/messages/${listingId}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));

    const handleReceive = (msg) => {
      console.log('💬 Received on frontend:', msg);
      setMessages(prev => [...prev, msg]);
    };

    socket.on('receiveMessage', handleReceive);

    return () => {
      socket.off('receiveMessage', handleReceive);
    };
  }, [listingId]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    // Optimistic UI update
    const tempMessage = {
      id: Date.now(),
      sender_id: senderId,
      receiver_id: receiverId,
      listing_id: listingId,
      message: newMessage,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);

    socket.emit('sendMessage', {
      senderId,
      receiverId,
      listingId,
      message: newMessage
    });

    setNewMessage('');
  };

  return (
    <div>
      <div className="message-box">
        {messages.map(msg => (
          <div key={msg.id} className={msg.sender_id === senderId ? 'sent' : 'received'}>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="input-row">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default MessageBox; 