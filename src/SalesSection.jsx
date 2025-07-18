import React, { useState, useEffect } from 'react';
import './SalesSection.css';

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

  const [images, setImages] = useState([]); // Store multiple images
  const [preview, setPreview] = useState([]); // Store multiple previews
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Checking local storage for token:", token);
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleChange = (e) => {
    setCarData({ ...carData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreview(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const token = localStorage.getItem('token');
    console.log("Token retrieved from localStorage before sending request:", token);

    if (!token) {
      setErrorMessage('You must be logged in to add a listing.');
      return;
    }

    const formData = new FormData();
    Object.keys(carData).forEach((key) => formData.append(key, carData[key]));
    images.forEach(img => formData.append('images', img));

    try {
      console.log("Sending request to backend...");
      const response = await fetch('http://localhost:5000/add-car', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response from server:", data);

      if (response.ok) {
        console.log("Car listing successful:", data);
        setSuccessMessage(data.message);
        setCarData({
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
        setImages([]);
        setPreview([]);
      } else {
        setErrorMessage(data.message || 'Failed to upload car');
      }
    } catch (error) {
      console.error('Error uploading car:', error);
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
            <p style={{ color: 'red', fontWeight: 'bold' }}>
              ⚠️ You must be logged in to add a car listing.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <h3>Car Details</h3>
          <input type="text" name="manufacturer" placeholder="Manufacturer" value={carData.manufacturer} onChange={handleChange} required />
          <input type="text" name="model" placeholder="Model" value={carData.model} onChange={handleChange} required />
          <input type="number" name="year" placeholder="Year" value={carData.year} onChange={handleChange} required />
          <input type="number" name="price" placeholder="Price" value={carData.price} onChange={handleChange} required />
          <input type="number" name="kilometers" placeholder="Kilometers Driven" value={carData.kilometers} onChange={handleChange} required />

          <select name="driveType" value={carData.driveType} onChange={handleChange}>
            <option value="">Drive Type</option>
            <option value="FWD">Front-Wheel Drive</option>
            <option value="RWD">Rear-Wheel Drive</option>
            <option value="AWD">All-Wheel Drive</option>
            <option value="4WD">4-Wheel Drive</option>
          </select>

          <select name="fuel" value={carData.fuel} onChange={handleChange}>
            <option value="">Fuel Type</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>

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

          <input type="number" name="seats" placeholder="Number of Seats" value={carData.seats} onChange={handleChange} required />

          {/* New fields for more car options */}
          <input type="text" name="color" placeholder="Exterior Color" value={carData.color} onChange={handleChange} />
          <input type="text" name="interiorColor" placeholder="Interior Color" value={carData.interiorColor} onChange={handleChange} />
          <input type="text" name="interiorMaterial" placeholder="Interior Material" value={carData.interiorMaterial} onChange={handleChange} />
          <input type="number" name="doors" placeholder="Number of Doors" value={carData.doors} onChange={handleChange} />
          <textarea name="features" placeholder="Features (e.g. Sunroof, Bluetooth, Navigation, etc.)" value={carData.features} onChange={handleChange} />

          <input type="number" name="engineCubic" placeholder="Engine Size (cc or L)" value={carData.engineCubic} onChange={handleChange} />
          <input type="number" name="horsepower" placeholder="Horsepower" value={carData.horsepower} onChange={handleChange} />

          <h3>Upload Car Images</h3>
          <input type="file" accept="image/*" onChange={handleImageChange} multiple />

          {preview && preview.length > 0 && preview.map((src, idx) => (
            <img key={idx} src={src} alt={`Car Preview ${idx+1}`} className="image-preview" />
          ))}

          <button type="submit" disabled={!isLoggedIn}>List Car for Sale</button>
        </form>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default SalesSection;
