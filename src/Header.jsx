import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import carLogo from './images/auto_car-16.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For registration
  const [errorMessage, setErrorMessage] = useState(''); // For displaying error messages

  const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'proton.me'];
  const blockedDomains = ['10minutemail.com', 'tempmail.com', 'mailinator.com', 'guerrillamail.com'];

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setErrorMessage(''); // Clear error message when switching
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setErrorMessage(''); // Clear error message when switching
  };

  const validateEmail = (email) => {
    const emailDomain = email.split('@')[1]?.toLowerCase();
  
    if (blockedDomains.includes(emailDomain)) {
      return false; // Reject email from blocked domains
    }
  
    if (allowedDomains.includes(emailDomain)) {
      return true; // Accept email from allowed domains
    }
  
    return false; // Reject all other domains
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!validateEmail(email)) {
      alert('Please use a valid email address from allowed providers.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        email,
        password,
      });
      alert(response.data.message); // Display success message from the backend
    } catch (error) {
      console.log('Error response:', error.response);  // Log the full error response to debug
  
      if (error.response && error.response.data && error.response.data.message) {
        // Display the error message from the backend
        setErrorMessage(error.response.data.message);
      } else {
        // Fallback error message if no message is received from backend
        setErrorMessage('An unknown error occurred');
      }
    }
  };
  
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });
      const token = response.data.token;
      localStorage.setItem('token', token); // Store token in localStorage
      alert('Login successful');
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={carLogo} alt="vozilo.si" className="logo-image" draggable="false" />
        <span className="logo-text">vozilo.si</span>
      </div>
      <nav className="nav-links">
        <Link to="/buy" className="nav-link">Buy</Link>
        <div className="divider"></div>
        <Link to="/sell" className="nav-link">Sell</Link>
        <div className="divider"></div>
        <Link to="/info" className="nav-link">Info</Link>
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
                <form onSubmit={handleLogin}>
                  <label>Email:</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label>Password:</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit">Login</button>
                </form>
                <p>
                  No account? <span onClick={switchToRegister} className="toggle-link">Register here</span>
                </p>
              </div>
            ) : (
              <div>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                  <label>Username:</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label>Email:</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label>Password:</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit">Register</button>
                </form>

                {/* Display error message if it exists */}
                {errorMessage && <p className="error-message">{errorMessage}</p>}

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
