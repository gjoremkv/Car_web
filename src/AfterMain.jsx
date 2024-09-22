import React from 'react';
import './AfterMain.css'; // Create a corresponding CSS file
import carIcon from './images/car.png';
import vanIcon from './images/van.png';
import bicycleIcon from './images/bicycle.png';
import truckIcon from './images/truck.png';
import motorcycleIcon from './images/motorcycle.png';

function AfterMain() {
  return (
    <section className="after-main">
      <div className="vehicle-selection">
        <div className="vehicle-icons">
          <img src={carIcon} alt="Car" className="vehicle-icon" />
          <img src={vanIcon} alt="Van" className="vehicle-icon" />
          <img src={bicycleIcon} alt="Bicycle" className="vehicle-icon" />
          <img src={truckIcon} alt="Truck" className="vehicle-icon" />
          <img src={motorcycleIcon} alt="Motorcycle" className="vehicle-icon" />
        </div>

        <div className="filter-section">
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
        </div>
      </div>
    </section>
  );
}

export default AfterMain;
