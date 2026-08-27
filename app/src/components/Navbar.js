import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Navbar.css'; // 1. Import your new styles

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault(); 
    navigate(`/?search=${searchTerm}#page-container`);
    
  };

  return (
    // 2. Replaced bg-transparent with glass-navbar
    <nav className="navbar navbar-expand-lg navbar-dark w-100 glass-navbar">
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01">
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
        <Link className="navbar-brand" to="/" style={{ fontWeight: 'bold', color:'cornflowerblue' }}>IBM E-Commerce</Link>
        
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          <li className="nav-item active">
            <Link className="nav-link" to="/" style={{color:'grey'}}>Home</Link>
          </li>
          <li className="nav-item active">
            <Link className="nav-link" to="/about" style={{color:'grey'}}>About</Link>
          </li>
          <li className="nav-item active">
            <Link className="nav-link" to="/contact" style={{color:'grey'}}>Contact</Link>
          </li>
          <li className="nav-item active">
            <Link className="nav-link" to="/privacy" style={{color:'grey'}}>Privacy & Policy</Link>
          </li>
          {/* <li className="nav-item">
            <Link className="nav-link" to="/addproduct">Add Product</Link>
          </li> */}
        </ul>
        
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