import React, { useState } from 'react';
import './ListingDetail.css';

export default function CarImageGallery({ images = [] }) {
  const [mainIdx, setMainIdx] = useState(0);
  if (!images.length) return null;
  return (
    <div className="CarImageGallery">
      <img className="main-image" src={images[mainIdx]} alt={`Main ${mainIdx+1}`} />
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