import React, { useState, useEffect } from 'react';
import './AuctionSection.css';

const AuctionSection = () => {
  const [auctions, setAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    setAuctions([
      {
        id: 1,
        title: '2020 BMW 3 Series',
        engine: '3.0L I6',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        location: 'California',
        image: '/uploads/sample-bmw.jpg',
        currentBid: 15200,
        timeLeft: '31 min 08',
        bids: 18,
      },
      {
        id: 2,
        title: '2018 Audi A4',
        engine: '2.0L I4',
        transmission: 'Automatic',
        fuel: 'Diesel',
        location: 'New York',
        image: '/uploads/sample-audi.jpg',
        currentBid: 12900,
        timeLeft: '2 h 29 min',
        bids: 12,
      },
    ]);
  }, []);

  return (
    <div className="auction-page">
      <header className="auction-header">
        <h1>Auction Page</h1>
        <div>
          <button className="btn">Start Selling</button>
          <button className="btn primary">Browse Live Auctions</button>
        </div>
      </header>

      <div className="auction-body">
        <aside className="auction-sidebar">
          <h3>Filters</h3>

          <label>Year</label>
          <div className="filter-row">
            <input type="number" placeholder="2000" />
            <span>-</span>
            <input type="number" placeholder="2024" />
          </div>

          <label>Fuel Type</label>
          <select>
            <option>Gasoline</option>
            <option>Diesel</option>
          </select>

          <label>Transmission</label>
          <select>
            <option>Automatic</option>
            <option>Manual</option>
          </select>

          <button className="filter-btn">Apply Filters</button>
        </aside>

        <main className="auction-main">
          <nav className="auction-tabs">
            {['Live Auctions', 'Ending Soon', 'My Bids', 'Won Auctions', 'Start New Auction'].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab.toLowerCase() ? 'active' : ''}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="auction-listings">
            {auctions.length === 0 ? (
              <div className="auction-listings-placeholder">
                <h3>No auctions live right now</h3>
                <p>Check back soon or create your own auction listing.</p>
              </div>
            ) : (
              auctions.map((car) => (
                <div className="auction-card" key={car.id}>
                  <img src={car.image} alt={car.title} className="auction-image" />
                  <div className="auction-details">
                    <h4>{car.title}</h4>
                    <p>{car.engine} | {car.transmission} | {car.fuel}</p>
                    <p>📍 {car.location}</p>
                    <div className="auction-bid-row">
                      <span className="bid-price">€{car.currentBid.toLocaleString()}</span>
                      <span className="bid-time">{car.timeLeft}</span>
                    </div>
                    <p>{car.bids} bids</p>
                    <button className="place-bid-btn">Place Bid</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuctionSection; 