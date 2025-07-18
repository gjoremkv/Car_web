import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header'; // Ensure the path is correct
import MainSection from './MainSection'; // Import the MainSection component
import AfterMain from './AfterMain'; // Import the AfterMain component
import SalesSection from './SalesSection'; // Import the SalesSection component
import Buy from './Buy'; // Component for /buy route


import Info from './Info'; // Component for /info route
import ListingDetail from './ListingDetail'; // New component for detailed car view
import AuctionSection from './AuctionSection'; // Import the AuctionSection component

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    
    if (token && username && userId) {
      // You might want to verify the token with your backend here
      setCurrentUser({ id: parseInt(userId), username, token });
    }
  }, []);

  // Listen for storage changes (when user logs in/out in Header)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('userId');
      
      if (token && username && userId) {
        setCurrentUser({ id: parseInt(userId), username, token });
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>  {/* Wrap your app in Router */}
      <div className="App">
        <Header />  {/* The header is constant across all routes */}
        
        <Routes>  {/* Define the routes for navigation */}
          <Route path="/" element={
            <>
              <MainSection />
              <AfterMain />
            </>
          } />
          <Route path="/buy" element={<Buy />} />  {/* Define route for /buy */}
          <Route path="/sell" element={<SalesSection />} />
          <Route path="/auction" element={<AuctionSection />} />
          <Route path="/info" element={<Info />} />  {/* Define route for /info */}
          <Route path="/car/:id" element={<ListingDetail currentUser={currentUser} />} />  {/* Pass currentUser prop */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
