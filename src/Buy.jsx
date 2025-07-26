import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { popularManufacturers, otherManufacturers } from './data/manufacturers';
import { modelsByBrand } from './data/modelsByBrand';
import './Buy.css';

const Buy = () => {
  const location = useLocation();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [fuel, setFuel] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [color, setColor] = useState('');
  const [interiorColor, setInteriorColor] = useState('');
  const [interiorMaterial, setInteriorMaterial] = useState('');
  const [transmission, setTransmission] = useState('');
  const [driveType, setDriveType] = useState('');
  const [doors, setDoors] = useState('');
  const [vehicleType, setVehicleType] = useState('');
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

  // Generate years array (last 40 years)
  const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

  // Function to search cars using backend API
  const searchCars = async (customFilters = null) => {
    const filters = customFilters || {
      manufacturer, model, fuel, transmission, driveType, vehicleType,
      priceFrom, priceTo, yearFrom, yearTo, kilometers
    };
    
    console.log('🔍 Searching cars with filters:', filters);

    try {
      const searchData = {
        manufacturer: filters.manufacturer || undefined,
        model: filters.model || undefined,
        fuel: filters.fuel || undefined,
        transmission: filters.transmission || undefined,
        driveType: filters.driveType || undefined,
        vehicleType: filters.vehicleType || undefined,
        priceFrom: filters.priceFrom || undefined,
        priceTo: filters.priceTo || undefined,
        yearFrom: filters.yearFrom || undefined,
        yearTo: filters.yearTo || undefined,
        kilometers: filters.kilometers || undefined
      };

      // Remove undefined values
      Object.keys(searchData).forEach(key => 
        searchData[key] === undefined && delete searchData[key]
      );

      const response = await fetch("http://localhost:5000/api/search/search-cars", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Search results:", data.length, "cars found");
      
      if (Array.isArray(data)) {
        setCarListings(data);
      } else {
        console.warn('Unexpected search data format, setting empty array');
        setCarListings([]);
      }
    } catch (error) {
      console.error("❌ Error searching cars:", error);
      setCarListings([]);
    }
  };

  // Initial load - fetch all cars or search with URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasFilters = searchParams.toString().length > 0;

    if (hasFilters) {
      // If we have URL parameters, perform search
      searchCars();
    } else {
      // Otherwise, fetch all cars
      const fetchAllCars = async () => {
        console.log('📋 Fetching all cars...');
        try {
          const response = await fetch("http://localhost:5000/api/cars");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          if (Array.isArray(data)) {
            setCarListings(data);
          } else if (data && data.cars && Array.isArray(data.cars)) {
            setCarListings(data.cars);
          } else {
            console.warn('Unexpected data format, setting empty array');
            setCarListings([]);
          }
        } catch (error) {
          console.error("Error fetching cars:", error);
          setCarListings([]);
        }
      };

      fetchAllCars();
    }
  }, []);

  // Initialize filters from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    console.log('🌐 URL Search string:', location.search);
    console.log('🔍 All URL parameters:', Object.fromEntries(searchParams));
    
    // Collect all URL parameters
    const urlFilters = {
      driveType: searchParams.get('driveType') || '',
      fuel: searchParams.get('fuel') || '',
      transmission: searchParams.get('transmission') || '',
      vehicleType: searchParams.get('vehicleType') || '',
      priceFrom: searchParams.get('priceFrom') || '',
      priceTo: searchParams.get('priceTo') || '',
      manufacturer: searchParams.get('manufacturer') || '',
      model: searchParams.get('model') || '',
      yearFrom: searchParams.get('yearFrom') || '',
      yearTo: searchParams.get('yearTo') || '',
      kilometers: searchParams.get('kilometers') || ''
    };
    
    console.log('📊 Processed URL filters:', urlFilters);
    
    // Set state values
    if (urlFilters.driveType) setDriveType(urlFilters.driveType);
    if (urlFilters.fuel) setFuel(urlFilters.fuel);
    if (urlFilters.transmission) setTransmission(urlFilters.transmission);
    if (urlFilters.vehicleType) setVehicleType(urlFilters.vehicleType);
    if (urlFilters.priceFrom) setPriceFrom(urlFilters.priceFrom);
    if (urlFilters.priceTo) setPriceTo(urlFilters.priceTo);
    if (urlFilters.manufacturer) setManufacturer(urlFilters.manufacturer);
    if (urlFilters.model) setModel(urlFilters.model);
    if (urlFilters.yearFrom) setYearFrom(urlFilters.yearFrom);
    if (urlFilters.yearTo) setYearTo(urlFilters.yearTo);
    if (urlFilters.kilometers) setKilometers(urlFilters.kilometers);
    
    // Auto-expand more filters if requested
    if (searchParams.get('showMoreFilters') === 'true') {
      setShowMoreFilters(true);
    }
    
    console.log('📊 Applied URL filters:', Object.fromEntries(searchParams));
    
    // Trigger search immediately with URL filters if any exist
    const hasFilters = Object.values(urlFilters).some(value => value !== '');
    if (hasFilters) {
      console.log('🔍 URL filters detected, searching immediately with:', urlFilters);
      searchCars(urlFilters);
    } else {
      console.log('📋 No URL filters found, will fetch all cars');
    }
  }, [location.search]);

  // Search whenever filters change (but not on initial load if URL has filters)
  useEffect(() => {
    // Don't trigger if this is the initial load with URL parameters
    const searchParams = new URLSearchParams(location.search);
    const hasUrlFilters = searchParams.toString().length > 0;
    
    if (!hasUrlFilters && (manufacturer || model || fuel || transmission || driveType || vehicleType || 
        priceFrom || priceTo || yearFrom || yearTo || kilometers)) {
      console.log('🔍 Filter changed, triggering search...');
      searchCars();
    }
  }, [manufacturer, model, fuel, transmission, driveType, vehicleType, 
      priceFrom, priceTo, yearFrom, yearTo, kilometers]);
  
  const toggleMoreFilters = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  const handleFeatureChange = (feature) => {
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [feature]: !prevFeatures[feature],
    }));
  };
  
  // Clear filters function
  const clearAllFilters = () => {
    console.log('🗑️ Clearing all filters');
    setManufacturer('');
    setModel('');
    setFuel('');
    setTransmission('');
    setDriveType('');
    setVehicleType('');
    setPriceFrom('');
    setPriceTo('');
    setYearFrom('');
    setYearTo('');
    setKilometers('');
    setColor('');
    setInteriorColor('');
    setInteriorMaterial('');
    setDoors('');
    setFeatures({
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
    
    // Fetch all cars after clearing filters
    setTimeout(() => {
      console.log('📋 Fetching all cars after clearing filters');
      const fetchAllCars = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/cars");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          if (Array.isArray(data)) {
            setCarListings(data);
          } else if (data && data.cars && Array.isArray(data.cars)) {
            setCarListings(data.cars);
          } else {
            console.warn('Unexpected data format, setting empty array');
            setCarListings([]);
          }
        } catch (error) {
          console.error("Error fetching cars:", error);
          setCarListings([]);
        }
      };
      fetchAllCars();
    }, 100);
  };

  return (
    <div className="buy-page">
      {/* Filters Section on Top */}
      <div className="filters-section-top">
        <div className="filters">
          <div className="filter">
            <label>Manufacturer</label>
            <select value={manufacturer} onChange={(e) => {
              setManufacturer(e.target.value);
              setModel(''); // Reset model when manufacturer changes
            }}>
              <option value="">Any</option>
              <optgroup label="Popular">
                {popularManufacturers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
              <optgroup label="All Brands A-Z">
                {otherManufacturers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="filter">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!manufacturer}>
              <option value="">Any</option>
              {manufacturer && modelsByBrand[manufacturer]?.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Fuel Type</label>
            <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
              <option value="">Any</option>
              <option value="Petrol">Petrol</option>
              <option value="Gasoline">Gasoline</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="filter">
            <label>Vehicle Type</label>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
              <option value="">Any</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">Coupe</option>
              <option value="Van">Van</option>
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
          
          {/* Clear All Filters button */}
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear All
          </button>
        </div>

        {/* Search Results Summary */}
        <div className="search-summary">
          <p>
            <strong>{carListings.length}</strong> cars found
            {(manufacturer || model || fuel || vehicleType || priceFrom || priceTo || yearFrom || yearTo || kilometers) && (
              <span> matching your filters</span>
            )}
          </p>
          {manufacturer && <span className="active-filter">Manufacturer: {manufacturer}</span>}
          {model && <span className="active-filter">Model: {model}</span>}
          {fuel && <span className="active-filter">Fuel: {fuel}</span>}
          {vehicleType && <span className="active-filter">Type: {vehicleType}</span>}
          {(priceFrom || priceTo) && (
            <span className="active-filter">
              Price: €{priceFrom || '0'} - €{priceTo || '∞'}
            </span>
          )}
          {(yearFrom || yearTo) && (
            <span className="active-filter">
              Year: {yearFrom || 'Any'} - {yearTo || 'Latest'}
            </span>
          )}
          {kilometers && <span className="active-filter">Max km: {kilometers}</span>}
        </div>

        {/* More Filters Section */}
        {showMoreFilters && (
          <div className="more-filters-section">
            <div className="filter">
              <label>Year From</label>
              <select value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}>
                <option value="">Any</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label>Year To</label>
              <select value={yearTo} onChange={(e) => setYearTo(e.target.value)}>
                <option value="">Any</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label>Max Kilometres</label>
              <input
                type="number"
                value={kilometers}
                placeholder="Max Kilometres"
                onChange={(e) => setKilometers(e.target.value)}
              />
            </div>

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
          {carListings.length > 0 ? (
            carListings.map(car => (
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
