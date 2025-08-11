import React, { useEffect, useState } from 'react';

export default function MyListings({ currentUser }) {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/cars/my-cars`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(setCars);
  }, [currentUser]);

  const openAuctionModal = (car) => setSelectedCar(car);

  return (
    <div>
      <h2>My Listings</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {cars.map(car => (
          <div key={car.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 260 }}>
            <img src={car.image_path ? apiUrl(car.image_path) : '/placeholder.jpg'} alt={car.model} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6 }} />
            <h4>{car.manufacturer} {car.model}</h4>
            <p>Year: {car.year}</p>
            <button onClick={() => openAuctionModal(car)}>Start Auction</button>
          </div>
        ))}
      </div>
      {selectedCar && (
        <AuctionModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
}

// AuctionModal component will be implemented below
import AuctionModal from '../components/AuctionModal'; 
import { apiUrl } from '../utils/url';
