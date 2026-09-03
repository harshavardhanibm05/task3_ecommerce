import { useState } from 'react';
import './StaticPages.css';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // In production this would POST to a support API
    setSubmitted(true);
  };

  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Contact Us</h1>
        <p>We're here to help — reach out anytime.</p>
      </div>

      <div className="static-content">

        <div className="contact-layout">

          {/* Info column */}
          <div className="contact-info-col">
            <div className="contact-info-card">
              <span className="contact-info-icon">📧</span>
              <h3>Email</h3>
              <p>support@ibm-ecom.example.com</p>
            </div>
            <div className="contact-info-card">
              <span className="contact-info-icon">📞</span>
              <h3>Phone</h3>
              <p>1800-IBM-HELP (Mon–Fri, 9am–6pm IST)</p>
            </div>
            <div className="contact-info-card">
              <span className="contact-info-icon">🏢</span>
              <h3>Office</h3>
              <p>IBM India Pvt. Ltd.<br />Bangalore, Karnataka — 560045</p>
            </div>
          </div>

          {/* Form column */}
          <div className="contact-form-col">
            {submitted ? (
              <div className="contact-success">
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                <h2>Message Received!</h2>
                <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button
                  className="checkout-continue-btn"
                  style={{ marginTop: '20px' }}
                  onClick={() => { setSubmitted(false); setForm({ name:'',email:'',subject:'',message:'' }); }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="checkout-form-card" onSubmit={handleSubmit} noValidate>
                <h2 className="card-section-title">Send a Message</h2>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input name="subject" value={form.subject} onChange={handleChange} placeholder="Order issue / Product query / Other" required />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question…"
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="checkout-continue-btn">
                  Send Message 📨
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ContactPage;
