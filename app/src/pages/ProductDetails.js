import { useParams, Link } from 'react-router-dom';
import {useState,useEffect} from 'react';
// Remove the Navbar import if it's already in App.js wrapping everything
// import { products } from './products';


function ProductDetails() {
  const { id } = useParams(); 
  const[products, setProduct] = useState([]);
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
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="details-page">
        <h2>Product not found!</h2>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="details-page">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <div className="details-container">
        {/* Left Column: Image */}
        <div className="details-image-wrapper">
          <img src={product.image?.startsWith('http') ? product.image : `http://localhost:5000/${product.image}`} alt={product.name} className="details-image" />
          
        </div>

        {/* Right Column: Information */}
        <div className="details-info">
          <span className="category-badge">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>
          <h2 className="details-price">${product.price.toFixed(2)}</h2>
          <p className="details-description">{product.description}</p>
          
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
      
    </div>
  );
}

export default ProductDetails;