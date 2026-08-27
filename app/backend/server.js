// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); // Allows server to read JSON data

// Create "uploads" folder automatically if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Make the "uploads" folder publicly accessible 
// so React can display images using http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static('uploads'));

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the uploads folder
  },
  filename: (req, file, cb) => {
    // Give the file a unique name using the current timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// We expect the file to be sent in a field named 'imageFile'
const upload = multer({ storage: storage });

// Connect to Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'ecom'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database!');
});


//API for get the products 
app.get('/api/allproducts', (req, res) => {
  const sql = 'SELECT * FROM products';
  
  db.query(sql, (err, results) => {
  
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error occurred" });
    }
    
    res.status(200).json(results);
  });
});

// Update the API Endpoint to use upload.single()
app.post('/api/products', upload.single('imageFile'), (req, res) => {
  const { name, price, description, category } = req.body;
  
  // Determine which image path/URL to save
  let imageToSave = req.body.image; // Default to the URL string if provided

  if (req.file) {
    // If a file was uploaded, construct the local URL path instead
    imageToSave = `uploads/${req.file.filename}`;
  }

  const sql = "INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)";
  const values = [name, price, description, category, imageToSave];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add product" });
    }
    res.status(201).json({ message: "Product added!", id: result.insertId });
  });
});


// DELETE a product by ID
app.delete('/api/products/:id', (req, res) => {
  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete product" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  });
});

// UPDATE a product by ID (Needs upload.single to handle potential new files!)
app.put('/api/products/:id', upload.single('imageFile'), (req, res) => {
  const { name, price, description, category } = req.body;
  const id = req.params.id;
  
  // If they uploaded a new file, construct the new path. Otherwise, keep the old string.
  let imageToSave = req.body.image; 
  if (req.file) {
    imageToSave = `http://localhost:5000/uploads/${req.file.filename}`;
  }

  const sql = "UPDATE products SET name = ?, price = ?, description = ?, category = ?, image = ? WHERE id = ?";
  const values = [name, price, description, category, imageToSave, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update product" });
    }
    res.status(200).json({ message: "Product updated successfully" });
  });
});
app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});