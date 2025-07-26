import React, { useEffect, useState } from 'react';

export default function StartAuctionModal({ onClose }) {
  const [step, setStep] = useState(0); // 0: choose, 1: existing, 2: new
  const [myCars, setMyCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState(24);

  // For new car
  const [carDetails, setCarDetails] = useState({
    manufacturer: '', model: '', year: '', price: '', fuel: '', transmission: '', color: '',
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`http://localhost:5000/api/cars/my-cars`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setMyCars(data))
    .catch(err => console.error('Error fetching my cars:', err));
  }, []);

  const handleStartAuction = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auctions/start-auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          car_id: selectedCar,
          start_price: startPrice,
          end_time: endTime,
        }),
      });

      if (res.ok) {
        alert('Auction started successfully!');
        onClose();
      } else {
        alert('Failed to start auction');
      }
    } catch (error) {
      console.error('Error starting auction:', error);
      alert('Error starting auction');
    }
  };

  const handleAuctionExistingCar = async () => {
    if (!selectedCar || !startPrice || !endTime) {
      alert('Please fill all fields');
      return;
    }

    try {
      const auctionRes = await fetch('http://localhost:5000/api/auctions/start-auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          car_id: selectedCar,
          start_price: startPrice,
          end_time: endTime,
        }),
      });

      if (auctionRes.ok) {
        alert('Auction started successfully!');
        onClose();
      } else {
        alert('Failed to start auction');
      }
    } catch (error) {
      console.error('Error starting auction:', error);
      alert('Error starting auction');
    }
  };

  // Create car then auction
  const handleCreateAndAuction = async () => {
    // 1. Create car
    const carRes = await fetch('http://localhost:5000/add-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...carDetails, seller_id: userId })
    });
    const carData = await carRes.json();
    if (!carRes.ok || !carData.id) {
      alert('Failed to create car');
      return;
    }
    // 2. Start auction
    const auctionRes = await fetch('http://localhost:5000/api/auctions/start-auction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        car_id: carData.id,
        start_price: Number(startPrice),
        duration_hours: Number(duration)
      })
    });
    if (auctionRes.ok) {
      alert('Auction started!');
      onClose();
    } else {
      alert('Failed to start auction');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 10, minWidth: 320 }}>
        <button onClick={onClose} style={{ float: 'right' }}>X</button>
        {step === 0 && (
          <div>
            <h2>Start New Auction</h2>
            <button onClick={() => setStep(1)}>Auction an Existing Listing</button>
            <button onClick={() => setStep(2)}>Create Auction From Scratch</button>
          </div>
        )}
        {step === 1 && (
          <div>
            <h3>Select a car to auction</h3>
            {myCars.length === 0 && <div>No listings found.</div>}
            {myCars.map(car => (
              <div key={car.id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
                <div>{car.manufacturer} {car.model} ({car.year})</div>
                <input
                  type="number"
                  placeholder="Start Price"
                  value={selectedCar?.id === car.id ? startPrice : ''}
                  onChange={e => {
                    setSelectedCar(car);
                    setStartPrice(e.target.value);
                  }}
                />
                <input
                  type="number"
                  placeholder="Duration (hours)"
                  value={selectedCar?.id === car.id ? duration : 24}
                  onChange={e => {
                    setSelectedCar(car);
                    setDuration(e.target.value);
                  }}
                />
                <button onClick={() => handleAuctionExisting(car)}>Start Auction</button>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <h3>Enter Car Details</h3>
            <input placeholder="Manufacturer" value={carDetails.manufacturer} onChange={e => setCarDetails(d => ({ ...d, manufacturer: e.target.value }))} />
            <input placeholder="Model" value={carDetails.model} onChange={e => setCarDetails(d => ({ ...d, model: e.target.value }))} />
            <input placeholder="Year" value={carDetails.year} onChange={e => setCarDetails(d => ({ ...d, year: e.target.value }))} />
            {/* Add more fields as needed */}
            <input placeholder="Start Price" type="number" value={startPrice} onChange={e => setStartPrice(e.target.value)} />
            <input placeholder="Duration (hours)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
            <button onClick={handleCreateAndAuction}>Create Car & Start Auction</button>
          </div>
        )}
      </div>
    </div>
  );
} 