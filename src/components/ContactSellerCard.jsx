import React, { useState } from 'react';
import socket from '../socket';
import '../ListingDetail.css';

export default function ContactSellerCard({
  seller = {},
  price,
  phone,
  rating = 4.5,
  senderId,
  receiverId,
  listingId
}) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;

    const messageData = {
      senderId,
      receiverId,
      listingId,
      message
    };

    socket.emit('sendMessage', messageData);
    setMessage(''); // Clear input
  };

  return (
    <div className="ContactSellerCardModern">
      <h2>{seller.dealership || 'Private Seller'}</h2>
      <p className="location">📍 {seller?.location || 'Location unknown'}</p>

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

      <div className="contact-seller-box">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button onClick={handleSend} className="email-btn">
          📩 Send
        </button>
      </div>

      <div className="actions">
        <button className="park">🔖 Save</button>
        <button className="share">🔗 Share</button>
      </div>
    </div>
  );
} 