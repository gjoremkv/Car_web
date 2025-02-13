import React, { useState } from 'react';
import './MainSection.css'; // Import the corresponding CSS file

function MainSection() {
  // State to control the visibility of the popup
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDriveType, setSelectedDriveType] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Stores search results

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // 📌 Function to send search data to backend
  const fetchSearchResults = async (e) => {
    e.preventDefault();

    const searchData = {
      driveType: selectedDriveType,
      fuel: selectedFuelType,
      transmission: selectedTransmission,
      budgetMin: parseInt(budgetMin) || 0,
      budgetMax: parseInt(budgetMax) || 1000000,
      familySize: parseInt(familySize) || 1,
      vehicleType: selectedVehicleType,
    };

    try {
      const response = await fetch('http://localhost:5000/search-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <section className="main-section">
      {/* Background Image and Welcome Box */}
      <div className="background-image-container">
        <div className="content-container">
          <div className="welcome-box">
            <h2>Shopping for a Car?</h2>
            <p>
              Still not sure what you're looking for? No worries! We have the perfect match for you today.
              Try our latest configurator based on your needs and wishes.
            </p>
            <button onClick={togglePopup} className="start-configurator-btn">
              Try Our Configurator
            </button>
          </div>
        </div>
      </div>

      {/* Configurator Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Car Preferences</h2>
            <form onSubmit={fetchSearchResults}>
              {/* Row 1: Drive Type & Fuel */}
              <div className="form-row">
                <label>
                  Drive Type:
                  <select value={selectedDriveType} onChange={(e) => setSelectedDriveType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="FWD">Front-Wheel Drive</option>
                    <option value="RWD">Rear-Wheel Drive</option>
                    <option value="AWD">All-Wheel Drive</option>
                    <option value="4WD">4-Wheel Drive</option>
                  </select>
                </label>

                <label>
                  Fuel Type:
                  <select value={selectedFuelType} onChange={(e) => setSelectedFuelType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>
              </div>

              {/* Row 2: Transmission & Budget */}
              <div className="form-row">
                <label>
                  Transmission:
                  <select value={selectedTransmission} onChange={(e) => setSelectedTransmission(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </label>

                <label>
                  Budget:
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </label>
              </div>

              {/* Row 3: Family Size & Vehicle Type */}
              <div className="form-row">
                <label>
                  Family Size:
                  <input
                    type="number"
                    placeholder="Seats"
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                  />
                </label>

                <label>
                  Vehicle Type:
                  <select value={selectedVehicleType} onChange={(e) => setSelectedVehicleType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Coupe">Coupe</option>
                  </select>
                </label>
              </div>

              <button type="submit">Search</button>
            </form>
            <button className="close-popup" onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}

      {/* Display Search Results */}
      <div className="search-results">
        <h3>Search Results:</h3>
        {searchResults.length === 0 ? (
          <p>No matching cars found</p>
        ) : (
          searchResults.map((car, index) => (
            <div key={index} className="car-card">
              <h4>{car.manufacturer} {car.model} ({car.year})</h4>
              <p><strong>Price:</strong> ${car.price}</p>
              <p><strong>Drive Type:</strong> {car.drive_type}</p>
              <p><strong>Fuel:</strong> {car.fuel}</p>
              <p><strong>Seats:</strong> {car.seats}</p>
              <img src={`http://localhost:5000${car.image_path}`} alt={car.model} className="car-image" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default MainSection;
