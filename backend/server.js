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

//  **Serve Uploaded Images**
app.use('/uploads', express.static('uploads'));

//  **Enable CORS**
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// **MySQL Database Connection**
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER || 'programmer',
  password: process.env.DB_PASSWORD || 'GDp050506!$', // Move to `.env` for security
  database: process.env.DB_NAME || 'marketplace_credentials',
});

db.connect((err) => {
  if (err) {
    console.error(' Database connection error:', err);
    return;
  }
  console.log(' Connected to MySQL database.');
});

//  **Middleware: Authenticate JWT Token**
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 Received Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(" No token provided");
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🔍 Extracted Token:", token);
  console.log("🔍 Decoded Token Before Verification:", jwt.decode(token));

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      console.error(" JWT Verification Error:", err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log("✅ Decoded Token:", user); // Add this line
  
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

    const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
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
app.post('/add-car', authenticateToken, upload.single('image'), (req, res) => {
  console.log(" Add Car Request Received:", req.body);
  console.log(" Logged-in User ID:", req.user.id);

  const { manufacturer, model, year, price, driveType, fuel, transmission, seats, kilometers, vehicleType } = req.body;
  const sellerId = req.user.id;

  if (!req.file) {
    console.log(" Car image is missing");
    return res.status(400).json({ message: 'Car image is required' });
  }

  const imagePath = `/uploads/${req.file.filename}`;

  const query = `
    INSERT INTO cars (seller_id, manufacturer, model, year, price, drive_type, fuel, transmission, seats, kilometers, vehicle_type, image_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [sellerId, manufacturer, model, year, price, driveType, fuel, transmission, seats, kilometers, vehicleType, imagePath], (err, result) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log(" Car listed successfully with ID:", result.insertId);
    res.status(201).json({ message: 'Car listed successfully!', carId: result.insertId, imagePath });
  });
});

//  **Fetch All Cars**
app.get('/cars', (req, res) => {
  console.log("🔍 Fetching all cars...");
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
  console.log("🔍 Fetching car details for ID:", id);

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

//  **Fetch Cars Listed by Logged-in User**
app.get('/my-cars', authenticateToken, (req, res) => {
  const sellerId = req.user.id;

  if (!sellerId) {
    console.error("❌ sellerId is missing!");
    return res.status(400).json({ message: 'Invalid seller ID' });
  }
  
  console.log("🔍 Fetching cars for user ID:", sellerId);

  const query = 'SELECT * FROM cars WHERE seller_id = ?';
  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error(" Database error:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log(" Cars fetched for user:", sellerId);
    res.json(results);
  });
});

// 📌 **Start the Server**
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
