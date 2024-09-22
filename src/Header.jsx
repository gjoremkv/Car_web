import React, { useState } from 'react';
import './Header.css';
import carLogo from './images/auto_car-16.png'; // Import your car logo

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={carLogo} alt="vozilo.si" className="logo-image" draggable="false" />
        <span className="logo-text">vozilo.si</span>
      </div>
      <nav className="nav-links">
        <a href="/buy" className="nav-link">Buy</a>
        <div className="divider"></div>
        <a href="/sell" className="nav-link">Sell</a>
        <div className="divider"></div>
        <a href="/info" className="nav-link">Info</a>
      </nav>
      <div className="register-button">
        <button onClick={togglePopup} className="register-link">Register / Login</button>
      </div>

      {isOpen && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            {isLogin ? (
              <div>
                <h2>Login</h2>
                <form>
                  <label>Email:</label>
                  <input type="email" placeholder="Enter your email" required />
                  <label>Password:</label>
                  <input type="password" placeholder="Enter your password" required />
                  <button type="submit">Login</button>
                </form>
                <p>
                  No account? <span onClick={switchToRegister} className="toggle-link">Register here</span>
                </p>
              </div>
            ) : (
              <div>
                <h2>Register</h2>
                <form>
                  <label>Name:</label>
                  <input type="text" placeholder="Enter your name" required />
                  <label>Surname:</label>
                  <input type="text" placeholder="Enter your surname" required />
                  <label>Email:</label>
                  <input type="email" placeholder="Enter your email" required />
                  <label>Age:</label>
                  <input type="number" placeholder="Enter your age" required />
                  <label>Password:</label>
                  <input type="password" placeholder="Create a password" required />
                  <button type="submit">Register</button>
                </form>
                <p>
                  Already have an account? <span onClick={switchToLogin} className="toggle-link">Login here</span>
                </p>
              </div>
            )}
            <span className="close-popup" onClick={togglePopup}>X</span>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
