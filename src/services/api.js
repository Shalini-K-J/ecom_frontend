const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return 'https://ecomm-backend-dsyn.onrender.com/api';
};

const API_URL = getApiUrl();

// User APIs
export const userAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  login: async (email, password, isAdmin = false) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, isAdmin })
    });
    return response.json();
  },
  
  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/users`);
    return response.json();
  },
  
  createUser: async (userData) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Product APIs
export const productAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`);
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return response.json();
  },
  
  create: async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return response.json();
  },
  
  update: async (id, productData) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Cart APIs
export const cartAPI = {
  getCart: async (userId) => {
    const response = await fetch(`${API_URL}/cart/${userId}`);
    return response.json();
  },
  
  addToCart: async (userId, item) => {
    const response = await fetch(`${API_URL}/cart/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return response.json();
  },
  
  updateItem: async (userId, itemId, quantity) => {
    const response = await fetch(`${API_URL}/cart/${userId}/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return response.json();
  },
  
  removeItem: async (userId, itemId) => {
    const response = await fetch(`${API_URL}/cart/${userId}/item/${itemId}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  
  clearCart: async (userId) => {
    const response = await fetch(`${API_URL}/cart/${userId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: async (userId) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}`);
    return response.json();
  },
  
  addToWishlist: async (userId, item) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return response.json();
  },
  
  removeItem: async (userId, itemId) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}/item/${itemId}`, {
      method: 'DELETE'
    });
    return response.json();
  },
  
  clearWishlist: async (userId) => {
    const response = await fetch(`${API_URL}/wishlist/${userId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Order APIs
export const orderAPI = {
  getOrders: async (userId) => {
    const response = await fetch(`${API_URL}/orders/${userId}`);
    return response.json();
  },
  
  getOrderById: async (id) => {
    const response = await fetch(`${API_URL}/orders/order/${id}`);
    return response.json();
  },
  
  createOrder: async (userId, orderData) => {
    const response = await fetch(`${API_URL}/orders/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },
  
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },
  
  getAllOrders: async () => {
    const response = await fetch(`${API_URL}/orders`);
    return response.json();
  }
};
