import { useEffect, useState } from 'react';

export default function Inbox({ userId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) return; // Only fetch if userId is defined
    fetch(`${process.env.REACT_APP_API_URL}/api/messages/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Messages:', data); // for debug
        setMessages(data);
      })
      .catch((err) => console.error('Failed to fetch messages', err));
  }, [userId]);

  return (
    <div>
      <h2>Your Inbox</h2>
      {messages.length > 0 ? (
        messages.map((msg) => (
          <div key={msg.id}>
            <strong>From:</strong> {msg.sender_id}<br />
            <strong>To:</strong> {msg.receiver_id}<br />
            <strong>Message:</strong> {msg.message}<br />
            <hr />
          </div>
        ))
      ) : (
        <p>No messages yet.</p>
      )}
    </div>
  );
} 