import React, { useState, useEffect } from 'react';
import './SalesSection.css';
import carIcon from './icons/auto-icon-15.png';
import seatIcon from './icons/car-interior.png';
import { modelsByBrand } from './data/modelsByBrand';

const SalesSection = () => {
  const [carData, setCarData] = useState({
    manufacturer: '',
    model: '',
    year: '',
    price: '',
    driveType: '',
    fuel: '',
    transmission: '',
    seats: '',
    kilometers: '',
    vehicleType: '',
    color: '',
    interiorColor: '',
    interiorMaterial: '',
    doors: '',
    features: '',
    engineCubic: '',
    horsepower: '',
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const interiorColors = ['#000000', '#A52A2A', '#8B4513', '#D3D3D3', '#FFFFFF'];
  const exteriorColors = ['#000000', '#FFFFFF', '#C0C0C0', '#FF0000', '#0000FF', '#00FF00', '#FFD700', '#8B0000'];

  const colorMap = {
    '#FF0000': 'red',
    '#000000': 'black',
    '#FFFFFF': 'white',
    '#C0C0C0': 'silver',
    '#0000FF': 'blue',
    '#00FF00': 'lime',
    '#FFD700': 'gold',
    '#8B0000': 'darkred',
    '#A52A2A': 'brown',
    '#8B4513': 'saddlebrown',
    '#D3D3D3': 'lightgray',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleChange = (e) => {
    setCarData({ ...carData, [e.target.name]: e.target.value });
  };

  const handleColorSelect = (field, hex) => {
    const name = colorMap[hex] || hex;
    setCarData({ ...carData, [field]: name });
  };

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    const current = carData.features ? carData.features.split(', ') : [];
    const updated = checked ? [...current, value] : current.filter(f => f !== value);
    setCarData({ ...carData, features: updated.join(', ') });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreview(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const handleRemoveImage = (idx) => {
    const updatedPreview = preview.filter((_, i) => i !== idx);
    const updatedImages = images.filter((_, i) => i !== idx);
    setPreview(updatedPreview);
    setImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to add a listing.');
      return;
    }

    const formData = new FormData();
    Object.keys(carData).forEach((key) => formData.append(key, carData[key]));
    images.forEach(img => formData.append('images', img));

    try {
      const response = await fetch('http://localhost:5000/add-car', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setCarData({
          manufacturer: '', model: '', year: '', price: '', driveType: '', fuel: '', transmission: '',
          seats: '', kilometers: '', vehicleType: '', color: '', interiorColor: '', interiorMaterial: '',
          doors: '', features: '', engineCubic: '', horsepower: '',
        });
        setImages([]);
        setPreview([]);
      } else {
        setErrorMessage(data.message || 'Failed to upload car');
      }
    } catch (error) {
      setErrorMessage('An error occurred while uploading the car');
    }
  };

  return (
    <div className="sales-section-outer">
      <div className="sales-section-card">
        <h2>Sell Your Car</h2>
        <p>Enter your car details to list your vehicle for sale.</p>

        {!isLoggedIn && (
          <div className="login-warning">
            <p className="warning-text">⚠️ You must be logged in to add a car listing.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <select
                name="manufacturer"
                value={carData.manufacturer}
                onChange={handleChange}
                required
              >
                <option value="">Select Manufacturer</option>
                {Object.keys(modelsByBrand).map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              {modelsByBrand[carData.manufacturer] ? (
                <select name="model" value={carData.model} onChange={handleChange} required>
                  <option value="">Select Model</option>
                  {modelsByBrand[carData.manufacturer].map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="model"
                  placeholder="Enter Model"
                  value={carData.model}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
            <div className="form-row">
              <select name="year" value={carData.year} onChange={handleChange} required>
                <option value="">Year</option>
                {Array.from({ length: 2025 - 1940 + 1 }, (_, i) => 2025 - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={carData.price}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  required
                />
                <span className="unit-label">€</span>
              </div>
            </div>
            {carData.price && (
              <div className="price-suggestion-bar">
                <div className="bar">
                  <div className="green"></div>
                  <div className="yellow"></div>
                  <div className="red"></div>
                </div>
                <p className="price-label">Suggested price range: €20,000 – €35,000</p>
              </div>
            )}
            <div className="form-row">
              <div className="input-with-unit">
                <input
                  type="number"
                  name="kilometers"
                  placeholder="Kilometers"
                  value={carData.kilometers}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  inputMode="numeric"
                  required
                />
                <span className="unit-label">km</span>
              </div>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="seats"
                  placeholder="Seats"
                  value={carData.seats}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  inputMode="numeric"
                />
                <span className="unit-label">seats</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Specifications</h3>
            <div className="form-row">
              <select name="driveType" value={carData.driveType} onChange={handleChange}>
                <option value="">Drive Type</option>
                <option value="FWD">Front-Wheel Drive</option>
                <option value="RWD">Rear-Wheel Drive</option>
                <option value="AWD">All-Wheel Drive</option>
                <option value="4WD">4-Wheel Drive</option>
              </select>
              <select name="fuel" value={carData.fuel} onChange={handleChange}>
                <option value="">Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-row">
              <select name="transmission" value={carData.transmission} onChange={handleChange}>
                <option value="">Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
              <select name="vehicleType" value={carData.vehicleType} onChange={handleChange}>
                <option value="">Vehicle Type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Coupe">Coupe</option>
              </select>
            </div>
            <div className="form-row color-section">
              <div className="color-picker-group">
                <label>Exterior Color</label>
                <div className="color-swatch-row">
                  {exteriorColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch${carData.color === color ? ' selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect('color', color)}
                      title={color}
                    >
                      <img src={carIcon} alt="Car" className="swatch-icon" />
                    </button>
                  ))}
                </div>
                <input type="hidden" name="color" value={carData.color} />
              </div>

              <div className="color-picker-group">
                <label>Interior Color</label>
                <div className="color-swatch-row">
                  {interiorColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch${carData.interiorColor === color ? ' selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect('interiorColor', color)}
                      title={color}
                    >
                      <img src={seatIcon} alt="Seat" className="swatch-icon" />
                    </button>
                  ))}
                </div>
                <input type="hidden" name="interiorColor" value={carData.interiorColor} />
              </div>
            </div>
            <div className="form-row">
              <input type="text" name="interiorMaterial" placeholder="Interior Material" value={carData.interiorMaterial} onChange={handleChange} />
              <div className="input-with-unit">
                <input
                  type="number"
                  name="doors"
                  placeholder="Doors"
                  value={carData.doors}
                  onChange={handleChange}
                  min="1"
                  step="1"
                />
                <span className="unit-label">doors</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Performance</h3>
            <div className="form-row">
              <div className="input-with-unit">
                <input
                  type="number"
                  name="engineCubic"
                  placeholder="Engine Size"
                  value={carData.engineCubic}
                  onChange={handleChange}
                  min="700"
                  step="100"
                />
                <span className="unit-label">cm³</span>
              </div>
              <div className="input-with-unit">
                <input
                  type="number"
                  name="horsepower"
                  placeholder="Horsepower"
                  value={carData.horsepower}
                  onChange={handleChange}
                  min="50"
                  step="5"
                />
                <span className="unit-label">hp</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Features</h3>
            <div className="features-checkboxes">
              {['Bluetooth', 'ABS', 'Sunroof', 'Navigation', 'Leather Seats'].map((feature) => (
                <label key={feature}>
                  <input
                    type="checkbox"
                    name="features"
                    value={feature}
                    onChange={handleCheckboxChange}
                    checked={carData.features.includes(feature)}
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Upload Car Images</h3>
            <input type="file" accept="image/*" onChange={handleImageChange} multiple />
            {preview.length > 0 && (
              <div className="image-preview-grid">
                {preview.map((src, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={src} alt={`Car Preview ${idx + 1}`} />
                    <button type="button" className="remove-btn" onClick={() => handleRemoveImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={!isLoggedIn}>List Car for Sale</button>
        </form>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default SalesSection;
