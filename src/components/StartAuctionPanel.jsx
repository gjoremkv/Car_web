import React, { useEffect, useState } from 'react';
import CarForm from './CarForm';

export default function StartAuctionPanel() {
  const [step, setStep] = useState(0); // 0: choose, 1: existing, 2: new
  const [myCars, setMyCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState(24);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (step === 1 && userId) {
      fetch(`http://localhost:5000/my-cars`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMyCars(data);
          else if (Array.isArray(data.cars)) setMyCars(data.cars);
          else setMyCars([]);
        })
        .catch(() => setMyCars([]));
    }
  }, [step, userId, token]);

  // Auction existing car
  const handleAuctionExisting = async (car) => {
    const res = await fetch('http://localhost:5000/start-auction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        car_id: car.id,
        start_price: Number(startPrice),
        duration_hours: Number(duration)
      })
    });
    if (res.ok) {
      alert('Auction started!');
      setStep(0);
    } else {
      alert('Failed to start auction');
    }
  };

  // Create car then auction
  const handleCreateAuctionFromScratch = async (formData) => {
    const token = localStorage.getItem('token');
    console.log('[DEBUG] Submitting car for auction...');
    try {
      const res = await fetch('http://localhost:5000/add-car', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.car || !data.car.id) {
        alert('Failed to create car');
        return;
      }
      // 2. Prompt for auction details
      let startPrice = prompt("Enter start price (€):");
      let duration = prompt("Enter duration (hours):");
      if (!startPrice || !duration) {
        alert('Auction cancelled');
        return;
      }
      // 3. Create the auction
      const auctionRes = await fetch('http://localhost:5000/start-auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          car_id: data.car.id,
          start_price: Number(startPrice),
          duration_hours: Number(duration)
        })
      });
      if (auctionRes.ok) {
        alert('Auction created!');
        setStep(0);
      } else {
        alert('Failed to create auction');
      }
    } catch (error) {
      console.error('Error creating auction from scratch:', error);
      alert('Failed to create auction from scratch');
    }
  };

  return (
    <div style={{ padding: 32 }}>
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
          {(!myCars || myCars.length === 0) && <div>No listings found.</div>}
          {Array.isArray(myCars) && myCars.map(car => (
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
          <button onClick={() => setStep(0)}>Back</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <CarForm onSubmit={handleCreateAuctionFromScratch} submitLabel="Create Auction" />
          <button onClick={() => setStep(0)} style={{ marginTop: 16 }}>Back</button>
        </div>
      )}
    </div>
  );
} 