// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

  // Auto-create orders table if it doesn't exist
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      full_name VARCHAR(200) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
      discount DECIMAL(10,2) NOT NULL DEFAULT 0,
      shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      tax DECIMAL(10,2) NOT NULL DEFAULT 0,
      grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,
      payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
      status VARCHAR(50) NOT NULL DEFAULT 'placed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id VARCHAR(100) NOT NULL,
      source VARCHAR(20) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_price DECIMAL(10,2) NOT NULL,
      product_thumbnail TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `;

  db.query(createOrdersTable, (err) => {
    if (err) console.error('Error creating orders table:', err.sqlMessage);
  });
  db.query(createOrderItemsTable, (err) => {
    if (err) console.error('Error creating order_items table:', err.sqlMessage);
  });

  // Add user_id column to cart_items if it does not already exist (safe for MySQL 5.7+)
  const checkColSql = `
    SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_items' AND COLUMN_NAME = 'user_id'
  `;
  db.query(checkColSql, (err, rows) => {
    if (!err && rows[0].cnt === 0) {
      db.query('ALTER TABLE cart_items ADD COLUMN user_id INT NULL', (err2) => {
        if (err2) console.error('cart_items migration:', err2.sqlMessage);
      });
    }
  });
});


// ── JWT Auth Middleware ──────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. Please sign in.' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}


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

// Helper: convert empty string / undefined to null
const toNull = (v) => (v === '' || v === undefined || v === null) ? null : v;
const toNum  = (v) => (v === '' || v === undefined || v === null) ? null : Number(v);

const toJsonText = (v) => {
  if (v === '' || v === undefined || v === null) return null;
  if (typeof v === 'object') return JSON.stringify(v);
  try {
    JSON.parse(v);
    return v;
  } catch {
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

// POST — add a product to cart (requires auth)
app.post('/api/add/cart', authenticateToken, (req, res) => {
  const { product_id, source, product_name, product_price, product_image } = req.body;
  const user_id = req.user.id;

  if (!product_id || !source) {
    return res.status(400).json({ error: "product_id and source are required" });
  }

  const sql = 'INSERT INTO cart_items (user_id, product_id, source, product_name,product_images, product_price) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [user_id, product_id, source, product_name || null, product_image || null, product_price || null], (err, result) => {
    if (err) {
      console.error('INSERT error:', err.sqlMessage || err.message);
      return res.status(500).json({ error: err.sqlMessage || "Failed to add product" });
    }
    res.status(201).json({ message: "Product added to cart!", id: result.insertId });
  });
});

// GET — all cart items for the logged-in user
app.get('/api/cart/items', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `
    SELECT
      ci.id,
      ci.product_id,
      ci.source,
      ci.added_date,
      COALESCE(p.title, ci.product_name) AS product_name,
      COALESCE(p.price, ci.product_price) AS product_price,
      ci.product_images as et_product_image,
      p.images AS product_images,
      p.thumbnail AS product_thumbnail
    FROM cart_items ci
    LEFT JOIN products p ON ci.source = 'local' AND ci.product_id = p.id
    WHERE ci.user_id = ?
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error occurred" });
    }
    res.status(200).json(results);
  });
});

// DELETE — remove a single item from the cart (only own items)
app.delete('/api/cart/items/:id', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = 'DELETE FROM cart_items WHERE id = ? AND user_id = ?';
  db.query(sql, [req.params.id, user_id], (err, result) => {
    if (err) {
      console.error('DELETE error:', err.sqlMessage || err.message);
      return res.status(500).json({ error: err.sqlMessage || "Failed to remove cart item" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    res.status(200).json({ message: "Item removed from cart" });
  });
});

// DELETE — clear all cart items for the logged-in user (called after order placed)
app.delete('/api/cart/clear', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to clear cart" });
    res.status(200).json({ message: "Cart cleared" });
  });
});


// ── ORDERS ───────────────────────────────────────────────────────────────────

// POST — place a new order
app.post('/api/orders', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const {
    full_name, email, phone,
    address_line1, address_line2, city, state, pincode,
    subtotal, discount, shipping_fee, tax, grand_total,
    payment_method, items
  } = req.body;

  if (!full_name || !address_line1 || !city || !state || !pincode || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing required order details" });
  }

  const orderSql = `
    INSERT INTO orders
      (user_id, full_name, email, phone, address_line1, address_line2,
       city, state, pincode, subtotal, discount, shipping_fee, tax,
       grand_total, payment_method, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed')
  `;
  const orderValues = [
    user_id, full_name, email || '', phone || '',
    address_line1, address_line2 || '', city, state, pincode,
    subtotal || 0, discount || 0, shipping_fee || 0, tax || 0,
    grand_total || 0, payment_method || 'cod'
  ];

  db.query(orderSql, orderValues, (err, orderResult) => {
    if (err) {
      console.error('Order INSERT error:', err.sqlMessage || err.message);
      return res.status(500).json({ error: "Failed to create order" });
    }

    const orderId = orderResult.insertId;

    // Insert all order items
    const itemSql = 'INSERT INTO order_items (order_id, product_id, source, product_name, product_price, product_thumbnail) VALUES ?';
    const itemValues = items.map(item => [
      orderId,
      item.product_id,
      item.source,
      item.product_name,
      item.product_price,
      item.product_thumbnail || null
    ]);

    db.query(itemSql, [itemValues], (err2) => {
      if (err2) {
        console.error('OrderItems INSERT error:', err2.sqlMessage || err2.message);
        return res.status(500).json({ error: "Failed to save order items" });
      }

      // Clear the cart after successful order
      db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id], () => {});

      res.status(201).json({ message: "Order placed successfully!", orderId });
    });
  });
});

// GET — all orders for the logged-in user
app.get('/api/orders', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `
    SELECT o.*, COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error occurred" });
    }
    res.status(200).json(results);
  });
});

// GET — single order with items for the logged-in user
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const order_id = req.params.id;

  db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, user_id], (err, orders) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });

    db.query('SELECT * FROM order_items WHERE order_id = ?', [order_id], (err2, items) => {
      if (err2) return res.status(500).json({ error: "Database error" });
      res.status(200).json({ ...orders[0], items });
    });
  });
});


// ── AUTH ─────────────────────────────────────────────────────────────────────

// --- SIGN UP ROUTE ---
app.post('/api/signup', async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;
  
  try {
    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length > 0) return res.status(400).json({ error: "Email already exists" });
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const sql = 'INSERT INTO users (first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [first_name, last_name, email, hashedPassword, phone || null], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.status(201).json({ message: "Registration successful!" });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- SIGN IN ROUTE ---
app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;
  
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "No email found" });
    
    const user = results[0];
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: "Logged in successfully", 
      token, 
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: user.first_name,
        email: user.email,
        phone: user.phone
      }
    });
  });
});

app.listen(5000, '127.0.0.1', () => {
  console.log('Backend server running on http://127.0.0.1:5000');
});
