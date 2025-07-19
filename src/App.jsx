import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inbox from './components/Inbox.jsx';
import MessageBox from './components/MessageBox.jsx';
import Header from './Header.jsx';
import MainSection from './MainSection.jsx';
import AfterMain from './AfterMain.jsx';
import Buy from './Buy.jsx';
import SalesSection from './SalesSection.jsx';
import AuctionSection from './AuctionSection.jsx';
import Info from './Info.jsx';
import ListingDetail from './ListingDetail.jsx';

function App() {
  // Simulated logged-in user for testing (replace with real auth later)
  const user = JSON.parse(localStorage.getItem('user')) || { id: 1, username: 'demo' };

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <MainSection />
              <AfterMain />
            </>
          } />
          <Route path="/buy" element={<Buy />} />
          <Route path="/sell" element={<SalesSection />} />
          <Route path="/auction" element={<AuctionSection />} />
          <Route path="/info" element={<Info />} />
          <Route path="/car/:id" element={<ListingDetail currentUser={user} />} />
          <Route path="/inbox" element={<Inbox userId={user?.id} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
