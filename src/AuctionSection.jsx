import React from 'react';
import './AuctionSection.css';

const AuctionSection = () => {
  return (
    <div className="auction-section-outer">
      <div className="auction-section-card">
        <h2>Car Auctions</h2>
        <p>Browse live car auctions or start your own auction listing.</p>
        <button className="start-auction-btn">Start New Auction</button>
        <div className="auction-listings-placeholder">
          <h3>Live Auctions</h3>
          <p>No auctions available yet. Check back soon!</p>
        </div>
      </div>
    </div>
  );
};

export default AuctionSection; 