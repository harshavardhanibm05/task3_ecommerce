# 🛒 IBM E-Commerce Application

A full-stack e-commerce web application built with **React** on the frontend and **Node.js + Express** on the backend, powered by a **MySQL** database. It supports full product management (CRUD), category filtering, product search, image uploads, and a dedicated admin dashboard.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [API Endpoints](#-api-endpoints)
- [Application Pages & Components](#-application-pages--components)
- [Admin Portal](#-admin-portal)
- [Screenshots](#-screenshots)

---

## ✨ Features

### Customer-Facing
- 🏠 **Home Page** — Displays all products fetched live from the database
- 🔍 **Product Search** — Search products by name via the Navbar search bar
- 🗂️ **Category Filter** — Filter product listing by dynamically generated category buttons
- 📄 **Product Details Page** — View full product information (image, price, category, description)
- 🌊 **Animated Hero Banner** — Interactive water-wave effect banner with a "Shop Now" CTA
- 📱 **Responsive Design** — Works across desktop and mobile screen sizes

### Admin-Facing
- ➕ **Add Product** — Add a new product with name, price, category, description, and an image (file upload or URL)
- ✏️ **Edit Product** — Update any existing product's details via a modal popup
- 🗑️ **Delete Product** — Remove a product from the database with a confirmation prompt
- 🖼️ **Image Upload** — Upload product images directly to the server or provide an external image URL

---

## 🧰 Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 19, React Router DOM v7         |
| Styling    | Custom CSS, Bootstrap (via CDN)       |
| Icons      | `react-icons` (FontAwesome set)       |
| Animation  | `react-water-wave`                    |
| Backend    | Node.js, Express 5                    |
| Database   | MySQL (via `mysql2` driver)           |
| File Upload| Multer                                |
| API Comm.  | REST (JSON over HTTP)                 |

---

## 📁 Project Structure

```
e-com/app/
│
├── backend/                    # Node.js + Express backend server
│   ├── uploads/                # Uploaded product images are stored here
│   ├── server.js               # Main server file with all API routes
│   └── package.json            # Backend dependencies
│
├── public/                     # Static HTML template
│
├── src/
│   ├── admin/
│   │   ├── AdminPortal.js      # Admin dashboard (CRUD operations)
│   │   └── css/
│   │       └── AdminPortal.css
│   │
│   ├── components/
│   │   ├── Banner.js           # Hero banner with water-wave animation
│   │   ├── Navbar.js           # Navigation bar with search
│   │   ├── Footer.js           # Footer with social/contact links
│   │   ├── ProductDetails.js   # Single product detail view
│   │   ├── products.js         # (Static) Sample product data (reference)
│   │   └── css/                # Component-level stylesheets
│   │
│   ├── pages/
│   │   └── Home.js             # Home page — product grid, filter & search
│   │
│   ├── App.js                  # Root component with routes
│   ├── App.css                 # Global app styles
│   └── index.js                # React entry point
│
└── package.json                # Frontend dependencies
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine before running the project:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0 or higher)

---

## 🚀 Getting Started

### 1. Database Setup

Open your MySQL client (MySQL Workbench, CLI, or any tool) and run the following SQL to create the database and products table:

```sql
CREATE DATABASE IF NOT EXISTS ecom;

USE ecom;

CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  image       VARCHAR(500)
);
```

> **Note:** The backend connects using `host: localhost`, `user: root`, `password: ''` (empty), and `database: ecom`. Update the credentials in [`backend/server.js`](./backend/server.js) if your MySQL setup is different.

---

### 2. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd e-com/app/backend
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
node server.js
```

The backend will start on **http://localhost:5000**.

You should see in the terminal:
```
Connected to MySQL Database!
Backend server running on http://localhost:5000
```

---

### 3. Frontend Setup

Open a **new terminal** and navigate to the app root folder:

```bash
cd e-com/app
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will start on **http://localhost:3000** and open automatically in your browser.

---

## 📡 API Endpoints

All API routes are served from `http://localhost:5000`.

| Method   | Endpoint               | Description                         | Body / Params                             |
|----------|------------------------|-------------------------------------|-------------------------------------------|
| `GET`    | `/api/allproducts`     | Fetch all products from the DB      | —                                         |
| `POST`   | `/api/products`        | Add a new product                   | `FormData`: name, price, description, category, imageFile or image |
| `PUT`    | `/api/products/:id`    | Update an existing product by ID    | `FormData`: name, price, description, category, imageFile or image |
| `DELETE` | `/api/products/:id`    | Delete a product by ID              | URL param: `id`                           |

> Product images uploaded via file upload are stored in `backend/uploads/` and served statically at `http://localhost:5000/uploads/<filename>`.

---

## 🧩 Application Pages & Components

### Pages

| Page           | Route              | Description                                               |
|----------------|--------------------|-----------------------------------------------------------|
| Home           | `/`                | Product grid with category filter and search results      |
| Product Detail | `/product/:id`     | Detailed view of a single product                         |
| Admin Portal   | `/addproduct`      | Product management dashboard (add, edit, delete)          |

### Components

| Component        | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `Banner`         | Full-width hero section with interactive water-wave background and Navbar   |
| `Navbar`         | Site navigation with links (Home, About, Contact, Privacy) and search form  |
| `Footer`         | Brand copyright, LinkedIn, WhatsApp, and phone contact links                |
| `ProductDetails` | Shows product image, category badge, name, price, description and cart button |
| `AdminPortal`    | Admin dashboard with product table and modal form for CRUD operations       |

---

## 🛠️ Admin Portal

Navigate to **http://localhost:3000/addproduct** to access the Admin Portal.

### How it works:
1. **View all products** in a data table showing ID, image thumbnail, name, and price.
2. **Add a new product** by clicking the **+ Add New Product** button — a modal form appears where you fill in:
   - Product Name
   - Price
   - Category
   - Image (upload a file **or** provide an image URL)
   - Description
3. **Edit a product** by clicking the **Edit** button on any row — the modal reopens pre-filled with existing data.
4. **Delete a product** by clicking the **Delete** button — a confirmation dialog appears before deletion.

---

## 📸 Screenshots

| View                  | Description                                               |
|-----------------------|-----------------------------------------------------------|
| **Home Page**         | Hero banner with animated water-wave, product grid, category filter buttons and search |
| **Product Detail**    | Product image, title, price, category badge, and description |
| **Admin Dashboard**   | Product table with Edit/Delete actions and modal form for adding/editing products |

---

## 📦 Dependencies

### Frontend (`app/package.json`)

| Package               | Version   | Purpose                              |
|-----------------------|-----------|--------------------------------------|
| `react`               | ^19.2.8   | UI library                           |
| `react-dom`           | ^19.2.8   | DOM rendering                        |
| `react-router-dom`    | ^7.18.2   | Client-side routing                  |
| `react-icons`         | ^5.7.0    | Icon set (LinkedIn, WhatsApp, Phone) |
| `react-water-wave`    | ^2.0.1    | Animated water-wave banner effect    |
| `react-scripts`       | 5.0.1     | CRA build tooling                    |

### Backend (`backend/package.json`)

| Package    | Version   | Purpose                          |
|------------|-----------|----------------------------------|
| `express`  | ^5.2.1    | Web server / REST API framework  |
| `mysql2`   | ^3.24.2   | MySQL database driver            |
| `multer`   | ^2.2.0    | Multipart file upload handling   |
| `cors`     | ^2.8.6    | Cross-Origin Resource Sharing    |

---

## 🗒️ Notes

- The **Backend must be running before the Frontend** for product data to load correctly.
- Both servers must run simultaneously in separate terminals.
- Uploaded images are persisted in `backend/uploads/`. This folder is auto-created by the server on first run.
- The `products.js` file under `src/components/` contains static sample data used only as a reference — the live app reads all data from the MySQL database via the REST API.

---

*© IBM E-Commerce. Built with React & Node.js.*
