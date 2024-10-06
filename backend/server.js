const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000; // change the port if needed

// Enable CORS with options
const corsOptions = {
  origin: 'http://localhost:3000', // React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow the necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow the required headers
};

app.use(cors(corsOptions));

// Parse incoming request bodies in JSON format
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'programmer',          
  password: 'GDp050506!$',     
  database: 'marketplace_credentials'  
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

  // Check if the email already exists in the database
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error('Error checking email in the database:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.length > 0) {
      // If email already exists, send a message
      return res.status(400).json({ message: 'User already registered, use login instead' });
    }

    // If email does not exist, proceed to register the user
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert the new user into the database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user into the database:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
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
