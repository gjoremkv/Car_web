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
    // Debug log all form values
    console.log('[DEBUG] CarForm submit values:', form);

    // Check required numeric fields
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
      console.error('[DEBUG] No images selected');
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
        <input name="price" type="number" value={form.price} onChange={handleChange} required min="1" />
      </div>
      <div className="form-row">
        <label>Drive Type</label>
        <select name="drive_type" value={form.drive_type} onChange={handleChange} required>
          <option value="">Select Drive Type</option>
          {driveTypes.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Fuel Type</label>
        <select name="fuel" value={form.fuel} onChange={handleChange} required>
          <option value="">Select Fuel Type</option>
          {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Transmission</label>
        <select name="transmission" value={form.transmission} onChange={handleChange} required>
          <option value="">Select Transmission</option>
          {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Seats</label>
        <input name="seats" type="number" value={form.seats} onChange={handleChange} required min="1" />
      </div>
      <div className="form-row">
        <label>Kilometers</label>
        <input name="kilometers" type="number" value={form.kilometers} onChange={handleChange} required min="0" />
      </div>
      <div className="form-row">
        <label>Vehicle Type</label>
        <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} required>
          <option value="">Select Vehicle Type</option>
          {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="form-row">
        <label>Color</label>
        <input name="color" value={form.color} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label>Interior Color</label>
        <input name="interior_color" value={form.interior_color} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label>Interior Material</label>
        <input name="interior_material" value={form.interior_material} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label>Doors</label>
        <input name="doors" type="number" value={form.doors} onChange={handleChange} required min="1" />
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
      <div className="form-row">
        <label>Engine Cubic</label>
        <input name="engine_cubic" value={form.engine_cubic} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label>Horsepower</label>
        <input name="horsepower" value={form.horsepower} onChange={handleChange} />
      </div>
      <div className="form-row">
        <label>Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} required />
      </div>
      <button type="submit" className="auction-submit-btn">{submitLabel}</button>
    </form>
  );
} 