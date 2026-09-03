import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const SHIPPING_THRESHOLD = 999;   // Free shipping above this
const SHIPPING_FEE       = 99;
const TAX_RATE           = 0.18;  // 18% GST

function CartPage() {
  const { cartItems, fetchCartItems, removeFromCart } = useCart();
  const [removing, setRemoving] = useState(null);
  const [coupon, setCoupon]     = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [discount, setDiscount]   = useState(0);
  const navigate = useNavigate();
  console.log("Cart Items", cartItems);
  // Fetch on mount in case user navigated directly
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleRemove = async (cartItemId) => {
    setRemoving(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(null);
    }
  };

  const handleCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'IBM10') {
      setDiscount(10);
      setCouponMsg('✓ Coupon applied — 10% off!');
    } else if (code === 'SAVE20') {
      setDiscount(20);
      setCouponMsg('✓ Coupon applied — 20% off!');
    } else {
      setDiscount(0);
      setCouponMsg('✗ Invalid coupon code.');
    }
  };

  // ── Calculations ──
  const subtotal      = cartItems.reduce((sum, item) => sum + Number(item.product_price || 0), 0);
  const couponSaving  = (subtotal * discount) / 100;
  const afterCoupon   = subtotal - couponSaving;
  const shippingFee   = afterCoupon >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxAmount     = afterCoupon * TAX_RATE;
  const grandTotal    = afterCoupon + shippingFee + taxAmount;

 
  // ── Empty state ──
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="cart-shop-btn">Start Shopping</Link>
        </div>
      </div>
    );
  }


  return (
    <div className="cart-page">

      {/* ── Page header ── */}
      <div className="cart-header-row">
        <Link to="/" className="back-link">← Continue Shopping</Link>
        <h1 className="cart-heading">My Cart <span className="cart-count-badge">{cartItems.length}</span></h1>
      </div>

      <div className="cart-layout">

        {/* ── LEFT: Items list ── */}
        <div className="cart-items-col">
          {cartItems.map((item) => {
            // Resolve thumbnail: local items carry product_images / product_thumbnail from the JOIN
            const rawImg   = item.product_images
              ? (Array.isArray(item.product_images) ? item.product_images[0] : item.product_images)
              : (item.product_thumbnail || '');
            // const imgSrc   = rawImg && rawImg.startsWith('http')
            //   ? rawImg
            //   : rawImg ? `http://localhost:5000/${rawImg}` : null;
            const imgSrc = item.et_product_image;

            const isRemoving = removing === item.id;

            return (
              <div key={item.id} className={`cart-item-card ${isRemoving ? 'cart-item-removing' : ''}`}>
                {/* Thumbnail */}
                <div className="cart-item-img-wrap">
                  {imgSrc
                    ? <img src={imgSrc} alt={item.product_name} className="cart-item-img" />
                    : <div className="cart-item-img-placeholder">📦</div>
                  }
                </div>

                {/* Info */}
                <div className="cart-item-info">
                  <div className="cart-item-top">
                    <div>
                      <h3 className="cart-item-name">{item.product_name || 'Product'}</h3>
                      <span className={`cart-source-chip ${item.source === 'local' ? 'chip-local' : 'chip-external'}`}>
                        {item.source === 'local' ? '🏪 Our Store' : '🌐 External'}
                      </span>
                    </div>
                    <div className="cart-item-price">
                      ₹{Number(item.product_price || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="cart-item-meta">
                    <span className="cart-item-date">
                      Added: {new Date(item.added_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      className="cart-remove-btn"
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving}
                      aria-label="Remove item"
                    >
                      {isRemoving ? 'Removing…' : '🗑 Remove'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div className="cart-summary-col">
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>

            {/* Coupon */}
            <div className="cart-coupon-row">
              <input
                className="cart-coupon-input"
                type="text"
                placeholder="Coupon code (e.g. IBM10)"
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponMsg(''); }}
              />
              <button className="cart-coupon-btn" onClick={handleCoupon}>Apply</button>
            </div>
            {couponMsg && (
              <p className={`cart-coupon-msg ${couponMsg.startsWith('✓') ? 'coupon-ok' : 'coupon-err'}`}>
                {couponMsg}
              </p>
            )}

            {/* Price breakdown */}
            <div className="cart-summary-rows">
              <SummaryRow label={`Subtotal (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`} value={`₹${subtotal.toFixed(2)}`} />
              {couponSaving > 0 && (
                <SummaryRow label={`Coupon Discount (${discount}%)`} value={`-₹${couponSaving.toFixed(2)}`} highlight />
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

            {shippingFee > 0 && (
              <p className="cart-free-shipping-hint">
                Add ₹{(SHIPPING_THRESHOLD - afterCoupon).toFixed(2)} more for FREE shipping!
              </p>
            )}

            <button
              className="cart-checkout-btn"
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  navigate('/auth', { state: { from: '/checkout' } });
                } else {
                  navigate('/checkout', {
                    state: { subtotal, discount, couponSaving, shippingFee, taxAmount, grandTotal }
                  });
                }
              }}
            >
              Proceed to Checkout
            </button>

            {/* Trust badges */}
            <div className="cart-trust-badges">
              <span>🔒 Secure Checkout</span>
              <span>🔄 Easy Returns</span>
              <span>🚚 Fast Delivery</span>
            </div>
          </div>

          {/* Accepted payments note */}
          <p className="cart-payment-note">
            Accepted: UPI · Debit/Credit Card · Net Banking · Wallets
          </p>
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

export default CartPage;
