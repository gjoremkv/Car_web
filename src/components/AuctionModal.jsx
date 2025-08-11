import React, { useState } from 'react';
import { apiUrl } from '../utils/url';

export default function AuctionModal({ car, onClose }) {
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!startPrice || startPrice <= 0) {
      setError('Please enter a valid start price');
      setLoading(false);
      return;
    }

    if (!duration || duration <= 0 || duration > 168) {
      setError('Duration must be between 1 and 168 hours');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/start-auction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          car_id: car.id,
          start_price: parseFloat(startPrice),
          duration_hours: parseInt(duration)
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Auction started successfully!');
        onClose();
        // Optionally refresh the page or update the UI
        window.location.reload();
      } else {
        setError(data.message || 'Failed to start auction');
      }
    } catch (error) {
      console.error('Error starting auction:', error);
      setError('Failed to start auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auction-modal-overlay" onClick={onClose}>
      <div className="auction-modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h3>Start Auction for {car?.manufacturer} {car?.model}</h3>
          
          {car?.image_path && (
            <img 
              src={apiUrl(car.image_path)} 
              alt={car.model}
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
            />
          )}
          
          <div className="form-group">
            <label>Start Price (€)</label>
            <input
              type="number"
              value={startPrice}
              onChange={e => setStartPrice(e.target.value)}
              placeholder="Enter starting price"
              min="1"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Duration (hours)</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}>
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>1 day</option>
              <option value={48}>2 days</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Starting...' : 'Start Auction'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
