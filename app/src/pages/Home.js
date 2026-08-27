import { Link } from 'react-router-dom';

//This is for mock data products
// import { products } from './products'; 

import { useState, useEffect } from 'react';


function Home() {
  const[products, setProduct] = useState([]);

  //Filtering state
  const [selectedCategory, setSelectedCategory] = useState('All');
  //Fetching data from the API
  useEffect(()=>{
    const fetchProducts = async () =>{
      try{
        const response = await fetch('http://localhost:5000/api/allproducts');
        const products = await response.json();
        setProduct(products);
        console.log(products);
      }catch(error){
        console.log("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);
  

  //Getting the unique categories
  const uniqueCategories = ['All', ...new Set(products.map(product => product.category))];
  //Filtering the products 
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  return (
    // 2. Use className instead of style
    <div className="page-container">
      <h1 className="header">Our Products</h1>
      

    {/* 4. Display the filter buttons */}
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
              // Highlight the button if it's the currently selected one
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
              // Checks if it starts with 'http'. 
              // The '?.' prevents crashes if product.image is ever undefined while loading.
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
              <p className="product-price">${product.price.toFixed(2)}</p>
              
              <Link to={`/product/${product.id}`} className="link">
                <button className="button">View Details</button>
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;