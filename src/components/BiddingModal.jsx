import React, { useState } from 'react';
import './BiddingModal.css';

export default function BiddingModal({ auction, onClose, onBidPlaced }) {
  const [bidAmount, setBidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentBid = parseFloat(auction.current_bid || 0);
  const minBid = currentBid + 1; // Minimum bid increment

  const handleBid = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/place-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          auction_id: auction.auction_id || auction.id,
          bid_amount: Number(bidAmount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Bid placed successfully!');
        onBidPlaced(auction.auction_id, bidAmount);
        onClose();
      } else {
        setError(data.message || 'Failed to place bid');
      }
    } catch (err) {
      setError('Failed to place bid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!auction) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Place Bid</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="auction-info">
          <h3>{auction.manufacturer} {auction.model} ({auction.year})</h3>
          <div className="bid-details">
            <p><strong>Current Bid:</strong> €{currentBid.toLocaleString()}</p>
            <p><strong>Time Left:</strong> {auction.time_left_formatted}</p>
            <p><strong>Minimum Bid:</strong> €{minBid.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleBid}>
          <div className="form-group">
            <label htmlFor="bidAmount">Your Bid (€)</label>
            <input
              type="number"
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={minBid}
              step="1"
              required
              disabled={isLoading}
              placeholder={`Enter amount (min: €${minBid})`}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="bid-btn">
              {isLoading ? 'Placing Bid...' : `Place Bid €${bidAmount ? parseFloat(bidAmount).toLocaleString() : '0'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
