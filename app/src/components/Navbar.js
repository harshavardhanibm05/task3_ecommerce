import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './css/Navbar.css';
import cartLogo from '../assets/shopping-cart.png';
import { useCart } from '../context/CartContext';

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { cartItems, fetchCartItems } = useCart();

  // Check for logged-in user whenever the route changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${searchTerm}#page-container`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

useEffect(() => {
    fetchCartItems();
  }, [user, fetchCartItems]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark w-100 glass-navbar">
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
        <Link className="navbar-brand" to="/" style={{ fontWeight: 'bold', color:'cornflowerblue' }}>IBM E-Commerce</Link>
        
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          <li className={`nav-item ${currentPath === '/' ? 'active' : ''}`}>
            <Link className="nav-link" to="/" style={{ color: currentPath === '/' ? '#f15e14' : 'grey', fontWeight: currentPath === '/' ? 'bold' : 'normal' }}>Home</Link>
          </li>
          <li className={`nav-item ${currentPath === '/about' ? 'active' : ''}`}>
            <Link className="nav-link" to="/about" style={{ color: currentPath === '/about' ? '#f15e14' : 'grey', fontWeight: currentPath === '/about' ? 'bold' : 'normal' }}>About</Link>
          </li>
          <li className={`nav-item ${currentPath === '/contact' ? 'active' : ''}`}>
            <Link className="nav-link" to="/contact" style={{ color: currentPath === '/contact' ? '#f15e14' : 'grey', fontWeight: currentPath === '/contact' ? 'bold' : 'normal' }}>Contact</Link>
          </li>
          {/* <li className={`nav-item ${currentPath === '/privacy' ? 'active' : ''}`}>
            <Link className="nav-link" to="/privacy" style={{ color: currentPath === '/privacy' ? '#f15e14' : 'grey', fontWeight: currentPath === '/privacy' ? 'bold' : 'normal' }}>Privacy & Policy</Link>
          </li> */}
        </ul>

        <Link to="/cart" className={`nav-cart-link position-relative my-2 my-sm-0 ${currentPath === '/cart' ? 'nav-cart-active' : ''}`}>
          <img src={cartLogo} alt="Cart" width={28} height={28} className="nav-cart-icon" />
          {cartItems.length > 0 && (
            <span className="nav-cart-badge">{cartItems.length > 99 ? '99+' : cartItems.length}</span>
          )}
        </Link>
        
        <form className="form-inline my-2 my-lg-0" onSubmit={handleSearch}>
          <input className="form-control mr-sm-2" type="search" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="btn btn-outline-light my-2 my-sm-0" type="submit">Search</button>
        </form>

        {/* ── Conditional Auth Section ── */}
        {user ? (
          <div className="nav-profile-container ml-lg-3 mt-2 mt-lg-0" ref={dropdownRef}>
            <button className="btn nav-profile-btn" onClick={() => setShowDropdown(!showDropdown)}>
              👤 {user.name || user.first_name}
            </button>
            
            {showDropdown && (
              <div className="nav-profile-dropdown">
                <div className="dropdown-header">
                  <strong>{user.name || `${user.first_name} ${user.last_name}`}</strong>
                  <p>{user.email}</p>
                </div>
                <hr className="dropdown-divider" />
                <Link to="/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>📦 Order History</Link>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>⚙️ Personal Details</Link>
                <hr className="dropdown-divider" />
                <button className="dropdown-item text-danger" onClick={handleLogout}>🚪 Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="btn nav-signin-btn ml-lg-3 mt-2 mt-lg-0">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;