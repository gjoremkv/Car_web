import React, { useEffect, useState } from 'react';
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
import MiniInbox from './components/MiniInbox.jsx';
import MyListings from './pages/MyListings';
import AuctionModal from './components/AuctionModal';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedToken = localStorage.getItem('token');
    
    if (storedId && storedUsername && storedToken) {
      setUser({ id: parseInt(storedId), username: storedUsername });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const updatedId = localStorage.getItem('userId');
      const updatedUsername = localStorage.getItem('username');
      const updatedToken = localStorage.getItem('token');
      if (updatedId && updatedUsername && updatedToken) {
        setUser({ id: parseInt(updatedId), username: updatedUsername });
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        {user && <MiniInbox currentUserId={user.id} />}
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
          <Route path="/my-listings" element={<MyListings currentUser={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
