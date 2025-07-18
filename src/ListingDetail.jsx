import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CarImageGallery from './CarImageGallery';
import ContactSellerCard from './ContactSellerCard';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/car/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.message === 'Car not found') {
          setCar(null);
        } else {
          fetch(`http://localhost:5000/car/${id}/images`)
            .then(res => res.json())
            .then(imgs => {
              let imagesArr = [];
              if (imgs && imgs.length > 0) {
                imagesArr = imgs.map(img => `http://localhost:5000${img.image_path}`);
              } else if (data.image_path) {
                imagesArr = [`http://localhost:5000${data.image_path}`];
              } else {
                imagesArr = ['/uploads/default-car.jpg'];
              }
              setCar({ ...data, images: imagesArr });
              setLoading(false);
            })
            .catch(() => {
              let imagesArr = [];
              if (data.image_path) {
                imagesArr = [`http://localhost:5000${data.image_path}`];
              } else {
                imagesArr = ['/uploads/default-car.jpg'];
              }
              setCar({ ...data, images: imagesArr });
              setLoading(false);
            });
        }
      })
      .catch(() => {
        setCar(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!car) return <p>Car not found</p>;

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
    images = [],
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
