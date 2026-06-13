import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaPhone, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa'
import { userAPI } from '../services/api'
import './Signup.css'

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Full name is required'
    if (!/^[a-zA-Z\s]{2,}$/.test(name)) return 'Name must contain only letters and be at least 2 characters'
    return ''
  }

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required'
    if (!/^[0-9]{10}$/.test(phone)) return 'Phone must be exactly 10 digits'
    return ''
  }

  const validateEmail = (email) => {
    if (!email) return 'Email is required'
    // Only allow letters, numbers, @ and . in email
    const emailCharsRegex = /^[a-zA-Z0-9@.]+$/
    if (!emailCharsRegex.test(email)) {
      return 'Email can only contain letters, numbers, @ and .'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    // Only allow gmail.com and yahoo.com domains
    const allowedDomains = ['gmail.com', 'yahoo.com']
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!allowedDomains.includes(emailDomain)) {
      return 'Only gmail.com and yahoo.com email addresses are allowed'
    }
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)'
    return ''
  }

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password'
    if (confirmPassword !== formData.password) return 'Passwords do not match'
    return ''
  }

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword)
    }

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    )

    setErrors(filteredErrors)
    return Object.keys(filteredErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      if (!/^\d*$/.test(value)) return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const data = await userAPI.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      if (data.message || data.success) {
        setMessage({ type: 'success', text: 'Registration successful! Please login to continue.' })
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Registration failed!' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="signup-container">
      <div className="auth-box">
        {message.text && (
          <div className={`message-box message-${message.type}`}>
            {message.text}
          </div>
        )}
        <div className="auth-header">
          <FaUserPlus className="auth-icon" />
          <h1 className="auth-title">Sign Up</h1>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <FaUser className="input-icon" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone className="input-icon" />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number (10 digits)"
              maxLength="10"
              inputMode="numeric"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

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
              placeholder="Enter your email (gmail.com or yahoo.com only)"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
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
              placeholder="Enter your password (min 8 chars, uppercase, lowercase, number, special char)"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FaLock className="input-icon" />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            <FaUserPlus className="button-icon" />
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Already have an account?
            <Link to="/login" className="switch-link">
              <FaSignInAlt className="switch-icon" />
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup