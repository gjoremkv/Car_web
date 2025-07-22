import React, { useState } from 'react';

export default function AuctionModal({ car, onClose }) {
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState(24);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... your auction logic here ...
    onClose();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Start Auction for {car?.model}</h3>
        <input
          type="number"
          value={startPrice}
          onChange={e => setStartPrice(e.target.value)}
          placeholder="Start Price"
        />
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="Duration (hours)"
        />
        <button type="submit">Start Auction</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
} 