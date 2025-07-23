import React, { useState } from 'react';
import './ListingDetail.css';

export default function CarImageGallery({ images = [] }) {
  const [mainIdx, setMainIdx] = useState(0);
  if (!images.length) return null;

  const handlePrev = () => {
    setMainIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setMainIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="CarImageGallery">
      <div className="main-image-container">
        <button className="arrow left" onClick={handlePrev}>&#10094;</button>
        <img className="main-image" src={images[mainIdx]} alt={`Main ${mainIdx + 1}`} />
        <button className="arrow right" onClick={handleNext}>&#10095;</button>
      </div>
      <div className="thumbnails">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            className={`thumbnail${mainIdx === idx ? ' selected' : ''}`}
            alt={`Image ${idx + 1}`}
            onClick={() => setMainIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
} 