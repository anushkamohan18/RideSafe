// API configuration and utilities
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
};

export * from './authService';

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// API response wrapper
export const createApiResponse = (data, message = 'Success') => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

// API error wrapper
export const createApiError = (message, statusCode = 500) => ({
  success: false,
  error: message,
  statusCode,
  timestamp: new Date().toISOString()
});
