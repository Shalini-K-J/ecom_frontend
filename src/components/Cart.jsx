import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Cart.css'
import { showToast } from './Toast'

function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [sameAddress, setSameAddress] = useState(true)
  const [showPlaceOrder, setShowPlaceOrder] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Check login status
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(loggedIn)
    
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(savedCart)
    
    // Calculate subtotal (without GST)
    const sub = savedCart.reduce((sum, item) => {
      const qty = item.quantity || 1
      return sum + (item.price * qty)
    }, 0)
    setSubtotal(sub)
    
    // Load saved addresses
    const addresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
    setSavedAddresses(addresses)
    
    // Load recently viewed items
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    setRecentlyViewed(viewed.slice(0, 4)) // Show max 4 items
  }, [])

  const calculateItemTotal = (item) => {
    const qty = item.quantity || 1
    return item.price * qty
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const updateQuantity = (index, change) => {
    const newCart = [...cartItems]
    const newQty = (newCart[index].quantity || 1) + change
    
    if (newQty <= 0) {
      // Remove item if quantity becomes 0
      newCart.splice(index, 1)
    } else {
      newCart[index].quantity = newQty
    }
    
    setCartItems(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    
    const sub = newCart.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    setSubtotal(sub)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    
    if (!sameAddress) {
      if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required'
      if (!formData.deliveryCity.trim()) newErrors.deliveryCity = 'City is required'
      if (!formData.deliveryState.trim()) newErrors.deliveryState = 'State is required'
      if (!formData.deliveryPincode.trim()) newErrors.deliveryPincode = 'Pincode is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    
    if (!validateForm()) {
      setShowAddressForm(true)
      return
    }
    
    // Save address to localStorage
    const orderAddress = {
      ...formData,
      sameAddress,
      deliveryAddress: sameAddress ? formData.address : formData.deliveryAddress,
      deliveryCity: sameAddress ? formData.city : formData.deliveryCity,
      deliveryState: sameAddress ? formData.state : formData.deliveryState,
      deliveryPincode: sameAddress ? formData.pincode : formData.deliveryPincode
    }
    localStorage.setItem('orderAddress', JSON.stringify(orderAddress))
    navigate('/payment')
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const removeFromCart = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index)
    setCartItems(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    
    const sub = newCart.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    setSubtotal(sub)
  }

  const handlePlaceOrderClick = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setShowPlaceOrder(true)
  }

  const handleSelectAddress = (address) => {
    setSelectedAddress(address)
    setFormData({
      ...formData,
      name: address.name || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || ''
    })
  }

  const handleSaveNewAddress = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    const newAddress = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    }
    const updatedAddresses = [...savedAddresses, newAddress]
    setSavedAddresses(updatedAddresses)
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses))
    setShowNewAddressForm(false)
    setSelectedAddress(newAddress)
    showToast('Address saved successfully!', 'success')
  }

  const addToCartFromRecentlyViewed = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartItems(cart)
    const sub = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    setSubtotal(sub)
    showToast('Product added to cart!', 'success')
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>Shopping Cart</h1>
          <p className="cart-empty">Your cart is currently empty</p>
          <Link to="/products" className="continue-shopping">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <Link to={`/products/${item.id}`} className="cart-item-image">
                {item.image.startsWith('http') ? (
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                ) : (
                  <span className="cart-item-emoji">{item.image}</span>
                )}
              </Link>
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <span className="cart-item-category">{item.category}</span>
                <p className="cart-item-price">₹{item.price} each</p>
              </div>
              
              {/* Quantity Controls */}
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(index, -1)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity || 1}</span>
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(index, 1)}
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                ₹{calculateItemTotal(item).toFixed(2)}
              </div>
              
              <button 
                className="remove-btn" 
                onClick={() => removeFromCart(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Place Order Button - Before Address */}
        <button 
          className="place-order-btn"
          onClick={handlePlaceOrderClick}
        >
          Place Order
        </button>

        {/* Place Order Section - Address Selection */}
        {showPlaceOrder && (
          <div className="place-order-section">
            <h2>Select Delivery Address</h2>
            
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="saved-addresses">
                <h3>Saved Addresses</h3>
                <div className="address-cards">
                  {savedAddresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`address-card ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <p><strong>{addr.name}</strong></p>
                      <p>{addr.phone}</p>
                      <p>{addr.address}, {addr.city}</p>
                      <p>{addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
                 <label className="same-address-checkbox">
              <input
                type="checkbox"
                checked={sameAddress}
                onChange={(e) => setSameAddress(e.target.checked)}
              />
              Billing address same as shipping address
            </label>
              </div>
            )}
            
            {/* Add New Address Button */}
            {!showNewAddressForm ? (
              <button 
                className="add-new-address-btn"
                onClick={() => setShowNewAddressForm(true)}
              >
                + Add New Address
              </button>
            ) : (
              <div className="new-address-form">
                <h3>Add New Address</h3>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="form-group">
                  <label>Shipping Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button 
                    className="save-address-btn"
                    onClick={handleSaveNewAddress}
                  >
                    Save Address
                  </button>
                  <button 
                    className="cancel-address-btn"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Proceed Button */}
            {selectedAddress && (
              <button 
                className="proceed-btn"
                onClick={() => {
                  localStorage.setItem('orderAddress', JSON.stringify(selectedAddress))
                  navigate('/payment')
                }}
              >
                Proceed to Payment
              </button>
            )}
          </div>
        )}

        
        <Link to="/products" className="continue-shopping">Continue Shopping</Link>
        
        {/* Recently Viewed Items */}
        {recentlyViewed.length > 0 && (
          <div className="recently-viewed-section">
            <h2>Recently Viewed Items</h2>
            <div className="recently-viewed-grid">
              {recentlyViewed.map((item) => (
                <div key={item.id} className="recently-viewed-item">
                  <div className="recently-viewed-image">
                    {item.image.startsWith('http') ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span className="recently-viewed-emoji">{item.image}</span>
                    )}
                  </div>
                  <div className="recently-viewed-details">
                    <h4>{item.name}</h4>
                    <p className="recently-viewed-price">₹{item.price}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCartFromRecentlyViewed(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
