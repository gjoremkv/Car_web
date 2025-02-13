import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './ListingDetail.css'; // Import your CSS file

const ListingDetail = () => {
  const { id } = useParams(); // Get car ID from the URL
  const location = useLocation();
  const car = location.state?.car; // Get car details passed from Link
  const [images, setImages] = useState([]); // Store car images
  const [currentImage, setCurrentImage] = useState(0); // Track current image index

  useEffect(() => {
    // Fetch images from backend
    fetch(`http://localhost:5000/car/${id}/images`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setImages(data.map(img => `http://localhost:5000${img.image_path}`));
        } else {
          setImages(['/uploads/default-car.jpg']); // Default image if no images exist
        }
      })
      .catch((err) => console.error("Error fetching images:", err));
  }, [id]);

  const handleNextImage = () => {
    setCurrentImage((currentImage + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImage((currentImage - 1 + images.length) % images.length);
  };

  if (!car) {
    return <div>No car details found.</div>;
  }

  // Dummy car rating (can be fetched dynamically in the future)
  const rating = 4;

  return (
    <div className="car-detail-page">
      <div className="car-detail-left">
        <h2>{car.manufacturer} {car.model} - {car.year}</h2>
        
        {/* Image Gallery */}
        <div className="image-gallery">
          <button className="prev" onClick={handlePrevImage}>&lt;</button>
          <div className="image-container">
            <img src={images[currentImage]} alt={car.model} className="main-image" />
          </div>
          <button className="next" onClick={handleNextImage}>&gt;</button>
        </div>

        {/* Basic Car Information */}
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

        {/* Technical Car Information */}
        <div className="technical-info">
          <h3>Technical Data</h3>
          <div className="technical-info-box">
            <p><strong>Engine:</strong> 2.0L Turbo</p>
            <p><strong>Max Speed:</strong> 240 km/h</p>
            <p><strong>Fuel Consumption:</strong> 7.5L/100km</p>
            <p><strong>CO2 Emissions:</strong> 120 g/km</p>
          </div>
        </div>

        {/* Car Features */}
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

        {/* Price Section */}
        <div className="bottom-price">
          <p className="car-price">${car.price}</p>
        </div>
      </div>

      {/* Right Section: Contact Seller */}
      <div className="car-detail-right">
        <h3>Contact Seller</h3>
        <p><strong>Seller Name:</strong> John Doe</p> {/* Replace with actual seller data */}
        <p><strong>Email:</strong> johndoe@example.com</p>
        <p><strong>Phone:</strong> +1234567890</p>
        
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
