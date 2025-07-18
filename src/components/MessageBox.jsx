import { useState } from 'react';

export default function MessageBox({ senderId, receiverId, listingId }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: Number(senderId),
          receiverId: Number(receiverId),
          listingId: Number(listingId),
          message
        })
      });

      if (res.ok) {
        setSent(true);
        setMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="message-box">
      {sent ? (
        <p style={{ color: 'green' }}>Message sent!</p>
      ) : (
        <>
          <textarea
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
          <button onClick={sendMessage} style={{ marginTop: '8px' }}>
            Send
          </button>
        </>
      )}
    </div>
  );
} 