import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Home() {
  const [products, setProduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // 1. Read the search term from the URL (sent by the Navbar)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || ''; // Defaults to empty string if no search

  // Fetching data from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/allproducts');
        const data = await response.json();
        setProduct(data);
        console.log(data);
      } catch(error) {
        console.log("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Getting the unique categories
  const uniqueCategories = ['All', ...new Set(products.map(product => product.category))];
  
  // 2. Filter the products by BOTH category and search query
  const filteredProducts = products.filter((product) => {
    // Does it match the category? (True if 'All' is selected, OR if the category matches)
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    // Does it match the search? (True if search is empty, OR if name contains the typed letters)
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        {filteredProducts.map((product) => (
          <div key={product.id} className="card">
            
           <img 
              src={
                product.image?.startsWith('http') 
                  ? product.image 
                  : `http://localhost:5000/${product.image}`
              }
              alt={product.name} 
              className="product-image" 
            />
            
            <div className="card-content">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-price">₹{Number(product.price).toFixed(2)}</p>
              
              <Link to={`/product/${product.id}`} className="link">
                <button className="button">View Details</button>
              </Link>
            </div>

          </div>
        ))}
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