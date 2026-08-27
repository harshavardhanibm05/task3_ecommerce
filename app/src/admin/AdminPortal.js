import { useState, useEffect } from 'react';
import './css/AdminPortal.css'; // Import the new styles!

function AdminPortal() {
  const [productsList, setProductsList] = useState([]); 
  const [editingId, setEditingId] = useState(null); 
  
  // NEW: State to control if the popup is visible
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  const [imageFile, setImageFile] = useState(null);
  const [product, setProduct] = useState({
    name: '', price: '', description: '', category: '', image: ''
  });

  // --- 1. READ ---
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/allproducts');
      const data = await response.json();
      setProductsList(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Form Handlers ---
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const resetForm = () => {
    setProduct({ name: '', price: '', description: '', category: '', image: '' });
    setImageFile(null);
    setEditingId(null);
  };

  // NEW: Helper to open modal for a brand new product
  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // NEW: Helper to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // --- 2. CREATE & UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('price', product.price);
    formData.append('description', product.description);
    formData.append('category', product.category);
    
    if (imageFile) formData.append('imageFile', imageFile);
    else formData.append('image', product.image);

    try {
      const url = editingId ? `http://localhost:5000/api/products/${editingId}` : 'http://localhost:5000/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });

      if (response.ok) {
        alert(`Product successfully ${editingId ? 'updated' : 'added'}!`);
        fetchProducts(); 
        handleCloseModal(); // Close popup on success
      } else {
        alert("Error saving product.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // --- 3. UPDATE (Trigger) ---
  const handleEditClick = (prod) => {
    setEditingId(prod.id);
    setProduct({
      name: prod.name, price: prod.price, description: prod.description, category: prod.category, image: prod.image 
    });
    setIsModalOpen(true); // Open the popup with the data filled in
  };

  // --- 4. DELETE ---
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchProducts(); 
      } else {
        alert("Error deleting product.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <div className="admin-container">
      
      {/* HEADER SECTION */}
      <div className="admin-header">
        <h1>Product Dashboard</h1>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          + Add New Product
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsList.map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>
                  <img src={prod.image?.startsWith('http') ? prod.image : `http://localhost:5000/${prod.image}`} alt={prod.name} className="product-thumbnail" />
                </td>
                <td>{prod.name}</td>
                <td>${Number(prod.price).toFixed(2)}</td>
                <td>
                  <button className="btn btn-edit" onClick={() => handleEditClick(prod)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDeleteClick(prod.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL / POPUP SECTION */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-header">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" name="name" placeholder="Product Name" value={product.name} onChange={handleChange} required className="form-input" />
              </div>
              
              <div className="form-group">
                <input type="number" name="price" placeholder="Price" step="0.01" value={product.price} onChange={handleChange} required className="form-input" />
              </div>
              
              <div className="form-group">
                <input type="text" name="category" placeholder="Category" maxLength="20" value={product.category} onChange={handleChange} required className="form-input" />
              </div>
              
              <div className="image-upload-box">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Upload Image File:</label>
                <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} />
                
                <div className="upload-divider">OR</div>
                
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Image URL:</label>
                <input type="text" name="image" placeholder="https://..." value={product.image} onChange={handleChange} className="form-input" />
              </div>

              <div className="form-group">
                <textarea name="description" placeholder="Product Description" value={product.description} onChange={handleChange} required className="form-input" style={{ minHeight: '100px' }} />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-success">
                  {editingId ? "Save Changes" : "Save Product"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminPortal;