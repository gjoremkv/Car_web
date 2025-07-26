import React, { useEffect, useState } from 'react';
import CarForm from './CarForm';

export default function StartAuctionPanel() {
  const [step, setStep] = useState(0); // 0: choose, 1: existing, 2: new
  const [myCars, setMyCars] = useState([]);
  const [carInputs, setCarInputs] = useState({}); // Store inputs per car ID
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId'); // Assuming userId is also stored in localStorage

  useEffect(() => {
    if (step === 1 && userId) {
      console.log('🔍 Fetching user cars for auction...');
      setLoading(true);
      // Clear previous data first
      setMyCars([]);
      setCarInputs({});
      
      fetch(`http://localhost:5000/api/cars/my-cars`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('📦 Received my cars:', data);
          if (Array.isArray(data)) {
            // Remove any potential duplicates by ID
            const uniqueCars = data.filter((car, index, arr) => 
              arr.findIndex(c => c.id === car.id) === index
            );
            console.log(`📋 Found ${uniqueCars.length} unique cars for user`);
            setMyCars(uniqueCars);
            // Initialize inputs for each unique car
            const initialInputs = {};
            uniqueCars.forEach(car => {
              initialInputs[car.id] = { startPrice: '', duration: 24 };
            });
            setCarInputs(initialInputs);
          } else if (Array.isArray(data.cars)) {
            const uniqueCars = data.cars.filter((car, index, arr) => 
              arr.findIndex(c => c.id === car.id) === index
            );
            setMyCars(uniqueCars);
          } else {
            setMyCars([]);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('❌ Error fetching my cars:', error);
          setMyCars([]);
          setLoading(false);
        });
    } else if (step !== 1) {
      // Clear data when not on step 1
      setMyCars([]);
      setCarInputs({});
    }
  }, [step, userId, token]);

  // Update input for specific car
  const updateCarInput = (carId, field, value) => {
    setCarInputs(prev => ({
      ...prev,
      [carId]: {
        ...prev[carId],
        [field]: value
      }
    }));
  };

  // Auction existing car
  const handleAuctionExisting = async (car) => {
    const inputs = carInputs[car.id];
    const startPrice = Number(inputs?.startPrice);
    const duration = Number(inputs?.duration);

    // Validation
    if (!startPrice || startPrice <= 0) {
      alert('Please enter a valid start price');
      return;
    }
    if (!duration || duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    setLoading(true);
    try {
      // Start auction with inputs for this car
      const { startPrice, duration } = carInputs[car.id];
      console.log(`🏁 Starting auction: ${car.manufacturer} ${car.model} - €${startPrice} for ${duration}h`);
      
      const res = await fetch('http://localhost:5000/start-auction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          car_id: car.id,
          start_price: Number(startPrice),
          duration_hours: Number(duration)
        })
      });
      
      const responseData = await res.json();
      console.log('📡 Auction response:', responseData);
      
      if (res.ok) {
        alert(`Auction started successfully for ${car.manufacturer} ${car.model}!`);
        setStep(0);
        setCarInputs({}); // Reset inputs
      } else {
        alert(`Failed to start auction: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error starting auction:', error);
      alert('Failed to start auction due to network error');
    } finally {
      setLoading(false);
    }
  };

  // Create car then auction
  const handleCreateAuctionFromScratch = async (formData) => {
    console.log('[DEBUG] Submitting car for auction...');
    setLoading(true);
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      {step === 0 && (
        <div>
          <h2>Start New Auction</h2>
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            <button 
              onClick={() => setStep(1)}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Auction an Existing Listing
            </button>
            <button 
              onClick={() => setStep(2)}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Create Auction From Scratch
            </button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div>
          <h3>Select a car to auction</h3>
          {loading && <div>Loading your cars...</div>}
          {!loading && (!myCars || myCars.length === 0) && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              <p>No listings found.</p>
              <p>You need to create a car listing first before you can auction it.</p>
            </div>
          )}
          {!loading && Array.isArray(myCars) && myCars.map(car => {
            const inputs = carInputs[car.id] || { startPrice: '', duration: 24 };
            return (
              <div key={car.id} style={{ 
                border: '1px solid #ddd', 
                margin: '16px 0', 
                padding: '16px', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  {car.image_path && (
                    <img 
                      src={`http://localhost:5000${car.image_path}`} 
                      alt={`${car.manufacturer} ${car.model}`}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{car.manufacturer} {car.model} ({car.year})</h4>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                      Listed for: €{car.price} | {car.fuel} | {car.transmission}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                      Start Price (€):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 1000"
                      value={inputs.startPrice}
                      onChange={e => updateCarInput(car.id, 'startPrice', e.target.value)}
                      style={{ 
                        padding: '8px', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px',
                        width: '120px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                      Duration (hours):
                    </label>
                    <input
                      type="number"
                      placeholder="24"
                      value={inputs.duration}
                      onChange={e => updateCarInput(car.id, 'duration', e.target.value)}
                      style={{ 
                        padding: '8px', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px',
                        width: '100px'
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => handleAuctionExisting(car)}
                    disabled={loading || !inputs.startPrice || !inputs.duration}
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: loading || !inputs.startPrice || !inputs.duration ? '#ccc' : '#dc3545',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: loading || !inputs.startPrice || !inputs.duration ? 'not-allowed' : 'pointer',
                      marginTop: '20px'
                    }}
                  >
                    {loading ? 'Starting...' : 'Start Auction'}
                  </button>
                </div>
              </div>
            );
          })}
          <button 
            onClick={() => setStep(0)} 
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
      )}
      {step === 2 && (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>Create New Auction</h3>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '30px', 
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Car Details
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Manufacturer (e.g., BMW)"
                  style={{ 
                    padding: '12px', 
                    border: '2px solid #dee2e6', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Model (e.g., M3)"
                  style={{ 
                    padding: '12px', 
                    border: '2px solid #dee2e6', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input
                  type="number"
                  placeholder="Year (e.g., 2020)"
                  style={{ 
                    padding: '12px', 
                    border: '2px solid #dee2e6', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Kilometers"
                  style={{ 
                    padding: '12px', 
                    border: '2px solid #dee2e6', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Auction Settings
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6c757d' }}>
                    Starting Price (€)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    style={{ 
                      padding: '12px', 
                      border: '2px solid #dee2e6', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6c757d' }}>
                    Duration (hours)
                  </label>
                  <select
                    style={{ 
                      padding: '12px', 
                      border: '2px solid #dee2e6', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                    <option value="168">1 week</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>
                Car Images
              </label>
              <div style={{ 
                border: '2px dashed #dee2e6', 
                borderRadius: '8px', 
                padding: '30px', 
                textAlign: 'center',
                backgroundColor: 'white'
              }}>
                <p style={{ margin: '0', color: '#6c757d' }}>
                  📸 Click or drag images here to upload
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  style={{ marginTop: '10px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => setStep(0)}
                style={{ 
                  padding: '12px 30px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ← Back
              </button>
              <button 
                style={{ 
                  padding: '12px 30px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                🚗 Create Auction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 