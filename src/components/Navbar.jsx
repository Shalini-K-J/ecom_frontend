import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser, FaSignInAlt, FaSignOutAlt, FaHome, FaInfoCircle, FaBox, FaBlog, FaEnvelope, FaBoxOpen, FaCog, FaHeart, FaSearch } from 'react-icons/fa'
import { productAPI } from '../services/api'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [allowedPages, setAllowedPages] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [allProducts, setAllProducts] = useState([])

  const refreshNavbar = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Expose refresh function globally for other components to call
  useEffect(() => {
    window.refreshNavbar = refreshNavbar
    
    // Load all products for search
    const loadProductsForSearch = async () => {
      try {
        const data = await productAPI.getAll()
        if (data.data) {
          setAllProducts(data.data)
        }
      } catch (error) {
        console.error('Error loading products for search:', error)
      }
    }
    loadProductsForSearch()
    
    return () => {
      delete window.refreshNavbar
    }
  }, [])

  useEffect(() => {
    // Check login status from localStorage
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
      setIsLoggedIn(loggedIn)
      
      // Check admin role - both from userData and isAdminUser flag
      const isAdminUser = localStorage.getItem('isAdminUser') === 'true'
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      setIsAdmin(userData.role === 'admin' || isAdminUser)
      
      // Load cart count from localStorage (sum quantities)
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      setCartCount(totalItems)
      
      // Load user permissions from userData (set during login from database)
      // Also check isAdminUser flag
      const isAdminFlag = localStorage.getItem('isAdminUser') === 'true'
      
      if (isAdminFlag) {
        // Admin user - hide regular user pages
        setAllowedPages({})
        setIsAdmin(true)
      } else if (loggedIn && userData.email) {
        // Get permissions from userData which comes from database login
        if (userData.permissions) {
          setAllowedPages(userData.permissions)
          // Check if user is admin based on permissions or role
          setIsAdmin(userData.role === 'admin' || userData.permissions.adminDashboard === true)
        } else {
          // Default: all pages enabled
          setAllowedPages({
            home: true,
            about: true,
            products: true,
            blog: true,
            contact: true,
            cart: true,
            wishlist: true,
            'order-tracking': true,
            profile: true,
            checkout: true
          })
          // Check role for admin
          setIsAdmin(userData.role === 'admin')
        }
      } else {
        // Default: all pages enabled for non-logged in users (except private pages)
        setAllowedPages({
          home: true,
          about: true,
          products: true,
          blog: true,
          contact: true,
          cart: true,
          wishlist: false,
          'order-tracking': false,
          profile: false,
          checkout: false
        })
      }
    }
    
    // Initial check
    checkLoginStatus()
    
    // Listen for storage changes (when localStorage is updated in other tabs/components)
    window.addEventListener('storage', checkLoginStatus)
    
    // Listen for focus events (when user returns to the tab)
    window.addEventListener('focus', checkLoginStatus)
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus)
      window.removeEventListener('focus', checkLoginStatus)
    }
  }, [location, refreshKey])

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', 'false')
    localStorage.setItem('isAdminUser', 'false')
    setIsLoggedIn(false)
    setShowDropdown(false)
    // Refresh navbar to update login state
    if (window.refreshNavbar) {
      window.refreshNavbar()
    }
    navigate('/')
  }

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim().length > 0) {
      const filtered = allProducts.filter(product =>
        product.name?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 8)) // Show max 8 results
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }

  const handleSearchResultClick = (product) => {
    setSearchQuery('')
    setShowSearch(false)
    // Navigate to products page with the product name as search term
    navigate(`/products?search=${encodeURIComponent(product.name)}`)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaShoppingCart className="logo-icon" />
          <span className="logo-text">Wow Cart</span>
        </Link>
        
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery && setShowSearch(true)}
              className="navbar-search-input"
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(product => (
                <div 
                  key={product._id || product.id} 
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(product)}
                >
                  <img src={product.image} alt={product.name} className="search-result-img" />
                  <div className="search-result-info">
                    <span className="search-result-name">{product.name}</span>
                    <span className="search-result-price">₹{product.price}</span>
                  </div>
                </div>
              ))}
              <div 
                className="search-result-view-all"
                onClick={() => {
                  navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
                  setShowSearch(false)
                }}
              >
                View all results
              </div>
            </div>
          )}
        </form>
        
        <ul className="navbar-menu">
          {allowedPages.home !== false && (
          <li className="navbar-item">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className="nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          )}
          {allowedPages.about !== false && (
          <li className="navbar-item">
            <Link 
              to="/about" 
              className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
            >
              <FaInfoCircle className="nav-icon" />
              <span>About</span>
            </Link>
          </li>
          )}
          {allowedPages.products !== false && (
          <li className="navbar-item">
            <Link 
              to="/products" 
              className={`navbar-link ${isActive('/products') ? 'active' : ''}`}
            >
              <FaBox className="nav-icon" />
              <span>Products</span>
            </Link>
          </li>
          )}
          {allowedPages.blog !== false && (
          <li className="navbar-item">
            <Link 
              to="/blog" 
              className={`navbar-link ${isActive('/blog') ? 'active' : ''}`}
            >
              <FaBlog className="nav-icon" />
              <span>Blog</span>
            </Link>
          </li>
          )}
          {allowedPages.contact !== false && (
          <li className="navbar-item">
            <Link 
              to="/contact" 
              className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}
            >
              <FaEnvelope className="nav-icon" />
              <span>Contact</span>
            </Link>
          </li>
          )}
          
          {isAdmin && allowedPages.adminDashboard !== false && (
            <li className="navbar-item">
              <Link 
                to="/admin" 
                className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <FaCog className="nav-icon" />
                <span>Admin</span>
              </Link>
            </li>
          )}
          
          {isLoggedIn ? (
            <li className="navbar-item user-profile-container">
              <button 
                className={`navbar-link user-profile-btn ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUser className="nav-icon" />
                <span>Profile</span>
              </button>
              {showDropdown && (
                <div className="user-dropdown">
                  
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaUser className="dropdown-icon" />
                    My Profile
                  </Link>
                  {allowedPages['order-tracking'] !== false && (
                  <Link to="/order-tracking" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaBoxOpen className="dropdown-icon" />
                    Order Tracking
                  </Link>
                  )}
                  {allowedPages.wishlist !== false && (
                  <Link to="/wishlist" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaHeart className="dropdown-icon" />
                    Wishlist
                  </Link>
                  )}
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li className="navbar-item">
              <Link 
                to="/login" 
                className={`navbar-link ${isActive('/login') || isActive('/signup') ? 'active' : ''}`}
              >
                <FaSignInAlt className="nav-icon" />
                <span>Login</span>
              </Link>
            </li>
          )}
          
          {allowedPages.cart !== false && (
          <li className="navbar-item">
            <Link to="/cart" className="navbar-link cart-link">
              <FaShoppingCart className="nav-icon cart-icon" />
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
