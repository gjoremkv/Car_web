import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const BASE_URL = 'http://localhost:5000';

export default function MiniInbox({ currentUserId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUsername, setChatUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (currentUserId) {
      socket.emit('registerUser', currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/${currentUserId}`);
        const text = await res.text();

        try {
          const data = JSON.parse(text);
          setMessages(data);

          const uniquePartners = [];
          const seen = new Set();
          data.forEach(msg => {
            const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
            if (!seen.has(otherUserId)) {
              seen.add(otherUserId);
              uniquePartners.push({
                userId: otherUserId,
                username: msg.sender_id === currentUserId ? msg.receiver_username : msg.sender_username
              });
            }
          });

          setConversations(uniquePartners);

          if (uniquePartners.length > 0 && !chatUserId) {
            const first = uniquePartners[0];
            setChatUserId(first.userId);
            setChatUsername(first.username);
          }
        } catch (err) {
          console.error("❌ Failed to parse JSON from /api/messages:", text);
          setMessages([]);
          setConversations([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    const handler = (message) => {
      setMessages(prev => {
        if (prev.some(msg => msg.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    socket.on(`receiveMessage-${currentUserId}`, handler);

    return () => socket.off(`receiveMessage-${currentUserId}`, handler);
  }, [currentUserId, chatUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = chatUserId
    ? messages.filter(
        msg => msg.sender_id === chatUserId || msg.receiver_id === chatUserId
      )
    : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !chatUserId) return;

    socket.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: chatUserId,
      listingId: null,
      message: newMessage
    });

    try {
      const res = await fetch(`${BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: chatUserId,
          listingId: null,
          message: newMessage
        })
      });

      const result = await res.json();
      if (!result.success) {
        console.error('❌ DB Error:', result.error);
      }
    } catch (err) {
      console.error('❌ Failed to send message to DB:', err);
    }

    setNewMessage('');
  };

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
          overflow: 'hidden',
          boxShadow: '0 0 10px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '12px', fontWeight: 'bold', textAlign: 'center', background: '#f8f8f8' }}>
            {chatUsername ? `Chat with: ${chatUsername}` : 'Select a chat:'}
            {!chatUsername && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 10 }}>
                {conversations.map(c => (
                  <li key={c.userId}>
                    <button onClick={() => {
                      setChatUserId(c.userId);
                      setChatUsername(c.username);
                    }}>
                      {c.username}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredMessages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender_id === currentUserId ? 'flex-end' : 'flex-start',
                background: msg.sender_id === currentUserId ? '#dcf8c6' : '#f1f0f0',
                padding: '8px 12px',
                borderRadius: '10px',
                maxWidth: '80%'
              }}>
                <strong>{msg.sender_username}:</strong> <br />
                {msg.message}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{ padding: '10px', display: 'flex', gap: '6px', borderTop: '1px solid #eee' }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
              disabled={!chatUserId}
            />
            <button type="submit" style={{
              background: '#e63946',
              color: 'white',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold'
            }} disabled={!chatUserId}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}