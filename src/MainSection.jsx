import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainSection.css'; // Import the corresponding CSS file

const quickPresets = [
  {
    label: 'Family SUV under €15k',
    values: { vehicleType: 'SUV', budgetMax: 15000, fuel: 'Hybrid' }
  },
  {
    label: 'Budget Sedan under €10k',
    values: { vehicleType: 'Sedan', budgetMax: 10000 }
  },
  {
    label: 'Electric Cars',
    values: { fuel: 'Electric' }
  },
  {
    label: '7-Seaters',
    values: { familySize: 7 }
  }
];

const vehicleIcons = {
  SUV: '🚙',
  Sedan: '🚗',
  Coupe: '🏎️',
  Van: '🚐',
  Any: '🚘'
};

// Add gray vehicle icon URLs at the top, after imports
const carIcon = "http://localhost:5000/uploads/car.png";
const vanIcon = "http://localhost:5000/uploads/van.png";
const coupeIcon = "http://localhost:5000/uploads/coupe.png";
const anyIcon = "http://localhost:5000/uploads/car.png";

const vehicleIconImgs = {
  SUV: carIcon,
  Sedan: carIcon,
  Coupe: coupeIcon,
  Van: vanIcon,
  Any: anyIcon
};

function MainSection() {
  const navigate = useNavigate();
  // State to control the visibility of the popup
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDriveType, setSelectedDriveType] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [familySize, setFamilySize] = useState(5);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Stores search results
  const [tags, setTags] = useState([]);
  const [searchCount, setSearchCount] = useState(null);
  const [filteredPreviewCars, setFilteredPreviewCars] = useState([]); // Top 3 preview
  const debounceTimeout = useRef(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]); // Feature checklist
  const [noResultExplanation, setNoResultExplanation] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [compareCars, setCompareCars] = useState([]);
  // Replace quizQuestions and quiz logic with the new, detailed 10-question quiz
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({ features: [] });
  const quizQuestions = [
    {
      key: 'drivingLocation',
      question: 'Where do you drive most often?',
      options: [
        { label: 'Mostly in the city', value: 'city' },
        { label: 'Mostly on highways', value: 'highway' },
        { label: 'Off-road / mountain areas', value: 'offroad' },
      ],
    },
    {
      key: 'priority',
      question: 'What’s more important to you?',
      options: [
        { label: 'Fuel economy', value: 'economy' },
        { label: 'Performance', value: 'performance' },
        { label: 'Low maintenance', value: 'maintenance' },
        { label: 'Environmental impact', value: 'eco' },
      ],
    },
    {
      key: 'familySize',
      question: 'How many people do you usually travel with?',
      options: [
        { label: 'Just me or one passenger', value: 2 },
        { label: 'Small family (2–4)', value: 5 },
        { label: 'Large family (5+)', value: 7 },
      ],
    },
    {
      key: 'budget',
      question: 'What\'s your budget for the car?',
      options: [
        { label: 'Under €5,000', value: [0, 5000] },
        { label: '€5,000 – €15,000', value: [5000, 15000] },
        { label: 'Over €15,000', value: [15000, 50000] },
      ],
    },
    {
      key: 'fuel',
      question: 'Do you have a preferred fuel type?',
      options: [
        { label: 'Doesn’t matter', value: '' },
        { label: 'Gasoline', value: 'Gasoline' },
        { label: 'Diesel', value: 'Diesel' },
        { label: 'Electric', value: 'Electric' },
        { label: 'Hybrid', value: 'Hybrid' },
      ],
    },
    {
      key: 'transmission',
      question: 'Do you want an automatic or manual?',
      options: [
        { label: 'Automatic', value: 'Automatic' },
        { label: 'Manual', value: 'Manual' },
        { label: 'Doesn’t matter', value: '' },
      ],
    },
    {
      key: 'features',
      question: 'Do you want a car with specific features? (Select all that apply)',
      options: [
        { label: 'Heated seats', value: 'Heated Seats' },
        { label: 'Navigation', value: 'Navigation' },
        { label: 'Parking sensors', value: 'Parking Sensors' },
        { label: 'Apple CarPlay', value: 'Apple CarPlay' },
        { label: 'Rear camera', value: 'Backup Camera' },
      ],
      multi: true,
    },
    {
      key: 'vehicleType',
      question: 'Do you prefer a certain vehicle type?',
      options: [
        { label: 'SUV', value: 'SUV' },
        { label: 'Sedan', value: 'Sedan' },
        { label: 'Coupe', value: 'Coupe' },
        { label: 'Van', value: 'Van' },
        { label: 'I don\'t care', value: '' },
      ],
    },
    {
      key: 'doors',
      question: 'How many doors do you want?',
      options: [
        { label: '2 doors', value: 2 },
        { label: '4 doors', value: 4 },
        { label: 'Doesn’t matter', value: '' },
      ],
    },
    {
      key: 'driveType',
      question: 'What kind of driving conditions do you face?',
      options: [
        { label: 'I live in a snowy/mountain area', value: 'AWD' },
        { label: 'Normal roads', value: 'FWD' },
        { label: 'I don’t know', value: '' },
      ],
    },
  ];
  const startQuiz = () => { setShowQuiz(true); setQuizStep(0); setQuizAnswers({ features: [] }); };
  const handleQuizAnswer = (option) => {
    const q = quizQuestions[quizStep];
    if (q.multi) {
      // Toggle feature in array
      setQuizAnswers(prev => {
        const features = prev.features || [];
        const exists = features.includes(option);
        return { ...prev, features: exists ? features.filter(f => f !== option) : [...features, option] };
      });
      // Don't advance step yet, wait for user to click Next
      return;
    } else {
      setQuizAnswers(prev => ({ ...prev, [q.key]: option }));
      setTimeout(() => {
        if (quizStep < quizQuestions.length - 1) setQuizStep(quizStep + 1);
        else applyQuizAnswers();
      }, 150);
    }
  };
  const handleQuizNext = () => {
    if (quizStep < quizQuestions.length - 1) setQuizStep(quizStep + 1);
    else applyQuizAnswers();
  };
  const applyQuizAnswers = () => {
    // Map answers to filters
    // 1. Driving location
    if (quizAnswers.drivingLocation === 'city') {
      setSelectedVehicleType('Sedan');
      setSelectedDriveType('FWD');
    } else if (quizAnswers.drivingLocation === 'highway') {
      setSelectedVehicleType('Sedan');
      setSelectedFuelType('Hybrid');
    } else if (quizAnswers.drivingLocation === 'offroad') {
      setSelectedVehicleType('SUV');
      setSelectedDriveType('4WD');
    }
    // 2. Priority
    if (quizAnswers.priority === 'economy') {
      setSelectedFuelType('Diesel');
      setSelectedTransmission('');
      setPriceRange([0, 15000]);
    } else if (quizAnswers.priority === 'performance') {
      setSelectedFuelType('Gasoline');
      setSelectedDriveType('AWD');
    } else if (quizAnswers.priority === 'maintenance') {
      setSelectedTransmission('Automatic');
      setPriceRange([0, 10000]);
    } else if (quizAnswers.priority === 'eco') {
      setSelectedFuelType('Electric');
    }
    // 3. Family size
    if (quizAnswers.familySize) setFamilySize(Number(quizAnswers.familySize));
    // 4. Budget
    if (quizAnswers.budget) setPriceRange(quizAnswers.budget);
    // 5. Fuel
    setSelectedFuelType(quizAnswers.fuel || '');
    // 6. Transmission
    setSelectedTransmission(quizAnswers.transmission || '');
    // 7. Features
    setSelectedFeatures(quizAnswers.features || []);
    // 8. Vehicle type
    setSelectedVehicleType(quizAnswers.vehicleType || '');
    // 9. Doors (not directly mapped in UI, but could be used if filter is added)
    // 10. Drive type
    setSelectedDriveType(quizAnswers.driveType || '');
    setShowQuiz(false);
  };

  // Parallax state
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const focusTimeout = useRef(null);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Parallax mouse move handler
  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setParallax({ x, y });
    setIsFocused(true);
    if (focusTimeout.current) clearTimeout(focusTimeout.current);
    focusTimeout.current = setTimeout(() => setIsFocused(false), 600);
  };

  // Tag logic
  const addTag = (type, value, label) => {
    if (!tags.some(t => t.type === type && t.value === value)) {
      setTags([...tags, { type, value, label }]);
    }
  };
  const removeTag = (type, value) => {
    setTags(tags.filter(t => !(t.type === type && t.value === value)));
    if (type === 'drive') setSelectedDriveType('');
    if (type === 'fuel') setSelectedFuelType('');
    if (type === 'trans') setSelectedTransmission('');
    if (type === 'vehicle') setSelectedVehicleType('');
    if (type === 'family') setFamilySize(5);
    if (type === 'price') setPriceRange([0, 50000]);
  };

  // Quick pick logic
  const handleQuickPick = (preset) => {
    if (preset.values.vehicleType) setSelectedVehicleType(preset.values.vehicleType);
    if (preset.values.budgetMax) setPriceRange([0, preset.values.budgetMax]);
    if (preset.values.fuel) setSelectedFuelType(preset.values.fuel);
    if (preset.values.familySize) setFamilySize(preset.values.familySize);
  };

  // Suggest For Me
  const fillSuggested = async () => {
    console.log('🎯 Suggest For Me clicked');
    try {
      const response = await fetch('http://localhost:5000/api/search/suggest-car', { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch suggestion');
      const suggestion = await response.json();
      console.log('✅ Suggestion received:', suggestion);
      if (suggestion) {
        setSelectedDriveType(suggestion.driveType || '');
        setSelectedFuelType(suggestion.fuel || '');
        setSelectedTransmission(suggestion.transmission || '');
        setPriceRange([
          suggestion.budgetMin !== undefined ? suggestion.budgetMin : 0,
          suggestion.budgetMax !== undefined ? suggestion.budgetMax : 50000
        ]);
        setFamilySize(suggestion.familySize || 5);
        setSelectedVehicleType(suggestion.vehicleType || '');
        setSelectedFeatures(suggestion.features || []);
        console.log('✅ Configurator updated with suggestion');
      }
    } catch (error) {
      console.error('❌ Suggestion failed:', error);
      // fallback: default suggestion
      setSelectedDriveType('AWD');
      setSelectedFuelType('Hybrid');
      setSelectedTransmission('Automatic');
      setPriceRange([10000, 20000]);
      setFamilySize(5);
      setSelectedVehicleType('SUV');
      setSelectedFeatures([]);
      console.log('✅ Applied fallback suggestion');
    }
  };

  // Clear all
  const clearFilters = () => {
    setSelectedDriveType('');
    setSelectedFuelType('');
    setSelectedTransmission('');
    setPriceRange([0, 50000]);
    setFamilySize(5);
    setSelectedVehicleType('');
    setTags([]);
    setSearchCount(null);
  };

  // Feature checklist options
  const featureOptions = [
    'Sunroof',
    'Heated Seats',
    'Bluetooth',
    'Navigation',
    'Backup Camera',
    'Parking Sensors',
    'Leather Seats',
    'Apple CarPlay',
    'Android Auto',
    'Keyless Entry',
    'Lane Assist',
    'Cruise Control',
  ];

  // Feature toggle handler
  const handleFeatureToggle = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Live search
  const fetchSearchResults = async (e) => {
    if (e) e.preventDefault();
    console.log('🔍 Fetching search results...');
    const searchData = {
      driveType: selectedDriveType,
      fuel: selectedFuelType,
      transmission: selectedTransmission,
      budgetMin: priceRange[0],
      budgetMax: priceRange[1],
      familySize,
      vehicleType: selectedVehicleType,
      features: selectedFeatures,
    };
    console.log('📊 Search data:', searchData);
    try {
      const response = await fetch('http://localhost:5000/api/search/search-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });
      if (!response.ok) throw new Error('Failed to fetch search results');
      const results = await response.json();
      console.log('✅ Search results:', results.length, 'cars found');
      if (results.explanation) {
        setNoResultExplanation(results.explanation);
        setSearchResults([]);
        setSearchCount(0);
      } else {
        setNoResultExplanation('');
        setSearchResults(results);
        setSearchCount(results.length);
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
      setSearchCount(0);
      setNoResultExplanation('No cars found. Please try different filters.');
    }
  };

  // Navigate to Buy page with filters
  const navigateToBuyPage = () => {
    const searchParams = new URLSearchParams({
      ...(selectedDriveType && { driveType: selectedDriveType }),
      ...(selectedFuelType && { fuel: selectedFuelType }),
      ...(selectedTransmission && { transmission: selectedTransmission }),
      ...(selectedVehicleType && { vehicleType: selectedVehicleType }),
      ...(priceRange[0] !== 0 && { priceFrom: priceRange[0] }),
      ...(priceRange[1] !== 50000 && { priceTo: priceRange[1] }),
      ...(familySize !== 5 && { familySize: familySize }),
    });
    
    navigate(`/buy?${searchParams.toString()}`);
  };

  // Debounced live preview fetch
  const fetchPreviewCars = () => {
    console.log('🔍 Fetching preview cars...');
    const searchData = {
      driveType: selectedDriveType,
      fuel: selectedFuelType,
      transmission: selectedTransmission,
      budgetMin: priceRange[0],
      budgetMax: priceRange[1],
      familySize,
      vehicleType: selectedVehicleType,
      features: selectedFeatures,
    };
    fetch('http://localhost:5000/api/search/search-cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData),
    })
      .then(res => res.json())
      .then(results => {
        console.log('✅ Preview results:', results.length || 0, 'cars');
        if (results.explanation) {
          setNoResultExplanation(results.explanation);
          setFilteredPreviewCars([]);
        } else {
          setNoResultExplanation('');
          setFilteredPreviewCars(results.slice(0, 3));
        }
      })
      .catch((error) => {
        console.error('❌ Preview fetch error:', error);
        setFilteredPreviewCars([]);
        setNoResultExplanation('No cars found. Please try different filters.');
      });
  };

  // Debounce filter changes for live preview
  React.useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(fetchPreviewCars, 350);
    return () => clearTimeout(debounceTimeout.current);
    // eslint-disable-next-line
  }, [selectedDriveType, selectedFuelType, selectedTransmission, selectedVehicleType, familySize, priceRange]);

  // Update tags on filter change
  React.useEffect(() => {
    let newTags = [];
    if (selectedDriveType) newTags.push({ type: 'drive', value: selectedDriveType, label: `🛞 ${selectedDriveType}` });
    if (selectedFuelType) newTags.push({ type: 'fuel', value: selectedFuelType, label: `⛽ ${selectedFuelType}` });
    if (selectedTransmission) newTags.push({ type: 'trans', value: selectedTransmission, label: `⚙️ ${selectedTransmission}` });
    if (selectedVehicleType) newTags.push({ type: 'vehicle', value: selectedVehicleType, label: `${vehicleIcons[selectedVehicleType] || '🚘'} ${selectedVehicleType}` });
    if (familySize !== 5) newTags.push({ type: 'family', value: familySize, label: `👨‍👩‍👧‍👦 ${familySize} seats` });
    if (priceRange[0] !== 0 || priceRange[1] !== 50000) newTags.push({ type: 'price', value: priceRange.join('-'), label: `💶 €${priceRange[0]}–€${priceRange[1]}` });
    setTags(newTags);
    // Live search (optional)
    fetchSearchResults();
    // eslint-disable-next-line
  }, [selectedDriveType, selectedFuelType, selectedTransmission, selectedVehicleType, familySize, priceRange]);

  // Save configuration handler
  const handleSaveConfig = async () => {
    console.log('💾 Saving configuration...');
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found, cannot save config');
      return;
    }
    const configData = {
      driveType: selectedDriveType,
      fuel: selectedFuelType,
      transmission: selectedTransmission,
      budgetMin: priceRange[0],
      budgetMax: priceRange[1],
      familySize,
      vehicleType: selectedVehicleType,
      features: selectedFeatures,
    };
    console.log('📊 Config data:', configData);
    try {
      const response = await fetch('http://localhost:5000/api/search/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(configData),
      });
      if (response.ok) {
        console.log('✅ Configuration saved successfully');
      } else {
        console.error('❌ Failed to save configuration');
      }
    } catch (error) {
      console.error('❌ Save config error:', error);
    }
  };

  const handleAddToCompare = (car) => {
    setCompareCars(prev => prev.find(c => c.id === car.id) ? prev : prev.length < 3 ? [...prev, car] : prev);
  };
  const handleRemoveFromCompare = (carId) => {
    setCompareCars(prev => prev.filter(c => c.id !== carId));
  };

  // Automatically open the quiz when the configurator popup opens
  React.useEffect(() => {
    if (showPopup) {
      setShowQuiz(true);
      setQuizStep(0);
      setQuizAnswers({ features: [] });
    }
  }, [showPopup]);

  return (
    <section className={`main-section${showPopup ? ' configurator-open' : ''}`}>
      {/* Background Image and Welcome Box */}
      <div className="background-image-container" onMouseMove={handleMouseMove} onMouseLeave={() => { setParallax({ x: 0, y: 0 }); setIsFocused(false); }}>
        <div className="content-container">
          <div
            className={`welcome-box${isFocused ? ' active' : ''}`}
            style={{
              transform: `translate3d(${parallax.x * 8}px, ${parallax.y * 8}px, 0)`
            }}
          >
            <h2>Shopping for a Car?</h2>
            <p>
              Still not sure what you're looking for? No worries! We have the perfect match for you today.
              Try our latest configurator based on your needs and wishes.
            </p>
            <button onClick={togglePopup} className="start-configurator-btn">
              Try Our Configurator
            </button>
          </div>
        </div>
      </div>

      {/* Configurator Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={togglePopup}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            {/* Close button top left */}
            <div className="close-popup-wrapper">
              <button className="close-popup" onClick={togglePopup} aria-label="Close popup">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="11" fill="#e5e7eb"/>
                  <path d="M7 7L15 15M15 7L7 15" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {/* Vehicle icon (gray PNG) */}
            <span className="vehicle-popup-icon" role="img" aria-label="Vehicle">
              <img src={vehicleIconImgs[selectedVehicleType] || anyIcon} alt="Vehicle" style={{width:48, height:48, filter:'grayscale(1)'}} />
            </span>
            <h2>Car Configurator</h2>
            <div className="quick-picks">
              {quickPresets.map((preset, i) => (
                <div className="quick-pick-btn-wrapper" key={i}>
                  <button className="quick-pick-btn" onClick={() => handleQuickPick(preset)}>{preset.label}</button>
                </div>
              ))}
            </div>
            <div className="filter-tags">
              {tags.map(tag => (
                <span className="tag" key={tag.type + tag.value}>{tag.label}
                  <div className="tag-remove-btn-wrapper">
                    <button className="tag-remove" onClick={() => removeTag(tag.type, tag.value)} title="Remove" aria-label="Remove tag">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="8" fill="#e5e7eb"/>
                        <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </span>
              ))}
            </div>
            <form onSubmit={fetchSearchResults} autoComplete="off">
              <div className="popup-dropdown-row">
                <label title="AWD is great for off-road and snowy terrain" style={{flex: 1}}>
                  🛞 Drive Type
                  <select className="popup-dropdown" value={selectedDriveType} onChange={e => setSelectedDriveType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="FWD">Front-Wheel Drive</option>
                    <option value="RWD">Rear-Wheel Drive</option>
                    <option value="AWD">All-Wheel Drive</option>
                    <option value="4WD">4-Wheel Drive</option>
                  </select>
                </label>
                <label title="Fuel type affects running costs and emissions" style={{flex: 1}}>
                  ⛽ Fuel Type
                  <select className="popup-dropdown" value={selectedFuelType} onChange={e => setSelectedFuelType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>
              </div>
              <div className="popup-dropdown-row">
                <label title="Automatic is easier in traffic" style={{flex: 1}}>
                  ⚙️ Transmission
                  <select className="popup-dropdown" value={selectedTransmission} onChange={e => setSelectedTransmission(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                  </select>
                </label>
                <label title="Body style affects space and looks" style={{flex: 1}}>
                  {vehicleIcons[selectedVehicleType] || '🚘'} Vehicle Type
                  <select className="popup-dropdown" value={selectedVehicleType} onChange={e => setSelectedVehicleType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Van">Van</option>
                  </select>
                </label>
              </div>
              <div className="slider-row">
                <span className="slider-label" title="How many seats do you need?">👨‍👩‍👧‍👦 Family Size</span>
                <input type="range" min="2" max="8" value={familySize} onChange={e => setFamilySize(Number(e.target.value))} className="slider" />
                <span className="slider-value">{familySize} seats</span>
              </div>
              <div className="slider-row">
                <span className="slider-label" title="Set your price range">💶 Price Range</span>
                <input type="range" min="0" max="50000" step="500" value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} className="slider" />
                <input type="range" min="0" max="50000" step="500" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="slider" />
                <span className="slider-value">€{priceRange[0]} – €{priceRange[1]}</span>
              </div>
              {/* Feature Checklist */}
              <fieldset className="feature-checklist">
                <legend>Features</legend>
                <div className="feature-options-row">
                  {featureOptions.map(feature => (
                    <label key={feature} className="feature-checkbox-label">
                      <input
                        type="checkbox"
                        value={feature}
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="live-count">
                {searchCount !== null && `${searchCount} matching cars found`}
              </div>
              <div className="action-row">
                <div className="action-btn-wrapper">
                  <button type="button" className="action-btn" onClick={clearFilters}>Clear All</button>
                </div>
                <div className="action-btn-wrapper">
                  <button type="button" className="action-btn" onClick={fillSuggested}>Suggest For Me</button>
                </div>
                <div className="action-btn-wrapper">
                  <button type="submit" className="action-btn primary">Search</button>
                </div>
                <div className="action-btn-wrapper">
                  <button type="button" className="action-btn" onClick={navigateToBuyPage}>View All Results</button>
                </div>
                {isLoggedIn && (
                  <div className="action-btn-wrapper">
                    <button type="button" className="action-btn" onClick={handleSaveConfig}>Save Configuration</button>
                  </div>
                )}
              </div>
            </form>
            {/* Live Filter Preview (Top 3 Cars) */}
            {filteredPreviewCars.length > 0 && (
              <div className="live-preview-cars">
                <h4>Top Matches:</h4>
                <div className="preview-cards-row">
                  {filteredPreviewCars.map((car, idx) => (
                    <div className="preview-car-card" key={car.id || idx}>
                      <div><b>{car.manufacturer} {car.model}</b></div>
                      <div>Year: {car.year}</div>
                      <div>Price: €{car.price}</div>
                      <div>Fuel: {car.fuel}</div>
                      <div>Seats: {car.seats}</div>
                      {car.image_path && <img src={`http://localhost:5000${car.image_path}`} alt={car.model} style={{width: '100%', borderRadius: 8, marginTop: 6}} />}
                      <button className="compare-btn" onClick={() => handleAddToCompare(car)} disabled={compareCars.find(c => c.id === car.id) || compareCars.length >= 3} style={{marginTop:8, background:'#e5e7eb', border:'1px solid #bbb', borderRadius:4, padding:'4px 10px', fontWeight:500, cursor:'pointer'}}>
                        {compareCars.find(c => c.id === car.id) ? 'Added' : 'Compare'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {compareCars.length > 0 && (
              <div className="compare-modal" style={{marginTop:18, background:'#f3f4f6', border:'1px solid #bbb', borderRadius:8, padding:16}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <b>Compare Cars</b>
                  <button onClick={() => setCompareCars([])} style={{background:'none', border:'none', color:'#b91c1c', fontWeight:600, cursor:'pointer'}}>Clear</button>
                </div>
                <div style={{display:'flex', gap:16, marginTop:10}}>
                  {compareCars.map(car => (
                    <div key={car.id} style={{background:'#fff', border:'1px solid #ddd', borderRadius:6, padding:10, minWidth:160, position:'relative'}}>
                      <button onClick={() => handleRemoveFromCompare(car.id)} style={{position:'absolute', top:4, right:4, background:'none', border:'none', color:'#b91c1c', fontWeight:700, cursor:'pointer'}}>×</button>
                      <div><b>{car.manufacturer} {car.model}</b></div>
                      <div>Year: {car.year}</div>
                      <div>Price: €{car.price}</div>
                      <div>Fuel: {car.fuel}</div>
                      <div>Seats: {car.seats}</div>
                      <div>Drive: {car.drive_type}</div>
                      <div>Transmission: {car.transmission}</div>
                      <div>Features: {car.features}</div>
                      {car.image_path && <img src={`http://localhost:5000${car.image_path}`} alt={car.model} style={{width: '100%', borderRadius: 6, marginTop: 6}} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {noResultExplanation && (
              <div className="no-result-explanation" style={{color:'#b45309', background:'#fffbe6', border:'1px solid #fbbf24', borderRadius:6, padding:'10px 16px', marginTop:12, fontWeight:500}}>
                {noResultExplanation}
              </div>
            )}
            {/* Live vehicle stats summary */}
            <div className="vehicle-stats-summary" style={{marginTop:18, background:'#f9fafb', border:'1px solid #d1d5db', borderRadius:8, padding:14, fontSize:'1rem', fontWeight:500}}>
              <div style={{marginBottom:6}}><b>Current Selection Summary</b></div>
              <div>Drive Type: {selectedDriveType || 'Any'}</div>
              <div>Fuel: {selectedFuelType || 'Any'}</div>
              <div>Transmission: {selectedTransmission || 'Any'}</div>
              <div>Vehicle Type: {selectedVehicleType || 'Any'}</div>
              <div>Family Size: {familySize} seats</div>
              <div>Price Range: €{priceRange[0]} – €{priceRange[1]}</div>
              <div>Features: {selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'Any'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Display Search Results */}
      {/* <div className="search-results">
        <h3>Search Results:</h3>
        {searchResults.length === 0 ? (
          <p>No matching cars found</p>
        ) : (
          searchResults.map((car, index) => (
            <div key={index} className="car-card">
              <h4>{car.manufacturer} {car.model} ({car.year})</h4>
              <p><strong>Price:</strong> ${car.price}</p>
              <p><strong>Drive Type:</strong> {car.drive_type}</p>
              <p><strong>Fuel:</strong> {car.fuel}</p>
              <p><strong>Seats:</strong> {car.seats}</p>
              <img src={`http://localhost:5000${car.image_path}`} alt={car.model} className="car-image" />
            </div>
          ))
        )}
      </div> */}
      {showQuiz && (
        <div className="quiz-modal" style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.25)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#fff', borderRadius:10, padding:32, minWidth:320, boxShadow:'0 2px 16px #0002', textAlign:'center'}}>
            <div style={{fontSize:'1.2rem', fontWeight:600, marginBottom:18}}>{quizQuestions[quizStep].question}</div>
            <div style={{display:'flex', flexDirection:'column', gap:12, alignItems:'center'}}>
              {quizQuestions[quizStep].multi ? (
                quizQuestions[quizStep].options.map(opt => (
                  <label key={opt.value} style={{display:'flex', alignItems:'center', gap:8, fontSize:'1rem', fontWeight:500}}>
                    <input
                      type="checkbox"
                      checked={quizAnswers.features?.includes(opt.value)}
                      onChange={() => handleQuizAnswer(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))
              ) : (
                quizQuestions[quizStep].options.map(opt => (
                  <button key={opt.value} className="action-btn" style={{background:'#e5e7eb', color:'#222', fontWeight:500, minWidth:180}} onClick={() => handleQuizAnswer(opt.value)}>{opt.label}</button>
                ))
              )}
            </div>
            {quizQuestions[quizStep].multi && (
              <button className="action-btn" style={{marginTop:24, background:'#ffba3a', color:'#222', fontWeight:600}} onClick={handleQuizNext}>Next</button>
            )}
            <button className="action-btn" style={{marginTop:24, background:'#bbb', color:'#fff'}} onClick={()=>setShowQuiz(false)}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default MainSection;
