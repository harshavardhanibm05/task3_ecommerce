import { useState, useEffect } from 'react';
import './css/AdminPortal.css';

const EMPTY_PRODUCT = {
  title: '', price: '', description: '', category: '', brand: '', sku: '',
  stock: '', weight: '', discountPercentage: '', rating: '',
  availabilityStatus: 'In Stock',
  warrantyInformation: '', shippingInformation: '', returnPolicy: '',
  minimumOrderQuantity: '', tags: '', images: '', thumbnail: '',
  dimensions: '{"width":"","height":"","depth":""}',
  reviews: '',
};

function AdminPortal() {
  const [productsList, setProductsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [imageFile, setImageFile] = useState(null);
  const [product, setProduct] = useState(EMPTY_PRODUCT);

  // --- READ ---
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/allproducts');
      const data = await response.json();
      setProductsList(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // --- Form Handlers ---
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const resetForm = () => {
    setProduct(EMPTY_PRODUCT);
    setImageFile(null);
    setEditingId(null);
    setActiveTab('basic');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // --- CREATE & UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append every field — compact JSON fields to a single line to avoid
    // multipart boundary issues with newlines inside field values
    Object.entries(product).forEach(([key, val]) => {
      if (key === 'images') return; // handled separately below
      if (key === 'reviews' || key === 'tags') {
        // Validate reviews is proper JSON before sending; tags stays as plain text
        if (key === 'reviews') {
          if (!val || val.trim() === '') return; // skip empty reviews
          try {
            const parsed = JSON.parse(val);
            // Compact to single line — no newlines inside multipart field value
            formData.append(key, JSON.stringify(parsed));
          } catch {
            alert('Reviews must be valid JSON. Please check the format.');
            return;
          }
        } else {
          // tags — plain comma-separated string, safe to send as-is
          formData.append(key, val);
        }
        return;
      }
      formData.append(key, val);
    });

    if (imageFile) {
      formData.append('imageFile', imageFile);
    } else {
      formData.append('images', product.images);
    }

    try {
      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : 'http://localhost:5000/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });

      if (response.ok) {
        alert(`Product successfully ${editingId ? 'updated' : 'added'}!`);
        fetchProducts();
        handleCloseModal();
      } else {
        alert("Error saving product.");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // --- EDIT Trigger ---
  const handleEditClick = (prod) => {
    setEditingId(prod.id);
    setProduct({
      title: prod.title || '',
      price: prod.price || '',
      description: prod.description || '',
      category: prod.category || '',
      brand: prod.brand || '',
      sku: prod.sku || '',
      stock: prod.stock || '',
      weight: prod.weight || '',
      discountPercentage: prod.discountPercentage || '',
      rating: prod.rating || '',
      availabilityStatus: prod.availabilityStatus || 'In Stock',
      warrantyInformation: prod.warrantyInformation || '',
      shippingInformation: prod.shippingInformation || '',
      returnPolicy: prod.returnPolicy || '',
      minimumOrderQuantity: prod.minimumOrderQuantity || '',
      tags: prod.tags || '',
      images: prod.images || '',
      thumbnail: prod.thumbnail || '',
      dimensions: prod.dimensions || '{"width":"","height":"","depth":""}',
      reviews: prod.reviews || '',
    });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // --- DELETE ---
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

  // Normalize image for table preview
  const getThumb = (prod) => {
    const raw = prod.thumbnail || prod.images || '';
    const img = Array.isArray(raw) ? raw[0] : raw;
    return img.startsWith('http') ? img : `http://localhost:5000/${img}`;
  };

  return (
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <h1>Product Dashboard</h1>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          + Add New Product
        </button>
      </div>

      {/* TABLE */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Title</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsList.map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>
                  <img src={getThumb(prod)} alt={prod.title} className="product-thumbnail" />
                </td>
                <td>{prod.title}</td>
                <td>{prod.brand || '—'}</td>
                <td>{prod.category}</td>
                <td>₹{Number(prod.price).toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {prod.stock > 0 ? prod.stock : 'Out'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-edit" onClick={() => handleEditClick(prod)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDeleteClick(prod.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-wide">

            <div className="modal-top-bar">
              <h2 className="modal-header">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            {/* TABS */}
            <div className="modal-tabs">
              {['basic', 'pricing', 'logistics', 'media'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'basic' && '📦 Basic Info'}
                  {tab === 'pricing' && '💰 Pricing & Stock'}
                  {tab === 'logistics' && '🚚 Logistics'}
                  {tab === 'media' && '🖼️ Media'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>

              {/* TAB: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="tab-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Product Title *</label>
                      <input type="text" name="title" placeholder="e.g. iPhone 15 Pro" value={product.title} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brand</label>
                      <input type="text" name="brand" placeholder="e.g. Apple" value={product.brand} onChange={handleChange} className="form-input" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <input type="text" name="category" placeholder="e.g. smartphones" value={product.category} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input type="text" name="sku" placeholder="e.g. APL-IPH-15-001" value={product.sku} onChange={handleChange} className="form-input" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags <span className="form-hint">(comma-separated)</span></label>
                    <input type="text" name="tags" placeholder='e.g. smartphone, apple, ios' value={product.tags} onChange={handleChange} className="form-input" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea name="description" placeholder="Full product description..." value={product.description} onChange={handleChange} required className="form-input form-textarea" />
                  </div>
                </div>
              )}

              {/* TAB: PRICING & STOCK */}
              {activeTab === 'pricing' && (
                <div className="tab-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Price (₹) *</label>
                      <input type="number" name="price" placeholder="0.00" step="0.01" min="0" value={product.price} onChange={handleChange} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount %</label>
                      <input type="number" name="discountPercentage" placeholder="0.00" step="0.01" min="0" max="100" value={product.discountPercentage} onChange={handleChange} className="form-input" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Stock Quantity</label>
                      <input type="number" name="stock" placeholder="0" min="0" value={product.stock} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Min. Order Quantity</label>
                      <input type="number" name="minimumOrderQuantity" placeholder="1" min="1" value={product.minimumOrderQuantity} onChange={handleChange} className="form-input" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Availability Status</label>
                      <select name="availabilityStatus" value={product.availabilityStatus} onChange={handleChange} className="form-input">
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weight (g)</label>
                      <input type="number" name="weight" placeholder="0" min="0" value={product.weight} onChange={handleChange} className="form-input" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Rating <span className="form-hint">(0.00 – 5.00)</span></label>
                      <input type="number" name="rating" placeholder="0.00" step="0.01" min="0" max="5" value={product.rating} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dimensions <span className="form-hint">(JSON)</span></label>
                      <input type="text" name="dimensions" placeholder='{"width":"15","height":"13","depth":"23"}' value={product.dimensions} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LOGISTICS */}
              {activeTab === 'logistics' && (
                <div className="tab-content">
                  <div className="form-group">
                    <label className="form-label">Warranty Information</label>
                    <input type="text" name="warrantyInformation" placeholder="e.g. 1 year warranty" value={product.warrantyInformation} onChange={handleChange} className="form-input" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipping Information</label>
                    <input type="text" name="shippingInformation" placeholder="e.g. Ships in 3-5 business days" value={product.shippingInformation} onChange={handleChange} className="form-input" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Return Policy</label>
                    <input type="text" name="returnPolicy" placeholder="e.g. 30-day return policy" value={product.returnPolicy} onChange={handleChange} className="form-input" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Reviews <span className="form-hint">(JSON array — leave blank to skip)</span>
                      {product.reviews && product.reviews.trim() !== '' && (() => {
                        try { JSON.parse(product.reviews); return <span className="json-valid">✓ Valid JSON</span>; }
                        catch { return <span className="json-invalid">✕ Invalid JSON</span>; }
                      })()}
                    </label>
                    <textarea
                      name="reviews"
                      placeholder='[{"rating":5,"comment":"Great!","reviewerName":"John","date":"2025-01-01T00:00:00.000Z"}]'
                      value={product.reviews}
                      onChange={handleChange}
                      className={`form-input form-textarea ${
                        product.reviews && product.reviews.trim() !== ''
                          ? (() => { try { JSON.parse(product.reviews); return 'input-valid'; } catch { return 'input-invalid'; } })()
                          : ''
                      }`}
                      style={{ minHeight: '110px', fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}

              {/* TAB: MEDIA */}
              {activeTab === 'media' && (
                <div className="tab-content">
                  <div className="image-upload-box">
                    <label className="form-label">Upload Product Image</label>
                    <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} />
                    {imageFile && <p className="upload-preview-name">Selected: {imageFile.name}</p>}
                    <div className="upload-divider">OR</div>
                    <label className="form-label">Image URL</label>
                    <input type="text" name="images" placeholder="https://cdn.example.com/product.webp" value={product.images} onChange={handleChange} className="form-input" />
                  </div>

                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label className="form-label">Thumbnail URL</label>
                    <input type="text" name="thumbnail" placeholder="https://cdn.example.com/thumbnail.webp" value={product.thumbnail} onChange={handleChange} className="form-input" />
                    {(product.thumbnail || product.images) && (
                      <div className="image-preview-wrap">
                        <img
                          src={product.thumbnail || product.images}
                          alt="preview"
                          className="image-preview"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

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
