import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { popularManufacturers, otherManufacturers } from './data/manufacturers';
import { modelsByBrand } from './data/modelsByBrand';
import './AfterMain.css'; // Create a corresponding CSS file
import { apiUrl } from './utils/url';

const carIcon = '/uploads/car.png';
const vanIcon = '/uploads/van.png';

// Generate years array (last 40 years)
const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

function AfterMain() {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState('car');
  const [leasingOrBuy, setLeasingOrBuy] = useState('buy');
  const [goodDeals, setGoodDeals] = useState([]);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  
  // Filter states
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [price, setPrice] = useState('');

  // Fetch random good deals when component mounts
  useEffect(() => {
    const fetchGoodDeals = async () => {
      try {
        console.log('🎯 Fetching good deals...');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cars`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Remove duplicates based on car ID and shuffle
          const uniqueCars = data.filter((car, index, self) => 
            index === self.findIndex(c => c.id === car.id)
          );
          const shuffled = [...uniqueCars].sort(() => 0.5 - Math.random());
          setGoodDeals(shuffled.slice(0, 6)); // Only take 6 unique cars
          console.log('✅ Good deals loaded:', shuffled.slice(0, 6).length, 'unique cars');
        } else {
          console.warn('No cars data available for good deals');
          setGoodDeals([]);
        }
      } catch (error) {
        console.error("❌ Error fetching good deals:", error);
        setGoodDeals([]);
      }
    };

    fetchGoodDeals();
  }, []);

  const handleVehicleSelect = (vehicleType) => {
    console.log('🚗 Vehicle selected:', vehicleType);
    setSelectedVehicle(vehicleType);
  };

  const handleGetStarted = () => {
    console.log('🎯 Get Started clicked with vehicle:', selectedVehicle);
    console.log('🔍 Current filter values:', { manufacturer, model, kilometers, yearFrom, yearTo, price });
    
    const searchParams = new URLSearchParams();
    
    // Only add vehicle type filter for specific types like Van
    // Don't restrict 'car' to just 'Sedan' since cars can be Sedan, Coupe, etc.
    if (selectedVehicle === 'van') {
      searchParams.set('vehicleType', 'Van');
    }
    // Note: We don't set vehicleType for 'car' to allow broader search
    
    // Add other filters if they have values
    if (manufacturer) searchParams.set('manufacturer', manufacturer);
    if (model) searchParams.set('model', model);
    if (kilometers) searchParams.set('kilometers', kilometers);
    if (yearFrom) searchParams.set('yearFrom', yearFrom);
    if (yearTo) searchParams.set('yearTo', yearTo);
    if (price) searchParams.set('priceFrom', '0');
    if (price) searchParams.set('priceTo', price);
    
    const finalUrl = `/buy?${searchParams.toString()}`;
    console.log('🚀 Navigating to:', finalUrl);
    navigate(finalUrl);
  };

  const handleMoreFilters = () => {
    console.log('🔍 More Filters clicked');
    
    const searchParams = new URLSearchParams();
    
    // Only add vehicle type filter for specific types like Van
    if (selectedVehicle === 'van') {
      searchParams.set('vehicleType', 'Van');
    }
    
    // Add current filters
    if (manufacturer) searchParams.set('manufacturer', manufacturer);
    if (model) searchParams.set('model', model);
    if (kilometers) searchParams.set('kilometers', kilometers);
    if (yearFrom) searchParams.set('yearFrom', yearFrom);
    if (yearTo) searchParams.set('yearTo', yearTo);
    if (price) searchParams.set('priceFrom', '0');
    if (price) searchParams.set('priceTo', price);
    
    // Add a parameter to show expanded filters
    searchParams.set('showMoreFilters', 'true');
    
    navigate(`/buy?${searchParams.toString()}`);
  };

  // Navigation functions for good deals carousel
  const goToPrevDeal = () => {
    setCurrentDealIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, goodDeals.length - 3) : Math.max(0, prevIndex - 1)
    );
  };

  const goToNextDeal = () => {
    setCurrentDealIndex((prevIndex) => 
      prevIndex + 3 >= goodDeals.length ? 0 : prevIndex + 1
    );
  };

  // Refresh good deals with new random selection
  const refreshGoodDeals = async () => {
    try {
      console.log('🔄 Refreshing good deals...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cars`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Remove duplicates and get new random selection
        const uniqueCars = data.filter((car, index, self) => 
          index === self.findIndex(c => c.id === car.id)
        );
        const shuffled = [...uniqueCars].sort(() => 0.5 - Math.random());
        setGoodDeals(shuffled.slice(0, 6)); // Only take 6 unique cars
        setCurrentDealIndex(0); // Reset to first set
        console.log('✅ Good deals refreshed with', shuffled.slice(0, 6).length, 'new unique cars');
      }
    } catch (error) {
      console.error("❌ Error refreshing good deals:", error);
    }
  };

  // Get the current 3 deals to display
  const visibleDeals = goodDeals.slice(currentDealIndex, currentDealIndex + 3);

  return (
    <section className="after-main">
      <div className="vehicle-selection-wrapper">
        <div className="vehicle-selection">
          <div className="vehicle-icons">
            <button 
              className={`vehicle-icon-btn${selectedVehicle === 'car' ? ' selected' : ''}`} 
              onClick={() => handleVehicleSelect('car')}
            >
              <img src={carIcon} alt="Car" className="vehicle-icon" />
            </button>
            <button 
              className={`vehicle-icon-btn${selectedVehicle === 'van' ? ' selected' : ''}`} 
              onClick={() => handleVehicleSelect('van')}
            >
              <img src={vanIcon} alt="Van" className="vehicle-icon" />
            </button>
          </div>

          <div className="filter-section">
            <div className="payment-label-group">
              <label className="payment-label">Payment method</label>
              <div className="leasing-buy-toggle pill-style">
                <button className={leasingOrBuy === 'buy' ? 'selected' : ''} onClick={() => setLeasingOrBuy('buy')}>Buy</button>
                <button className={leasingOrBuy === 'leasing' ? 'selected' : ''} onClick={() => setLeasingOrBuy('leasing')}>Leasing</button>
              </div>
            </div>

            <div className="filter-item">
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

            <div className="filter-item">
              <label>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!manufacturer}>
                <option value="">Any</option>
                {manufacturer && modelsByBrand[manufacturer]?.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Kilometres</label>
              <input 
                type="number" 
                placeholder="Max Kilometres" 
                value={kilometers}
                onChange={(e) => setKilometers(e.target.value)}
              />
            </div>

            <div className="filter-item">
              <label>Year From</label>
              <select value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}>
                <option value="">Any</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Year To</label>
              <select value={yearTo} onChange={(e) => setYearTo(e.target.value)}>
                <option value="">Any</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Max Price</label>
              <input 
                type="number" 
                placeholder="Max Price" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button className="search-btn center-btn" onClick={handleGetStarted}>Search</button>
              <button className="more-filters-btn" onClick={handleMoreFilters}>
                <svg className="more-filters-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9 9C9.55228 9 10 8.55228 10 8C10 7.44772 9.55228 7 9 7C8.44772 7 8 7.44772 8 8C8 8.55228 8.44772 9 9 9ZM11.8293 7C11.4175 5.83481 10.3062 5 9 5C7.69378 5 6.58254 5.83481 6.17071 7H2V9H6.17071C6.58254 10.1652 7.69378 11 9 11C10.3062 11 11.4175 10.1652 11.8293 9H22V8V7H11.8293ZM12.1707 15H2V17H12.1707C12.5825 18.1652 13.6938 19 15 19C16.3062 19 17.4175 18.1652 17.8293 17H22V15H17.8293C17.4175 13.8348 16.3062 13 15 13C13.6938 13 12.5825 13.8348 12.1707 15ZM14 16C14 16.5523 14.4477 17 15 17C15.5523 17 16 16.5523 16 16C16 15.4477 15.5523 15 15 15C14.4477 15 14 15.4477 14 16Z" fill="currentColor"></path></svg>
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="good-deals-section">
        <div className="good-deals-container">
          <div className="good-deals-header">
            <h2 className="good-deals-title">Good Deals Today</h2>
            <button 
              onClick={refreshGoodDeals} 
              className="refresh-deals-btn"
              title="Get new random deals"
            >
              ↻ Refresh
            </button>
          </div>
          {goodDeals.length > 0 ? (
            <>
              <div className="good-deals-cards">
                {visibleDeals.map((deal) => (
                  <Link 
                    to={`/car/${deal.id}`} 
                    state={{ car: deal }}
                    key={deal.id} 
                    className="good-deal-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="deal-image">
                      <img 
                        src={deal.image_path ? apiUrl(deal.image_path) : 'https://via.placeholder.com/300x200'} 
                        alt={`${deal.manufacturer} ${deal.model}`} 
                      />
                    </div>
                    <div className="deal-info">
                      <h3>{deal.manufacturer} {deal.model}</h3>
                      <p className="deal-year">Year: {deal.year}</p>
                      <p className="deal-km">Kilometres: {deal.kilometers?.toLocaleString()} km</p>
                      <p className="deal-price">€{parseFloat(deal.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="carousel-nav">
                <button 
                  onClick={goToPrevDeal} 
                  disabled={currentDealIndex === 0}
                  className="nav-btn prev-btn"
                >
                  &#8249;
                </button>
                <span className="carousel-indicator">
                  {currentDealIndex + 1}-{Math.min(currentDealIndex + 3, goodDeals.length)} of {goodDeals.length}
                </span>
                <button 
                  onClick={goToNextDeal} 
                  disabled={currentDealIndex + 3 >= goodDeals.length}
                  className="nav-btn next-btn"
                >
                  &#8250;
                </button>
              </div>
            </>
          ) : (
            <div className="no-deals">
              <p>Loading good deals...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AfterMain;
