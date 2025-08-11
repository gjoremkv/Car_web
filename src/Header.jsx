import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

const carLogo = '/uploads/auto_car-16.png'; // as you had it

function Header() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (storedUsername && token && userId) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    } else {
      setUsername('');
      setIsLoggedIn(false);
    }

    const handleStorageChange = () => {
      const newUsername = localStorage.getItem('username');
      const newToken = localStorage.getItem('token');
      const newUserId = localStorage.getItem('userId');
      if (newUsername && newToken && newUserId) {
        setUsername(newUsername);
        setIsLoggedIn(true);
      } else {
        setUsername('');
        setIsLoggedIn(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const togglePopup = () => setIsOpen(!isOpen);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, username: responseUsername, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('username', responseUsername);
      localStorage.setItem('userId', userId);

      setUsername(responseUsername);
      setIsLoggedIn(true);
      setIsOpen(false);
      setEmail('');
      setPassword('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Login failed');
      console.error('Error logging in:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      setErrorMessage('Registration successful! Please login.');
      setIsLogin(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.error || error.response.data.message || 'An unknown error occurred';
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUsername('');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={carLogo} alt="vozilo.si" className="logo-image" draggable="false" />
        <span className="logo-text">vozilo.si</span>
      </div>

      <nav className="nav-links">
        {location.pathname === '/buy' ? (
          <Link to="/" className="nav-link" title="Home">
            <svg className="nav-home-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4L21 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10.5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <Link to="/buy" className="nav-link">Buy</Link>
        )}
        <div className="divider"></div>
        {location.pathname === '/sell' ? (
          <Link to="/" className="nav-link" title="Home">
            <svg className="nav-home-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4L21 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10.5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <Link to="/sell" className="nav-link">Sell</Link>
        )}
        <div className="divider"></div>
        {location.pathname === '/auction' ? (
          <Link to="/" className="nav-link" title="Home">
            <svg className="nav-home-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4L21 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10.5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <Link to="/auction" className="nav-link">Auction</Link>
        )}
        <div className="divider"></div>
        {location.pathname === '/info' ? (
          <Link to="/" className="nav-link" title="Home">
            <svg className="nav-home-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4L21 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10.5V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <Link to="/info" className="nav-link">Info</Link>
        )}
      </nav>

      <div className="register-button">
        {(username && isLoggedIn) ? (
          <div className="user-info">
            <span>Welcome, {username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        ) : (
          <button onClick={togglePopup} className="register-link">Register / Login</button>
        )}
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
                  No account? <span onClick={() => setIsLogin(false)} className="toggle-link">Register here</span>
                </p>
              </div>
            ) : (
              <div>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                  <label>First Name:</label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <label>Last Name:</label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <p>
                  Already have an account? <span onClick={() => setIsLogin(true)} className="toggle-link">Login here</span>
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
