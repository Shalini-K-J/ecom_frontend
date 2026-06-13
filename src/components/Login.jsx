import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaUserShield } from 'react-icons/fa'
import { userAPI } from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    
    try {
      const data = await userAPI.login(formData.email, formData.password, false)

      if (data.message) {
        localStorage.setItem('isLoggedIn', 'true')
        // Check if user is admin from response data
        const isAdmin = data.data?.role === 'admin'
        localStorage.setItem('isAdminUser', isAdmin ? 'true' : 'false')
        localStorage.setItem('userData', JSON.stringify(data.data))
        setMessage({ type: 'success', text: 'Login successful!' })
        // Refresh navbar to update login state
        if (window.refreshNavbar) {
          window.refreshNavbar()
        }
        // Redirect admin to admin dashboard, regular user to home
        setTimeout(() => navigate(isAdmin ? '/admin' : '/'), 1000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid email or password!' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLoginRedirect = () => {
    navigate('/admin-login')
  }

  return (
    <div className="login-container">
      <div className="auth-box">
        {message.text && (
          <div className={`message-box message-${message.type}`}>
            {message.text}
          </div>
        )}
        <div className="auth-header">
          <FaSignInAlt className="auth-icon" />
          <h1 className="auth-title">User Login</h1>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            <FaSignInAlt className="button-icon" />
            Login
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Don't have an account?
            <Link to="/signup" className="switch-link">
              <FaUserPlus className="switch-icon" />
              Sign Up
            </Link>
          </p>
        </div>
        
        {/* Admin Login Redirect */}
        <div className="admin-login-section">
          <button type="button" className="admin-login-btn" onClick={handleAdminLoginRedirect}>
            <FaUserShield className="admin-icon" />
            Admin Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
