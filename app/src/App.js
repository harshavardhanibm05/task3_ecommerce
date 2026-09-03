import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ProductDetails from "./components/ProductDetails";
import Banner from './components/Banner';
import AddProduct from "./admin/AdminPortal";
import CartPage from "./pages/CartPage";
import Auth from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";

// Pages where the animated banner should NOT appear
const HIDE_BANNER_ROUTES = ['/auth', '/checkout', '/payment', '/order-success', '/orders', '/about', '/contact', '/profile'];

function ConditionalBanner() {
  const location = useLocation();
  const shouldHide = HIDE_BANNER_ROUTES.some(r =>
    location.pathname === r || location.pathname.startsWith('/orders/')
  );
  if (shouldHide) return null;
  return <Banner />;
}

// Plain navbar shown on pages that don't use the full Banner
function ConditionalPlainNavbar() {
  const location = useLocation();
  const shouldShow = HIDE_BANNER_ROUTES.some(r =>
    location.pathname === r || location.pathname.startsWith('/orders/')
  );
  // Never show on auth page — it has its own back-to-home link
  if (!shouldShow || location.pathname === '/auth') return null;
  return (
    <div style={{ background: '#1a1a2e', padding: '10px 0' }}>
      <Navbar />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ConditionalBanner />
        <ConditionalPlainNavbar />

        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/product/:source/:id" element={<ProductDetails />} />
          <Route path="/addproduct"         element={<AddProduct />} />
          <Route path="/cart"               element={<CartPage />} />
          <Route path="/auth"               element={<Auth />} />
          <Route path="/checkout"           element={<CheckoutPage />} />
          <Route path="/payment"            element={<PaymentPage />} />
          <Route path="/order-success"      element={<OrderSuccessPage />} />
          <Route path="/orders"             element={<OrderHistoryPage />} />
          <Route path="/orders/:id"         element={<OrderDetailPage />} />
          <Route path="/about"              element={<AboutPage />} />
          <Route path="/contact"            element={<ContactPage />} />
          <Route path="/profile"            element={<ProfilePage />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
