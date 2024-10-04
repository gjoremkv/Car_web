import React from 'react';
import { useLocation } from 'react-router-dom';

const ListingDetail = () => {
  const location = useLocation();
  const car = location.state?.car; // Get the car details from Link's state

  if (!car) {
    return <div>No car details found.</div>;
  }

  return (
    <div className="car-detail-page">
      <h2>{car.manufacturer} {car.model} - {car.year}</h2>
      <img src={car.imgSrc} alt={car.model} />
      <div className="car-info">
        <p><strong>Price:</strong> ${car.price}</p>
        <p><strong>Kilometers:</strong> {car.kilometers} km</p>
        <p><strong>Fuel Type:</strong> {car.fuel}</p>
        <p><strong>Drive Type:</strong> {car.driveType}</p>
        <p><strong>Transmission:</strong> {car.transmission}</p>
        <p><strong>Horsepower:</strong> {car.horsepower} HP</p>
        <button>Contact Seller</button>
      </div>
    </div>
  );
};

export default ListingDetail;
