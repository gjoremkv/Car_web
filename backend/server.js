const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000; // You can change the port if needed

// Enable CORS to allow requests from frontend (React)
app.use(cors());

// Parse incoming request bodies in JSON format
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'programmer',          // Replace with your MySQL username
  password: 'GDp050506!$',  // Replace with your MySQL password
  database: 'marketplace_credentials'  // Replace with your database name
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Register Route (User Registration)
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Hash the user's password for security
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Insert user into the database
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error inserting user into the database:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login Route (User Login)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate a JWT token for authentication
    const token = jwt.sign({ id: user.user_id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
