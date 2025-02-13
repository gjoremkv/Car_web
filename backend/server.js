const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000; // Change if needed

// Enable static file serving for uploaded images
app.use('/uploads', express.static('uploads'));

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'programmer',
  password: 'GDp050506!$', // Secure this using .env later
  database: 'marketplace_credentials',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// 📌 User Registration
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length > 0) {
      return res.status(400).json({ message: 'User already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// 📌 User Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.user_id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  });
});

// 📌 Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📌 API to Upload Car Images
app.post('/upload', upload.single('image'), (req, res) => {
  const { car_id } = req.body;
  if (!car_id) return res.status(400).json({ message: "Car ID is required" });

  const imagePath = `/uploads/${req.file.filename}`;
  const query = 'INSERT INTO car_images (car_id, image_path) VALUES (?, ?)';

  db.query(query, [car_id, imagePath], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json({ message: 'Image uploaded successfully', imagePath });
  });
});

// 📌 API to Fetch Images for a Specific Car
app.get('/car/:id/images', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT image_path FROM car_images WHERE car_id = ?';

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json(results);
  });
});

// 📌 **NEW: API for Configurator Search**
app.post('/search-cars', (req, res) => {
  const { driveType, fuel, transmission, budgetMin, budgetMax, familySize, vehicleType } = req.body;

  let query = `SELECT * FROM cars WHERE 1=1`;
  let queryParams = [];

  if (driveType) {
    query += ` AND drive_type = ?`;
    queryParams.push(driveType);
  }
  if (fuel) {
    query += ` AND fuel = ?`;
    queryParams.push(fuel);
  }
  if (transmission) {
    query += ` AND transmission = ?`;
    queryParams.push(transmission);
  }
  if (budgetMin && budgetMax) {
    query += ` AND price BETWEEN ? AND ?`;
    queryParams.push(budgetMin, budgetMax);
  }
  if (familySize) {
    query += ` AND seats >= ?`;
    queryParams.push(familySize);
  }
  if (vehicleType) {
    query += ` AND type = ?`;
    queryParams.push(vehicleType);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error searching cars:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// 📌 Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
