import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI, productAPI, orderAPI } from '../services/api'
import './AdminDashboard.css'
import { showToast } from './Toast'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customerFormData, setCustomerFormData] = useState({ name: '', email: '', phone: '' })
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' })
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    permissions: {}
  })

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      navigate('/admin-login')
      return
    }
    
    // Check if admin
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (userData.role !== 'admin') {
      navigate('/')
      return
    }
    
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load users from backend
      const usersResponse = await userAPI.getAllUsers()
      if (usersResponse.data) {
        setUsers(usersResponse.data)
      }
      
      // Load products from backend
      const productsResponse = await productAPI.getAll()
      if (productsResponse.data) {
        setProducts(productsResponse.data)
      }
      
      // Load orders from backend
      const ordersResponse = await orderAPI.getAllOrders()
      if (ordersResponse.data) {
        setOrders(ordersResponse.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to localStorage if API fails
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      const savedProducts = JSON.parse(localStorage.getItem('products') || '[]')
      const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]')
      
      setUsers(savedUsers)
      setOrders(savedOrders)
      setProducts(savedProducts)
      setCategories(savedCategories)
    }
  }
  
  // Category handlers
  const handleAddCategory = () => {
    if (!categoryFormData.name.trim()) {
      showToast('Please enter category name', 'error')
      return
    }
    
    const newCategory = {
      id: Date.now().toString(),
      name: categoryFormData.name,
      description: categoryFormData.description,
      createdAt: new Date().toISOString()
    }
    
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
    showToast('Category added successfully!', 'success')
    setCategoryFormData({ name: '', description: '' })
    setShowAddCategoryModal(false)
  }
  
  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      setCategories(updatedCategories)
      localStorage.setItem('categories', JSON.stringify(updatedCategories))
      showToast('Category deleted successfully!', 'success')
    }
  }
  
  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowAddCategoryModal(true)
  }
  
  const handleUpdateCategory = () => {
    if (!categoryFormData.name.trim()) {
      showToast('Please enter category name', 'error')
      return
    }
    
    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: categoryFormData.name, description: categoryFormData.description }
        : cat
    )
    setCategories(updatedCategories)
    localStorage.setItem('categories', JSON.stringify(updatedCategories))
    showToast('Category updated successfully!', 'success')
    setCategoryFormData({ name: '', description: '' })
    setEditingCategory(null)
    setShowAddCategoryModal(false)
  }
  
  // Customer edit functions
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setCustomerFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || ''
    })
    setShowCustomerModal(true)
  }
  
  const handleUpdateCustomer = async () => {
    if (!customerFormData.name.trim() || !customerFormData.email.trim()) {
      showToast('Please fill required fields', 'error')
      return
    }
    
    try {
      const response = await userAPI.updateUser(editingCustomer.id, {
        name: customerFormData.name,
        email: customerFormData.email,
        phone: customerFormData.phone
      })
      
      if (response.success) {
        showToast('Customer updated successfully!', 'success')
        loadData()
      } else {
        showToast(response.message || 'Failed to update customer', 'error')
      }
    } catch (error) {
      showToast('Error updating customer', 'error')
    }
    
setEditingCustomer(null)
    setCustomerFormData({ name: '', email: '', phone: '' })
    setShowCustomerModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // When role changes, reset permissions to defaults
    if (name === 'role') {
      const userDefaultPermissions = {
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
      }
      
      // Admin gets ONLY admin permissions - no user page access
      const adminDefaultPermissions = {
        adminDashboard: true,
        manageUsers: true,
        manageProducts: true,
        manageOrders: true
      }
      
      setUserFormData({
        ...userFormData,
        role: value,
        permissions: value === 'admin' ? adminDefaultPermissions : userDefaultPermissions
      })
    } else {
      setUserFormData({ ...userFormData, [name]: value })
    }
  }

  // Auto-generate unique user ID with numbers
  const generateUserId = () => {
    const timestamp = Date.now().toString()
    const random = Math.floor(100000 + Math.random() * 900000) // 6 digit number
    return `USR${timestamp.slice(-6)}${random}`.toUpperCase()
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setUserFormData({
      id: generateUserId(),
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      permissions: {}
    })
    setShowAddUserForm(true)
  }

  const handleEditUser = (user) => {
    // Store both MongoDB _id and custom id
    setEditingUser({
      ...user,
      id: user.id || user._id
    })
    setUserFormData({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role || 'user',
      permissions: user.permissions || {}
    })
    setShowAddUserForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userAPI.deleteUser(userId)
        if (response.success) {
          const updatedUsers = users.filter(user => user.id !== userId)
          setUsers(updatedUsers)
          showToast('User deleted successfully!', 'success')
        } else {
          showToast(response.message || 'Failed to delete user', 'error')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        showToast('Failed to delete user. Please try again.', 'error')
      }
    }
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    
    try {
      // Set default permissions based on role
      // Admin gets ONLY admin permissions (no user pages)
      // User gets ONLY user permissions
      const userDefaultPermissions = {
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
      }

      // Admin gets ONLY admin permissions - no user page access
      const adminDefaultPermissions = {
        adminDashboard: true,
        manageUsers: true,
        manageProducts: true,
        manageOrders: true
      }

      // Use MongoDB _id for updates, custom id for display
      const userData = {
        id: userFormData.id || editingUser?.id || generateUserId(),
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone,
        role: userFormData.role || 'user',
        permissions: userFormData.permissions && Object.keys(userFormData.permissions).length > 0 
          ? userFormData.permissions 
          : (userFormData.role === 'admin' ? adminDefaultPermissions : userDefaultPermissions),
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
      }

      // Get the MongoDB _id for API calls
      const mongoId = editingUser?._id || editingUser?.id

      // Only include password if it's provided (for new users or password change)
      if (userFormData.password) {
        userData.password = userFormData.password
      }

      let response
      
      if (editingUser && mongoId) {
        // Update existing user using MongoDB _id
        response = await userAPI.updateUser(mongoId, userData)
        if (response.success) {
          const updatedUsers = users.map(user => 
            user.id === editingUser.id ? { ...user, ...userData } : user
          )
          setUsers(updatedUsers)
          showToast('User updated successfully!', 'success')
        } else {
          showToast(response.message || 'Failed to update user', 'error')
          return
        }
      } else {
        // Create new user
        userData.password = userFormData.password || 'password123'
        response = await userAPI.createUser(userData)
        if (response.success || response.data) {
          // Reload users from database
          loadData()
          showToast('User added successfully!', 'success')
        } else {
          showToast(response.message || 'Failed to add user', 'error')
          return
        }
      }
      
      setShowAddUserForm(false)
      setUserFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        permissions: {}
      })
    } catch (error) {
      console.error('Error saving user:', error)
      showToast('Failed to save user. Please try again.', 'error')
    }
  }

  const handleManagePermissions = (user) => {
    // Store both MongoDB _id and custom id
    setSelectedUser({
      ...user,
      id: user.id || user._id
    })
    setShowPermissionsModal(true)
  }

  const handlePermissionChange = async (pageName, isAllowed) => {
    if (selectedUser) {
      // Update local state first
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id || user._id === selectedUser.id) {
          return {
            ...user,
            permissions: {
              ...user.permissions,
              [pageName]: isAllowed
            }
          }
        }
        return user
      })
      setUsers(updatedUsers)
      
      // Update in database using MongoDB _id
      const mongoId = selectedUser._id || selectedUser.id
      try {
        const response = await userAPI.updateUser(mongoId, {
          permissions: updatedUsers.find(u => u._id === mongoId || u.id === mongoId)?.permissions
        })
        if (response.success) {
          showToast('Permission updated!', 'success')
        }
      } catch (error) {
        console.error('Error updating permission:', error)
      }
      
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    }
  }

  const handleOrderStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    setOrders(updatedOrders)
    showToast(`Order status updated to ${newStatus}`, 'success')
  }

  // Define user pages that regular users can access
  const userPageOptions = [
    { name: 'home', label: 'Home Page' },
    { name: 'about', label: 'About Page' },
    { name: 'products', label: 'Products Page' },
    { name: 'blog', label: 'Blog Page' },
    { name: 'contact', label: 'Contact Page' },
    { name: 'cart', label: 'Shopping Cart' },
    { name: 'wishlist', label: 'Wishlist' },
    { name: 'profile', label: 'User Profile' },
    { name: 'order-tracking', label: 'Order Tracking' },
    { name: 'checkout', label: 'Checkout' }
  ]

  // Define admin permissions
  const adminPageOptions = [
    { name: 'adminDashboard', label: 'Admin Dashboard' },
    { name: 'manageUsers', label: 'Manage Users' },
    { name: 'manageProducts', label: 'Manage Products' },
    { name: 'manageOrders', label: 'Manage Orders' }
  ]

  // Get pages based on role - show only relevant pages for each role
  const userPages = userFormData.role === 'admin' ? adminPageOptions : userPageOptions

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h1>Dashboard Overview</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{users.length}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>₹{totalRevenue.toFixed(2)}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛍️</div>
                <div className="stat-content">
                  <h3>{products.length}</h3>
                  <p>Total Products</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h1>Analytics & Reports</h1>
            
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Sales Overview</h3>
                <div className="analytics-stat">
                  <span className="label">Total Revenue:</span>
                  <span className="value">₹{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="analytics-stat">
                  <span className="label">Total Orders:</span>
                  <span className="value">{orders.length}</span>
                </div>
                <div className="analytics-stat">
                  <span className="label">Average Order Value:</span>
                  <span className="value">₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</span>
                </div>
              </div>
              
              <div className="analytics-card warning">
                <h3>Low Stock Alerts</h3>
                {products.filter(p => (p.stock || 0) < 10).length === 0 ? (
                  <p>No low stock products</p>
                ) : (
                  <ul className="low-stock-list">
                    {products.filter(p => (p.stock || 0) < 10).slice(0, 5).map(product => (
                      <li key={product.id}>
                        {product.name} - <span className="stock-count">{product.stock} left</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="analytics-card">
                <h3>Top Products</h3>
                {products.length === 0 ? (
                  <p>No products yet</p>
                ) : (
                  <ul className="top-products-list">
                    {products.slice(0, 5).map((product, index) => (
                      <li key={product.id}>
                        <span className="rank">{index + 1}</span>
                        {product.name} - <span className="price">₹{product.price}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="analytics-card">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? (
                  <p>No orders yet</p>
                ) : (
                  <ul className="recent-orders-list">
                    {orders.slice(0, 5).map((order, index) => (
                      <li key={order.id || index}>
                        <span className="order-id">#{order.id?.slice(-6) || order.id}</span>
                        <span className="order-status">{order.status || 'Pending'}</span>
                        <span className="order-total">₹{order.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="customers-section">
            <div className="section-header">
              <h1>Customer Management</h1>
            </div>
            
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'admin').map(user => {
                  const userOrders = orders.filter(o => o.userId === user.id || o.email === user.email)
                  return (
                    <tr key={user.id}>
                      <td>{user.id?.slice(-6) || user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{userOrders.length}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditCustomer(user)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h1>User Management</h1>
              <button className="add-btn" onClick={handleAddUser}>
                Add User
              </button>
            </div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>{user.id || user._id?.slice(-8)}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{orders.filter(order => order.userId === user._id || order.userId === user.id).length}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user._id || user.id)}
                      >
                        Delete
                      </button>
                      <button 
                        className="permissions-btn"
                        onClick={() => handleManagePermissions(user)}
                      >
                        Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h1>Order Management</h1>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order?.id || `order-${index}`}>
                    <td>{order.id}</td>
                    <td>{order.email}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>₹{order.total}</td>
                    <td>
                      <select 
                        className={`status-select ${order.status}`}
                        value={order.status}
                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => showToast('Order details: ' + JSON.stringify(order.items), 'info')}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Edit Modal */}
        {showCustomerModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Customer</h2>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                handleUpdateCustomer(); 
              }} className="user-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={customerFormData.name}
                    onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData({...customerFormData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Update Customer</button>
                  <button type="button" className="cancel-btn" onClick={() => { 
                    setShowCustomerModal(false) 
                    setEditingCustomer(null)
                    setCustomerFormData({ name: '', email: '', phone: '' })
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="categories-section">
            <div className="section-header">
              <h1>Category Management</h1>
              <button className="add-btn" onClick={() => setShowAddCategoryModal(true)}>
                Add Category
              </button>
            </div>
            
            {categories.length === 0 ? (
              <div className="empty-state">
                <p>No categories yet. Add your first category!</p>
              </div>
            ) : (
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => {
                    const categoryProducts = products.filter(p => p.category === category.name)
                    return (
                      <tr key={category.id}>
                        <td>{category.id?.slice(-6) || category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description || 'N/A'}</td>
                        <td>{categoryProducts.length}</td>
                        <td>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditCategory(category)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showAddCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              editingCategory ? handleUpdateCategory() : handleAddCategory(); 
            }} className="user-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  placeholder="Enter category description"
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => { 
                  setShowAddCategoryModal(false) 
                  setEditingCategory(null)
                  setCategoryFormData({ name: '', description: '' })
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSaveUser} className="user-form">
              <div className="form-group">
                <label>User ID</label>
                <div className="id-input-group">
                  <input
                    type="text"
                    name="id"
                    value={userFormData.id || (editingUser ? editingUser.id : '')}
                    readOnly
                    className="readonly-field"
                  />
                  <button 
                    type="button" 
                    className="regenerate-btn"
                    onClick={() => setUserFormData({...userFormData, id: generateUserId()})}
                    title="Generate New ID"
                  >
                    🔄
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={userFormData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={userFormData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={userFormData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={userFormData.role}
                  onChange={handleInputChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {/* Page Permissions Section */}
              <div className="permissions-section">
                <h3>Page Access Permissions</h3>
                <div className="permissions-grid">
                  {userPages.map(page => (
                    <div key={page.name} className="permission-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={userFormData.permissions?.[page.name] ?? true}
                          onChange={(e) => {
                            setUserFormData({
                              ...userFormData,
                              permissions: {
                                ...userFormData.permissions,
                                [page.name]: e.target.checked
                              }
                            })
                          }}
                        />
                        <span>{page.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddUserForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Manage Permissions for {selectedUser.name}</h2>
            <div className="permissions-container">
              <div className="permission-items">
                {userPages.map(page => (
                  <div key={page.name} className="permission-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedUser.permissions?.[page.name] ?? true}
                        onChange={(e) => handlePermissionChange(page.name, e.target.checked)}
                      />
                      {page.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="button" className="save-btn" onClick={() => setShowPermissionsModal(false)}>
                  Save
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowPermissionsModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
