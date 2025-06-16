/**
 * API Client for Web Application
 * Handles HTTP requests, authentication, and error handling
 */

import axios from 'axios';

// Get API URL from environment or config
const API_BASE_URL = process.env.REACT_APP_API_URL || window.RIDESAFE_CONFIG?.API_URL || 'http://localhost:8000/api';

console.log('API Client initialized with base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      requestData: error.config?.data,
      responseData: error.response?.data,
      headers: error.response?.headers
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle validation errors (422)
    if (error.response?.status === 422) {
      console.error('Validation Error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
