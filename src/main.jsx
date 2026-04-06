import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Create default admin user if it doesn't exist
const createDefaultAdmin = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const adminExists = users.find(u => u.email === 'admin@example.com')
  
  if (!adminExists) {
    const defaultAdmin = {
      id: Date.now(),
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '1234567890',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
    users.push(defaultAdmin)
    localStorage.setItem('users', JSON.stringify(users))
    console.log('Default admin user created: admin@example.com / admin123')
  }
}

createDefaultAdmin()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
