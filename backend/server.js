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
const port = 5000;

// --- Add these lines after app and port ---
const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

//  **Serve Uploaded Images**
app.use('/uploads', express.static('uploads'));

//  **Enable CORS**
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **MySQL Database Connection**
const db = mysql.createConnection({
  host: 'localhost',
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

//  **User Registration**
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
    res.status(200).json({ token, username: user.username });
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
  console.log(" Add Car Request Received:", req.body);
  console.log(" Logged-in User ID:", req.user.id);

  // Destructure all fields including new ones
  const { manufacturer, model, year, price, driveType, fuel, transmission, seats, kilometers, vehicleType, color, interiorColor, interiorMaterial, doors, features, engineCubic, horsepower } = req.body;
  const sellerId = req.user.id;

  if (!req.files || req.files.length === 0) {
    console.log(" Car images are missing");
    return res.status(400).json({ message: 'At least one car image is required' });
  }

  // Use the first image as the main image_path
  const imagePath = `/uploads/${req.files[0].filename}`;

  // Updated SQL to include new fields
  const query = `
    INSERT INTO cars (seller_id, manufacturer, model, year, price, drive_type, fuel, transmission, seats, kilometers, vehicle_type, color, interior_color, interior_material, doors, features, engine_cubic, horsepower, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Convert empty string integer fields to null
  const safeInt = (val) => (val === '' ? null : val);
  const doorsSafe = safeInt(doors);
  const seatsSafe = safeInt(seats);
  const yearSafe = safeInt(year);
  const kilometersSafe = safeInt(kilometers);
  const priceSafe = safeInt(price);
  const horsepowerSafe = safeInt(horsepower);
  const engineCubicSafe = safeInt(engineCubic);

  db.query(query, [
    sellerId, manufacturer, model, yearSafe, priceSafe, driveType, fuel, transmission, seatsSafe, kilometersSafe, vehicleType, color, interiorColor, interiorMaterial, doorsSafe, features, engineCubicSafe, horsepowerSafe, imagePath
  ], (err, result) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log(" Car listed successfully with ID:", result.insertId);

    // Insert all images into car_images table
    req.files.forEach(file => {
      const imgPath = `/uploads/${file.filename}`;
      db.query('INSERT INTO car_images (car_id, image_path) VALUES (?, ?)', [result.insertId, imgPath], (imgErr) => {
        if (imgErr) {
          console.error('Error saving car image:', imgErr);
        }
      });
    });

    // Send newly added car data back
    const newCar = {
      id: result.insertId,
      seller_id: sellerId,
      manufacturer,
      model,
      year,
      price,
      drive_type: driveType,
      fuel,
      transmission,
      seats,
      kilometers,
      vehicle_type: vehicleType,
      color,
      interior_color: interiorColor,
      interior_material: interiorMaterial,
      doors,
      features,
      engine_cubic: engineCubic,
      horsepower,
      image_path: imagePath,
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

  if (!sellerId) {
    console.error(" sellerId is missing!");
    return res.status(400).json({ message: 'Invalid seller ID' });
  }
  
  console.log("🔍 Fetching cars for user ID:", sellerId);

  const query = 'SELECT * FROM cars WHERE seller_id = ? ORDER BY id DESC';


  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error(" SQL Error:", err.sqlMessage || err);
      return res.status(500).json({ message: 'Database error', error: err.sqlMessage || err });
    }
    
    console.log(" Cars fetched for user:", sellerId);
    res.json(results);
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

// ✅ CREATE MESSAGE ROUTE
app.post('/api/messages', async (req, res) => {
  console.log('Received message:', req.body);

  const { senderId, receiverId, listingId, message } = req.body;

  if (!senderId || !receiverId || !listingId || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Use .promise() for async/await with mysql2
    const [result] = await db.promise().execute(
      'INSERT INTO chat_messages (sender_id, receiver_id, listing_id, message) VALUES (?, ?, ?, ?)',
      [senderId, receiverId, listingId, message]
    );

    const insertedMessage = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      listing_id: listingId,
      message,
      created_at: new Date(),
    };

    // Emit live message to the receiver
    io.emit(`receiveMessage-${receiverId}`, insertedMessage);

    res.status(200).json({ success: true, message: insertedMessage });
  } catch (err) {
    console.error('Failed to save message:', err);
    res.status(500).json({ error: 'Internal server error' });
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

// Get messages for a specific user (inbox)
app.get('/api/messages/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.promise().execute(
      `SELECT * FROM chat_messages 
       WHERE sender_id = ? OR receiver_id = ? 
       ORDER BY id DESC`,
      [userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/messages/:listingId', async (req, res) => {
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
    console.log('🔥 Message received from frontend:', data);
    const { senderId, receiverId, listingId, message } = data;

    try {
      const [result] = await db.promise().execute(
        'INSERT INTO chat_messages (sender_id, receiver_id, listing_id, message) VALUES (?, ?, ?, ?)',
        [senderId, receiverId, listingId, message]
      );

      const newMessage = {
        id: result.insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        listing_id: listingId,
        message,
        created_at: new Date()
      };

      // Emit to all users in the room for this listing
      io.to(`listing_${listingId}`).emit('receiveMessage', newMessage);

    } catch (error) {
      console.error('DB error:', error);
    }
  });

  socket.on('joinRoom', (listingId) => {
    console.log(`📥 User joined room listing_${listingId}`);
    socket.join(`listing_${listingId}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
