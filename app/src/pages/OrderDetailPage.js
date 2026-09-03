import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './Orders.css';

const STATUS_STEPS = [
  { key: 'placed',    label: 'Order Placed',     icon: '📋' },
  { key: 'confirmed', label: 'Confirmed',          icon: '✅' },
  { key: 'packed',    label: 'Packed',             icon: '📦' },
  { key: 'shipped',   label: 'Shipped',            icon: '🚚' },
  { key: 'out',       label: 'Out for Delivery',   icon: '🛵' },
  { key: 'delivered', label: 'Delivered',          icon: '🏠' },
];

const STATUS_CONFIG = {
  placed:    { label: 'Order Placed',    color: '#3b82f6', bg: '#eff6ff' },
  confirmed: { label: 'Confirmed',       color: '#8b5cf6', bg: '#f5f3ff' },
  packed:    { label: 'Packed',          color: '#f59e0b', bg: '#fffbeb' },
  shipped:   { label: 'Shipped',         color: '#f15e14', bg: '#fff7ed' },
  out:       { label: 'Out for Delivery',color: '#10b981', bg: '#ecfdf5' },
  delivered: { label: 'Delivered',       color: '#16a34a', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled',       color: '#dc2626', bg: '#fef2f2' },
};

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    fetch(`http://localhost:5000/api/orders/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) setOrder(data);
        else setError(data.error || 'Order not found');
      })
      .catch(() => setError('Could not connect to server.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="orders-page"><div className="orders-loading">Loading…</div></div>;
  if (error)   return <div className="orders-page"><div className="orders-error">⚠️ {error}</div></div>;
  if (!order)  return null;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['placed'];
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);

  const deliveryDate = (() => {
    const d = new Date(order.created_at);
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  return (
    <div className="orders-page">
      <div className="orders-header">
        <Link to="/orders" className="back-link">← Back to Orders</Link>
        <h1 className="orders-heading">Order #{order.id}</h1>
      </div>

      <div className="order-detail-layout">

        {/* LEFT */}
        <div className="order-detail-main">

          {/* Status & Timeline */}
          <div className="order-detail-card">
            <div className="order-detail-card-header">
              <h2 className="card-section-title">Delivery Status</h2>
              <span className="order-status-chip" style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.label}
              </span>
            </div>
            <p className="delivery-estimate">
              Expected by: <strong>{deliveryDate}</strong>
            </p>

            {/* Horizontal timeline */}
            <div className="order-detail-timeline">
              {STATUS_STEPS.map((s, i) => {
                const isDone    = i <= currentStepIndex;
                const isActive  = i === currentStepIndex;
                return (
                  <div key={s.key} className="odt-step">
                    <div className={`odt-icon-wrap ${isDone ? 'odt-done' : ''} ${isActive ? 'odt-active' : ''}`}>
                      <span className="odt-icon">{s.icon}</span>
                    </div>
                    <span className={`odt-label ${isActive ? 'odt-label-active' : isDone ? 'odt-label-done' : ''}`}>
                      {s.label}
                    </span>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`odt-connector ${i < currentStepIndex ? 'odt-connector-done' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="order-detail-card">
            <h2 className="card-section-title">
              Items ({order.items?.length || 0})
            </h2>
            <div className="order-items-list">
              {(order.items || []).map(item => {
                const rawImg = item.product_thumbnail || '';
                const imgSrc = rawImg
                  ? (rawImg.startsWith('http') ? rawImg : `http://localhost:5000/${rawImg}`)
                  : null;
                return (
                  <div key={item.id} className="order-item-row">
                    <div className="order-item-img-wrap">
                      {imgSrc
                        ? <img src={imgSrc} alt={item.product_name} className="order-item-img" />
                        : <div className="order-item-img-placeholder">📦</div>
                      }
                    </div>
                    <div className="order-item-info">
                      <span className="order-item-name">{item.product_name}</span>
                      <span className={`cart-source-chip ${item.source === 'local' ? 'chip-local' : 'chip-external'}`}>
                        {item.source === 'local' ? '🏪 Our Store' : '🌐 External'}
                      </span>
                    </div>
                    <span className="order-item-price">₹{Number(item.product_price).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery address */}
          <div className="order-detail-card">
            <h2 className="card-section-title">📍 Delivery Address</h2>
            <div className="review-address">
              <p><strong>{order.full_name}</strong></p>
              <p>{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
              <p>{order.city}, {order.state} — {order.pincode}</p>
              <p>📞 {order.phone || 'Not provided'} &nbsp;|&nbsp; ✉️ {order.email}</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Price summary */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card">
            <h2 className="cart-summary-title">Payment Summary</h2>
            <div className="cart-summary-rows">
              <SummaryRow label="Subtotal"      value={`₹${Number(order.subtotal).toFixed(2)}`} />
              {Number(order.discount) > 0 && (
                <SummaryRow label="Discount"    value={`-₹${Number(order.discount).toFixed(2)}`} highlight />
              )}
              <SummaryRow
                label="Shipping"
                value={Number(order.shipping_fee) === 0 ? 'FREE' : `₹${Number(order.shipping_fee).toFixed(2)}`}
                highlight={Number(order.shipping_fee) === 0}
              />
              <SummaryRow label="GST (18%)"     value={`₹${Number(order.tax).toFixed(2)}`} muted />
            </div>
            <div className="cart-divider" />
            <div className="cart-total-row">
              <span>Total Paid</span>
              <span>₹{Number(order.grand_total).toFixed(2)}</span>
            </div>
            <div className="order-payment-method-row">
              <span>Payment Method</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{order.payment_method}</span>
            </div>
            <div className="order-placed-on">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
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

export default OrderDetailPage;
