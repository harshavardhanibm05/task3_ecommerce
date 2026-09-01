// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create "uploads" folder automatically if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Make the "uploads" folder publicly accessible
app.use('/uploads', express.static('uploads'));

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Increase field size limit to 5 MB to handle large JSON in reviews / tags fields
const upload = multer({
  storage: storage,
  limits: { fieldSize: 5 * 1024 * 1024 }
});

// Connect to Database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database!');
});


// GET all products
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

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error occurred" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(results[0]);
  });
});

// Helper: convert empty string / undefined to null (prevents MySQL strict-mode errors on numeric columns)
const toNull = (v) => (v === '' || v === undefined || v === null) ? null : v;
const toNum  = (v) => (v === '' || v === undefined || v === null) ? null : Number(v);

// Helper: ensure a value stored as JSON text is always a valid JSON string or null.
// Accepts a JSON string, a plain object/array (already parsed), or null.
const toJsonText = (v) => {
  if (v === '' || v === undefined || v === null) return null;
  // Already a plain JS object/array — stringify it
  if (typeof v === 'object') return JSON.stringify(v);
  // Already a string — validate it is valid JSON, else wrap as JSON array of strings
  try {
    JSON.parse(v);
    return v; // valid JSON string, keep as-is
  } catch {
    // Plain comma-separated text (e.g. tags) — store as-is, it's longtext
    return v;
  }
};

// POST — add a new product (all fields)
app.post('/api/products', upload.single('imageFile'), (req, res) => {
  const {
    title, price, description, category,
    discountPercentage, rating, stock, tags,
    brand, sku, weight, dimensions,
    warrantyInformation, shippingInformation, availabilityStatus,
    reviews, returnPolicy, minimumOrderQuantity, meta, thumbnail
  } = req.body;

  let imagesToSave = toNull(req.body.images);
  if (req.file) {
    imagesToSave = `uploads/${req.file.filename}`;
  }

  const sql = 'INSERT INTO products (title, price, description, category, images, thumbnail, discountPercentage, rating, stock, tags, brand, sku, weight, dimensions, warrantyInformation, shippingInformation, availabilityStatus, reviews, returnPolicy, minimumOrderQuantity, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  const values = [
    toNull(title), toNum(price), toNull(description), toNull(category),
    imagesToSave, toNull(thumbnail),
    toNum(discountPercentage), toNum(rating), toNum(stock),
    toJsonText(tags), toNull(brand), toNull(sku), toNum(weight),
    toNull(dimensions), toNull(warrantyInformation),
    toNull(shippingInformation), toNull(availabilityStatus),
    toJsonText(reviews), toNull(returnPolicy),
    toNum(minimumOrderQuantity), toNull(meta)
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('INSERT error:', err.sqlMessage || err.message);
      return res.status(500).json({ error: err.sqlMessage || "Failed to add product" });
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

// PUT — update a product by ID (all fields)
app.put('/api/products/:id', upload.single('imageFile'), (req, res) => {
  const id = req.params.id;
  const {
    title, price, description, category,
    discountPercentage, rating, stock, tags,
    brand, sku, weight, dimensions,
    warrantyInformation, shippingInformation, availabilityStatus,
    reviews, returnPolicy, minimumOrderQuantity, meta, thumbnail
  } = req.body;

  let imagesToSave = toNull(req.body.images);
  if (req.file) {
    imagesToSave = `uploads/${req.file.filename}`;
  }

  const sql = 'UPDATE products SET title = ?, price = ?, description = ?, category = ?, images = ?, thumbnail = ?, discountPercentage = ?, rating = ?, stock = ?, tags = ?, brand = ?, sku = ?, weight = ?, dimensions = ?, warrantyInformation = ?, shippingInformation = ?, availabilityStatus = ?, reviews = ?, returnPolicy = ?, minimumOrderQuantity = ?, meta = ? WHERE id = ?';

  const values = [
    toNull(title), toNum(price), toNull(description), toNull(category),
    imagesToSave, toNull(thumbnail),
    toNum(discountPercentage), toNum(rating), toNum(stock),
    toJsonText(tags), toNull(brand), toNull(sku), toNum(weight),
    toNull(dimensions), toNull(warrantyInformation),
    toNull(shippingInformation), toNull(availabilityStatus),
    toJsonText(reviews), toNull(returnPolicy),
    toNum(minimumOrderQuantity), toNull(meta),
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('UPDATE error:', err.sqlMessage || err.message);
      return res.status(500).json({ error: err.sqlMessage || "Failed to update product" });
    }
    res.status(200).json({ message: "Product updated successfully" });
  });
});

app.listen(5000, '127.0.0.1', () => {
  console.log('Backend server running on http://127.0.0.1:5000');
});
