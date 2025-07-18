import React, { useState } from 'react';
import './AfterMain.css'; // Create a corresponding CSS file
const carIcon = "http://localhost:5000/uploads/car.png";
const vanIcon = "http://localhost:5000/uploads/van.png";
const bicycleIcon = "http://localhost:5000/uploads/bicycle.png";
const truckIcon = "http://localhost:5000/uploads/truck.png";
const motorcycleIcon = "http://localhost:5000/uploads/motorcycle.png";

function AfterMain() {
  const [selectedVehicle, setSelectedVehicle] = useState('car');
  const [leasingOrBuy, setLeasingOrBuy] = useState('buy');

  return (
    <section className="after-main">
      <div className="vehicle-selection-wrapper">
        <div className="vehicle-selection">
          <div className="vehicle-icons">
            <button className={`vehicle-icon-btn${selectedVehicle === 'car' ? ' selected' : ''}`} onClick={() => setSelectedVehicle('car')}><img src={carIcon} alt="Car" className="vehicle-icon" /></button>
            <button className={`vehicle-icon-btn${selectedVehicle === 'van' ? ' selected' : ''}`} onClick={() => setSelectedVehicle('van')}><img src={vanIcon} alt="Van" className="vehicle-icon" /></button>
            <button className={`vehicle-icon-btn${selectedVehicle === 'bicycle' ? ' selected' : ''}`} onClick={() => setSelectedVehicle('bicycle')}><img src={bicycleIcon} alt="Bicycle" className="vehicle-icon" /></button>
            <button className={`vehicle-icon-btn${selectedVehicle === 'truck' ? ' selected' : ''}`} onClick={() => setSelectedVehicle('truck')}><img src={truckIcon} alt="Truck" className="vehicle-icon" /></button>
            <button className={`vehicle-icon-btn${selectedVehicle === 'motorcycle' ? ' selected' : ''}`} onClick={() => setSelectedVehicle('motorcycle')}><img src={motorcycleIcon} alt="Motorcycle" className="vehicle-icon" /></button>
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
              <select>
                <option value="">Any</option>
                <option value="Toyota">Toyota</option>
                <option value="Ford">Ford</option>
                <option value="BMW">BMW</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Model</label>
              <select>
                <option value="">Any</option>
                <option value="Corolla">Corolla</option>
                <option value="Focus">Focus</option>
                <option value="3 Series">3 Series</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Kilometres</label>
              <input type="number" placeholder="Kilometres" />
            </div>

            <div className="filter-item">
              <label>Year From</label>
              <select>
                <option value="">Any</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Year To</label>
              <select>
                <option value="">Any</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Price</label>
              <input type="number" placeholder="Price" />
            </div>

            <div className="filter-actions">
              <button className="search-btn center-btn">Search</button>
              <button className="more-filters-btn">
                <svg className="more-filters-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9 9C9.55228 9 10 8.55228 10 8C10 7.44772 9.55228 7 9 7C8.44772 7 8 7.44772 8 8C8 8.55228 8.44772 9 9 9ZM11.8293 7C11.4175 5.83481 10.3062 5 9 5C7.69378 5 6.58254 5.83481 6.17071 7H2V9H6.17071C6.58254 10.1652 7.69378 11 9 11C10.3062 11 11.4175 10.1652 11.8293 9H22V8V7H11.8293ZM12.1707 15H2V17H12.1707C12.5825 18.1652 13.6938 19 15 19C16.3062 19 17.4175 18.1652 17.8293 17H22V15H17.8293C17.4175 13.8348 16.3062 13 15 13C13.6938 13 12.5825 13.8348 12.1707 15ZM14 16C14 16.5523 14.4477 17 15 17C15.5523 17 16 16.5523 16 16C16 15.4477 15.5523 15 15 15C14.4477 15 14 15.4477 14 16Z" fill="currentColor"></path></svg>
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="good-deals-section">
        <h2 className="good-deals-title">Good Deals Today</h2>
        <div className="good-deals-cards">
          {/* Placeholder for car cards */}
          <div className="good-deal-card">Car 1</div>
          <div className="good-deal-card">Car 2</div>
          <div className="good-deal-card">Car 3</div>
        </div>
      </div>
    </section>
  );
}

export default AfterMain;
