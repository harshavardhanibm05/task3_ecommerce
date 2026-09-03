import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { source, id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [cartMsg, setCartMsg] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (source === 'local') {
          // Fetch single product directly from our backend
          const response = await fetch(`http://localhost:5000/api/products/${id}`);
          const data = await response.json();
          setProduct(data.error ? null : data);
        } else if (source === 'external') {
          const EXTERNAL_API = process.env.REACT_APP_EXTERNAL_API || '';
          const baseUrl = EXTERNAL_API.replace(/\/products.*$/, '/products');
          const response = await fetch(`${baseUrl}/${id}`);
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [source, id]);

  if (loading) {
    return <div className="details-page"><p>Loading...</p></div>;
  }

  if (!product) {
    return (
      <div className="details-page">
        <h2>Product not found!</h2>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  // Add to cart — works for both local and external products
  const cartAddHandle = async () => {
    try {
      // Determine the display price (after discount if applicable)
      const price = Number(product.price) || 0;
      const discount = product.discountPercentage ? Number(product.discountPercentage) : 0;
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

      await addToCart({
        product_id: product.id,
        source: source,                              // 'local' or 'external' from URL params
        product_name: product.title || product.name || 'Product',
        product_price: parseFloat(finalPrice.toFixed(2))
      });

      setCartMsg('✓ Added to cart!');
      setTimeout(() => setCartMsg(''), 3000);
    } catch (error) {
      if (error.message === 'LOGIN_REQUIRED') {
        navigate('/auth', { state: { from: `/product/${source}/${id}` } });
        return;
      }
      console.error("Error adding to cart:", error);
      setCartMsg(`✗ ${error.message}`);
      setTimeout(() => setCartMsg(''), 3000);
    }
  };

  // --- Normalize fields across both sources ---
  const displayName  = product.title  || product.name  || 'Product';
  const displayDesc  = product.description || '';
  const displayPrice = Number(product.price) || 0;
  const displayCat   = product.category || '';
  const displayBrand = product.brand || null;
  const displaySKU   = product.sku || null;
  const displayStock = product.stock != null ? product.stock : null;
  const displayRating = product.rating != null ? Number(product.rating) : null;
  const displayDiscount = product.discountPercentage != null ? Number(product.discountPercentage) : null;
  const displayAvailability = product.availabilityStatus || null;
  const displayWarranty = product.warrantyInformation || null;
  const displayShipping = product.shippingInformation || null;
  const displayReturn = product.returnPolicy || null;
  const displayMinOrder = product.minimumOrderQuantity || null;
  const displayWeight = product.weight || null;
  const displayTags = product.tags
    ? (typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()) : product.tags)
    : [];
  const displayReviews = product.reviews
    ? (typeof product.reviews === 'string' ? JSON.parse(product.reviews) : product.reviews)
    : [];

  // Build image array — local stores a single string, external stores an array
  const rawImages = Array.isArray(product.images)
    ? product.images
    : (product.images ? [product.images] : []);
  const imageList = rawImages.map(img =>
    img.startsWith('http') ? img : `http://localhost:5000/${img}`
  );
  // Fallback to thumbnail if no images
  if (imageList.length === 0 && product.thumbnail) {
    imageList.push(product.thumbnail);
  }
  const currentImage = imageList[activeImage] || '';

  // Discounted price
  const discountedPrice = displayDiscount
    ? displayPrice * (1 - displayDiscount / 100)
    : null;

  return (
    <div className="details-page">
      <Link to="/" className="back-link">← Back to Home</Link>

      {/* Source badge */}
      <div style={{ marginBottom: '16px' }}>
        <span className={`source-badge ${source === 'local' ? 'source-local' : 'source-external'}`}>
          {source === 'local' ? '🏪 Our Store' : '🌐 External'}
        </span>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="details-container">

        {/* LEFT: Image gallery */}
        <div className="details-image-wrapper">
          <img src={currentImage} alt={displayName} className="details-image" />

          {/* Thumbnail strip — only shown when there are multiple images */}
          {imageList.length > 1 && (
            <div className="image-thumb-strip">
              {imageList.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`view ${idx + 1}`}
                  className={`image-thumb ${activeImage === idx ? 'thumb-active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="details-info">
          {displayCat && <span className="category-badge">{displayCat}</span>}
          <h1 className="details-title">{displayName}</h1>
          {displayBrand && <p className="details-brand">by <strong>{displayBrand}</strong></p>}

          {/* Rating row */}
          {displayRating !== null && (
            <div className="rating-row">
              <span className="stars">{renderStars(displayRating)}</span>
              <span className="rating-value">{displayRating.toFixed(1)}</span>
            </div>
          )}

          {/* Price block */}
          <div className="price-block">
            {discountedPrice ? (
              <>
                <span className="price-original">₹{displayPrice.toFixed(2)}</span>
                <span className="price-discounted">₹{discountedPrice.toFixed(2)}</span>
                <span className="discount-tag">-{displayDiscount.toFixed(0)}%</span>
              </>
            ) : (
              <span className="details-price">₹{displayPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Availability */}
          {displayAvailability && (
            <p className={`availability ${displayAvailability === 'In Stock' ? 'avail-in' : 'avail-out'}`}>
              ● {displayAvailability}
              {displayStock !== null && ` (${displayStock} units)`}
            </p>
          )}

          <p className="details-description">{displayDesc}</p>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="tags-row">
              {displayTags.map((tag, i) => (
                <span key={i} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}

          <button className="add-to-cart-btn" onClick={cartAddHandle}>Add to Cart</button>
          {cartMsg && (
            <p style={{ marginTop: '8px', fontWeight: 'bold', color: cartMsg.startsWith('✓') ? 'green' : 'red' }}>
              {cartMsg}
            </p>
          )}
        </div>
      </div>

      {/* ── EXTRA DETAILS GRID ── */}
      <div className="extra-details-grid">

        {/* Product Details */}
        <div className="detail-card">
          <h3 className="detail-card-title">Product Details</h3>
          {displaySKU       && <DetailRow label="SKU"           value={displaySKU} />}
          {displayWeight    && <DetailRow label="Weight"        value={`${displayWeight} g`} />}
          {displayMinOrder  && <DetailRow label="Min. Order"    value={`${displayMinOrder} units`} />}
          {product.dimensions && <DimensionsRow raw={product.dimensions} />}
        </div>

        {/* Shipping & Returns */}
        {(displayShipping || displayReturn || displayWarranty) && (
          <div className="detail-card">
            <h3 className="detail-card-title">Shipping & Returns</h3>
            {displayWarranty && <DetailRow label="Warranty"  value={displayWarranty} />}
            {displayShipping && <DetailRow label="Shipping"  value={displayShipping} />}
            {displayReturn   && <DetailRow label="Returns"   value={displayReturn} />}
          </div>
        )}
      </div>

      {/* ── REVIEWS ── */}
      {displayReviews.length > 0 && (
        <div className="reviews-section">
          <h2 className="reviews-heading">Customer Reviews ({displayReviews.length})</h2>
          <div className="reviews-grid">
            {displayReviews.map((review, i) => (
              <div key={i} className="review-card">
                <div className="review-top">
                  <span className="reviewer-name">{review.reviewerName}</span>
                  <span className="review-stars">{renderStars(review.rating)}</span>
                </div>
                <p className="review-comment">"{review.comment}"</p>
                <p className="review-date">{new Date(review.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// --- Helper: render star string ---
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// --- Helper: single detail row ---
function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

// --- Helper: parse & display dimensions ---
function DimensionsRow({ raw }) {
  try {
    const dims = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!dims || (!dims.width && !dims.height && !dims.depth)) return null;
    return (
      <DetailRow
        label="Dimensions"
        value={`${dims.width} × ${dims.height} × ${dims.depth} cm`}
      />
    );
  } catch {
    return null;
  }
}

export default ProductDetails;
