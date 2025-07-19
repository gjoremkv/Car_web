import React, { useEffect, useState } from 'react';
import socket from '../socket'; // Make sure this is your shared socket instance

function MessageBox({ listingId, senderId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Join the room for this listing
    socket.emit('joinRoom', listingId);

    // Fetch past messages
    fetch(`http://localhost:5000/api/messages/${listingId}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));

    // Listen for new messages
    socket.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  }, [listingId]);

  return (
    <div className="message-box">
      {(messages || []).map((msg) => (
        <div key={msg.id} className={`message ${msg.sender_id === 1 ? 'sent' : 'received'}`}>
          <p>{msg.message}</p>
        </div>
      ))}
    </div>
  );
}

export default MessageBox; 