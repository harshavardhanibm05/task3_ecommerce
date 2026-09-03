import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StaticPages.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/auth', { state: { from: '/profile' } }); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm({
      first_name: u.first_name || u.name || '',
      last_name:  u.last_name  || '',
      email:      u.email      || '',
      phone:      u.phone      || ''
    });
  }, [navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = e => {
    e.preventDefault();
    // Update localStorage with new name/phone info (no server call needed for display)
    const updated = { ...user, first_name: form.first_name, last_name: form.last_name, name: form.first_name, phone: form.phone };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="static-page" style={{ maxWidth: '640px' }}>
      <div className="checkout-breadcrumb" style={{ marginBottom: '28px' }}>
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1 className="checkout-heading">Personal Details</h1>
      </div>

      <form className="checkout-form-card" onSubmit={handleSave}>
        <h2 className="card-section-title">Account Information</h2>

        <div className="form-row-2">
          <div className="form-group">
            <label>First Name</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input name="email" type="email" value={form.email} readOnly style={{ background: '#f3f4f6', cursor: 'not-allowed' }} />
          <span style={{ fontSize: '12px', color: '#aaa' }}>Email cannot be changed.</span>
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
        </div>

        {saved && (
          <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
            ✓ Changes saved locally!
          </p>
        )}

        <button type="submit" className="checkout-continue-btn">
          Save Changes
        </button>
      </form>

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/orders" className="order-view-btn" style={{ textDecoration: 'none' }}>
          📦 Order History
        </Link>
        <Link to="/" className="back-link" style={{ display: 'flex', alignItems: 'center' }}>
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default ProfilePage;
