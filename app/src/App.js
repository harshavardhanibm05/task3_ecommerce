import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ProductDetails from "./components/ProductDetails";
import Banner from './components/Banner';
// import Navbar from "./components/Navbar";
import AddProduct from "./admin/AdminPortal";

function App() {
  return (
    // 1. BrowserRouter MUST be the outermost wrapper
    <BrowserRouter>
      
      {/* 2. Navbar goes INSIDE BrowserRouter, but OUTSIDE Routes */}
      {/* <Navbar />  */}
      <Banner />

      {/* 3. Your page routes go here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:source/:id" element={<ProductDetails />} />
        <Route path="/addproduct" element={<AddProduct />} />
      </Routes>
      
      <Footer />
    </BrowserRouter>
  );
}

export default App;