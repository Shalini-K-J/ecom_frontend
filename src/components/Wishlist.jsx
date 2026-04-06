import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Wishlist.css'
import { showToast } from './Toast'

function Wishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(loggedIn)

    if (!loggedIn) {
      navigate('/login')
      return
    }

    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(savedWishlist)
  }, [navigate])

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId)
    setWishlist(updatedWishlist)
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    showToast('Product removed from wishlist!', 'success')
  }

  const addToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    // Get existing cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if product already exists
    const existingIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingIndex >= 0) {
      // Increase quantity if product exists
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1
    } else {
      // Add new product with quantity 1
      cart.push({ ...product, quantity: 1 })
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    showToast('Product added to cart!', 'success')
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1 className="wishlist-title">My Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-icon">🤍</div>
            <h2>Your wishlist is empty</h2>
            <p>Add products you love to your wishlist</p>
            <Link to="/products" className="shop-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <div key={product.id} className="wishlist-card">
                <Link to={`/products/${product.id}`} className="wishlist-image">
                  {product.image.startsWith('http') ? (
                    <img src={product.image} alt={product.name} className="wishlist-img" />
                  ) : (
                    <span className="wishlist-emoji">{product.image}</span>
                  )}
                </Link>
                <div className="wishlist-info">
                  <span className="wishlist-category">{product.category}</span>
                  <h3 className="wishlist-name">{product.name}</h3>
                  <div className="wishlist-price">
                    <span className="price">₹</span>
                    <span className="price-value">{product.price}</span>
                  </div>
                  <div className="wishlist-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
