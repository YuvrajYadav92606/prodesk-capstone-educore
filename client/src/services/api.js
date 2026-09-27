import axios from 'axios';

// Base Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Attaches the persisted JWT from localStorage to every outgoing request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('educore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Intercepts 401 Unauthorized errors (null, invalid, or expired tokens)
 * and forces an immediate cleanup and redirect to /login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Security Interceptor] 401 Unauthorized detected. Purging session & redirecting to login...');
      localStorage.removeItem('educore_token');
      localStorage.removeItem('educore_user');
      
      // Prevent redirect loop if already on auth routes
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
