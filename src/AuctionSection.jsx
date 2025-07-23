import React, { useEffect, useState } from 'react';
import './AuctionSection.css';
import StartAuctionPanel from './components/StartAuctionPanel';

const TABS = [
  { key: 'live auctions', label: 'Live Auctions' },
  { key: 'ending soon', label: 'Ending Soon' },
  { key: 'my bids', label: 'My Bids' },
  { key: 'won auctions', label: 'Won Auctions' },
  { key: 'start new auction', label: 'START NEW AUCTION' }
];

const AuctionSection = () => {
  const [activeTab, setActiveTab] = useState('live auctions');
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      let endpoint = '';
      if (activeTab === 'live auctions') endpoint = '/auctions/live';
      else if (activeTab === 'ending soon') endpoint = '/auctions/ending-soon';
      else return;

      try {
        const res = await fetch(`http://localhost:5000${endpoint}`);
        
        if (!res.ok) {
          console.error(`Failed to fetch auctions: ${res.status} ${res.statusText}`);
          setAuctions([]);
          return;
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON:', contentType);
          setAuctions([]);
          return;
        }

        const data = await res.json();
        setAuctions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setAuctions([]);
      }
    };

    fetchAuctions();
  }, [activeTab]);

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
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? 'active' : ''}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === 'start new auction' ? (
            <div className="auction-form-outer">
              <StartAuctionPanel />
            </div>
          ) : (
            <div className="auction-listings">
              {auctions.length === 0 ? (
                <div className="auction-listings-placeholder">
                  <h3>No auctions live right now</h3>
                  <p>Check back soon or create your own auction listing.</p>
                </div>
              ) : (
                auctions.map((auction) => {
                  // Use server-calculated time left instead of local calculation
                  const timeLeft = auction.time_left_formatted || 
                    (auction.minutes_remaining > 0 ? `${auction.minutes_remaining}m left` : 'Ended');
                  
                  return (
                    <div className="auction-card" key={auction.auction_id}>
                      <img 
                        src={auction.image_path ? `http://localhost:5000${auction.image_path}` : '/placeholder.jpg'} 
                        alt={`${auction.manufacturer} ${auction.model}`} 
                        className="auction-image" 
                      />
                      <div className="auction-details">
                        <h4>{auction.manufacturer} {auction.model} ({auction.year})</h4>
                        <p>{auction.engine_cubic || 'N/A'} | {auction.transmission || 'N/A'} | {auction.fuel || 'N/A'}</p>
                        <p>📍 Location TBD</p>
                        <div className="auction-bid-row">
                          <span className="bid-price">
                            €{auction.current_bid ? parseFloat(auction.current_bid).toLocaleString() : '0'}
                          </span>
                          <span className="bid-time">{timeLeft}</span>
                        </div>
                        <p>{auction.bid_count || 0} bids | Starting: €{auction.start_price ? parseFloat(auction.start_price).toLocaleString() : '0'}</p>
                        <button className="place-bid-btn" disabled={auction.status !== 'active'}>
                          {auction.status === 'active' ? 'Place Bid' : 'Auction Ended'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuctionSection; 