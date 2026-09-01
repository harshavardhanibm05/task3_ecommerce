import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
// require('dotenv').config();

function Home() {
  const [products, setProduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  // cardMsgs: Map of "source-id" -> { text, ok }
  const [cardMsgs, setCardMsgs] = useState({});
  const { addToCart } = useCart();
  const LOCALHOST_API = process.env.REACT_APP_LOCALHOST_API;
  const EXTERNAL_API = process.env.REACT_APP_EXTERNAL_API;
  // console.log("Local API", LOCALHOST_API);
  
  // 1. Read the search term from the URL (sent by the Navbar)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || ''; // Defaults to empty string if no search

  // Fetching data from both APIs and tagging each product with its source
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch local DB products (may fail if backend is down)
        let localProducts = [];
        try {
          const response = await fetch(LOCALHOST_API);
          const data = await response.json();
          localProducts = data.map(p => ({ ...p, source: 'local' }));
        } catch (e) {
          console.warn("Local API unavailable:", e.message);
        }

        // Fetch external API products
        let externalProducts = [];
        try {
          const resp1 = await fetch(EXTERNAL_API);
          const data1 = await resp1.json();
          externalProducts = (data1.products || []).map(p => ({ ...p, source: 'external' }));
        } catch (e) {
          console.warn("External API unavailable:", e.message);
        }

        setProduct([...localProducts, ...externalProducts]);
      } catch(error) {
        console.log("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    const key = `${product.source}-${product.id}`;
    const price    = Number(product.price) || 0;
    const discount = Number(product.discountPercentage) || 0;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    setCardMsgs(prev => ({ ...prev, [key]: { text: 'Adding…', ok: true } }));
    try {
      await addToCart({
        product_id:    product.id,
        source:        product.source,
        product_name:  product.title || product.name || 'Product',
        product_price: parseFloat(finalPrice.toFixed(2))
      });
      setCardMsgs(prev => ({ ...prev, [key]: { text: '✓ Added!', ok: true } }));
    } catch (err) {
      setCardMsgs(prev => ({ ...prev, [key]: { text: '✗ Failed', ok: false } }));
    }
    setTimeout(() => setCardMsgs(prev => { const n = { ...prev }; delete n[key]; return n; }), 2500);
  }, [addToCart]);

  // Getting the unique categories
  const uniqueCategories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];
  
  // 2. Filter the products by BOTH category and search query
  const filteredProducts = products.filter((product) => {
    // Does it match the category? (True if 'All' is selected, OR if the category matches)
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    // Normalize name: DB uses 'name', external APIs use 'title'
    const productName = (product.name || product.title || '').toLowerCase();
    // Does it match the search? (True if search is empty, OR if name contains the typed letters)
    const matchesSearch = productName.includes(searchQuery.toLowerCase());
    
    // Only keep the product if BOTH are true
    return matchesCategory && matchesSearch;
  });

  //Automatically scroll to the container when a search query is submitted
  useEffect(() => {
    if (searchQuery) {
      const container = document.getElementById('page-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchQuery]);

  return (
    <div className="page-container" id="page-container">
      
      {/* 3. Optional: Show what they searched for and a "Clear" button */}
      {searchQuery && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h6>Search results for: "{searchQuery}"</h6>
          <Link to="/" style={{ color: '#007bff', textDecoration: 'underline' }}>Clear Search</Link>
        </div>
      )}

      {/* Display the filter buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
        {uniqueCategories.map(category => (
          <button 
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '3px 10px',
              borderRadius: '25px',
              border: '2px solid #000',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '10px',
              transition: 'all 0.2s ease',
              backgroundColor: selectedCategory === category ? '#000' : '#fff',
              color: selectedCategory === category ? '#fff' : '#000',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => {
          const rawImage = Array.isArray(product.images)
            ? product.images[0]
            : (product.images || product.image || '');
          const imageSrc = rawImage.startsWith('http')
            ? rawImage
            : `http://localhost:5000/${rawImage}`;

          const displayName = product.name || product.title || 'Product Name';
          const detailPath  = `/product/${product.source}/${product.id}`;
          const price       = Number(product.price) || 0;
          const discount    = Number(product.discountPercentage) || 0;
          const finalPrice  = discount > 0 ? price * (1 - discount / 100) : null;
          const rating      = product.rating != null ? Number(product.rating) : null;
          const stock       = product.stock != null ? Number(product.stock) : null;
          const availability = product.availabilityStatus || null;

          return (
            <div key={`${product.source}-${product.id}`} className="card">

              {/* Discount badge — top-right corner of image */}
              <div className="card-image-wrap">
                <img src={imageSrc} alt={displayName} className="product-image" />
                {discount > 0 && (
                  <span className="card-discount-badge">-{Math.round(discount)}%</span>
                )}
              </div>

              <div className="card-content">
                {/* Category chip */}
                {product.category && (
                  <span className="card-category">{product.category}</span>
                )}

                <h3 className="product-title">{displayName}</h3>

                {/* Rating stars */}
                {rating !== null && (
                  <div className="card-rating">
                    <span className="card-stars">
                      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
                    </span>
                    <span className="card-rating-val">{rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Price row */}
                <div className="card-price-row">
                  {finalPrice ? (
                    <>
                      <span className="card-price-original">₹{price.toFixed(2)}</span>
                      <span className="card-price-final">₹{finalPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="card-price-final">₹{price.toFixed(2)}</span>
                  )}
                </div>

                {/* Stock / availability */}
                {(stock !== null || availability) && (
                  <p className={`card-stock ${stock === 0 || availability === 'Out of Stock' ? 'card-stock-out' : 'card-stock-in'}`}>
                    {stock === 0 || availability === 'Out of Stock'
                      ? '✕ Out of Stock'
                      : stock !== null
                        ? `✓ In Stock (${stock})`
                        : `✓ ${availability}`}
                  </p>
                )}

                <div className="card-actions-row">
                <Link to={detailPath} className="link details-link-wrapper">
                  <button className="button full-width-btn">View Details</button>
                </Link>
                
                <button
                  className="card-add-cart-btn cart-30-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={cardMsgs[`${product.source}-${product.id}`]?.text === 'Adding…'}
                >
                  🛒 
                </button>
              </div>
                {cardMsgs[`${product.source}-${product.id}`] && (
                  <p className={`card-cart-msg ${cardMsgs[`${product.source}-${product.id}`].ok ? 'card-cart-msg-ok' : 'card-cart-msg-err'}`}>
                    {cardMsgs[`${product.source}-${product.id}`].text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show a message if no products match the search or category */}
      {filteredProducts.length === 0 && (
        <h4 style={{ textAlign: 'center', width: '100%', color: '#666' }}>
          No products found.
        </h4>
      )}

    </div>
  );
}

export default Home;