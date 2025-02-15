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
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
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
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
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
    if (image) {
      formData.append('image', image);
    }

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
        });
        setImage(null);
        setPreview('');
      } else {
        setErrorMessage(data.message || 'Failed to upload car');
      }
    } catch (error) {
      console.error('Error uploading car:', error);
      setErrorMessage('An error occurred while uploading the car');
    }
  };

  return (
    <div className="sale-page">
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

        <h3>Upload Car Image</h3>
        <input type="file" accept="image/*" onChange={handleImageChange} required />

        {preview && <img src={preview} alt="Car Preview" className="image-preview" />}

        <button type="submit" disabled={!isLoggedIn}>List Car for Sale</button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default SalesSection;
