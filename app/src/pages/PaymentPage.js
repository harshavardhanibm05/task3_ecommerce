import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'upi',     label: 'UPI',                  icon: '📱', desc: 'Pay via GPay, PhonePe, Paytm, etc.' },
  { id: 'card',    label: 'Debit / Credit Card',  icon: '💳', desc: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'netbank', label: 'Net Banking',           icon: '🏦', desc: 'All major Indian banks supported' },
  { id: 'wallet',  label: 'Wallet',                icon: '👛', desc: 'Paytm, Amazon Pay, Mobikwik' },
  { id: 'cod',     label: 'Cash on Delivery',      icon: '💵', desc: 'Pay when your order arrives' },
];

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCartItems } = useCart();

  const state = location.state || {};
  const deliveryDetails = state.deliveryDetails || {};
  const subtotal        = Number(state.subtotal     || 0);
  const couponSaving    = Number(state.couponSaving  || 0);
  const shippingFee     = Number(state.shippingFee   || 0);
  const taxAmount       = Number(state.taxAmount     || 0);
  const grandTotal      = Number(state.grandTotal    || 0);

  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId]   = useState('');
  const [placing, setPlacing] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }
    if (!deliveryDetails.full_name) { navigate('/checkout'); return; }

    // Fetch cart items so we can submit them with the order
    fetch('http://localhost:5000/api/cart/items', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(data => setCartItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [navigate, deliveryDetails.full_name]);

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    if (cartItems.length === 0) {
      alert('Your cart is empty. Please go back and add items.');
      return;
    }

    setPlacing(true);
    try {
      const items = cartItems.map(item => ({
        product_id:        item.product_id,
        source:            item.source,
        product_name:      item.product_name,
        product_price:     item.product_price,
        product_thumbnail: item.product_thumbnail || item.product_images || null
      }));

      const body = {
        ...deliveryDetails,
        subtotal,
        discount: couponSaving,
        shipping_fee: shippingFee,
        tax: taxAmount,
        grand_total: grandTotal,
        payment_method: selectedMethod,
        items
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      // Refresh cart count in context
      fetchCartItems();

      navigate('/order-success', {
        state: {
          orderId: data.orderId,
          grandTotal,
          payment_method: selectedMethod,
          deliveryDetails
        }
      });
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-breadcrumb">
        <Link to="/checkout" className="back-link">← Back to Checkout</Link>
        <h1 className="checkout-heading">Payment</h1>
      </div>

      {/* Step indicator */}
      <div className="checkout-steps">
        <div className="checkout-step step-done">
          <div className="step-circle">✓</div>
          <span className="step-label">Delivery Details</span>
          <div className="step-line line-done" />
        </div>
        <div className="checkout-step step-active">
          <div className="step-circle">2</div>
          <span className="step-label">Review & Pay</span>
        </div>
      </div>

      <div className="checkout-layout">

        {/* ── LEFT ── */}
        <div className="checkout-main">

          {/* Delivery address recap */}
          <div className="checkout-review-card">
            <div className="review-header">
              <h2 className="card-section-title">📍 Delivering To</h2>
              <Link to="/checkout" className="edit-btn">✏️ Edit</Link>
            </div>
            <div className="review-address">
              <p><strong>{deliveryDetails.full_name}</strong></p>
              <p>{deliveryDetails.address_line1}{deliveryDetails.address_line2 ? `, ${deliveryDetails.address_line2}` : ''}</p>
              <p>{deliveryDetails.city}, {deliveryDetails.state} — {deliveryDetails.pincode}</p>
              <p>📞 {deliveryDetails.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Payment methods */}
          <div className="checkout-form-card">
            <h2 className="card-section-title">Select Payment Method</h2>
            <div className="payment-methods-list">
              {PAYMENT_METHODS.map(m => (
                <label
                  key={m.id}
                  className={`payment-method-card ${selectedMethod === m.id ? 'pm-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={selectedMethod === m.id}
                    onChange={() => setSelectedMethod(m.id)}
                    className="pm-radio"
                  />
                  <span className="pm-icon">{m.icon}</span>
                  <div className="pm-info">
                    <span className="pm-label">{m.label}</span>
                    <span className="pm-desc">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {selectedMethod === 'upi' && (
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                />
              </div>
            )}

            {selectedMethod === 'cod' && (
              <p className="cod-note">
                💡 Cash on Delivery: Pay ₹{grandTotal.toFixed(2)} when your order arrives. An extra ₹30 COD fee may apply.
              </p>
            )}

            <button
              className="checkout-continue-btn"
              style={{ marginTop: '24px' }}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Placing Order…' : `🛒 Place Order — ₹${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Summary ── */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-rows">
              <SummaryRow label={`Subtotal (${cartItems.length} item${cartItems.length !== 1 ? 's' : ''})`} value={`₹${subtotal.toFixed(2)}`} />
              {couponSaving > 0 && (
                <SummaryRow label="Coupon Discount" value={`-₹${couponSaving.toFixed(2)}`} highlight />
              )}
              <SummaryRow label="Shipping" value={shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`} highlight={shippingFee === 0} />
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

export default PaymentPage;
