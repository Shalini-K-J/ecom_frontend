import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaSignOutAlt, FaUsers, FaBox, FaShoppingBag, FaChartLine, FaCog } from 'react-icons/fa'
import './AdminNavbar.css'

function AdminNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const isActive = (path) => location.pathname === path
  
  const handleLogout = () => {
    localStorage.setItem('isLoggedIn', 'false')
    localStorage.setItem('isAdminUser', 'false')
    localStorage.removeItem('userData')
    navigate('/admin-login')
  }

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <div className="admin-navbar-brand">
          <span className="admin-brand-icon">⚙️</span>
          <span className="admin-brand-text">Admin Panel</span>
        </div>
        
        <ul className="admin-navbar-menu">
          <li>
            <Link 
              to="/admin" 
              className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              <FaChartLine className="admin-nav-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/admin-products" 
              className={`admin-nav-link ${isActive('/admin-products') ? 'active' : ''}`}
            >
              <FaShoppingBag className="admin-nav-icon" />
              <span>Products</span>
            </Link>
          </li>
        </ul>
        
        <div className="admin-navbar-actions">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="admin-nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
