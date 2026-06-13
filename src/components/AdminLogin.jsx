import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaSignInAlt, FaUserShield, FaArrowLeft } from 'react-icons/fa'
import { userAPI } from '../services/api'
import './AdminLogin.css'
import { showToast } from './Toast'

function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

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
      const data = await userAPI.login(formData.email, formData.password, true)

      if (data.message) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('isAdminUser', 'true')
        localStorage.setItem('userData', JSON.stringify(data.data))
        showToast('Admin login successful!', 'success')
        navigate('/admin')
      } else {
        showToast(data.error || 'Invalid admin credentials!', 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setLoading(true)
    
    try {
      // Try to login with default admin credentials
      const data = await userAPI.login('admin@shalinicart.com', 'admin123', true)

      if (data.message) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('isAdminUser', 'true')
        localStorage.setItem('userData', JSON.stringify(data.data))
        showToast('Admin login successful!', 'success')
        navigate('/admin')
      } else {
        // If no admin exists, create one
        if (data.error && (data.error.includes('Invalid') || data.error.includes('not found'))) {
          const signupData = await userAPI.signup({
            name: 'Admin',
            email: 'admin@shalinicart.com',
            phone: '1234567890',
            password: 'admin123'
          })

          if (signupData.message) {
            // Try login again
            const loginData = await userAPI.login('admin@shalinicart.com', 'admin123', true)
            if (loginData.message) {
              localStorage.setItem('isLoggedIn', 'true')
              localStorage.setItem('isAdminUser', 'true')
              localStorage.setItem('userData', JSON.stringify(loginData.data))
              showToast('Admin login successful!', 'success')
              navigate('/admin')
            }
          }
        } else {
          showToast(data.error || 'Admin login failed!', 'error')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-auth-box">
        <div className="admin-auth-header">
          <FaUserShield className="admin-auth-icon" />
          <h1 className="admin-auth-title">Admin Login</h1>
          <p className="admin-auth-subtitle">Access the admin panel</p>
        </div>
        
        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="email">
              <FaEnvelope className="admin-input-icon" />
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              <FaLock className="admin-input-icon" />
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter admin password"
              required
            />
          </div>

<button type="submit" className="admin-auth-button" disabled={loading}>
             <FaSignInAlt className="admin-button-icon" />
             {loading ? 'Logging in...' : 'Login as Admin'}
           </button>
        </form>

        {/* Admin Quick Login */}
        <div className="admin-quick-login">
<button type="button" className="admin-quick-btn" onClick={handleQuickLogin} disabled={loading}>
             <FaUserShield className="admin-quick-icon" />
             {loading ? 'Logging in...' : 'Quick Admin Login (admin123)'}
           </button>
        </div>

        <div className="admin-switch">
          <p>
            <Link to="/login" className="admin-switch-link">
              <FaArrowLeft className="admin-switch-icon" />
              Back to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
