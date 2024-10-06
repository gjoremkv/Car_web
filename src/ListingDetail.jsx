import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ListingDetail.css'; // Make sure to import your CSS file

const ListingDetail = () => {
  const location = useLocation();
  const car = location.state?.car; // Get the car details from Link's state
  const [currentImage, setCurrentImage] = useState(0); // Track the current image index

  // Example images (replace with car images when available)
  const images = [
    car.imgSrc,
    'https://via.placeholder.com/600x400/0000FF',
    'https://via.placeholder.com/600x400/FFFF00'
  ];

  const handleNextImage = () => {
    setCurrentImage((currentImage + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImage((currentImage - 1 + images.length) % images.length);
  };

  if (!car) {
    return <div>No car details found.</div>;
  }

  // Dummy car rating (could be dynamically calculated or fetched from a database)
  const rating = 4; // Assuming a rating out of 5

  return (
    <div className="car-detail-page">
      <div className="car-detail-left">
        <h2>{car.manufacturer} {car.model} - {car.year}</h2>
        <div className="image-gallery">
          <button className="prev" onClick={handlePrevImage}>&lt;</button>
          <div className="image-container">
            <img src={images[currentImage]} alt={car.model} className="main-image" />
          </div>
          <button className="next" onClick={handleNextImage}>&gt;</button>
        </div>

        {/* Basic Information */}
        <div className="car-info">
          <h3>Basic Information</h3>
          <div className="car-info-box">
            <p><strong>Price:</strong> ${car.price}</p>
            <p><strong>Kilometers:</strong> {car.kilometers} km</p>
            <p><strong>Fuel Type:</strong> {car.fuel}</p>
            <p><strong>Drive Type:</strong> {car.driveType}</p>
            <p><strong>Transmission:</strong> {car.transmission}</p>
            <p><strong>Horsepower:</strong> {car.horsepower} HP</p>
          </div>
        </div>

        {/* Technical Information */}
        <div className="technical-info">
          <h3>Technical Data</h3>
          <div className="technical-info-box">
            <p><strong>Engine:</strong> 2.0L Turbo</p>
            <p><strong>Max Speed:</strong> 240 km/h</p>
            <p><strong>Fuel Consumption:</strong> 7.5L/100km</p>
            <p><strong>CO2 Emissions:</strong> 120 g/km</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-info">
          <h3>Features</h3>
          <div className="features-info-box">
            <p><strong>Airbags:</strong> Front and Side Airbags</p>
            <p><strong>Parking Sensors:</strong> Front and Rear Parking Sensors</p>
            <p><strong>Bluetooth:</strong> Enabled</p>
            <p><strong>Navigation System:</strong> Built-in GPS</p>
            <p><strong>Heated Seats:</strong> Front and Rear Heated Seats</p>
            <p><strong>Cruise Control:</strong> Adaptive Cruise Control</p>
          </div>
        </div>

        {/* Price at the Bottom */}
        <div className="bottom-price">
          <p className="car-price">${car.price}</p>
        </div>
      </div>

      <div className="car-detail-right">
        <h3>Contact Seller</h3>
        <p><strong>Seller Name:</strong> John Doe</p> {/* Replace with real data */}
        <p><strong>Email:</strong> johndoe@example.com</p> {/* Replace with real data */}
        <p><strong>Phone:</strong> +1234567890</p> {/* Replace with real data */}
        
        {/* Ratings Section */}
        <div className="ratings-title">Ratings</div>
        <div className="car-rating">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`rating-square ${index < rating ? '' : 'empty'}`}
            ></div>
          ))}
        </div>

        <button className="contact-btn">Contact Seller</button>
      </div>
    </div>
  );
};

export default ListingDetail;
