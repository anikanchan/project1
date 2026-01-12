import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: (email) => api.get(`/orders/my-orders?email=${email}`),
};

// Payment APIs
export const paymentAPI = {
  createIntent: (orderId) => api.post('/payments/create-intent', { orderId }),
  confirm: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
};

// Config APIs
export const configAPI = {
  getStripeKey: () => api.get('/config/stripe'),
};

// Admin APIs
export const adminAPI = {
  getAllOrders: () => api.get('/admin/orders'),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getAllProducts: () => api.get('/admin/products'),
};

export default api;
