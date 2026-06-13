import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaShoppingCart, FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa'
import { productAPI, wishlistAPI, cartAPI } from '../services/api'
import './Products.css'
import { showToast } from './Toast'

const initialProducts = [
  { id: 1, name: 'Wireless Headphones', price: 299, originalPrice: 599, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', gst: 18, profit: 20, description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear sound quality. Perfect for music lovers and professionals.' },
  { id: 2, name: 'Smart Watch', price: 199, originalPrice: 399, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', gst: 18, profit: 25, description: 'Advanced smart watch with heart rate monitoring, fitness tracking, and smartphone notifications. Water-resistant and stylish design.' },
  { id: 3, name: 'Leather Bag', price: 149, originalPrice: 299, category: 'Fashion', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', gst: 12, profit: 30, description: 'Genuine leather messenger bag with multiple compartments. Perfect for work or travel, durable and elegant.' },
  { id: 4, name: 'Running Shoes', price: 129, originalPrice: 259, category: 'Sports', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', gst: 18, profit: 22, description: 'Lightweight running shoes with superior cushioning and grip. Ideal for athletes and fitness enthusiasts.' },
  { id: 5, name: 'Coffee Maker', price: 89, originalPrice: 179, category: 'Home', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', gst: 18, profit: 28, description: 'Automatic coffee maker with programmable timer. Brews delicious coffee in minutes with aromatic flavor.' },
  { id: 6, name: 'Yoga Mat', price: 49, originalPrice: 99, category: 'Fitness', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', gst: 12, profit: 35, description: 'Eco-friendly yoga mat with non-slip surface. Extra thick for comfort during workouts and meditation.' },
  { id: 7, name: 'Laptop Stand', price: 39, originalPrice: 79, category: 'Accessories', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', gst: 18, profit: 25, description: 'Ergonomic laptop stand with adjustable height. Improves posture and reduces neck strain while working.' },
  { id: 8, name: 'Water Bottle', price: 25, originalPrice: 50, category: 'Lifestyle', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', gst: 18, profit: 40, description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours.' },
  { id: 9, name: 'Bluetooth Speaker', price: 159, originalPrice: 319, category: 'Electronics', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', gst: 18, profit: 30, description: 'Portable Bluetooth speaker with powerful bass and 360-degree sound. Waterproof design for outdoor use.' },
  { id: 10, name: 'Fitness Tracker', price: 79, originalPrice: 159, category: 'Electronics', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400', gst: 18, profit: 35, description: 'Smart fitness band with step counter, sleep monitor, and heart rate sensor. Sleek design fits any style.' },
  { id: 11, name: 'Sunglasses', price: 89, originalPrice: 179, category: 'Fashion', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', gst: 12, profit: 45, description: 'UV400 protection sunglasses with polarized lenses. Stylish frames that provide complete eye protection.' },
  { id: 12, name: 'Backpack', price: 119, originalPrice: 239, category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', gst: 12, profit: 28, description: 'Durable backpack with laptop compartment and multiple pockets. Perfect for school, college, or travel.' },
  { id: 13, name: 'Tennis Racket', price: 189, originalPrice: 379, category: 'Sports', image: 'https://images.unsplash.com/photo-1617083934555-ac7b4d0c8be2?w=400', gst: 18, profit: 25, description: 'Professional-grade tennis racket with carbon fiber frame. Lightweight yet powerful for competitive play.' },
  { id: 14, name: 'Cricket Bat', price: 249, originalPrice: 499, category: 'Sports', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', gst: 18, profit: 22, description: 'Willow cricket bat with excellent stroke. Handcrafted for optimal balance and power hitting.' },
  { id: 15, name: 'LED Lamp', price: 45, originalPrice: 90, category: 'Home', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', gst: 18, profit: 40, description: 'Modern LED desk lamp with touch control and adjustable brightness. Energy-efficient with eye protection.' },
  { id: 16, name: 'Plant Pot', price: 35, originalPrice: 70, category: 'Home', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', gst: 12, profit: 50, description: 'Ceramic plant pot with drainage hole. Modern design adds elegance to any indoor space.' },
  { id: 17, name: 'Dumbbells Set', price: 299, originalPrice: 599, category: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', gst: 18, profit: 30, description: 'Adjustable dumbbells set ranging from 5-25 lbs. Perfect for home gym and strength training.' },
  { id: 18, name: 'Resistance Bands', price: 29, originalPrice: 59, category: 'Fitness', image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', gst: 12, profit: 55, description: 'Set of 5 resistance bands with different tension levels. Ideal for warm-up and strength exercises.' },
  { id: 19, name: 'Phone Case', price: 19, originalPrice: 39, category: 'Accessories', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', gst: 18, profit: 60, description: 'Shockproof phone case with precise cutouts. Premium protection with slim design.' },
  { id: 20, name: 'USB Cable', price: 15, originalPrice: 30, category: 'Accessories', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', gst: 18, profit: 65, description: 'Fast charging USB cable with durable nylon braid. Compatible with all USB-C devices.' },
  { id: 21, name: 'Notebook Set', price: 24, originalPrice: 49, category: 'Stationery', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', gst: 12, profit: 45, description: 'Set of 3 premium notebooks with high-quality paper. Perfect for journaling, notes, and sketching.' },
  { id: 22, name: 'Pen Set', price: 18, originalPrice: 36, category: 'Stationery', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', gst: 12, profit: 50, description: 'Luxury pen set with ballpoint and rollerball pens. Smooth writing experience with elegant design.' },
  { id: 23, name: 'Desk Organizer', price: 39, originalPrice: 79, category: 'Office', image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400', gst: 18, profit: 35, description: 'Multi-compartment desk organizer for pens, cards, and accessories. Keeps your workspace tidy.' },
  { id: 24, name: 'Wall Clock', price: 59, originalPrice: 119, category: 'Home', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400', gst: 18, profit: 40, description: 'Modern silent wall clock with large numbers. Battery operated with sleek frame design.' }
]

function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [cartCount, setCartCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  // Load products on mount
  useEffect(() => {
    loadProducts()
    
    // Check login status
    const userData = localStorage.getItem('userData')
    if (userData) {
      setIsLoggedIn(true)
      const parsedUser = JSON.parse(userData)
      loadWishlist(parsedUser.id)
      loadCart(parsedUser.id)
    }
  }, [])

  // Apply filters and search
  useEffect(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      result = result.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Price filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll()
      if (response.data && response.data.length > 0) {
        setProducts(response.data)
      } else {
        // If no products in DB, use initial and save to DB
        setProducts(initialProducts)
        // Save initial products to database
        for (const product of initialProducts) {
          await productAPI.create(product)
        }
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts(initialProducts)
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
        // Find the item in wishlist
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

  // Cart functions
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
    <div className="products-container">
      <div className="products-header">
        <h1>All Products</h1>
        <p className="products-count">{filteredProducts.length} products available</p>
      </div>

      {/* Filter Panel */}
      <div className="filter-section">
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filters {showFilters ? '▲' : '▼'}
        </button>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label><FaSearch /> Search:</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
              <div className="price-range-inputs">
                <input
                  type="number"
                  min="0"
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  placeholder="Min"
                  className="price-input"
                />
                <span>to</span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  placeholder="Max"
                  className="price-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label><FaSortAmountDown /> Sort By:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setPriceRange([0, 1000])
                setSortBy('default')
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000) && (
        <div className="active-filters">
          <span>Active Filters:</span>
          {searchQuery && <span className="filter-tag">Search: {searchQuery}</span>}
          {selectedCategory !== 'all' && <span className="filter-tag">Category: {selectedCategory}</span>}
          {(priceRange[0] > 0 || priceRange[1] < 1000) && <span className="filter-tag">Price: ₹{priceRange[0]} - ₹{priceRange[1]}</span>}
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.map(product => (
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
              <p className="product-description">{product.description}</p>
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
    </div>
  )
}

export default Products
