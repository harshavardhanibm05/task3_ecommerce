import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Checkout.css';

const STEPS = ['Delivery Details', 'Review & Pay'];

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Totals passed from CartPage via navigate state
  const summary = location.state || {};
  const subtotal     = Number(summary.subtotal     || 0);
  const couponSaving = Number(summary.couponSaving  || 0);
  const shippingFee  = Number(summary.shippingFee   || 0);
  const taxAmount    = Number(summary.taxAmount     || 0);
  const grandTotal   = Number(summary.grandTotal    || 0);

  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/auth', { state: { from: '/checkout' } });
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    setForm(prev => ({
      ...prev,
      full_name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email || '',
      phone: u.phone || ''
    }));
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())    e.full_name    = 'Full name is required';
    if (!form.email.trim())        e.email        = 'Email is required';
    if (!form.address_line1.trim()) e.address_line1 = 'Address is required';
    if (!form.city.trim())         e.city         = 'City is required';
    if (!form.state.trim())        e.state        = 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode  = 'Valid 6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validate()) setStep(1);
  };

  const handlePlaceOrder = () => {
    navigate('/payment', {
      state: {
        deliveryDetails: form,
        subtotal, couponSaving, shippingFee, taxAmount, grandTotal
      }
    });
  };

  // Delivery status timeline (shown only in step 1 review)
  const deliveryStatuses = [
    { key: 'placed',      label: 'Order Placed',      icon: '📋', done: true },
    { key: 'confirmed',   label: 'Confirmed',          icon: '✅', done: false },
    { key: 'packed',      label: 'Packed',             icon: '📦', done: false },
    { key: 'shipped',     label: 'Shipped',            icon: '🚚', done: false },
    { key: 'out',         label: 'Out for Delivery',   icon: '🛵', done: false },
    { key: 'delivered',   label: 'Delivered',          icon: '🏠', done: false },
  ];

  if (!user) return null;

  return (
    <div className="checkout-page">

      {/* Breadcrumb */}
      <div className="checkout-breadcrumb">
        <Link to="/cart" className="back-link">← Back to Cart</Link>
        <h1 className="checkout-heading">Checkout</h1>
      </div>

      {/* Step indicator */}
      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`checkout-step ${i === step ? 'step-active' : i < step ? 'step-done' : ''}`}>
            <div className="step-circle">{i < step ? '✓' : i + 1}</div>
            <span className="step-label">{s}</span>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'line-done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="checkout-layout">

        {/* ── LEFT PANEL ── */}
        <div className="checkout-main">

          {step === 0 && (
            <form className="checkout-form-card" onSubmit={handleContinue} noValidate>
              <h2 className="card-section-title">Delivery Address</h2>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe" />
                  {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="House No., Street, Area" />
                {errors.address_line1 && <span className="form-error">{errors.address_line1}</span>}
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Landmark, Colony (Optional)" />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>City *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" value={form.state} onChange={handleChange}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <span className="form-error">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" maxLength={6} />
                  {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                </div>
              </div>

              <button type="submit" className="checkout-continue-btn">
                Continue to Review →
              </button>
            </form>
          )}

          {step === 1 && (
            <div>
              {/* Address Review */}
              <div className="checkout-review-card">
                <div className="review-header">
                  <h2 className="card-section-title">Delivery Address</h2>
                  <button className="edit-btn" onClick={() => setStep(0)}>✏️ Edit</button>
                </div>
                <div className="review-address">
                  <p><strong>{form.full_name}</strong></p>
                  <p>{form.address_line1}{form.address_line2 ? `, ${form.address_line2}` : ''}</p>
                  <p>{form.city}, {form.state} — {form.pincode}</p>
                  <p>📞 {form.phone || 'Not provided'} &nbsp;|&nbsp; ✉️ {form.email}</p>
                </div>
              </div>

              {/* Delivery Status Timeline */}
              <div className="checkout-review-card">
                <h2 className="card-section-title">📦 Expected Delivery Timeline</h2>
                <p className="delivery-estimate">
                  Estimated delivery: <strong>{getDeliveryDate()}</strong> (5–7 business days)
                </p>
                <div className="delivery-timeline">
                  {deliveryStatuses.map((s, i) => (
                    <div key={s.key} className={`timeline-step ${i === 0 ? 'timeline-active' : ''}`}>
                      <div className="timeline-icon-wrap">
                        <span className="timeline-icon">{s.icon}</span>
                        {i < deliveryStatuses.length - 1 && <div className="timeline-connector" />}
                      </div>
                      <div className="timeline-info">
                        <span className={`timeline-label ${i === 0 ? 'tl-active' : 'tl-pending'}`}>{s.label}</span>
                        <span className="timeline-sub">{i === 0 ? 'Today' : `+${i + 1} day${i + 1 > 1 ? 's' : ''}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="checkout-continue-btn" onClick={handlePlaceOrder}>
                Proceed to Payment →
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-rows">
              <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
              {couponSaving > 0 && (
                <SummaryRow label="Coupon Discount" value={`-₹${couponSaving.toFixed(2)}`} highlight />
              )}
              <SummaryRow
                label="Shipping"
                value={shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                highlight={shippingFee === 0}
              />
              <SummaryRow label="GST (18%)" value={`₹${taxAmount.toFixed(2)}`} muted />
            </div>
            <div className="cart-divider" />
            <div className="cart-total-row">
              <span>Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="checkout-trust">
              <span>🔒 Secure</span>
              <span>🔄 Easy Returns</span>
              <span>🚚 Fast Delivery</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight, muted }) {
  return (
    <div className="cart-summary-row">
      <span className={muted ? 'summary-muted' : ''}>{label}</span>
      <span className={highlight ? 'summary-highlight' : muted ? 'summary-muted' : ''}>{value}</span>
    </div>
  );
}

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default CheckoutPage;
