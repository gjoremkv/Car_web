// src/SalesSection.jsx
import React from 'react';
import './SalesSection.css'; // Ensure the CSS file is properly linked

function SalesSection() {
  return (
    <section className="sales-outer-container">
      <div className="sales-inner-container">
        <h2>Most sold vehicles this month:</h2>
        <div className="sales-container">
          <div className="sales-item">
            <div className="sales-image">Image 1</div>
            <p className="sales-number">1000</p>
          </div>
          <div className="sales-item">
            <div className="sales-image">Image 2</div>
            <p className="sales-number">3000</p>
          </div>
          <div className="sales-item">
            <div className="sales-image">Image 3</div>
            <p className="sales-number">10000</p>
          </div>
          <div className="sales-item">
            <div className="sales-image">Image 4</div>
            <p className="sales-number">500</p>
          </div>
          <div className="sales-item">
            <div className="sales-image">Image 5</div>
            <p className="sales-number">7000</p>
          </div>
          <div className="sales-item">
            <div className="sales-image">Image 6</div>
            <p className="sales-number">1200</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SalesSection;
