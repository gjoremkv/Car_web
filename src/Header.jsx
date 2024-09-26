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

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        email,
        password,
      });
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert('Registration failed');
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
