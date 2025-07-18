import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CarImageGallery from './CarImageGallery';
import ContactSellerCard from './ContactSellerCard';
import './ListingDetail.css';

export default function ListingDetail() {
  const location = useLocation();
  const [car, setCar] = useState({});
  const [images, setImages] = useState([]);

  useEffect(() => {
    const carObj = location.state?.car;
    if (!carObj || !carObj.id) return;
    setCar(carObj);
    fetch(`http://localhost:5000/car/${carObj.id}/images`)
      .then((res) => res.json())
      .then((data) => {
        const allImages = [
          carObj.image_path ? `http://localhost:5000${carObj.image_path}` : null,
          ...data.map(img => `http://localhost:5000${img.image_path}`)
        ].filter(Boolean);
        const uniqueImages = allImages.filter((url, idx, arr) => arr.indexOf(url) === idx);
        setImages(uniqueImages);
      });
  }, [location.state]);

  if (!car || !car.id) return <p>Car not found</p>;

  const {
    manufacturer,
    model,
    year,
    price,
    kilometers,
    fuel,
    drive_type,
    transmission,
    horsepower,
    color,
    interior_color,
    interior_material,
    doors,
    seats,
    vehicle_type,
    seller,
    engine_cubic,
    features,
  } = car;

  return (
    <div className="ListingDetail">
      <div className="main-content">
        <CarImageGallery images={images} />
        <h2>{manufacturer} {model} - {year}</h2>
        <div className="car-description-box">
          <p>This well-maintained {year} {manufacturer} {model} offers comfort, performance, and style.
            It's perfect for everyday driving or long trips. Equipped with {horsepower || 'N/A'} HP and a sleek
            {color || 'N/A'} exterior, this vehicle is ready to hit the road.
          </p>
        </div>
        <table className="spec-table">
          <tbody>
            <tr><td><strong>Price:</strong></td><td>{price} €</td></tr>
            <tr><td><strong>Kilometers:</strong></td><td>{kilometers} km</td></tr>
            <tr><td><strong>Fuel Type:</strong></td><td>{fuel || 'N/A'}</td></tr>
            <tr><td><strong>Transmission:</strong></td><td>{transmission || 'N/A'}</td></tr>
            <tr><td><strong>Drive Type:</strong></td><td>{drive_type || 'N/A'}</td></tr>
            <tr><td><strong>Horsepower:</strong></td><td>{horsepower || 'N/A'} HP</td></tr>
            <tr><td><strong>Engine Cubic:</strong></td><td>{engine_cubic || 'N/A'} cc</td></tr>
            <tr><td><strong>Color:</strong></td><td>{color || 'N/A'}</td></tr>
            <tr><td><strong>Doors:</strong></td><td>{doors || 'N/A'}</td></tr>
            <tr><td><strong>Seats:</strong></td><td>{seats || 'N/A'}</td></tr>
            <tr><td><strong>Interior Material:</strong></td><td>{interior_material || 'N/A'}</td></tr>
            <tr><td><strong>Interior Color:</strong></td><td>{interior_color || 'N/A'}</td></tr>
            <tr><td><strong>Vehicle Type:</strong></td><td>{vehicle_type || 'N/A'}</td></tr>
          </tbody>
        </table>
        {features && features.trim() && (
          <div className="features-grid">
            <h3>Features</h3>
            <ul>
              {features.split(',').map((f, i) => (
                <li key={i}><span className="check">✓</span> {f.trim()}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="sticky-contact">
        <ContactSellerCard seller={seller} price={price} />
      </div>
    </div>
  );
}
