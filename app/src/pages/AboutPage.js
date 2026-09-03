import { Link } from 'react-router-dom';
import './StaticPages.css';

function AboutPage() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>About IBM E-Commerce</h1>
        <p>Technology-driven shopping, powered by IBM.</p>
      </div>

      <div className="static-content">

        <section className="static-section">
          <h2>Our Story</h2>
          <p>
            IBM E-Commerce is a next-generation online retail platform built on IBM Cloud infrastructure.
            We offer a curated selection of cutting-edge technology products — from our own in-house catalogue
            to thousands of external products from verified global suppliers — all in one place.
          </p>
          <p>
            Our mission is simple: deliver the best tech at the best price, with the trust and reliability
            that only IBM can provide.
          </p>
        </section>

        <div className="static-cards-row">
          <div className="static-card">
            <span className="static-card-icon">🏪</span>
            <h3>Our Store Products</h3>
            <p>Curated, quality-verified products stocked directly in our warehouse with fast fulfillment.</p>
          </div>
          <div className="static-card">
            <span className="static-card-icon">🌐</span>
            <h3>External Products</h3>
            <p>A wide catalogue of products sourced from trusted global partners and marketplaces.</p>
          </div>
          <div className="static-card">
            <span className="static-card-icon">🔒</span>
            <h3>Secure Payments</h3>
            <p>Every transaction is protected with enterprise-grade IBM security protocols.</p>
          </div>
          <div className="static-card">
            <span className="static-card-icon">🚚</span>
            <h3>Fast Delivery</h3>
            <p>5–7 business day delivery across India with real-time order tracking.</p>
          </div>
        </div>

        <section className="static-section">
          <h2>Why Choose Us?</h2>
          <ul className="static-list">
            <li>✓ Trusted IBM brand with decades of technology expertise</li>
            <li>✓ Best-in-class products across categories</li>
            <li>✓ Transparent pricing with no hidden fees</li>
            <li>✓ Hassle-free returns within 30 days</li>
            <li>✓ 24/7 customer support</li>
          </ul>
        </section>

        <div className="static-cta">
          <Link to="/" className="checkout-continue-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Start Shopping →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default AboutPage;
