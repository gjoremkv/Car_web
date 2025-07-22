import React, { useState } from 'react';
import { popularManufacturers, otherManufacturers } from '../data/manufacturers';
import { models } from '../data/models';
import { features as allFeatures } from '../data/features';

const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);
const driveTypes = ["FWD", "RWD", "AWD", "4WD"];
const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid", "LPG", "CNG"];
const transmissions = ["Manual", "Automatic", "CVT", "Dual-clutch"];
const vehicleTypes = ["Sedan", "Hatchback", "SUV", "Coupe", "Convertible", "Wagon", "Van", "Pickup"];

export default function CarForm({ onSubmit, submitLabel = "Create Auction" }) {
  const [form, setForm] = useState({
    manufacturer: '',
    model: '',
    year: '',
    price: '',
    drive_type: '',
    fuel: '',
    transmission: '',
    seats: '',
    kilometers: '',
    vehicle_type: '',
    color: '',
    interior_color: '',
    interior_material: '',
    doors: '',
    features: [],
    engine_cubic: '',
    horsepower: '',
  });
  const [images, setImages] = useState([]);

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
    setImages([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "features") {
        formData.append(key, value.join(','));
      } else {
        formData.append(key, value);
      }
    });
    images.forEach((img) => formData.append('images', img));
    onSubmit(formData);
  };

  return (
    <form className="auction-car-form" onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Auction Your Car</h2>
      <div className="form-row">
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
      <div className="form-row">
        <label>Model</label>
        <select name="model" value={form.model} onChange={handleChange} required disabled={!form.manufacturer}>
          <option value="">Select Model</option>
          {models[form.manufacturer]?.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Year</label>
        <select name="year" value={form.year} onChange={handleChange} required>
          <option value="">Select Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Price (€)</label>
        <input name="price" type="number" value={form.price} onChange={handleChange} required />
      </div>
      <div className="form-row">
        <label>Drive Type</label>
        <select name="drive_type" value={form.drive_type} onChange={handleChange}>
          <option value="">Select Drive Type</option>
          {driveTypes.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Fuel Type</label>
        <select name="fuel" value={form.fuel} onChange={handleChange}>
          <option value="">Select Fuel Type</option>
          {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Transmission</label>
        <select name="transmission" value={form.transmission} onChange={handleChange}>
          <option value="">Select Transmission</option>
          {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Vehicle Type</label>
        <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
          <option value="">Select Vehicle Type</option>
          {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Features</label>
        <div className="features-checkboxes">
          {allFeatures.map(f => (
            <label key={f} className="feature-checkbox">
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
      {/* Add other fields as needed, similar to above */}
      <div className="form-row">
        <label>Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
      </div>
      <button type="submit" className="auction-submit-btn">{submitLabel}</button>
    </form>
  );
} 