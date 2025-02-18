import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './Buy.css';


const Buy = () => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [fuel, setFuel] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [color, setColor] = useState('');
  const [interiorColor, setInteriorColor] = useState('');
  const [interiorMaterial, setInteriorMaterial] = useState('');
  const [transmission, setTransmission] = useState('');
  const [driveType, setDriveType] = useState('');
  const [doors, setDoors] = useState('');
  const [features, setFeatures] = useState({
    airbags: false,
    seatWarmers: false,
    sunroof: false,
    parkingSensors: false,
    backupCamera: false,
    navigation: false,
    bluetooth: false,
    heatedSeats: false,
    cruiseControl: false,
    laneAssist: false,
    keylessEntry: false,
    leatherSeats: false,
    appleCarPlay: false,
    androidAuto: false,
  });

  const [carListings, setCarListings] = useState([]);

  useEffect(() => {
    const fetchCars = () => {
      fetch("http://localhost:5000/cars")
        .then((response) => response.json())
        .then((data) => setCarListings(data))
        .catch((error) => console.error("Error fetching cars:", error));
    };
  
    fetchCars();
  
    // Auto-refresh every 10 seconds to check for new cars
    const interval = setInterval(fetchCars, 10000);
    
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);
  

  const toggleMoreFilters = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  const handleFeatureChange = (feature) => {
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [feature]: !prevFeatures[feature],
    }));
  };
  const filteredCars = carListings.filter((car) => {
    return (
      (!manufacturer || car.manufacturer.toLowerCase() === manufacturer.toLowerCase()) &&
      (!model || car.model.toLowerCase() === model.toLowerCase()) &&
      (!fuel || car.fuel.toLowerCase() === fuel.toLowerCase()) &&
      (!color || car.color?.toLowerCase() === color.toLowerCase()) &&
      (!transmission || car.transmission.toLowerCase() === transmission.toLowerCase()) &&
      (!driveType || car.drive_type.toLowerCase() === driveType.toLowerCase()) &&
      (!priceFrom || parseFloat(car.price) >= parseFloat(priceFrom)) &&
      (!priceTo || parseFloat(car.price) <= parseFloat(priceTo))
    );
  });
  
  

  return (
    <div className="buy-page">
      {/* Filters Section on Top */}
      <div className="filters-section-top">
        <div className="filters">
          <div className="filter">
            <label>Manufacturer</label>
            <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>

              <option value="">Any</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Toyota">Toyota</option>
              <option value="BMW">BMW</option>
            </select>
          </div>

          <div className="filter">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="">Any</option>
              <option value="Golf">Golf</option>
              <option value="Corolla">Corolla</option>
              <option value="X5">X5</option>
            </select>
          </div>

          <div className="filter">
            <label>Fuel Type</label>
            <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
              <option value="">Any</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="filter">
            <label>Price (From)</label>
            <input
              type="number"
              value={priceFrom}
              placeholder="Min Price"
              onChange={(e) => setPriceFrom(e.target.value)}
            />
          </div>

          <div className="filter">
            <label>Price (To)</label>
            <input
              type="number"
              value={priceTo}
              placeholder="Max Price"
              onChange={(e) => setPriceTo(e.target.value)}
            />
          </div>

          {/* Button to show/hide more filters */}
          <button className="toggle-more-filters" onClick={toggleMoreFilters}>
            {showMoreFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>

        {/* More Filters Section */}
        {showMoreFilters && (
          <div className="more-filters-section">
            <div className="filter">
              <label>Exterior Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                <option value="">Any</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
              </select>
            </div>

            <div className="filter">
              <label>Interior Color</label>
              <select value={interiorColor} onChange={(e) => setInteriorColor(e.target.value)}>
                <option value="">Any</option>
                <option value="Black">Black</option>
                <option value="Beige">Beige</option>
                <option value="Gray">Gray</option>
                <option value="Brown">Brown</option>
              </select>
            </div>

            <div className="filter">
              <label>Interior Material</label>
              <select
                value={interiorMaterial}
                onChange={(e) => setInteriorMaterial(e.target.value)}
              >
                <option value="">Any</option>
                <option value="Leather">Leather</option>
                <option value="Fabric">Fabric</option>
                <option value="Synthetic">Synthetic</option>
              </select>
            </div>

            <div className="filter">
              <label>Transmission</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                <option value="">Any</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="filter">
              <label>Drive Type</label>
              <select value={driveType} onChange={(e) => setDriveType(e.target.value)}>
                <option value="">Any</option>
                <option value="FWD">Front-Wheel Drive (FWD)</option>
                <option value="RWD">Rear-Wheel Drive (RWD)</option>
                <option value="AWD">All-Wheel Drive (AWD)</option>
              </select>
            </div>

            <div className="filter">
              <label>Number of Doors</label>
              <select value={doors} onChange={(e) => setDoors(e.target.value)}>
                <option value="">Any</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            {/* Car Features organized neatly in rows */}
            <div className="filter features-grid">
              <label>
                <input type="checkbox" checked={features.airbags} onChange={() => handleFeatureChange('airbags')} />
                Airbags
              </label>
              <label>
                <input type="checkbox" checked={features.seatWarmers} onChange={() => handleFeatureChange('seatWarmers')} />
                Seat Warmers
              </label>
              <label>
                <input type="checkbox" checked={features.sunroof} onChange={() => handleFeatureChange('sunroof')} />
                Sunroof
              </label>
              <label>
                <input type="checkbox" checked={features.parkingSensors} onChange={() => handleFeatureChange('parkingSensors')} />
                Parking Sensors
              </label>
              <label>
                <input type="checkbox" checked={features.backupCamera} onChange={() => handleFeatureChange('backupCamera')} />
                Backup Camera
              </label>
              <label>
                <input type="checkbox" checked={features.bluetooth} onChange={() => handleFeatureChange('bluetooth')} />
                Bluetooth
              </label>
              <label>
                <input type="checkbox" checked={features.heatedSeats} onChange={() => handleFeatureChange('heatedSeats')} />
                Heated Seats
              </label>
              <label>
                <input type="checkbox" checked={features.cruiseControl} onChange={() => handleFeatureChange('cruiseControl')} />
                Cruise Control
              </label>
              <label>
                <input type="checkbox" checked={features.laneAssist} onChange={() => handleFeatureChange('laneAssist')} />
                Lane Assist
              </label>
              <label>
                <input type="checkbox" checked={features.keylessEntry} onChange={() => handleFeatureChange('keylessEntry')} />
                Keyless Entry
              </label>
              <label>
                <input type="checkbox" checked={features.leatherSeats} onChange={() => handleFeatureChange('leatherSeats')} />
                Leather Seats
              </label>
              <label>
                <input type="checkbox" checked={features.appleCarPlay} onChange={() => handleFeatureChange('appleCarPlay')} />
                Apple CarPlay
              </label>
              <label>
                <input type="checkbox" checked={features.androidAuto} onChange={() => handleFeatureChange('androidAuto')} />
                Android Auto
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Car Listings Section */}
      <div className="car-listings-section">
        <h2>Car Listings</h2>
        <div className="car-listings">
          {filteredCars.length > 0 ? (
            filteredCars.map(car => (
              <Link to={`/car/${car.id}`} state={{ car }} style={{ textDecoration: 'none', color: 'inherit' }} key={car.id}>
                <div className="car-listing">
                <img src={car.image_path ? `http://localhost:5000${car.image_path}` : 'https://via.placeholder.com/300'} alt={car.model} />
                  <div className="car-details">
                    <h3>{car.manufacturer} {car.model}</h3>
                    <p><strong>Year:</strong> {car.year}</p>
                    <p><strong>Kilometers:</strong> {car.kilometers} km</p>
                    <p><strong>Fuel Type:</strong> {car.fuel}</p>
                    <p><strong>Drive Type:</strong> {car.drive_type}</p>
                    <p><strong>Transmission:</strong> {car.transmission}</p>
                    <p><strong>Price:</strong> ${car.price}</p>
                    <p><strong>Horsepower:</strong> {car.horsepower} HP</p>

                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No cars found matching your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Buy;
