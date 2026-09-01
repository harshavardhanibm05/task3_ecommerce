import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './css/Navbar.css';
import cartLogo from '../assets/shopping-cart.png';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Use shared cart state from context
  const { cartItems, fetchCartItems } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchTerm}#page-container`);
  };

  // Load cart items on mount
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark w-100 glass-navbar">
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
        <Link className="navbar-brand" to="/" style={{ fontWeight: 'bold', color:'cornflowerblue' }}>IBM E-Commerce</Link>
        
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          
          {/* Home Link */}
          <li className={`nav-item ${currentPath === '/' ? 'active' : ''}`}>
            <Link 
              className="nav-link" 
              to="/" 
              style={{ color: currentPath === '/' ? '#f15e14' : 'grey', fontWeight: currentPath === '/' ? 'bold' : 'normal' }}
            >
              Home
            </Link>
          </li>

          {/* About Link */}
          <li className={`nav-item ${currentPath === '/about' ? 'active' : ''}`}>
            <Link 
              className="nav-link" 
              to="/about" 
              style={{ color: currentPath === '/about' ? '#f15e14' : 'grey', fontWeight: currentPath === '/about' ? 'bold' : 'normal' }}
            >
              About
            </Link>
          </li>

          {/* Contact Link */}
          <li className={`nav-item ${currentPath === '/contact' ? 'active' : ''}`}>
            <Link 
              className="nav-link" 
              to="/contact" 
              style={{ color: currentPath === '/contact' ? '#f15e14' : 'grey', fontWeight: currentPath === '/contact' ? 'bold' : 'normal' }}
            >
              Contact
            </Link>
          </li>

          {/* Privacy Policy Link */}
          <li className={`nav-item ${currentPath === '/privacy' ? 'active' : ''}`}>
            <Link 
              className="nav-link" 
              to="/privacy" 
              style={{ color: currentPath === '/privacy' ? '#f15e14' : 'grey', fontWeight: currentPath === '/privacy' ? 'bold' : 'normal' }}
            >
              Privacy & Policy
            </Link>
          </li>

        </ul>
        {/* Cart icon — links to /cart, badge highlights when active */}
        <Link
          to="/cart"
          className={`nav-cart-link position-relative my-2 my-sm-0 ${currentPath === '/cart' ? 'nav-cart-active' : ''}`}
          aria-label={`Cart, ${cartItems.length} items`}
        >
          <img src={cartLogo} alt="Cart" width={28} height={28} className="nav-cart-icon" />
          {cartItems.length > 0 && (
            <span className="nav-cart-badge">
              {cartItems.length > 99 ? '99+' : cartItems.length}
            </span>
          )}
        </Link>
        <form className="form-inline my-2 my-lg-0" onSubmit={handleSearch}>
          <input 
            className="form-control mr-sm-2" 
            type="search" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button className="btn btn-outline-light my-2 my-sm-0" type="submit">
            Search
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Navbar;