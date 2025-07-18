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
        // Always include the main image first, then filter out duplicates
        const allImages = [
          carObj.image_path ? `http://localhost:5000${carObj.image_path}` : '/uploads/default-car.jpg',
          ...data.map((img) => `http://localhost:5000${img.image_path}`)
        ];
        // Remove duplicates
        const uniqueImages = allImages.filter((url, idx, arr) => arr.indexOf(url) === idx);
        setImages(uniqueImages);
      })
      .catch(() => {
        setImages(carObj.image_path ? [`http://localhost:5000${carObj.image_path}`] : ['/uploads/default-car.jpg']);
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
  } = car;

  return (
    <div className="ListingDetail">
      <div className="main-content">
        <CarImageGallery images={images} />
        <h2>{manufacturer} {model} - {year}</h2>
        <ul className="car-specs">
          <li><strong>Price:</strong> ${price}</li>
          <li><strong>Kilometers:</strong> {kilometers} km</li>
          <li><strong>Fuel Type:</strong> {fuel}</li>
          <li><strong>Drive Type:</strong> {drive_type}</li>
          <li><strong>Transmission:</strong> {transmission}</li>
          <li><strong>Horsepower:</strong> {horsepower || 'No information'}</li>
          <li><strong>Color:</strong> {color}</li>
          <li><strong>Interior Color:</strong> {interior_color}</li>
          <li><strong>Interior Material:</strong> {interior_material || 'No information'}</li>
          <li><strong>Doors:</strong> {doors}</li>
          <li><strong>Seats:</strong> {seats}</li>
          <li><strong>Vehicle Type:</strong> {vehicle_type}</li>
        </ul>
      </div>
      <div className="sticky-contact">
        <ContactSellerCard seller={seller} price={price} />
      </div>
    </div>
  );
}
