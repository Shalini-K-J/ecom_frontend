import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa'
import { productAPI, wishlistAPI, cartAPI } from '../services/api'
import './Home.css'
import { showToast } from './Toast'

function Home() {
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(loggedIn)
    
    // Load products from backend
    loadProducts()
    
    if (loggedIn) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      if (userData.id) {
        loadWishlist(userData.id)
        loadCart(userData.id)
      }
    }
  }, [])

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll()
      if (response.data) {
        setProducts(response.data.slice(0, 6)) // Show first 6 products
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadWishlist = async (userId) => {
    try {
      const response = await wishlistAPI.getWishlist(userId)
      if (response.data) {
        setWishlist(response.data.items || [])
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
    }
  }

  const loadCart = async (userId) => {
    try {
      const response = await cartAPI.getCart(userId)
      if (response.data && response.data.items) {
        const totalItems = response.data.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartCount(totalItems)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  // Wishlist functions
  const isProductInWishlist = (productId) => {
    return wishlist.some(item => item.productId === productId || item.productId?._id === productId)
  }

  const toggleWishlist = async (product) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (!userData.id) return

    try {
      if (isProductInWishlist(product._id || product.id)) {
        const wishlistItem = wishlist.find(item => item.productId === (product._id || product.id) || item.productId?._id === (product._id || product.id))
        if (wishlistItem) {
          await wishlistAPI.removeItem(userData.id, wishlistItem._id)
          // Also update localStorage for Wishlist page
          const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
          const updatedWishlist = existingWishlist.filter(item => item.id !== (product._id || product.id))
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
          setWishlist(updatedWishlist)
          showToast('Product removed from wishlist!', 'success')
        }
      } else {
        await wishlistAPI.addToWishlist(userData.id, {
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          image: product.image
        })
        // Also save to localStorage for Wishlist page
        const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
        existingWishlist.push({ ...product, id: product._id || product.id })
        localStorage.setItem('wishlist', JSON.stringify(existingWishlist))
        setWishlist(existingWishlist)
        showToast('Product added to wishlist!', 'success')
      }
      loadWishlist(userData.id)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      showToast('Failed to update wishlist. Please try again.', 'error')
    }
  }

  const addToCart = async (product) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (!userData.id) return

    try {
      await cartAPI.addToCart(userData.id, {
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
      // Also save to localStorage for Cart page compatibility
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingIndex = existingCart.findIndex(item => item.id === (product._id || product.id))
      if (existingIndex >= 0) {
        existingCart[existingIndex].quantity = (existingCart[existingIndex].quantity || 1) + 1
      } else {
        existingCart.push({ ...product, id: product._id || product.id, quantity: 1 })
      }
      localStorage.setItem('cart', JSON.stringify(existingCart))
      showToast('Product added to cart!', 'success')
      loadCart(userData.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Failed to add to cart. Please try again.', 'error')
    }
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Our Store</h1>
        <p>Discover amazing products at incredible prices</p>
        <div className="hero-buttons">
          <Link to="/products" className="hero-button">
            View All Products
          </Link>
          <Link to="/3d-sphere" className="hero-button secondary">
            🎮 Try 3D Sphere
          </Link>
        </div>
      </div>

      <div className="featured-products">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product._id || product.id} className="product-card">
              <Link to={`/products/${product._id || product.id}`} className="product-image">
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h2 className="product-name">{product.name}</h2>
                <div className="price-container">
                  <span className="product-price">₹{product.price.toFixed(2)}</span>
                  {((product.originalPrice) || product.price * 2) && (
                    <span className="discount-badge">
                      {Math.round((1 - product.price / (product.originalPrice || product.price * 2)) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="product-actions">
                  <button 
                    className="add-to-cart-button"
                    onClick={() => addToCart(product)}
                  >
                    <FaShoppingCart className="cart-icon" />
                    Add to Cart
                  </button>
                  <button 
                    className={`wishlist-button ${isProductInWishlist(product._id || product.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product)}
                    title={isProductInWishlist(product._id || product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {isProductInWishlist(product._id || product.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/products" className="view-all-button">
          View All Products →
        </Link>
      </div>
    </div>
  )
}

export default Home
