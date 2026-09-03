import { useLocation, Link } from 'react-router-dom';
import './Checkout.css';

function OrderSuccessPage() {
  const location = useLocation();
  const state = location.state || {};
  const orderId        = state.orderId;
  const grandTotal     = Number(state.grandTotal || 0);
  const paymentMethod  = state.payment_method || 'cod';
  const delivery       = state.deliveryDetails || {};

  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  return (
    <div className="checkout-page" style={{ textAlign: 'center' }}>
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-sub">
          Thank you, <strong>{delivery.full_name || 'Customer'}</strong>!<br />
          Your order <strong>#{orderId}</strong> has been confirmed.
        </p>

        <div className="success-detail-row">
          <div className="success-detail-box">
            <span className="success-detail-label">Amount Paid</span>
            <span className="success-detail-value">₹{grandTotal.toFixed(2)}</span>
          </div>
          <div className="success-detail-box">
            <span className="success-detail-label">Payment Method</span>
            <span className="success-detail-value" style={{ textTransform: 'uppercase' }}>{paymentMethod}</span>
          </div>
          <div className="success-detail-box">
            <span className="success-detail-label">Expected Delivery</span>
            <span className="success-detail-value">{deliveryDate}</span>
          </div>
        </div>

        {/* Mini delivery timeline */}
        <div className="success-timeline">
          {[
            { icon: '📋', label: 'Order Placed',    active: true },
            { icon: '✅', label: 'Confirmed',        active: false },
            { icon: '📦', label: 'Packed',           active: false },
            { icon: '🚚', label: 'Shipped',          active: false },
            { icon: '🛵', label: 'Out for Delivery', active: false },
            { icon: '🏠', label: 'Delivered',        active: false },
          ].map((s, i, arr) => (
            <div key={s.label} className="success-tl-step">
              <div className={`success-tl-icon ${s.active ? 'stl-active' : ''}`}>{s.icon}</div>
              <span className={`success-tl-label ${s.active ? 'stl-active-label' : ''}`}>{s.label}</span>
              {i < arr.length - 1 && <div className="success-tl-line" />}
            </div>
          ))}
        </div>

        <div className="success-actions">
          <Link to="/orders" className="checkout-continue-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            📦 View Order History
          </Link>
          <Link to="/" className="back-link" style={{ display: 'block', marginTop: '16px' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
