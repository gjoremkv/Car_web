import { useEffect, useState } from 'react';

export default function Inbox({ userId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`/api/messages/${userId}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error('Failed to fetch messages', err));
  }, [userId]);

  return (
    <div>
      <h2>Your Inbox</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id} style={{ marginBottom: '12px' }}>
              <div><strong>From:</strong> {msg.sender_id === userId ? 'You' : `User ${msg.sender_id}`}</div>
              <div><strong>Listing ID:</strong> {msg.listing_id}</div>
              <div>{msg.message}</div>
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 