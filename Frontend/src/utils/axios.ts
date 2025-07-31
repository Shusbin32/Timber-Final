import axios from 'axios';
import { API_BASE_URL, IS_PRODUCTION } from '@/config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Disabled for localhost to avoid CORS issues
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking in production
    if (IS_PRODUCTION) {
      config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Ensure we're using the correct base URL
    if (!config.baseURL) {
      config.baseURL = API_BASE_URL;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (!IS_PRODUCTION) {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        console.warn('Unauthorized access - redirected to login');
      } else if (status === 403) {
        console.error('Forbidden access');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error:', data);
      }
      
      if (!IS_PRODUCTION) {
        console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          data,
          message: error.message
        });
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
    } else {
      // Other error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
