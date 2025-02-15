import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header'; // Ensure the path is correct
import MainSection from './MainSection'; // Import the MainSection component
import AfterMain from './AfterMain'; // Import the AfterMain component
import SalesSection from './SalesSection'; // Import the SalesSection component
import Buy from './Buy'; // Component for /buy route


import Info from './Info'; // Component for /info route
import ListingDetail from './ListingDetail'; // New component for detailed car view

function App() {
  return (
    <Router>  {/* Wrap your app in Router */}
      <div className="App">
        <Header />  {/* The header is constant across all routes */}
        
        <Routes>  {/* Define the routes for navigation */}
          <Route path="/" element={
            <>
              <MainSection />
              <AfterMain />
              <SalesSection />
            </>
          } />
          <Route path="/buy" element={<Buy />} />  {/* Define route for /buy */}
          <Route path="/sell" element={<SalesSection />} />
                
          <Route path="/info" element={<Info />} />  {/* Define route for /info */}
          <Route path="/car/:id" element={<ListingDetail />} />  {/* New route for car details */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
