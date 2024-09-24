import React, { useState } from 'react';
import './Sell.css';

const Sell = () => {
  const [step, setStep] = useState(1); // Step 1: User Info, Step 2: Car Info
  const [userInfo, setUserInfo] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
  });
  const [carInfo, setCarInfo] = useState({
    make: '',
    model: '',
    year: '',
    kilometers: '',
    price: '',
    description: '',
    images: []
  });

  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleCarInfoChange = (e) => {
    setCarInfo({ ...carInfo, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    setCarInfo({ ...carInfo, images: [...carInfo.images, ...e.target.files] });
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  return (
    <div className="sell-page">
      <div className="content-area">
        {/* Left Section: Get Started Form */}
        <div className="get-started">
          {step === 1 && (
            <div className="registration-form">
              <h2>Get Started</h2>
              <p>Enter your personal information to start selling a car.</p>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  placeholder="Name"
                  required
                />
                <input
                  type="text"
                  name="surname"
                  value={userInfo.surname}
                  onChange={handleUserInfoChange}
                  placeholder="Surname"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  placeholder="Email"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={userInfo.password}
                  onChange={handleUserInfoChange}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleUserInfoChange}
                  placeholder="Phone Number"
                  required
                />
              </div>
              <button className="next-btn" onClick={handleNextStep}>
                Next: Car Details
              </button>
            </div>
          )}

          {/* Car Details Step */}
          {step === 2 && (
            <>
              <div className="car-details-form">
                <h2>Car Details</h2>
                <div className="form-group">
                  <input
                    type="text"
                    name="make"
                    value={carInfo.make}
                    onChange={handleCarInfoChange}
                    placeholder="Car Make"
                    required
                  />
                  <input
                    type="text"
                    name="model"
                    value={carInfo.model}
                    onChange={handleCarInfoChange}
                    placeholder="Car Model"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    name="year"
                    value={carInfo.year}
                    onChange={handleCarInfoChange}
                    placeholder="Year"
                    required
                  />
                  <input
                    type="number"
                    name="kilometers"
                    value={carInfo.kilometers}
                    onChange={handleCarInfoChange}
                    placeholder="Kilometers"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    name="price"
                    value={carInfo.price}
                    onChange={handleCarInfoChange}
                    placeholder="Price"
                    required
                  />
                </div>
                <textarea
                  name="description"
                  value={carInfo.description}
                  onChange={handleCarInfoChange}
                  placeholder="Describe your car..."
                  required
                />
                <div className="form-group">
                  <label>Upload Car Images:</label>
                  <input type="file" multiple onChange={handleImageUpload} />
                </div>
                <button onClick={handlePreviousStep}>Back</button>
                <button>Submit Listing</button>
              </div>

              {/* Live Preview Section (directly under Car Details) */}
              <div className="live-preview">
                <h3>Your Listing Preview</h3>
                <div className="preview-card">
                  {carInfo.images.length > 0 ? (
                    <img
                      src={URL.createObjectURL(carInfo.images[0])}
                      alt="Preview Car"
                      className="preview-img"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/300"
                      alt="Placeholder Car"
                      className="preview-img"
                    />
                  )}
                  <h4>{carInfo.make} {carInfo.model} {carInfo.year}</h4>
                  <p>{carInfo.kilometers ? `${carInfo.kilometers} km` : ''}</p>
                  <p>{carInfo.price ? `$${carInfo.price}` : ''}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Section: Info Banner and Premium Deals */}
        <div className="right-section">
          <div className="info-banner">
            <h2>Sell Your Car Fast</h2>
            <p>
              Due to Increased Daily Users, we help Sellers sell their cars in less than a week.
              <br />
              Check out some Premium Deals we provide our users with today!
            </p>
          </div>

          <div className="premium-deals">
            <h3>Premium Deals</h3>
            <div className="deal-card">
              <img src="https://via.placeholder.com/300" alt="BMW X5" />
              <h4>BMW X5 2021</h4>
              <p>Price: $50,000</p>
              <p>Kilometers: 8,000 km</p>
            </div>
            <div className="deal-card">
              <img src="https://via.placeholder.com/300" alt="Audi A6" />
              <h4>Audi A6 2020</h4>
              <p>Price: $40,000</p>
              <p>Kilometers: 12,000 km</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
