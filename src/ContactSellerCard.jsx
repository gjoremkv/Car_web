import React from 'react';
import './ListingDetail.css';

export default function ContactSellerCard({ seller = {}, price }) {
  return (
    <div className="ContactSellerCard">
      <h2>{price} €</h2>
      <p><strong>{seller.name}</strong></p>
      {seller.address && <p>{seller.address}</p>}
      {seller.email && <p>{seller.email}</p>}
      <button>Email Seller</button>
    </div>
  );
} 