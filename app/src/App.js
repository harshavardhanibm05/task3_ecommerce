import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Footer from "./pages/Footer";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./pages/Navbar";
import AddProduct from "./admin/AdminPortal";

function App() {
  return (
    // 1. BrowserRouter MUST be the outermost wrapper
    <BrowserRouter>
      
      {/* 2. Navbar goes INSIDE BrowserRouter, but OUTSIDE Routes */}
      <Navbar /> 

      {/* 3. Your page routes go here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/addproduct" element={<AddProduct />} />
      </Routes>
      
      <Footer />
    </BrowserRouter>
  );
}

export default App;