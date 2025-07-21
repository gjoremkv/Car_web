import React, { useState, useEffect } from 'react';
import socket from '../socket';

function MiniInbox({ currentUserId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit('registerUser', currentUserId);

    fetch(`http://localhost:5000/api/messages/${currentUserId}`)
      .then(res => res.json())
      .then(setMessages);

    const handleIncoming = (msg) => {
      if (msg.receiver_id === currentUserId || msg.sender_id === currentUserId) {
        setMessages(prev => [msg, ...prev]);
      }
    };

    socket.on('receiveMessage', handleIncoming);

    return () => {
      socket.off('receiveMessage', handleIncoming);
    };
  }, [currentUserId]);

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <button onClick={() => setOpen(!open)} style={{ padding: '8px 14px', borderRadius: 8 }}>
        📬 Inbox
      </button>
      {open && (
        <div style={{
          width: 320,
          height: 420,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflowY: 'auto',
          marginTop: 8,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          padding: 12
        }}>
          <h4 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>Messages</h4>
          {messages.length === 0 && <p style={{ textAlign: 'center' }}>No messages yet.</p>}
          {messages.map((msg) => (
            <div key={msg.id} style={{
              padding: '6px 10px',
              marginBottom: 6,
              borderBottom: '1px solid #eee'
            }}>
              <div><strong>From:</strong> {msg.sender_id}</div>
              <div><strong>To:</strong> {msg.receiver_id}</div>
              <div style={{ marginTop: 4 }}>{msg.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MiniInbox; 