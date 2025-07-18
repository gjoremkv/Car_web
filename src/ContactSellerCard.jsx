import React from 'react';
import './ListingDetail.css';

export default function ContactSellerCard({ seller = {}, price, phone, rating = 4.5 }) {
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

      <button className="email-btn">📩 Email Seller</button>

      <div className="actions">
        <button className="park">🔖 Save</button>
        <button className="share">🔗 Share</button>
      </div>
    </div>
  );
} 