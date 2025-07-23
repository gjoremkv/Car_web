import React, { useState } from 'react';
import { popularManufacturers, otherManufacturers } from '../data/manufacturers';
import { modelsByBrand } from '../data/modelsByBrand';
import { features as allFeatures } from '../data/features';

const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);
const driveTypes = ["FWD", "RWD", "AWD", "4WD"];
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "CNG"];
const transmissions = ["Manual", "Automatic", "CVT", "Dual-clutch"];
const vehicleTypes = ["Sedan", "Hatchback", "SUV", "Coupe", "Convertible", "Wagon", "Van", "Pickup"];

export default function CarForm({ onSubmit, submitLabel = "Create Auction", onBack }) {
  const [form, setForm] = useState({
    manufacturer: '',
    model: '',
    year: '',
    price: '',
    drive_type: '',
    fuel: '',
    transmission: '',
    seats: '4',
    kilometers: '0',
    vehicle_type: '',
    color: '',
    interior_color: '',
    interior_material: '',
    doors: '4',
    features: [],
    engine_cubic: '',
    horsepower: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (feature) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragging');
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
    if (droppedFiles.length > 0) {
      setImages(prev => [...prev, ...droppedFiles]);
      setImagePreviews(prev => [
        ...prev,
        ...droppedFiles.map(file => URL.createObjectURL(file))
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation as before...
    const requiredNumeric = ['seats', 'kilometers', 'doors'];
    for (let field of requiredNumeric) {
      if (
        form[field] === '' ||
        form[field] === null ||
        isNaN(Number(form[field])) ||
        Number(form[field]) < 0
      ) {
        console.error(`[DEBUG] Required numeric field missing or invalid: ${field}`, form[field]);
        return;
      }
    }
    if (!form.drive_type || !form.fuel || !form.transmission || !form.vehicle_type) {
      console.error('[DEBUG] Required dropdown missing:', {
        drive_type: form.drive_type,
        fuel: form.fuel,
        transmission: form.transmission,
        vehicle_type: form.vehicle_type
      });
      return;
    }
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "features") {
        formData.append(key, value.join(','));
      } else if (requiredNumeric.includes(key)) {
        formData.append(key, Number(value));
      } else {
        formData.append(key, value);
      }
    });
    images.forEach((img) => formData.append('images', img));

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/add-car', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (error) {
          console.error('[DEBUG] Failed to parse JSON:', error);
          data = {};
        }
      } else {
        try {
          const text = await res.text();
          // Remove leading whitespace before checking
          const trimmed = text.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            data = JSON.parse(trimmed);
          } else {
            data = {};
          }
        } catch (error) {
          console.error('[DEBUG] Failed to parse non-JSON response:', error);
          data = {};
        }
      }

      if (!res.ok) {
        alert('Failed to create car');
        return;
      }

      // ...success logic, e.g. show success message or redirect...
      alert('Car created successfully!');
    } catch (err) {
      alert('Failed to create car');
      console.error(err);
    }
  };

  return (
    <div className="auction-form-container">
      <form className="auction-car-form-modern" onSubmit={handleSubmit}>
        <h1 className="auction-title">Auction Your Car</h1>

        {/* Basic Info */}
        <div className="section">
          <h2>Vehicle Details</h2>
          <div className="form-grid">
            <div>
              <label>Manufacturer</label>
              <select
                name="manufacturer"
                value={form.manufacturer}
                onChange={e => setForm({ ...form, manufacturer: e.target.value, model: '' })}
                required
              >
                <option value="">Select Manufacturer</option>
                <optgroup label="Popular">
                  {popularManufacturers.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </optgroup>
                <optgroup label="All Brands A-Z">
                  {otherManufacturers.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label>Model</label>
              <select name="model" value={form.model} onChange={handleChange} required disabled={!form.manufacturer}>
                <option value="">Select Model</option>
                {modelsByBrand[form.manufacturer]?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label>Year</label>
              <select name="year" value={form.year} onChange={handleChange} required>
                <option value="">Select Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label>Price (€)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="1" />
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="section">
          <h2>Specifications</h2>
          <div className="form-grid">
            <div>
              <label>Drive Type</label>
              <select name="drive_type" value={form.drive_type} onChange={handleChange} required>
                <option value="">Select Drive Type</option>
                {driveTypes.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label>Fuel Type</label>
              <select name="fuel" value={form.fuel} onChange={handleChange} required>
                <option value="">Select Fuel Type</option>
                {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label>Transmission</label>
              <select name="transmission" value={form.transmission} onChange={handleChange} required>
                <option value="">Select Transmission</option>
                {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Color</label>
              <input name="color" value={form.color} onChange={handleChange} />
            </div>
            <div>
              <label>Vehicle Type</label>
              <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} required>
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label>Interior Color</label>
              <input name="interior_color" value={form.interior_color} onChange={handleChange} />
            </div>
            <div>
              <label>Seats</label>
              <input name="seats" type="number" value={form.seats} onChange={handleChange} required min="1" />
            </div>
            <div>
              <label>Doors</label>
              <input name="doors" type="number" value={form.doors} onChange={handleChange} required min="1" />
            </div>
            <div>
              <label>Kilometers</label>
              <input name="kilometers" type="number" value={form.kilometers} onChange={handleChange} required min="0" />
            </div>
            <div>
              <label>Interior Material</label>
              <input name="interior_material" value={form.interior_material} onChange={handleChange} />
            </div>
            <div>
              <label>Engine Cubic</label>
              <input name="engine_cubic" value={form.engine_cubic} onChange={handleChange} />
            </div>
            <div>
              <label>Horsepower</label>
              <input name="horsepower" value={form.horsepower} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="section">
          <h2>Upload Images</h2>
          <div
            className="upload-box"
            onClick={() => document.getElementById('auction-image-input').click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="auction-image-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {images.length === 0 ? (
              <span>Click or drag images here to upload</span>
            ) : (
              <div className="image-preview-list">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={src} alt={`preview-${idx}`} className="image-preview" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 22,
                        height: 22,
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: '22px',
                        padding: 0,
                      }}
                      title="Remove image"
                    >&#10006;</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="section">
          <h2>Features</h2>
          <div className="features-grid">
            {allFeatures.map(f => (
              <label key={f} className="feature-checkbox-modern">
                <input
                  type="checkbox"
                  checked={form.features.includes(f)}
                  onChange={() => handleFeatureChange(f)}
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="section" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button type="submit" className="cta-btn">{submitLabel}</button>
          <button type="button" className="cta-btn back-btn" onClick={onBack}>Back</button>
        </div>
      </form>
    </div>
  );
} 