import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

// Fallback auth API for development when service is not available
const fallbackAuthAPI = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock users for testing
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', password: 'password123' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211', password: 'password123' },
      { id: 3, name: 'Test User', email: 'test@example.com', phone: '+91 9876543212', password: 'test123' }
    ];
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw { 
        response: { 
          data: { 
            error: 'Invalid email or password. Try: john@example.com / password123' 
          } 
        } 
      };
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return {
      data: {
        user: userWithoutPassword,
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_' + Date.now()
      }
    };
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    if (userData.email === 'john@example.com' || userData.email === 'jane@example.com') {
      throw { 
        response: { 
          data: { 
            error: 'User with this email already exists' 
          } 
        } 
      };
    }
    
    const { password: _, ...userWithoutPassword } = userData;
    
    return {
      data: {
        user: { id: Date.now(), ...userWithoutPassword },
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_' + Date.now()
      }
    };
  },

  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      throw { response: { data: { error: 'No user found' } } };
    }
    
    return { data: { user: JSON.parse(savedUser) } };
  },

  refreshToken: async (refreshToken) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      throw { response: { data: { error: 'No user found' } } };
    }
    
    return {
      data: {
        user: JSON.parse(savedUser),
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_' + Date.now()
      }
    };
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { message: 'Logged out successfully' } };
  }
};

// Use fallback API for now (you can replace this with real API import later)
const authAPI = fallbackAuthAPI;

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS'
};

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isOnline: navigator.onLine
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Storage helpers
const storage = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  getTokens: () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  }),
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: AUTH_ACTIONS.SET_ONLINE_STATUS, payload: true });
      toast.success('Back online! 🌐', {
        duration: 2000,
        icon: '🌐'
      });
    };

    const handleOffline = () => {
      dispatch({ type: AUTH_ACTIONS.SET_ONLINE_STATUS, payload: false });
      toast.error('You are offline! 📵', {
        duration: 3000,
        icon: '📵'
      });
    };

    // Check initial status
    dispatch({ type: AUTH_ACTIONS.SET_ONLINE_STATUS, payload: navigator.onLine });

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for existing session on app start
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        const tokens = storage.getTokens();
        const savedUser = storage.getUser();

        if (tokens.accessToken && savedUser) {
          // For development, validate user exists and restore session
          try {
            // Quick validation - just check if user data is valid
            if (savedUser.id && savedUser.email && savedUser.name) {
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: savedUser,
                  accessToken: tokens.accessToken,
                  refreshToken: tokens.refreshToken
                }
              });
            } else {
              // Invalid user data, clear storage
              storage.clear();
              dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
          } catch (error) {
            console.log('Session validation failed, clearing storage');
            storage.clear();
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        storage.clear();
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkExistingSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Basic validation
      if (!email || !password) {
        throw {
          response: {
            data: {
              error: 'Email and password are required'
            }
          }
        };
      }

      const response = await authAPI.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user data
      storage.setTokens(accessToken, refreshToken);
      storage.setUser(user);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Basic validation
      if (!userData.email || !userData.password || !userData.name) {
        throw {
          response: {
            data: {
              error: 'Name, email and password are required'
            }
          }
        };
      }

      const response = await authAPI.register(userData);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user data
      storage.setTokens(accessToken, refreshToken);
      storage.setUser(user);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      toast.success(`Welcome to RideSafe, ${user.name}!`);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.clear();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user function
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    storage.setUser(updatedUser);
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;