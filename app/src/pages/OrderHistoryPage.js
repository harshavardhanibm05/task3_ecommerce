import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Orders.css';

const STATUS_CONFIG = {
  placed:    { label: 'Order Placed',    color: '#3b82f6', bg: '#eff6ff' },
  confirmed: { label: 'Confirmed',       color: '#8b5cf6', bg: '#f5f3ff' },
  packed:    { label: 'Packed',          color: '#f59e0b', bg: '#fffbeb' },
  shipped:   { label: 'Shipped',         color: '#f15e14', bg: '#fff7ed' },
  out:       { label: 'Out for Delivery',color: '#10b981', bg: '#ecfdf5' },
  delivered: { label: 'Delivered',       color: '#16a34a', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled',       color: '#dc2626', bg: '#fef2f2' },
};

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth', { state: { from: '/orders' } });
      return;
    }
    fetch('http://localhost:5000/api/orders', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        else setError(data.error || 'Failed to load orders');
      })
      .catch(() => setError('Could not connect to server.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">Loading your orders…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-error">⚠️ {error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders. Start shopping!</p>
          <Link to="/" className="cart-shop-btn">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <Link to="/" className="back-link">← Continue Shopping</Link>
        <h1 className="orders-heading">
          My Orders <span className="orders-count-badge">{orders.length}</span>
        </h1>
      </div>

      <div className="orders-list">
        {orders.map(order => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['placed'];
          return (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-id-block">
                  <span className="order-id-label">Order ID</span>
                  <span className="order-id-val">#{order.id}</span>
                </div>
                <span
                  className="order-status-chip"
                  style={{ color: cfg.color, background: cfg.bg }}
                >
                  {cfg.label}
                </span>
              </div>

              <div className="order-card-meta">
                <span>📅 {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}</span>
                <span>📦 {order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                <span>💳 {order.payment_method?.toUpperCase()}</span>
              </div>

              <div className="order-card-address">
                <span className="order-address-label">📍 Delivering to: </span>
                {order.full_name}, {order.city}, {order.state} — {order.pincode}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  <span className="order-total-label">Grand Total</span>
                  <span className="order-total-val">₹{Number(order.grand_total).toFixed(2)}</span>
                </div>
                <Link to={`/orders/${order.id}`} className="order-view-btn">
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
