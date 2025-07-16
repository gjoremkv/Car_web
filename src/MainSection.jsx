import React, { useState, useRef } from 'react';
import './MainSection.css'; // Import the corresponding CSS file

const quickPresets = [
  {
    label: 'Family SUV under €15k',
    values: { vehicleType: 'SUV', budgetMax: 15000, fuel: 'Hybrid' }
  },
  {
    label: 'Budget Sedan under €10k',
    values: { vehicleType: 'Sedan', budgetMax: 10000 }
  },
  {
    label: 'Electric Cars',
    values: { fuel: 'Electric' }
  },
  {
    label: '7-Seaters',
    values: { familySize: 7 }
  }
];

const vehicleIcons = {
  SUV: '🚙',
  Sedan: '🚗',
  Truck: '🚚',
  Van: '🚐',
  Coupe: '🏎️',
  Any: '🚘'
};

// Add gray vehicle icon URLs at the top, after imports
const carIcon = "http://localhost:5000/uploads/car.png";
const vanIcon = "http://localhost:5000/uploads/van.png";
const truckIcon = "http://localhost:5000/uploads/truck.png";
const vanIcon2 = "http://localhost:5000/uploads/van.png"; // fallback
const coupeIcon = "http://localhost:5000/uploads/coupe.png";
const anyIcon = "http://localhost:5000/uploads/car.png";

const vehicleIconImgs = {
  SUV: carIcon,
  Sedan: carIcon,
  Truck: truckIcon,
  Van: vanIcon,
  Coupe: coupeIcon,
  Any: anyIcon
};

function MainSection() {
  // State to control the visibility of the popup
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDriveType, setSelectedDriveType] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [familySize, setFamilySize] = useState(5);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Stores search results
  const [tags, setTags] = useState([]);
  const [searchCount, setSearchCount] = useState(null);

  // Parallax state
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const focusTimeout = useRef(null);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Parallax mouse move handler
  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setParallax({ x, y });
    setIsFocused(true);
    if (focusTimeout.current) clearTimeout(focusTimeout.current);
    focusTimeout.current = setTimeout(() => setIsFocused(false), 600);
  };

  // Tag logic
  const addTag = (type, value, label) => {
    if (!tags.some(t => t.type === type && t.value === value)) {
      setTags([...tags, { type, value, label }]);
    }
  };
  const removeTag = (type, value) => {
    setTags(tags.filter(t => !(t.type === type && t.value === value)));
    if (type === 'drive') setSelectedDriveType('');
    if (type === 'fuel') setSelectedFuelType('');
    if (type === 'trans') setSelectedTransmission('');
    if (type === 'vehicle') setSelectedVehicleType('');
    if (type === 'family') setFamilySize(5);
    if (type === 'price') setPriceRange([0, 50000]);
  };

  // Quick pick logic
  const handleQuickPick = (preset) => {
    if (preset.values.vehicleType) setSelectedVehicleType(preset.values.vehicleType);
    if (preset.values.budgetMax) setPriceRange([0, preset.values.budgetMax]);
    if (preset.values.fuel) setSelectedFuelType(preset.values.fuel);
    if (preset.values.familySize) setFamilySize(preset.values.familySize);
  };

  // Suggest For Me
  const fillSuggested = () => {
    setSelectedDriveType('AWD');
    setSelectedFuelType('Hybrid');
    setSelectedTransmission('Automatic');
    setPriceRange([10000, 20000]);
    setFamilySize(5);
    setSelectedVehicleType('SUV');
  };

  // Clear all
  const clearFilters = () => {
    setSelectedDriveType('');
    setSelectedFuelType('');
    setSelectedTransmission('');
    setPriceRange([0, 50000]);
    setFamilySize(5);
    setSelectedVehicleType('');
    setTags([]);
    setSearchCount(null);
  };

  // Live search
  const fetchSearchResults = async (e) => {
    if (e) e.preventDefault();
    const searchData = {
      driveType: selectedDriveType,
      fuel: selectedFuelType,
      transmission: selectedTransmission,
      budgetMin: priceRange[0],
      budgetMax: priceRange[1],
      familySize,
      vehicleType: selectedVehicleType,
    };
    try {
      const response = await fetch('http://localhost:5000/search-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });
      if (!response.ok) throw new Error('Failed to fetch search results');
      const results = await response.json();
      setSearchResults(results);
      setSearchCount(results.length);
    } catch (error) {
      setSearchResults([]);
      setSearchCount(0);
    }
  };

  // Update tags on filter change
  React.useEffect(() => {
    let newTags = [];
    if (selectedDriveType) newTags.push({ type: 'drive', value: selectedDriveType, label: `🛞 ${selectedDriveType}` });
    if (selectedFuelType) newTags.push({ type: 'fuel', value: selectedFuelType, label: `⛽ ${selectedFuelType}` });
    if (selectedTransmission) newTags.push({ type: 'trans', value: selectedTransmission, label: `⚙️ ${selectedTransmission}` });
    if (selectedVehicleType) newTags.push({ type: 'vehicle', value: selectedVehicleType, label: `${vehicleIcons[selectedVehicleType] || '🚘'} ${selectedVehicleType}` });
    if (familySize !== 5) newTags.push({ type: 'family', value: familySize, label: `👨‍👩‍👧‍👦 ${familySize} seats` });
    if (priceRange[0] !== 0 || priceRange[1] !== 50000) newTags.push({ type: 'price', value: priceRange.join('-'), label: `💶 €${priceRange[0]}–€${priceRange[1]}` });
    setTags(newTags);
    // Live search (optional)
    fetchSearchResults();
    // eslint-disable-next-line
  }, [selectedDriveType, selectedFuelType, selectedTransmission, selectedVehicleType, familySize, priceRange]);

  return (
    <section className="main-section">
      {/* Background Image and Welcome Box */}
      <div className="background-image-container" onMouseMove={handleMouseMove} onMouseLeave={() => { setParallax({ x: 0, y: 0 }); setIsFocused(false); }}>
        <div className="content-container">
          <div
            className={`welcome-box${isFocused ? ' active' : ''}`}
            style={{
              transform: `translate3d(${parallax.x * 8}px, ${parallax.y * 8}px, 0)`
            }}
          >
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
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            {/* Close button top left */}
            <button className="close-popup" onClick={togglePopup} aria-label="Close popup">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="11" fill="#e5e7eb"/>
                <path d="M7 7L15 15M15 7L7 15" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Vehicle icon (gray PNG) */}
            <span className="vehicle-popup-icon" role="img" aria-label="Vehicle">
              <img src={vehicleIconImgs[selectedVehicleType] || anyIcon} alt="Vehicle" style={{width:48, height:48, filter:'grayscale(1)'}} />
            </span>
            <h2>Car Configurator</h2>
            <div className="quick-picks">
              {quickPresets.map((preset, i) => (
                <button key={i} className="quick-pick-btn" onClick={() => handleQuickPick(preset)}>{preset.label}</button>
              ))}
            </div>
            <div className="filter-tags">
              {tags.map(tag => (
                <span className="tag" key={tag.type + tag.value}>{tag.label}
                  <button className="tag-remove" onClick={() => removeTag(tag.type, tag.value)} title="Remove" aria-label="Remove tag">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="8" fill="#e5e7eb"/>
                      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={fetchSearchResults} autoComplete="off">
              <div className="popup-dropdown-row">
                <label title="AWD is great for off-road and snowy terrain" style={{flex: 1}}>
                  🛞 Drive Type
                  <select className="popup-dropdown" value={selectedDriveType} onChange={e => setSelectedDriveType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="FWD">Front-Wheel Drive</option>
                    <option value="RWD">Rear-Wheel Drive</option>
                    <option value="AWD">All-Wheel Drive</option>
                    <option value="4WD">4-Wheel Drive</option>
                  </select>
                </label>
                <label title="Fuel type affects running costs and emissions" style={{flex: 1}}>
                  ⛽ Fuel Type
                  <select className="popup-dropdown" value={selectedFuelType} onChange={e => setSelectedFuelType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>
              </div>
              <div className="popup-dropdown-row">
                <label title="Automatic is easier in traffic" style={{flex: 1}}>
                  ⚙️ Transmission
                  <select className="popup-dropdown" value={selectedTransmission} onChange={e => setSelectedTransmission(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </label>
                <label title="Body style affects space and looks" style={{flex: 1}}>
                  {vehicleIcons[selectedVehicleType] || '🚘'} Vehicle Type
                  <select className="popup-dropdown" value={selectedVehicleType} onChange={e => setSelectedVehicleType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Coupe">Coupe</option>
                  </select>
                </label>
              </div>
              <div className="slider-row">
                <span className="slider-label" title="How many seats do you need?">👨‍👩‍👧‍👦 Family Size</span>
                <input type="range" min="2" max="8" value={familySize} onChange={e => setFamilySize(Number(e.target.value))} className="slider" />
                <span className="slider-value">{familySize} seats</span>
              </div>
              <div className="slider-row">
                <span className="slider-label" title="Set your price range">💶 Price Range</span>
                <input type="range" min="0" max="50000" step="500" value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} className="slider" />
                <input type="range" min="0" max="50000" step="500" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="slider" />
                <span className="slider-value">€{priceRange[0]} – €{priceRange[1]}</span>
              </div>
              <div className="live-count">
                {searchCount !== null && `${searchCount} matching cars found`}
              </div>
              <div className="action-row">
                <button type="button" className="action-btn" onClick={clearFilters}>Clear All</button>
                <button type="button" className="action-btn" onClick={fillSuggested}>Suggest For Me</button>
                <button type="submit" className="action-btn primary">Search</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Display Search Results */}
      {/* <div className="search-results">
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
      </div> */}
    </section>
  );
}

export default MainSection;
