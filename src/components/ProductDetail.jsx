import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaShoppingCart, FaArrowLeft, FaShareAlt, FaWhatsapp, FaTwitter, FaFacebook, FaMinus, FaPlus, FaExpand, FaTruck, FaCheck, FaTimes, FaBolt } from 'react-icons/fa'
import { productAPI, wishlistAPI, cartAPI } from '../services/api'
import { showToast } from './Toast'
import './ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [similarProducts, setSimilarProducts] = useState([])
  const [pincode, setPincode] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState(null) // null, 'deliverable', 'not-deliverable'
  const [checkingDelivery, setCheckingDelivery] = useState(false)

  // Calculate original price if not available (show 50% discount)
  const originalPrice = product?.originalPrice || (product ? product.price * 2 : 0)
  const discountPercent = product ? Math.round((1 - product.price / originalPrice) * 100) : 0

  useEffect(() => {
    loadProduct()
    checkLoginStatus()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll()
      if (response.data && response.data.length > 0) {
        // Find product by ID (handle both _id and id)
        const foundProduct = response.data.find(p => 
          p._id === id || p.id === id || p._id === parseInt(id)
        )
        if (foundProduct) {
          setProduct(foundProduct)
          
          // Load similar products (same category, excluding current product)
          const similar = response.data.filter(p => 
            p.category === foundProduct.category && 
            p._id !== foundProduct._id && 
            p.id !== foundProduct.id
          ).slice(0, 4)
          setSimilarProducts(similar)
        } else {
          showToast('Product not found', 'error')
          navigate('/products')
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      showToast('Error loading product', 'error')
    } finally {
      setLoading(false)
    }
  }

  const checkDelivery = () => {
    if (!pincode || pincode.length !== 6) {
      showToast('Please enter a valid 6-digit pincode', 'error')
      return
    }
    
    setCheckingDelivery(true)
    // Simulate API call - in real app, check against serviceable pincodes
    setTimeout(() => {
      // Example: pincodes starting with 1, 2, 3, 4, 5 are deliverable
      const firstDigit = parseInt(pincode[0])
      if (firstDigit >= 1 && firstDigit <= 7) {
        setDeliveryStatus('deliverable')
        showToast('Delivery available!', 'success')
      } else {
        setDeliveryStatus('not-deliverable')
        showToast('Sorry, delivery not available to this location', 'error')
      }
      setCheckingDelivery(false)
    }, 1000)
  }

  const buyNow = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (!userData.id) return

    try {
      // Clear cart and add only this product
      await cartAPI.addToCart(userData.id, {
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      })
      // Also update localStorage
      localStorage.setItem('cart', JSON.stringify([{ 
        ...product, 
        id: product._id || product.id, 
        quantity: quantity 
      }]))
      showToast('Redirecting to checkout...', 'success')
      // Navigate to payment/checkout page
      navigate('/payment')
    } catch (error) {
      console.error('Error in buy now:', error)
      showToast('Failed to proceed. Please try again.', 'error')
    }
  }

  const checkLoginStatus = () => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      setIsLoggedIn(true)
      const parsedUser = JSON.parse(userData)
      loadWishlist(parsedUser.id)
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

  const isProductInWishlist = () => {
    return wishlist.some(item => 
      item.productId === (product?._id || product?.id) || 
      item.productId?._id === (product?._id || product?.id)
    )
  }

  const toggleWishlist = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (!userData.id) return

    try {
      if (isProductInWishlist()) {
        const wishlistItem = wishlist.find(item => 
          item.productId === (product._id || product.id) || 
          item.productId?._id === (product._id || product.id)
        )
        if (wishlistItem) {
          await wishlistAPI.removeItem(userData.id, wishlistItem._id)
          // Also update localStorage
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
        // Also save to localStorage
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

  const addToCart = async () => {
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
        quantity: quantity
      })
      // Also update localStorage for Cart page
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingIndex = existingCart.findIndex(item => item.id === (product._id || product.id))
      if (existingIndex >= 0) {
        existingCart[existingIndex].quantity = (existingCart[existingIndex].quantity || 1) + quantity
      } else {
        existingCart.push({ ...product, id: product._id || product.id, quantity: quantity })
      }
      localStorage.setItem('cart', JSON.stringify(existingCart))
      showToast(`Added ${quantity} item(s) to cart!`, 'success')
      loadCart(userData.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Failed to add to cart. Please try again.', 'error')
    }
  }

  const loadCart = async (userId) => {
    try {
      const response = await cartAPI.getCart(userId)
      if (response.data && response.data.items) {
        const totalItems = response.data.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
        // Update cart count in navbar
        if (window.updateCartCount) {
          window.updateCartCount(totalItems)
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const handleShare = (platform) => {
    const productUrl = window.location.href
    const productName = product.name
    const productPrice = `₹${product.price}`
    
    let shareUrl = ''
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=Check out this product: ${productName} - ${productPrice} ${productUrl}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=Check out this product: ${productName} - ${productPrice}&url=${productUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`
        break
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(`${productName} - ${productPrice} ${productUrl}`)
        showToast('Link copied to clipboard!', 'success')
        setShowShareMenu(false)
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1) {
      setQuantity(value)
    } else if (e.target.value === '') {
      setQuantity(1)
    }
  }

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Product Not Found</h2>
        <Link to="/products" className="back-to-products-btn">
          <FaArrowLeft /> Back to Products
        </Link>
      </div>
    )
  }

  const totalPrice = product.price * quantity

  return (
    <div className="product-detail-container">
      <div className="product-detail-wrapper">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="product-detail-content">
          {/* Product Image */}
          <div className="product-detail-image">
            <img 
              src={product.image} 
              alt={product.name} 
              onClick={() => setShowImageModal(true)}
              style={{ cursor: 'pointer' }}
            />
            <button 
              className="expand-image-btn"
              onClick={() => setShowImageModal(true)}
              title="View Full Image"
            >
              <FaExpand />
            </button>
          </div>

          {/* Image Lightbox Modal */}
          {showImageModal && (
            <div className="image-modal" onClick={() => setShowImageModal(false)}>
              <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={() => setShowImageModal(false)}>×</button>
                <img src={product.image} alt={product.name} />
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="product-detail-info">
            <div className="product-detail-category">{product.category}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            
            <div className="product-detail-price">
              <span className="current-price">₹{product.price.toFixed(2)}</span>
              <span className="original-price">₹{originalPrice.toFixed(2)}</span>
              <span className="discount-badge">{discountPercent}% OFF</span>
            </div>

            <div className="product-detail-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <span className="quantity-label">Quantity:</span>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                />
                <button 
                  className="quantity-btn" 
                  onClick={incrementQuantity}
                >
                  <FaPlus />
                </button>
              </div>
              <span className="total-price">Total: ₹{totalPrice.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="product-detail-actions">
              <button 
                className="add-to-cart-detail-btn"
                onClick={addToCart}
              >
                <FaShoppingCart /> Add to Cart
              </button>
              <button 
                className="buy-now-detail-btn"
                onClick={buyNow}
              >
                <FaBolt /> Buy Now
              </button>
              <button 
                className={`wishlist-detail-btn ${isProductInWishlist() ? 'active' : ''}`}
                onClick={toggleWishlist}
              >
                {isProductInWishlist() ? <FaHeart /> : <FaRegHeart />}
                {isProductInWishlist() ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Delivery Check Section */}
            <div className="delivery-check-section">
              <div className="delivery-check-header">
                <FaTruck /> Check Delivery Availability
              </div>
              <div className="delivery-check-form">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setPincode(val)
                    setDeliveryStatus(null)
                  }}
                  className="pincode-input"
                  maxLength={6}
                />
                <button 
                  className="check-delivery-btn"
                  onClick={checkDelivery}
                  disabled={checkingDelivery || pincode.length !== 6}
                >
                  {checkingDelivery ? 'Checking...' : 'Check'}
                </button>
              </div>
              {deliveryStatus === 'deliverable' && (
                <div className="delivery-status deliverable">
                  <FaCheck /> Delivery available! Usually delivered in 3-5 business days.
                </div>
              )}
              {deliveryStatus === 'not-deliverable' && (
                <div className="delivery-status not-deliverable">
                  <FaTimes /> Sorry, delivery not available to this pincode.
                </div>
              )}
            </div>

            {/* Share Section */}
            <div className="share-section">
              <button 
                className="share-btn"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <FaShareAlt /> Share Product
              </button>
              
              {showShareMenu && (
                <div className="share-menu">
                  <button onClick={() => handleShare('whatsapp')}>
                    <FaWhatsapp /> WhatsApp
                  </button>
                  <button onClick={() => handleShare('twitter')}>
                    <FaTwitter /> Twitter
                  </button>
                  <button onClick={() => handleShare('facebook')}>
                    <FaFacebook /> Facebook
                  </button>
                  <button onClick={() => handleShare('copy')}>
                    📋 Copy Link
                  </button>
                </div>
              )}
            </div>

            {/* Product Meta Info */}
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Discount:</span>
                <span className="meta-value">{discountPercent}% OFF</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Save:</span>
                <span className="meta-value">₹{(originalPrice - product.price).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2 className="similar-products-title">Similar Products</h2>
          <div className="similar-products-grid">
            {similarProducts.map(similar => (
              <Link 
                to={`/products/${similar._id || similar.id}`} 
                key={similar._id || similar.id}
                className="similar-product-card"
              >
                <div className="similar-product-image">
                  <img src={similar.image} alt={similar.name} />
                </div>
                <div className="similar-product-info">
                  <h3>{similar.name}</h3>
                  <div className="similar-product-price">
                    <span className="current-price">₹{similar.price.toFixed(2)}</span>
                    <span className="discount-badge">
                      {Math.round((1 - similar.price / ((similar.originalPrice || similar.price * 2))) * 100)}% OFF
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
