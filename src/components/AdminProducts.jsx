import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaImage, FaTag, FaCube, FaAlignLeft } from 'react-icons/fa'
import { productAPI } from '../services/api'
import './AdminProducts.css'
import { showToast } from './Toast'

function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: '',
    gst: '18',
    profit: '',
    brand: '',
    sku: ''
  })

  const categories = [
    'Electronics', 'Fashion', 'Home', 'Sports', 'Fitness', 
    'Books', 'Toys', 'Accessories', 'Stationery', 'Office', 'Lifestyle', 'Other'
  ]

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      navigate('/admin-login')
      return
    }
    
    // Check if admin
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (userData.role !== 'admin') {
      navigate('/')
      return
    }
    
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll()
      if (response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      stock: parseInt(formData.stock) || 0,
      gst: parseInt(formData.gst) || 18,
      profit: parseInt(formData.profit) || 0,
      brand: formData.brand,
      sku: formData.sku
    }

    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, productData)
        showToast('Product updated successfully!', 'success')
      } else {
        await productAPI.create(productData)
        showToast('Product added successfully!', 'success')
      }
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      showToast('Error saving product. Please try again.', 'error')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      stock: product.stock || '',
      gst: product.gst || '18',
      profit: product.profit || '',
      brand: product.brand || '',
      sku: product.sku || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId)
        loadProducts()
        showToast('Product deleted successfully!', 'success')
      } catch (error) {
        console.error('Error deleting product:', error)
        showToast('Error deleting product. Please try again.', 'error')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      image: '',
      stock: '',
      gst: '18',
      profit: '',
      brand: '',
      sku: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
  }

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h1>Manage Products</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FaPlus /> {showAddForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="product-form-container">
          <h2>
            <FaCube /> {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label><FaCube /> Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label><FaTag /> Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>₹ Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>SKU / Item Code</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., PROD-001"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Pricing & Stock</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>GST (%)</label>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleInputChange}
                    placeholder="18"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Profit (%)</label>
                  <input
                    type="number"
                    name="profit"
                    value={formData.profit}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><FaAlignLeft /> Description</h3>
              <div className="form-group">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-section">
              <h3><FaImage /> Product Image</h3>
              <div className="form-group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
                <div className="image-preview-container">
                  {formData.image ? (
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                      <button type="button" className="remove-image" onClick={() => setFormData({...formData, image: ''})}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="no-image-preview">
                      <FaImage />
                      <p>No image selected</p>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Or enter image URL"
                  className="image-url-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <FaPlus /> {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-list">
        <h2>All Products ({products.length})</h2>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found. Add your first product!</p>
          </div>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>GST</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="product-thumbnail" />
                      ) : (
                        <span className="no-image"><FaImage /></span>
                      )}
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <strong>{product.name}</strong>
                        {product.brand && <span className="brand">{product.brand}</span>}
                      </div>
                    </td>
                    <td><span className="category-badge">{product.category}</span></td>
                    <td className="price-cell">₹{product.price?.toFixed(2)}</td>
                    <td>{product.gst || 18}%</td>
                    <td>
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="edit-btn"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
