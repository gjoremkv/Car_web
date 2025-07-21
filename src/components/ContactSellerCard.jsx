import React, { useState } from 'react';
import socket from '../socket';
import './ListingDetail.css';

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

    console.log('Sending message:', messageData);
    socket.emit('sendMessage', messageData);

    setMessage('');
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