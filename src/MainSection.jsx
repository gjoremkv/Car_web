import React, { useState } from 'react';
import './MainSection.css'; // Import the corresponding CSS file

function MainSection() {
  // State to control the visibility of the popup
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <section className="main-section">
      {/* Container that includes the background image with left and right padding */}
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

      {showPopup && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Car Preferences</h2>
            <form>
              {/* Row 1: Primary Use and Drive Type */}
              <div className="form-row">
                <label>
                  Primary Use:
                  <select>
                    <option value="commuting">Daily Commuting</option>
                    <option value="road-trips">Long Road Trips</option>
                    <option value="off-road">Off-road Driving</option>
                    <option value="city-driving">City Driving</option>
                    <option value="family">Family Vehicle</option>
                  </select>
                </label>

                <label>
                  Drive Type:
                  <select>
                    <option value="fwd">Front-Wheel Drive (FWD)</option>
                    <option value="rwd">Rear-Wheel Drive (RWD)</option>
                    <option value="awd">All-Wheel Drive (AWD)</option>
                    <option value="4wd">4-Wheel Drive (4WD)</option>
                  </select>
                </label>
              </div>

              {/* Row 2: Mileage and Fuel Type */}
              <div className="form-row">
                <label>
                  Mileage (Fuel Efficiency):
                  <select>
                    <option value="high">High Mileage (35+ MPG)</option>
                    <option value="moderate">Moderate Mileage (20-35 MPG)</option>
                    <option value="doesnt-matter">Doesn't Matter</option>
                  </select>
                </label>

                <label>
                  Fuel Type:
                  <select>
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="natural-gas">Natural Gas</option>
                  </select>
                </label>
              </div>

              {/* Row 3: Power and Transmission */}
              <div className="form-row">
                <label>
                  Power/Engine Size:
                  <select>
                    <option value="economy">Economy (smaller engine, less horsepower)</option>
                    <option value="balanced">Balanced (mid-range power)</option>
                    <option value="performance">High Performance (more horsepower)</option>
                  </select>
                </label>

                <label>
                  Transmission:
                  <select>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                  </select>
                </label>
              </div>

              {/* Row 4: Budget and Leasing */}
              <div className="form-row">
                <label>
                  Total Budget:
                  <input type="number" placeholder="Starting Price" /> -{' '}
                  <input type="number" placeholder="Ending Price" />
                </label>

                <label>
                  Leasing or Buying:
                  <select>
                    <option value="buying">Buying</option>
                    <option value="leasing">Leasing</option>
                  </select>
                </label>
              </div>

              {/* Row 5: Family Size and Baggage Space */}
              <div className="form-row">
                <label>
                  Family Size:
                  <select>
                    <option value="small">Small Family (1-2 people)</option>
                    <option value="medium">Medium Family (3-4 people)</option>
                    <option value="large">Large Family (5+ people)</option>
                  </select>
                </label>

                <label>
                  Baggage Space:
                  <select>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="doesnt-matter">Doesn't Matter</option>
                  </select>
                </label>
              </div>

              {/* Row 6: Vehicle Type and Technology */}
              <div className="form-row">
                <label>
                  Vehicle Type:
                  <select>
                    <option value="sedan">Sedan</option>
                    <option value="van">Van</option>
                    <option value="coupe">Coupe</option>
                    <option value="suv">SUV</option>
                    <option value="doesnt-matter">Doesn't Matter</option>
                  </select>
                </label>

                <label>
                  Technology Features:
                  <select multiple>
                    <option value="gps">GPS Navigation System</option>
                    <option value="safety">Advanced Safety Features</option>
                    <option value="entertainment">Entertainment System (Apple CarPlay, Android Auto)</option>
                    <option value="autonomous">Autonomous Driving Features</option>
                  </select>
                </label>
              </div>

              {/* Row 7: Eco-Friendliness and Brand */}
              <div className="form-row">
                <label>
                  Eco-Friendliness:
                  <select>
                    <option value="high-priority">Very Important</option>
                    <option value="moderate-priority">Somewhat Important</option>
                    <option value="not-a-priority">Not a Priority</option>
                  </select>
                </label>

                <label>
                  Preferred Manufacturer:
                  <select>
                    <option value="any">Any</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="ford">Ford</option>
                    <option value="bmw">BMW</option>
                    <option value="mercedes">Mercedes</option>
                  </select>
                </label>
              </div>

              {/* Row 8: Climate and Terrain */}
              <div className="form-row">
                <label>
                  Driving Terrain:
                  <select>
                    <option value="city">City Streets</option>
                    <option value="highway">Highways</option>
                    <option value="mountain">Mountains/Off-Road</option>
                  </select>
                </label>

                <label>
                  Climate Preferences:
                  <select>
                    <option value="hot">Hot Climate</option>
                    <option value="cold">Cold Climate</option>
                    <option value="moderate">Moderate Climate</option>
                  </select>
                </label>
              </div>

              <button type="submit">Search</button>
            </form>
            <button className="close-popup" onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default MainSection;
