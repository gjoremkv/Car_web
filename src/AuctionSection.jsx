import React, { useEffect, useState } from 'react';
import './AuctionSection.css';
import StartAuctionPanel from './components/StartAuctionPanel';
import BiddingModal from './components/BiddingModal';
import socket from './socket';

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
  const [myBids, setMyBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showBiddingModal, setShowBiddingModal] = useState(false);

  const handleBidClick = (auction) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to place a bid');
      return;
    }
    setSelectedAuction(auction);
    setShowBiddingModal(true);
  };

  const handleBidPlaced = (auctionId, newBidAmount) => {
    // Update the auction in the local state with the new bid
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.auction_id === auctionId 
          ? { ...auction, current_bid: newBidAmount.toString() }
          : auction
      )
    );
  };

  const closeBiddingModal = () => {
    setShowBiddingModal(false);
    setSelectedAuction(null);
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      let endpoint = '';
      if (activeTab === 'live auctions') endpoint = '/auctions/live';
      else if (activeTab === 'ending soon') endpoint = '/auctions/ending-soon';
      else if (activeTab === 'my bids') {
        // Fetch user's bids
        const token = localStorage.getItem('token');
        if (!token) {
          setMyBids([]);
          return;
        }
        
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/my-bids`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const data = await res.json();
          
          // Ensure data is an array
          if (Array.isArray(data)) {
            setMyBids(data);
          } else {
            console.error('❌ Expected array but got:', typeof data, data);
            setMyBids([]);
          }
        } catch (error) {
          console.error('❌ Error fetching my bids:', error);
          setMyBids([]);
        }
        return;
      }
      else if (activeTab === 'won auctions') {
        // Fetch user's won auctions
        const token = localStorage.getItem('token');
        if (!token) {
          setWonAuctions([]);
          return;
        }
        
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/won-auctions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const data = await res.json();
          
          // Ensure data is an array
          if (Array.isArray(data)) {
            setWonAuctions(data);
          } else {
            console.error('❌ Expected array but got:', typeof data, data);
            setWonAuctions([]);
          }
        } catch (error) {
          console.error('❌ Error fetching won auctions:', error);
          setWonAuctions([]);
        }
        return;
      }
      else return;

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
        
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

    // Listen for real-time bid updates only for auction tabs
    if (activeTab === 'live auctions' || activeTab === 'ending soon') {
      const handleBidUpdate = (bidData) => {
        console.log('💰 Real-time bid update received:', bidData);
        setAuctions(prevAuctions => 
          prevAuctions.map(auction => 
            auction.auction_id === bidData.auction_id 
              ? { ...auction, current_bid: bidData.new_bid.toString() }
              : auction
          )
        );
      };

      socket.on('bidUpdate', handleBidUpdate);

      // Cleanup
      return () => {
        socket.off('bidUpdate', handleBidUpdate);
      };
    }
  }, [activeTab]);

  return (
    <div className="auction-page">
      <header className="auction-header">
        <h1>Auction Page</h1>
        <div>
       
        </div>
      </header>

      <div className="auction-body">

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
              {(() => {
                console.log('🎨 Rendering logic - activeTab:', activeTab);
                console.log('🎨 myBids.length:', myBids.length);
                console.log('🎨 auctions.length:', auctions.length);
                
                if (activeTab === 'my bids') {
                  console.log('🎨 Rendering My Bids section');
                  if (myBids.length === 0) {
                    console.log('🎨 Showing no bids placeholder');
                    return (
                      <div className="auction-listings-placeholder">
                        <h3>No bids placed yet</h3>
                        <p>Place a bid on an auction to see it here.</p>
                      </div>
                    );
                  } else {
                    console.log('🎨 Showing bids:', myBids);
                    return myBids.map((bid) => {
                      console.log('🎨 Rendering bid:', bid);
                      return (
                        <div className="auction-card" key={bid.bid_id}>
                          <img 
                            src={bid.image_path ? apiUrl(bid.image_path) : '/placeholder.jpg'} 
                            alt={`${bid.manufacturer} ${bid.model}`} 
                            className="auction-image" 
                          />
                          <div className="auction-details">
                            <h4>{bid.manufacturer} {bid.model} ({bid.year})</h4>
                            <p><strong>Your Bid:</strong> €{parseFloat(bid.bid_amount).toLocaleString()}</p>
                            <p><strong>Current Bid:</strong> €{parseFloat(bid.current_bid).toLocaleString()}</p>
                            <p><strong>Status:</strong> <span className={`bid-status ${bid.bid_status}`}>{bid.bid_status}</span></p>
                            <p><strong>Auction:</strong> {bid.status}</p>
                            <p><strong>Bid Placed:</strong> {new Date(bid.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    });
                  }
                } else if (activeTab === 'won auctions') {
                  console.log('🎨 Rendering Won Auctions section');
                  if (wonAuctions.length === 0) {
                    console.log('🎨 Showing no won auctions placeholder');
                    return (
                      <div className="auction-listings-placeholder">
                        <h3>No won auctions yet</h3>
                        <p>You haven't won any auctions yet.</p>
                      </div>
                    );
                  } else {
                    console.log('🎨 Showing won auctions:', wonAuctions);
                    return wonAuctions.map((auction) => {
                      console.log('🎨 Rendering won auction:', auction);
                      return (
                        <div className="auction-card" key={auction.auction_id}>
                          <img 
                            src={auction.image_path ? apiUrl(auction.image_path) : '/placeholder.jpg'} 
                            alt={`${auction.manufacturer} ${auction.model}`} 
                            className="auction-image" 
                          />
                          <div className="auction-details">
                            <h4>{auction.manufacturer} {auction.model} ({auction.year})</h4>
                            <p>{auction.engine_cubic || 'N/A'} | {auction.transmission || 'N/A'} | {auction.fuel || 'N/A'}</p>
                            <p>📍 Location TBD</p>
                            <div className="auction-bid-row">
                              <span className="bid-price">
                                €{auction.winning_bid ? parseFloat(auction.winning_bid).toLocaleString() : '0'}
                              </span>
                              <span className="bid-time">WON</span>
                            </div>
                            <p>Starting Price: €{auction.start_price ? parseFloat(auction.start_price).toLocaleString() : '0'}</p>
                            <p><strong>Status:</strong> <span className="bid-status won">Auction Won</span></p>
                            <p><strong>Won Date:</strong> {new Date(auction.end_time).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    });
                  }
                } else {
                  console.log('🎨 Rendering auctions section');
                  if (auctions.length === 0) {
                    return (
                      <div className="auction-listings-placeholder">
                        <h3>No auctions live right now</h3>
                        <p>Check back soon or create your own auction listing.</p>
                      </div>
                    );
                  } else {
                    return auctions.map((auction) => {
                      const timeLeft = auction.time_left_formatted || 
                        (auction.minutes_remaining > 0 ? `${auction.minutes_remaining}m left` : 'Ended');
                      
                      return (
                        <div className="auction-card" key={auction.auction_id}>
                          <img 
                            src={auction.image_path ? apiUrl(auction.image_path) : '/placeholder.jpg'} 
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
                            <button className="place-bid-btn" disabled={auction.status !== 'active'} onClick={() => handleBidClick(auction)}>
                              {auction.status === 'active' ? 'Place Bid' : 'Auction Ended'}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  }
                }
              })()}
            </div>
          )}
        </main>
      </div>
      {showBiddingModal && selectedAuction && (
        <BiddingModal
          auction={selectedAuction}
          onBidPlaced={handleBidPlaced}
          onClose={closeBiddingModal}
        />
      )}
    </div>
  );
};

export default AuctionSection; 
import { apiUrl } from './utils/url';
