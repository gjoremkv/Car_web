const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT;
const backendUrl = `http://${process.env.IP_ADDR}:${port}`;

// --- Add these lines after app and port ---
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: backendUrl,
    methods: ['GET', 'POST']
  }
});

//  **Serve Uploaded Images**
app.use('/uploads', express.static('uploads'));

//  **Enable CORS**
app.use(cors({
  origin: backendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.IP_ADDR,
  user: process.env.DB_USER, // Only from .env
  password: process.env.DB_PASSWORD, // Only from .env
  database: process.env.DB_NAME, // Only from .env
});

db.connect((err) => {
  if (err) {
    console.error(' Database connection error:', err);
    return;
  }
  console.log(' Connected to MySQL database.');
});

// JWT secret must be set in .env
const JWT_SECRET = process.env.JWT_SECRET;

//  **Middleware: Authenticate JWT Token**
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 Received Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(" No token provided");
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log(" Extracted Token:", token);
  console.log(" Decoded Token Before Verification:", jwt.decode(token));

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error(" JWT Verification Error:", err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log(" Decoded Token:", user); // Add this line
  
    console.log(" Decoded Token on Backend:", user);
    req.user = user;
    next();
  });
};

//  **User Registration** (keeping original for backward compatibility)
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  console.log("🔍 Registration Request Received:", { username, email });

  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.length > 0) {
      console.log(" Email already registered:", email);
      return res.status(400).json({ message: 'User already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = `
    INSERT INTO users (username, email, password)
    VALUES (?, ?, ?)
    `;
    

    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) {
        console.error(" Error inserting user:", err);
        return res.status(500).json({ message: 'Server error' });
      }

      console.log(" User registered successfully:", username);
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

//  **User Login**
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(" Login Request Received:", email);

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.length === 0) {
      console.log("Invalid email:", email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      console.log(" Incorrect password for user:", email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    console.log(" User logged in successfully:", user.username);
    res.status(200).json({ token, username: user.username, userId: user.user_id });
  });
});

//  **Multer Configuration for Image Uploads**
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

//  **Add a New Car Listing**
app.post('/add-car', authenticateToken, upload.array('images', 10), (req, res) => {
  console.log("Add Car Request Received:", req.body);
  console.log("Logged-in User ID:", req.user.id);

  const {
    manufacturer, model, year, price, driveType, fuel, transmission, seats, kilometers,
    vehicleType, color, interior_color, interior_material, doors, features, engineCubic, horsepower
  } = req.body;
  const sellerId = req.user.id;

  if (!req.files || req.files.length === 0) {
    console.log("Car images are missing");
    return res.status(400).json({ message: 'At least one car image is required' });
  }

  const imagePath = `/uploads/${req.files[0].filename}`;

  // Handle field mapping and ensure required fields have defaults
  const drive_type = driveType || 'FWD'; // Default to FWD if not provided
  const vehicle_type = vehicleType || 'Sedan'; // Default to Sedan if not provided
  const fuelType = fuel || 'Gasoline'; // Default fuel type
  const transmissionType = transmission || 'Manual'; // Default transmission

  console.log("Mapped values:", { drive_type, vehicle_type, fuelType, transmissionType });

  const query = `
    INSERT INTO cars (seller_id, manufacturer, model, year, price, drive_type, fuel, transmission, seats, kilometers, vehicle_type, color, interior_color, interior_material, doors, features, engine_cubic, horsepower, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const safeInt = (val) => (val === '' || val === null || val === undefined ? null : parseInt(val) || null);
  const safeString = (val) => (val === '' || val === null || val === undefined ? null : val);
  
  db.query(query, [
    sellerId, manufacturer || '', model || '', safeInt(year), safeInt(price), drive_type, fuelType, transmissionType, safeInt(seats),
    safeInt(kilometers), vehicle_type, safeString(color), safeString(interior_color), safeString(interior_material), safeInt(doors), safeString(features),
    safeString(engineCubic), safeString(horsepower), imagePath
  ], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    console.log("Car listed successfully with ID:", result.insertId);

    req.files.forEach(file => {
      const imgPath = `/uploads/${file.filename}`;
      db.query('INSERT INTO car_images (car_id, image_path) VALUES (?, ?)', [result.insertId, imgPath], (imgErr) => {
        if (imgErr) {
          console.error('Error saving car image:', imgErr);
        }
      });
    });

    const newCar = {
      id: result.insertId,
      seller_id: sellerId,
      manufacturer, model, year, price, drive_type, fuel: fuelType, transmission: transmissionType, seats, kilometers,
      vehicle_type, color, interior_color, interior_material, doors, features, engine_cubic: engineCubic, horsepower, image_path: imagePath,
    };

    res.status(201).json({ message: 'Car listed successfully!', car: newCar });
  });
});

//  **Car Search/Filter Endpoint for Configurator**
app.post('/search-cars', (req, res) => {
  const { driveType, fuel, transmission, budgetMin, budgetMax, familySize, vehicleType, features } = req.body;
  let query = 'SELECT * FROM cars WHERE 1=1';
  const params = [];

  if (driveType) {
    query += ' AND drive_type = ?';
    params.push(driveType);
  }
  if (fuel) {
    query += ' AND fuel = ?';
    params.push(fuel);
  }
  if (transmission) {
    query += ' AND transmission = ?';
    params.push(transmission);
  }
  if (vehicleType) {
    query += ' AND vehicle_type = ?';
    params.push(vehicleType);
  }
  if (familySize) {
    query += ' AND seats >= ?';
    params.push(familySize);
  }
  if (budgetMin !== undefined && budgetMin !== null) {
    query += ' AND price >= ?';
    params.push(budgetMin);
  }
  if (budgetMax !== undefined && budgetMax !== null) {
    query += ' AND price <= ?';
    params.push(budgetMax);
  }
  if (features && Array.isArray(features) && features.length > 0) {
    features.forEach(feature => {
      query += ' AND features LIKE ?';
      params.push(`%${feature}%`);
    });
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      // Explain why no results
      let explanation = 'No cars match all selected filters. Try relaxing your price or feature requirements.';
      if (features && features.length > 0) explanation = 'No cars found with all selected features. Try removing some features.';
      else if (budgetMin > 0 || budgetMax < 50000) explanation = 'No cars found in the selected price range. Try adjusting your budget.';
      else if (familySize > 5) explanation = 'No cars found with enough seats. Try lowering the family size.';
      res.json({ cars: [], explanation });
    } else {
      res.json(results);
    }
  });
});

//  **Fetch All Cars**
app.get('/cars', (req, res) => {
  console.log(" Fetching all cars...");
  const query = 'SELECT * FROM cars';

  db.query(query, (err, results) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log(" Cars fetched successfully. Count:", results.length);
    res.json(results);
  });
});

//  **Fetch Specific Car Details**
app.get('/car/:id', (req, res) => {
  const { id } = req.params;
  console.log(" Fetching car details for ID:", id);

  const query = 'SELECT * FROM cars WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      console.log(" Car not found:", id);
      return res.status(404).json({ message: 'Car not found' });
    }

    console.log(" Car details fetched:", results[0]);
    res.json(results[0]);
  });
});

// GET /car/:id/images
app.get('/car/:id/images', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT image_path FROM car_images WHERE car_id = ?',
    [id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch images' });
      }
      res.json(rows);
    }
  );
});

//  **Fetch Cars Listed by Logged-in User**
app.get('/my-cars', authenticateToken, (req, res) => {
  const sellerId = req.user.id;
  console.log('[DEBUG] /my-cars called. sellerId:', sellerId);

  if (!sellerId) {
    console.error("[DEBUG] sellerId is missing!");
    return res.status(400).json({ message: 'Invalid seller ID' });
  }

  // Join with auctions to check if car is already in an active auction
  const query = `
    SELECT c.*, 
           a.auction_id, 
           a.status as auction_status,
           CASE 
             WHEN a.status = 'active' THEN 1 
             ELSE 0 
           END as in_active_auction
    FROM cars c 
    LEFT JOIN auctions a ON c.id = a.car_id AND a.status = 'active'
    WHERE c.seller_id = ? 
    ORDER BY c.id DESC
  `;
  
  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error("[DEBUG] SQL Error:", err.sqlMessage || err);
      return res.status(500).json({ message: 'Database error', error: err.sqlMessage || err });
    }
    
    // Filter out cars that are already in active auctions for the auction panel
    const availableCars = results.filter(car => !car.in_active_auction);
    console.log(`[DEBUG] /my-cars results: ${results.length} total cars, ${availableCars.length} available for auction`);
    
    res.json(availableCars);
  });
});

//  **Suggest Car Endpoint for Configurator**
app.get('/suggest-car', (req, res) => {
  // Query for most common values
  const queries = [
    "SELECT drive_type, COUNT(*) as cnt FROM cars GROUP BY drive_type ORDER BY cnt DESC LIMIT 1",
    "SELECT fuel, COUNT(*) as cnt FROM cars GROUP BY fuel ORDER BY cnt DESC LIMIT 1",
    "SELECT transmission, COUNT(*) as cnt FROM cars GROUP BY transmission ORDER BY cnt DESC LIMIT 1",
    "SELECT vehicle_type, COUNT(*) as cnt FROM cars GROUP BY vehicle_type ORDER BY cnt DESC LIMIT 1",
    "SELECT seats FROM cars ORDER BY seats",
    "SELECT price FROM cars ORDER BY price",
    "SELECT features FROM cars WHERE features IS NOT NULL AND features != ''"
  ];
  Promise.all(queries.map(q => new Promise((resolve, reject) => db.query(q, (err, results) => err ? reject(err) : resolve(results)))))
    .then(([drive, fuel, trans, vtype, seatsArr, priceArr, featuresArr]) => {
      const suggestion = {};
      suggestion.driveType = drive[0]?.drive_type || '';
      suggestion.fuel = fuel[0]?.fuel || '';
      suggestion.transmission = trans[0]?.transmission || '';
      suggestion.vehicleType = vtype[0]?.vehicle_type || '';
      // Median seats
      if (seatsArr.length > 0) {
        const mid = Math.floor(seatsArr.length / 2);
        suggestion.familySize = seatsArr.length % 2 === 0 ? Math.round((seatsArr[mid-1].seats + seatsArr[mid].seats)/2) : seatsArr[mid].seats;
      } else {
        suggestion.familySize = 5;
      }
      // Price range: 25th to 75th percentile
      if (priceArr.length > 0) {
        const q1 = priceArr[Math.floor(priceArr.length * 0.25)]?.price || 0;
        const q3 = priceArr[Math.floor(priceArr.length * 0.75)]?.price || 50000;
        suggestion.budgetMin = q1;
        suggestion.budgetMax = q3;
      } else {
        suggestion.budgetMin = 0;
        suggestion.budgetMax = 50000;
      }
      // Most common features
      const featureCounts = {};
      featuresArr.forEach(row => {
        if (row.features) {
          row.features.split(',').map(f => f.trim()).forEach(f => {
            if (f) featureCounts[f] = (featureCounts[f] || 0) + 1;
          });
        }
      });
      const sortedFeatures = Object.entries(featureCounts).sort((a,b) => b[1]-a[1]).map(([f]) => f);
      suggestion.features = sortedFeatures.slice(0, 3); // Top 3 features
      res.json(suggestion);
    })
    .catch(err => {
      console.error('Suggest car error:', err);
      res.status(500).json({ message: 'Failed to suggest car' });
    });
});

//  **Save Config Endpoint for Configurator**
// SQL to create table if needed:
// CREATE TABLE configurations (user_id INT PRIMARY KEY, config JSON NOT NULL);
app.post('/save-config', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const config = JSON.stringify(req.body);
  // Upsert: insert or update
  const query = `INSERT INTO configurations (user_id, config) VALUES (?, ?) ON DUPLICATE KEY UPDATE config = VALUES(config)`;
  db.query(query, [userId, config], (err) => {
    if (err) {
      console.error('Save config error:', err);
      return res.status(500).json({ message: 'Failed to save configuration' });
    }
    res.json({ message: 'Configuration saved' });
  });
});

// Start Auction Endpoint
app.post('/start-auction', authenticateToken, (req, res) => {
  const { car_id, start_price, duration_hours } = req.body;
  const seller_id = req.user.id;

  console.log(`🎯 Starting auction - Car ID: ${car_id}, Price: €${start_price}, Duration: ${duration_hours}h, Seller: ${seller_id}`);

  // Validation
  if (!car_id || !start_price || !duration_hours) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ message: 'Missing required fields: car_id, start_price, duration_hours' });
  }

  if (start_price <= 0) {
    console.log('❌ Invalid start price');
    return res.status(400).json({ message: 'Start price must be greater than 0' });
  }

  if (duration_hours <= 0 || duration_hours > 168) { // Max 7 days
    console.log('❌ Invalid duration');
    return res.status(400).json({ message: 'Duration must be between 1 and 168 hours' });
  }

  // Check if car exists and belongs to the seller
  db.query('SELECT * FROM cars WHERE id = ? AND seller_id = ?', [car_id, seller_id], (err, carResults) => {
    if (err) {
      console.error('❌ Error checking car ownership:', err);
      return res.status(500).json({ message: 'Database error checking car' });
    }

    if (carResults.length === 0) {
      console.log('❌ Car not found or not owned by user');
      return res.status(404).json({ message: 'Car not found or you do not own this car' });
    }

    // Check if car is already in an active auction
    db.query('SELECT * FROM auctions WHERE car_id = ? AND status = "active"', [car_id], (err, auctionResults) => {
      if (err) {
        console.error('❌ Error checking existing auctions:', err);
        return res.status(500).json({ message: 'Database error checking existing auctions' });
      }

      if (auctionResults.length > 0) {
        console.log('❌ Car already in active auction');
        return res.status(400).json({ message: 'This car is already in an active auction' });
      }

      const now = new Date();
      const end = new Date(now.getTime() + duration_hours * 60 * 60 * 1000);

      const query = `
        INSERT INTO auctions (car_id, seller_id, start_price, current_bid, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `;

      db.query(
        query,
        [car_id, seller_id, start_price, start_price, now, end],
        (err, result) => {
          if (err) {
            console.error('❌ Auction creation error:', err);
            return res.status(500).json({ message: 'Database error creating auction' });
          }

          console.log(`✅ Auction created successfully with ID: ${result.insertId}`);
          res.status(201).json({ 
            message: 'Auction started successfully', 
            auction_id: result.insertId,
            end_time: end.toISOString()
          });
        }
      );
    });
  });
});

// Get user's bids
app.get('/my-bids', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.query(
    `SELECT b.*, a.auction_id, a.start_time, a.end_time, a.status, a.current_bid,
            c.manufacturer, c.model, c.year, c.image_path,
            CASE WHEN b.bid_amount = a.current_bid THEN 'winning' ELSE 'outbid' END as bid_status
     FROM bids b
     JOIN auctions a ON b.auction_id = a.auction_id
     JOIN cars c ON a.car_id = c.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching user bids:', err);
        return res.status(500).json({ error: 'Failed to fetch bids' });
      }
      res.json(results);
    }
  );
});

// Get user's won auctions
app.get('/won-auctions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.query(
    `SELECT DISTINCT a.auction_id, a.start_time, a.end_time, a.status, a.current_bid, a.start_price,
            c.manufacturer, c.model, c.year, c.image_path, c.engine_cubic, c.transmission, c.fuel,
            b.bid_amount as winning_bid, b.created_at as bid_date
     FROM auctions a
     JOIN bids b ON a.auction_id = b.auction_id
     JOIN cars c ON a.car_id = c.id
     WHERE a.status = 'ended' 
       AND b.user_id = ? 
       AND b.bid_amount = a.current_bid
     ORDER BY a.end_time DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching won auctions:', err);
        return res.status(500).json({ error: 'Failed to fetch won auctions' });
      }
      res.json(results);
    }
  );
});

// Get live auctions
app.get('/auctions/live', (req, res) => {
  const now = new Date();
  console.log('🔍 Fetching live auctions...');
  
  db.query(
    `SELECT a.*, c.manufacturer, c.model, c.year, c.price as original_price, c.image_path,
            c.fuel, c.transmission, c.engine_cubic, c.horsepower, c.color,
            COUNT(b.bid_id) as bid_count,
            TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) as minutes_remaining,
            TIMESTAMPDIFF(HOUR, NOW(), a.end_time) as hours_remaining,
            CASE 
              WHEN TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) < 60 
              THEN CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 'm left')
              WHEN TIMESTAMPDIFF(HOUR, NOW(), a.end_time) < 24
              THEN CONCAT(TIMESTAMPDIFF(HOUR, NOW(), a.end_time), 'h ', 
                         MOD(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 60), 'm left')
              ELSE CONCAT(TIMESTAMPDIFF(DAY, NOW(), a.end_time), 'd left')
            END as time_left_formatted
     FROM auctions a
     JOIN cars c ON a.car_id = c.id
     LEFT JOIN bids b ON a.auction_id = b.auction_id
     WHERE a.status = 'active' AND a.start_time <= ? AND a.end_time > ?
     GROUP BY a.auction_id
     ORDER BY a.end_time ASC`,
    [now, now],
    (err, results) => {
      if (err) {
        console.error('❌ Error fetching live auctions:', err);
        return res.status(500).json({ error: 'Failed to fetch live auctions' });
      }
      console.log(`✅ Found ${results.length} live auctions`);
      res.json(results);
    }
  );
});

// Get auctions ending soon
app.get('/auctions/ending-soon', (req, res) => {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
  console.log('🔍 Fetching auctions ending soon...');
  
  db.query(
    `SELECT a.*, c.manufacturer, c.model, c.year, c.price as original_price, c.image_path,
            c.fuel, c.transmission, c.engine_cubic, c.horsepower, c.color,
            COUNT(b.bid_id) as bid_count,
            TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) as minutes_remaining,
            TIMESTAMPDIFF(HOUR, NOW(), a.end_time) as hours_remaining,
            CASE 
              WHEN TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) < 60 
              THEN CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 'm left')
              WHEN TIMESTAMPDIFF(HOUR, NOW(), a.end_time) < 24
              THEN CONCAT(TIMESTAMPDIFF(HOUR, NOW(), a.end_time), 'h ', 
                         MOD(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 60), 'm left')
              ELSE CONCAT(TIMESTAMPDIFF(DAY, NOW(), a.end_time), 'd left')
            END as time_left_formatted
     FROM auctions a
     JOIN cars c ON a.car_id = c.id
     LEFT JOIN bids b ON a.auction_id = b.auction_id
     WHERE a.status = 'active' AND a.start_time <= ? AND a.end_time BETWEEN ? AND ?
     GROUP BY a.auction_id
     ORDER BY a.end_time ASC`,
    [now, now, soonThreshold],
    (err, results) => {
      if (err) {
        console.error('❌ Error fetching ending soon auctions:', err);
        return res.status(500).json({ error: 'Failed to fetch ending soon auctions' });
      }
      console.log(`✅ Found ${results.length} auctions ending soon`);
      res.json(results);
    }
  );
});

// Place Bid Endpoint
app.post('/place-bid', authenticateToken, (req, res) => {
  const { auction_id, bid_amount } = req.body;
  const user_id = req.user.id;

  db.query(
    'SELECT current_bid, end_time FROM auctions WHERE auction_id = ?',
    [auction_id],
    (err, results) => {
      const auction = results && results[0];
      if (err || !auction) return res.status(404).json({ message: 'Auction not found' });

      if (new Date() > new Date(auction.end_time)) {
        return res.status(400).json({ message: 'Auction has ended' });
      }

      if (bid_amount <= auction.current_bid) {
        return res.status(400).json({ message: 'Bid must be higher than current bid' });
      }

      // Insert the bid
      const bidQuery = 'INSERT INTO bids (auction_id, user_id, bid_amount) VALUES (?, ?, ?)';
      db.query(bidQuery, [auction_id, user_id, bid_amount], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to place bid' });

        // Update auction's current_bid
        const updateAuction = 'UPDATE auctions SET current_bid = ? WHERE auction_id = ?';
        db.query(updateAuction, [bid_amount, auction_id], () => {
          // Emit real-time bid update to all connected clients
          io.emit('bidUpdate', {
            auction_id: auction_id,
            new_bid: bid_amount,
            bidder_id: user_id
          });
          
          console.log(`💰 New bid placed: €${bid_amount} on auction ${auction_id} by user ${user_id}`);
          res.status(200).json({ message: 'Bid placed successfully' });
        });
      });
    }
  );
});

// ✅ CREATE MESSAGE ROUTE
app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, listingId, message } = req.body;

  console.log("📩 Received POST /api/messages with:", req.body);

  // ✅ Allow listingId to be null/optional
  if (!senderId || !receiverId || !message) {
    console.log('❌ Missing required fields:', { senderId, receiverId, message });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.promise().execute(
      'INSERT INTO chat_messages (sender_id, receiver_id, listing_id, message) VALUES (?, ?, ?, ?)',
      [senderId, receiverId, listingId || null, message]
    );

    const insertedMessage = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      listing_id: listingId,
      message,
      created_at: new Date()
    };

    // (Optional but useful) Add a log after insert:
    console.log('✅ Saved message via REST POST /api/messages:', insertedMessage);

    res.status(201).json({ success: true, message: insertedMessage });
  } catch (err) {
    console.error('❌ DB error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all messages (for debugging)
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await db.promise().execute('SELECT * FROM chat_messages');
    res.json(rows); // Always respond with valid JSON
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Enhanced /api/messages/:userId endpoint with JOIN for usernames
app.get('/api/messages/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.promise().execute(
      `
      SELECT m.*, 
             sender.username AS sender_username,
             receiver.username AS receiver_username
      FROM chat_messages m
      JOIN users sender ON m.sender_id = sender.user_id
      JOIN users receiver ON m.receiver_id = receiver.user_id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at ASC
      `,
      [userId, userId]
    );

    res.json(rows); // Always send valid JSON
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ RENAME to avoid conflict:
app.get('/api/listing-messages/:listingId', async (req, res) => {
  const { listingId } = req.params;
  try {
    const [rows] = await db.promise().execute(
      'SELECT * FROM chat_messages WHERE listing_id = ? ORDER BY created_at ASC',
      [listingId]
    );
    res.json({ success: true, messages: rows });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

io.on('connection', (socket) => {
  socket.on('sendMessage', async (data) => {
    console.log('🔥 Received socket message:', data);

    const { senderId, receiverId, listingId, message } = data;

    // ✅ Allow listingId to be null/optional
    if (!senderId || !receiverId || !message) {
      return; // Or optionally: socket.emit('error', { error: 'Missing required fields (senderId, receiverId, message)' });
    }

    try {
      const [result] = await db.promise().execute(
        'INSERT INTO chat_messages (sender_id, receiver_id, listing_id, message) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, listingId || null, message]
      );

      console.log("✅ Inserted message ID:", result.insertId);

      const [users] = await db.promise().execute(
        'SELECT username, user_id FROM users WHERE user_id IN (?, ?)',
        [senderId, receiverId]
      );

      const senderUsername = users.find(u => u.user_id === senderId)?.username || '';
      const receiverUsername = users.find(u => u.user_id === receiverId)?.username || '';

      const newMessage = {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        listing_id: listingId,
        message,
        created_at: new Date(),
        sender_username: senderUsername,
        receiver_username: receiverUsername
      };

      console.log(`📡 Sent to user_${receiverId}`, newMessage);

      io.to(`user_${receiverId}`).emit(`receiveMessage-${receiverId}`, newMessage);
      io.to(`user_${senderId}`).emit(`receiveMessage-${senderId}`, newMessage);
    } catch (error) {
      console.error('❌ DB error:', error);
    }
  });

  socket.on('joinRoom', (listingId) => {
    console.log(`📥 User joined room listing_${listingId}`);
    socket.join(`listing_${listingId}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  // Register user to their own room
  socket.on('registerUser', (userId) => {
    console.log(`👤 User ${userId} connected`);
    socket.join(`user_${userId}`);
  });
});

// Automatic auction status update
setInterval(() => {
  const now = new Date();
  db.query(
    `UPDATE auctions
     SET status = 'ended'
     WHERE status = 'active' AND end_time <= ?`,
    [now],
    (err, result) => {
      if (err) {
        console.error('Error updating auction status:', err);
      } else {
        console.log('Auction status updated, affected rows:', result.affectedRows);
      }
    }
  );
}, 60000); // Every 60 seconds

server.listen(port, () => {
  console.log(`🚀 Server running at ${backendUrl}`);
});

// API Routes with /api prefix
// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const username = `${first_name} ${last_name}`.trim(); // Combine first and last name
  console.log("🔍 Registration Request Received:", { first_name, last_name, email });

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if email already exists
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (result.length > 0) {
      console.log(" Email already registered:", email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error(" Hashing Error:", err);
        return res.status(500).json({ error: "Failed to hash password" });
      }

      const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.error(" Database Error:", err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Username or email already exists" });
          }
          return res.status(500).json({ error: "Failed to register user" });
        }

        console.log("✅ User Registered Successfully:", result.insertId);
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log("🔍 Login Request Received:", { email });

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(" Database Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(" Password Comparison Error:", err);
        return res.status(500).json({ error: "Password comparison failed" });
      }

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      console.log("✅ Login Successful for:", user.email);
      res.json({ token, username: user.username, userId: user.user_id });
    });
  });
});

// Car routes
app.get('/api/cars', (req, res) => {
  const sql = `
    SELECT c.*, u.username 
    FROM cars c 
    LEFT JOIN users u ON c.seller_id = u.user_id 
    ORDER BY c.id DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to fetch cars' });
    }
    
    console.log(`✅ Fetched ${results.length} cars from database`);
    res.json(results);
  });
});

app.get('/api/cars/my-cars', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM cars WHERE seller_id = ? ORDER BY id DESC";
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to fetch user cars' });
    }
    
    console.log(`✅ Fetched ${results.length} cars for user ${userId}`);
    res.json(results);
  });
});

app.post('/api/cars', authenticateToken, upload.array('images', 10), (req, res) => {
  const userId = req.user.id;
  const { manufacturer, model, year, price, fuel, transmission, driveType, color, kilometers, seats, features, vehicleType } = req.body;
  
  console.log("API Car Request Received:", req.body);
  console.log("Logged-in User ID:", userId);
  
  // Handle field mapping and ensure required fields have defaults
  const drive_type = driveType || 'FWD';
  const vehicle_type = vehicleType || 'Sedan';
  const fuelType = fuel || 'Gasoline';
  const transmissionType = transmission || 'Manual';
  
  console.log("API Mapped values:", { drive_type, vehicle_type, fuelType, transmissionType });
  
  const imagePath = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;

  const sql = `INSERT INTO cars (seller_id, manufacturer, model, year, price, fuel, transmission, drive_type, color, kilometers, seats, features, vehicle_type, image_path) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const safeString = (val) => (val === '' || val === null || val === undefined ? null : val);
  const safeInt = (val) => (val === '' || val === null || val === undefined ? null : parseInt(val) || null);
  
  db.query(sql, [userId, manufacturer || '', model || '', safeInt(year), safeInt(price), fuelType, transmissionType, drive_type, safeString(color), safeInt(kilometers), safeInt(seats), safeString(features), vehicle_type, imagePath], (err, result) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Failed to add car', details: err.message });
    }
    
    console.log("✅ Car Added Successfully:", result.insertId);
    res.status(201).json({ message: 'Car added successfully', carId: result.insertId });
  });
});

// Search routes
app.post('/api/search/search-cars', (req, res) => {
  const { manufacturer, model, fuel, transmission, driveType, vehicleType, budgetMin, budgetMax, familySize, features, priceFrom, priceTo, yearFrom, yearTo, kilometers } = req.body;
  
  let sql = `SELECT c.*, u.username FROM cars c LEFT JOIN users u ON c.seller_id = u.user_id WHERE 1=1`;
  let params = [];

  if (manufacturer) {
    sql += ` AND c.manufacturer LIKE ?`;
    params.push(`%${manufacturer}%`);
  }
  if (model) {
    sql += ` AND c.model LIKE ?`;
    params.push(`%${model}%`);
  }
  if (fuel) {
    sql += ` AND c.fuel = ?`;
    params.push(fuel);
  }
  if (transmission) {
    sql += ` AND c.transmission = ?`;
    params.push(transmission);
  }
  if (driveType) {
    sql += ` AND c.drive_type = ?`;
    params.push(driveType);
  }
  if (vehicleType) {
    sql += ` AND c.vehicle_type = ?`;
    params.push(vehicleType);
  }
  if (budgetMin || priceFrom) {
    sql += ` AND c.price >= ?`;
    params.push(budgetMin || priceFrom);
  }
  if (budgetMax || priceTo) {
    sql += ` AND c.price <= ?`;
    params.push(budgetMax || priceTo);
  }
  if (yearFrom) {
    sql += ` AND c.year >= ?`;
    params.push(yearFrom);
  }
  if (yearTo) {
    sql += ` AND c.year <= ?`;
    params.push(yearTo);
  }
  if (kilometers) {
    sql += ` AND c.kilometers <= ?`;
    params.push(kilometers);
  }
  if (familySize) {
    sql += ` AND c.seats >= ?`;
    params.push(familySize);
  }

  sql += ` ORDER BY c.id DESC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(' Search Error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }
    
    console.log(`✅ Search completed: ${results.length} cars found`);
    res.json(results);
  });
});

app.get('/api/search/suggest-car', (req, res) => {
  const suggestions = [
    { vehicleType: 'SUV', fuel: 'Hybrid', transmission: 'Automatic', budgetMin: 15000, budgetMax: 25000, familySize: 5 },
    { vehicleType: 'Sedan', fuel: 'Gasoline', transmission: 'Manual', budgetMin: 8000, budgetMax: 15000, familySize: 4 },
    { vehicleType: 'Van', fuel: 'Diesel', transmission: 'Automatic', budgetMin: 20000, budgetMax: 35000, familySize: 7 }
  ];
  
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  res.json(randomSuggestion);
});

app.post('/api/search/save-config', authenticateToken, (req, res) => {
  res.json({ message: 'Configuration saved successfully' });
});

// Auction routes
app.post('/api/auctions/start-auction', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { car_id, start_price, duration_hours, end_time } = req.body;
  
  const endTime = end_time || new Date(Date.now() + (duration_hours || 24) * 60 * 60 * 1000);
  
  const sql = `INSERT INTO auctions (car_id, user_id, start_price, current_price, end_time, status) VALUES (?, ?, ?, ?, ?, 'active')`;
  
  db.query(sql, [car_id, userId, start_price, start_price, endTime], (err, result) => {
    if (err) {
      console.error(' Auction Creation Error:', err);
      return res.status(500).json({ error: 'Failed to start auction' });
    }
    
    console.log("✅ Auction Started Successfully:", result.insertId);
    res.status(201).json({ message: 'Auction started successfully', auctionId: result.insertId });
  });
});

app.get('/api/auctions/my-bids', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT a.*, c.manufacturer, c.model, c.year, c.image_path, b.bid_amount, b.created_at as bid_time
    FROM bids b
    JOIN auctions a ON b.auction_id = a.auction_id
    JOIN cars c ON a.car_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(' Database Error:', err);
      return res.status(500).json({ error: 'Failed to fetch bids' });
    }
    
    res.json(results);
  });
});

app.get('/api/auctions/won-auctions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT DISTINCT a.auction_id, a.start_time, a.end_time, a.status, a.current_bid, a.start_price,
            c.manufacturer, c.model, c.year, c.image_path, c.engine_cubic, c.transmission, c.fuel,
            b.bid_amount as winning_bid, b.created_at as bid_date
     FROM auctions a
     JOIN bids b ON a.auction_id = b.auction_id
     JOIN cars c ON a.car_id = c.id
     WHERE a.status = 'ended' 
       AND b.user_id = ? 
       AND b.bid_amount = a.current_bid
     ORDER BY a.end_time DESC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(' Database Error:', err);
      return res.status(500).json({ error: 'Failed to fetch won auctions' });
    }
    
    res.json(results);
  });
});

app.post('/api/auctions/place-bid', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { auction_id, bid_amount } = req.body;
  
  // First check if auction exists and is still active
  const checkAuctionSql = `SELECT * FROM auctions WHERE auction_id = ? AND status = 'active' AND end_time > NOW()`;
  
  db.query(checkAuctionSql, [auction_id], (err, auctionResults) => {
    if (err) {
      console.error(' Auction Check Error:', err);
      return res.status(500).json({ error: 'Failed to verify auction' });
    }
    
    if (auctionResults.length === 0) {
      return res.status(400).json({ error: 'Auction not found or has ended' });
    }
    
    const auction = auctionResults[0];
    if (parseFloat(bid_amount) <= parseFloat(auction.current_bid || auction.start_price)) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }
    
    const bidSql = `INSERT INTO bids (auction_id, user_id, bid_amount) VALUES (?, ?, ?)`;
    const updateAuctionSql = `UPDATE auctions SET current_bid = ? WHERE auction_id = ?`;
    
    db.query(bidSql, [auction_id, userId, bid_amount], (err, result) => {
      if (err) {
        console.error(' Bid Error:', err);
        return res.status(500).json({ error: 'Failed to place bid' });
      }
      
      db.query(updateAuctionSql, [bid_amount, auction_id], (err) => {
        if (err) {
          console.error(' Auction Update Error:', err);
          return res.status(500).json({ error: 'Failed to update auction' });
        }
        
        // Emit real-time bid update
        io.emit('bidUpdate', {
          auction_id: auction_id,
          new_bid: bid_amount,
          bidder_id: userId
        });
        
        console.log(`💰 New bid placed: €${bid_amount} on auction ${auction_id} by user ${userId}`);
        res.json({ message: 'Bid placed successfully' });
      });
    });
  });
});