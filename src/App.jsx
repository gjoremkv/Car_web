import React from 'react';
import Header from './Header'; // Ensure the path is correct
import MainSection from './MainSection'; // Import the MainSection component
import AfterMain from './AfterMain'; // Import the AfterMain component
import SalesSection from './SalesSection'; // Import the new SalesSection

function App() {
  return (
    <div className="App">
      <Header />
      <MainSection />  {}
      <AfterMain />    {}
      <SalesSection /> {}
    </div>
  );
}

export default App;