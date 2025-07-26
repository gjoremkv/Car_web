import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import CarImageGallery from './CarImageGallery';
import ContactSellerCard from './components/ContactSellerCard';
import MessageBox from './components/MessageBox';
import './ListingDetail.css';
import socket from './socket'; // adjust path if needed
import AuctionModal from './components/AuctionModal';

export default function ListingDetail({ currentUser }) {
  const location = useLocation();
  const [car, setCar] = useState({});
  const [images, setImages] = useState([]);
  const inputRef = useRef();
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const carObj = location.state?.car;
    if (!carObj || !carObj.id) return;
    setCar(carObj);
    
    // Fetch all images for this car
    const fetchImages = async () => {
      try {
        const allImages = [];
        
        // Add main image if it exists
        if (carObj.image_path) {
          allImages.push(`http://localhost:5000${carObj.image_path}`);
        }
        
        // Fetch additional images from car_images table
        const response = await fetch(`http://localhost:5000/car/${carObj.id}/images`);
        if (response.ok) {
          const additionalImages = await response.json();
          additionalImages.forEach(img => {
            const imageUrl = `http://localhost:5000${img.image_path}`;
            // Avoid duplicates
            if (!allImages.includes(imageUrl)) {
              allImages.push(imageUrl);
            }
          });
        }
        
        setImages(allImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to main image only
        if (carObj.image_path) {
          setImages([`http://localhost:5000${carObj.image_path}`]);
        }
      }
    };
    
    fetchImages();
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
    seller_id,
    engine_cubic,
    features,
  } = car;

  // Debug log for troubleshooting message box visibility
  console.log('currentUser', currentUser, 'seller_id', seller_id, 'car', car);

  const handleSend = () => {
    const text = inputRef.current.value.trim();
    if (!text) return;

    console.log('📤 Sending message:', {
      senderId: currentUser?.id,
      receiverId: seller_id,
      listingId: car?.id,
      message: text
    });

    socket.emit('sendMessage', {
      senderId: currentUser?.id,
      receiverId: seller_id,
      listingId: car?.id,
      message: text
    });

    inputRef.current.value = '';
  };

  const openAuctionModal = (car) => setSelectedCar(car);

  return (
    <div className="listing-detail-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Main content column */}
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
        {currentUser?.id === seller_id && (
          <button onClick={() => openAuctionModal(car)}>Start Auction</button>
        )}
      </div>

      {/* Sticky sidebar on the right */}
      <div className="contact-seller-sidebar">
        <div className="seller-card">
          <h3>Private Seller</h3>
          <p className="location">📍 Location unknown</p>
          <div className="rating">
            {'★'.repeat(4)}☆ <span className="rating-number">4.5</span>
          </div>
          <hr />
          <p className="price">{price} €</p>

          {/* Contact seller message input - only show if logged in and not own listing */}
          {currentUser && currentUser.id !== seller_id && (
            <div className="contact-seller-box">
              <h4>Contact Seller</h4>
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                className="message-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="send-btn">
                Send Message
              </button>
            </div>
          )}

          {/* Show login prompt if not logged in */}
          {!currentUser && (
            <div className="contact-seller-box">
              <h4>Contact Seller</h4>
              <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                Please login to contact the seller
              </p>
            </div>
          )}

          {/* Save & Share buttons */}
          <div className="seller-actions">
            <button className="save-btn">🔖 Save</button>
            <button className="share-btn">🔗 Share</button>
          </div>
        </div>
      </div>
      {selectedCar && (
        <AuctionModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
}
