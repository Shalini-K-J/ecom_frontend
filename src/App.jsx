import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import AdminNavbar from './components/AdminNavbar'
import Home from './components/Home'
import About from './components/About'
import Products from './components/Products'
import Blog from './components/Blog'
import Contact from './components/Contact'
import Cart from './components/Cart'
import Wishlist from './components/Wishlist'
import Login from './components/Login'
import AdminLogin from './components/AdminLogin'
import Signup from './components/Signup'
import Profile from './components/Profile'
import OrderTracking from './components/OrderTracking'
import Payment from './components/Payment'
import AdminDashboard from './components/AdminDashboard'
import AdminProducts from './components/AdminProducts'
import Chatbot from './components/Chatbot'
import GlowingSphere from './components/GlowingSphere'
import ProductDetail from './components/ProductDetail'
import { ToastProvider } from './components/Toast'
import './App.css'

// Component to handle navbar based on route and admin status
function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdminUser, setIsAdminUser] = useState(false)
  
  const isAdminRoute = location.pathname.startsWith('/admin')
  const is3DSphereRoute = location.pathname === '/3d-sphere'
  
  // Check if user is admin (checks both isAdminUser flag and userData role)
  useEffect(() => {
    const checkAdminStatus = () => {
      // Check isAdminUser flag first
      const isAdminFlag = localStorage.getItem('isAdminUser') === 'true'
      
      // Also check userData role as fallback
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      const isAdminRole = userData.role === 'admin'
      
      setIsAdminUser(isAdminFlag || isAdminRole)
    }
    checkAdminStatus()
    
    // Listen for storage changes
    window.addEventListener('storage', checkAdminStatus)
    window.addEventListener('focus', checkAdminStatus)
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus)
      window.removeEventListener('focus', checkAdminStatus)
    }
  }, [])
  
  // Redirect admin users away from regular user pages
  useEffect(() => {
    // Check if current path is a regular user route
    const path = location.pathname
    const isRegularUserRoute = 
      path === '/' || 
      path === '/about' || 
      path === '/products' || 
      path.startsWith('/products/') || 
      path === '/blog' || 
      path === '/contact' || 
      path === '/cart' || 
      path === '/wishlist' || 
      path === '/profile' || 
      path === '/order-tracking' || 
      path === '/payment'
    
    // Allow admin to access these routes
    const allowedForAdmin = ['/admin-login', '/admin', '/admin-products', '/3d-sphere']
    
    // If user is admin and trying to access regular user routes, redirect to admin
    if (isAdminUser && isRegularUserRoute && !allowedForAdmin.includes(path)) {
      navigate('/admin')
    }
  }, [location.pathname, isAdminUser, navigate])
  
  // Don't show Navbar for admin users at all
  const showNavbar = !is3DSphereRoute && !isAdminUser
  
  return (
    <div className="app">
      {!is3DSphereRoute && (isAdminRoute && location.pathname !== '/admin-login' ? <AdminNavbar /> : showNavbar ? <Navbar /> : null)}
      <div className="main-content">
        <Routes>
          <Route path="/" element={isAdminUser ? <AdminDashboard /> : <Home />} />
          <Route path="/about" element={isAdminUser ? <AdminDashboard /> : <About />} />
          <Route path="/products" element={isAdminUser ? <AdminDashboard /> : <Products />} />
          <Route path="/products/:id" element={isAdminUser ? <AdminDashboard /> : <ProductDetail />} />
          <Route path="/blog" element={isAdminUser ? <AdminDashboard /> : <Blog />} />
          <Route path="/contact" element={isAdminUser ? <AdminDashboard /> : <Contact />} />
          <Route path="/cart" element={isAdminUser ? <AdminDashboard /> : <Cart />} />
          <Route path="/wishlist" element={isAdminUser ? <AdminDashboard /> : <Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={isAdminUser ? <AdminDashboard /> : <Profile />} />
          <Route path="/order-tracking" element={isAdminUser ? <AdminDashboard /> : <OrderTracking />} />
          <Route path="/payment" element={isAdminUser ? <AdminDashboard /> : <Payment />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-products" element={<AdminProducts />} />
          <Route path="/3d-sphere" element={<GlowingSphere />} />
        </Routes>
      </div>
      {!isAdminUser && !isAdminRoute && !is3DSphereRoute && <Chatbot />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  )
}

export default App
