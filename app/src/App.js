import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ProductDetails from "./components/ProductDetails";
import Banner from './components/Banner';
// import Navbar from "./components/Navbar";
import AddProduct from "./admin/AdminPortal";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    // CartProvider wraps everything so all components share the same cart state
    <CartProvider>
      {/* 1. BrowserRouter MUST be the outermost router wrapper */}
      <BrowserRouter>
        
        {/* 2. Navbar goes INSIDE BrowserRouter, but OUTSIDE Routes */}
        {/* <Navbar />  */}
        <Banner />

        {/* 3. Your page routes go here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:source/:id" element={<ProductDetails />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
        
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;