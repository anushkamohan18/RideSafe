import axios from 'axios';

// Mock authentication service for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Mock users for development testing
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    password: 'password123',
    userType: 'customer'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9876543211',
    password: 'password123',
    userType: 'driver'
  },
  {
    id: 3,
    name: 'Test User',
    email: 'test@example.com',
    phone: '+91 9876543212',
    password: 'test123',
    userType: 'customer'
  }
];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      await delay(800); // Simulate API call
      
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw {
          response: {
            status: 401,
            data: {
              error: 'Invalid email or password'
            }
          }
        };
      }

      const { password: _, ...userWithoutPassword } = user;
      
      return {
        status: 200,
        data: {
          success: true,
          user: userWithoutPassword,
          accessToken: `mock_access_token_${user.id}_${Date.now()}`,
          refreshToken: `mock_refresh_token_${user.id}_${Date.now()}`,
          message: 'Login successful'
        }
      };
    } catch (error) {
      console.error('Auth API Login Error:', error);
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      await delay(1000);
      
      // Validate required fields
      if (!userData.name || !userData.email || !userData.password) {
        throw {
          response: {
            status: 400,
            data: {
              error: 'Name, email and password are required'
            }
          }
        };
      }
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw {
          response: {
            status: 409,
            data: {
              error: 'User with this email already exists'
            }
          }
        };
      }

      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        userType: userData.userType || 'customer'
      };

      return {
        status: 201,
        data: {
          success: true,
          user: newUser,
          accessToken: `mock_access_token_${newUser.id}_${Date.now()}`,
          refreshToken: `mock_refresh_token_${newUser.id}_${Date.now()}`,
          message: 'Registration successful'
        }
      };
    } catch (error) {
      console.error('Auth API Register Error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      await delay(300);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw {
          response: {
            status: 401,
            data: {
              error: 'No access token provided'
            }
          }
        };
      }

      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        throw {
          response: {
            status: 404,
            data: {
              error: 'User not found'
            }
          }
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          user: JSON.parse(savedUser)
        }
      };
    } catch (error) {
      console.error('Auth API Get Current User Error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      await delay(500);
      
      if (!refreshToken) {
        throw {
          response: {
            status: 400,
            data: {
              error: 'No refresh token provided'
            }
          }
        };
      }

      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        throw {
          response: {
            status: 404,
            data: {
              error: 'User session not found'
            }
          }
        };
      }

      const user = JSON.parse(savedUser);
      
      return {
        status: 200,
        data: {
          success: true,
          user,
          accessToken: `mock_access_token_${user.id}_${Date.now()}`,
          refreshToken: `mock_refresh_token_${user.id}_${Date.now()}`
        }
      };
    } catch (error) {
      console.error('Auth API Refresh Token Error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await delay(300);
      
      return {
        status: 200,
        data: {
          success: true,
          message: 'Logged out successfully'
        }
      };
    } catch (error) {
      console.error('Auth API Logout Error:', error);
      throw error;
    }
  }
};

export default authAPI;