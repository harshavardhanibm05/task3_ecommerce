import './css/Footer.css'; // Make sure Footer.css exists in this folder!
// FIXED: Changed FaponeAlt to FaPhoneAlt
import { FaLinkedin, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

function Footer() {
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
        
        {/* Right Side: Links with Icons */}
        <div className="footer-links">
          <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/harshavardhan05" className="footer-link">
            <FaLinkedin style={{ marginRight: '6px' }} /> LinkedIn
          </a>
          
          <a target="_blank" rel="noopener noreferrer" href="https://wa.me/yourphonenumber" className="footer-link">
            <FaWhatsapp style={{ marginRight: '6px' }} /> WhatsApp
          </a>
          
          <a href="tel:+1234567890" className="footer-link">
            <FaPhoneAlt style={{ marginRight: '6px' }} /> Call Us
          </a>
        </div>

      </div>
    </footer>
  );
}

export default Footer;