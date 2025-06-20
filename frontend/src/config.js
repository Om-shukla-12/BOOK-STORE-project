import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    USER: `${API_BASE_URL}/api/auth/user`
  },
  BOOKS: {
    LIST: `${API_BASE_URL}/api/books`,
    DETAIL: (id) => `${API_BASE_URL}/api/books/${id}`
  },
  CART: {
    GET: `${API_BASE_URL}/api/cart`,
    ADD: `${API_BASE_URL}/api/cart/add`,
    UPDATE: `${API_BASE_URL}/api/cart/update`,
    REMOVE: `${API_BASE_URL}/api/cart/remove`
  }
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

// Add response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 