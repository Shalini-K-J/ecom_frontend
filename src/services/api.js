const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://ecomm-backend-dsyn.onrender.com/api'
    : 'http://localhost:5000/api'));

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    } catch {
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  }
  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response');
  }
};

// User APIs
export const userAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  login: async (email, password, isAdmin = false) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, isAdmin })
    });
    return handleResponse(response);
  },
  
  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/users`);
    return handleResponse(response);
  },
  
  createUser: async (userData) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },
  
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Product APIs
export const productAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },
  
  create: async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  
  update: async (id, productData) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Cart APIs
export const cartAPI = {
  getCart: async (userId) => {
    const response = await fetch(`${API_URL}/cart/${userId}`);
    return handleResponse(response);
  },
  
  addToCart: async (userId, item) => {
    const response = await fetch(`${API_URL}/cart/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleResponse(response);
  },
  
  updateItem: async (userId, itemId, quantity) => {
    const response = await fetch(`${API_URL}/cart/${userId}/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return handleResponse(response);
  },
  
  removeItem: async (userId, itemId) => {
    const response = await fetch(`${API_URL}/cart/${userId}/item/${itemId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },
  
  clearCart: async (userId) => {
    const response = await fetch(`${API_URL}/cart/${userId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: async (userId) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}`);
    return handleResponse(response);
  },
  
  addToWishlist: async (userId, item) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleResponse(response);
  },
  
  removeItem: async (userId, itemId) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}/item/${itemId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },
  
  clearWishlist: async (userId) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Order APIs
export const orderAPI = {
  getOrders: async (userId) => {
    const response = await fetch(`${API_URL}/orders/${userId}`);
    return handleResponse(response);
  },
  
  getOrderById: async (id) => {
    const response = await fetch(`${API_URL}/orders/order/${id}`);
    return handleResponse(response);
  },
  
  createOrder: async (userId, orderData) => {
    const response = await fetch(`${API_URL}/orders/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },
  
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  
  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/orders`);
    return handleResponse(response);
  }
};
