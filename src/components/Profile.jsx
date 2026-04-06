import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Profile.css'
import { showToast } from './Toast'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loginInfo, setLoginInfo] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [permissions, setPermissions] = useState({})
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      // Get permissions from userData
      setPermissions(parsedUser.permissions || {})
      setEditFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        password: ''
      })
    }
    
    // Get login info
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const lastLogin = localStorage.getItem('lastLogin')
    
    setLoginInfo({
      isLoggedIn,
      lastLogin: lastLogin || new Date().toISOString()
    })
    
    // Set last login if not set
    if (!lastLogin) {
      localStorage.setItem('lastLogin', new Date().toISOString())
    }
  }, [])

  const handleEditProfile = (e) => {
    e.preventDefault()
    
    // Update userData in localStorage
    const updatedUser = {
      ...user,
      ...editFormData
    }
    
    // Remove password if it's empty
    if (!editFormData.password) {
      delete updatedUser.password
    }
    
    localStorage.setItem('userData', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setShowEditForm(false)
    
    // Also update in users array if it exists
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = users.findIndex(u => u.email === updatedUser.email)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem('users', JSON.stringify(users))
    }
    
    showToast('Profile updated successfully!', 'success')
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: ''
    })
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>👤</span>
          </div>
          <h1>{user?.name || 'User'}</h1>
          <p>Welcome back!</p>
          <button 
            className="edit-profile-btn"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            {showEditForm ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-content">
          {/* Edit Profile Form */}
          {showEditForm && (
            <div className="profile-section edit-form">
              <h2>Edit Profile</h2>
              <form onSubmit={handleEditProfile}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Login Details Section */}
          {!showEditForm && (
            <div className="profile-section">
              <h2>Account Information</h2>
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span className="info-value">{user?.name || 'User'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email || 'user@example.com'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{user?.phone || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Login Status:</span>
                  <span className="info-value status-active">✓ Active</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type:</span>
                  <span className={`info-value ${user?.role === 'admin' ? 'admin' : ''}`}>
                    {user?.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member since:</span>
                  <span className="info-value">
                    {loginInfo?.lastLogin ? new Date(loginInfo.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Login:</span>
                  <span className="info-value">
                    {loginInfo?.lastLogin ? new Date(loginInfo.lastLogin).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h2>Quick Links</h2>
            <div className="profile-links">
              {permissions.cart !== false && (
              <Link to="/cart" className="profile-link">
                🛒 My Cart
              </Link>
              )}
              {permissions.wishlist !== false && (
              <Link to="/wishlist" className="profile-link">
                🤍 My Wishlist
              </Link>
              )}
              {permissions['order-tracking'] !== false && (
              <Link to="/order-tracking" className="profile-link">
                📦 Order Tracking
              </Link>
              )}
              {permissions.products !== false && (
              <Link to="/products" className="profile-link">
                🛍️ Continue Shopping
              </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
