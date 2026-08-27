import './css/Footer.css'; // Import the new styles

function Footer() {
  // Automatically grabs the current year so it never goes out of date
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Left Side: Brand & Copyright */}
        <div>
          <h3 className="footer-brand">IBM E-commerce</h3>
          <p className="footer-copyright">
            © {currentYear} IBM E-commerce. All rights reserved.
          </p>
        </div>
        
        {/* Right Side: Links */}
        <div className="footer-links">
          <a target="_blank" href="https://www.linkedin.com/in/harshavardhan05" className="footer-link">LinkedIn</a>
          {/* <a href="#" className="footer-link">Twitter</a>
          <a href="#" className="footer-link">Support</a> */}
        </div>

      </div>
    </footer>
  );
}

export default Footer;