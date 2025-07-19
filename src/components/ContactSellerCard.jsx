import React, { useState } from 'react';
import socket from '../socket'; // Adjust the path if your socket file is elsewhere
import './ListingDetail.css';

export default function ContactSellerCard({ seller = {}, price, phone, rating = 4.5, currentUser = {}, listingId }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;

    // Make sure these IDs are correct for your app's data structure
    const senderId = currentUser.user_id || currentUser.id;
    const receiverId = seller.user_id || seller.id;
    // listingId should be passed as a prop

    // Emit the message via Socket.IO
    socket.emit('sendMessage', {
      senderId,
      receiverId,
      listingId,
      message,
    });

    setMessage('');
    // No alert! Optionally, you can trigger a UI update or notification here.
  };

  return (
    <div className="ContactSellerCardModern">
      <h2>{seller.dealership || 'Private Seller'}</h2>
      <p className="location">{seller?.location || 'Location unknown'}</p>

      <div className="rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? 'star full' : 'star'}>★</span>
        ))}
        <span className="rating-number">{rating.toFixed(1)}</span>
      </div>

      <hr />

      <p className="price">{price} €</p>

      {phone && (
        <div className="phone">
          <span className="label">Tel.:</span>
          <span className="value">{phone}</span>
        </div>
      )}

      <div className="contact-seller-box" style={{ margin: '1rem 0' }}>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          className="email-btn"
          onClick={handleSend}
          style={{ marginTop: '8px', width: '100%' }}
        >
          📩 Send Message
        </button>
      </div>

      <div className="actions">
        <button className="park">🔖 Save</button>
        <button className="share">🔗 Share</button>
      </div>
    </div>
  );
} 