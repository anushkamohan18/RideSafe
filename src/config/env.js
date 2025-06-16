/**
 * Environment Configuration for Web Application
 * Handles environment variables and app configuration
 */

const env = {
  // Environment detection
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_WEB: true,

  // API Configuration
  API_URL: process.env.REACT_APP_API_URL || window.RIDESAFE_CONFIG?.API_URL || 'http://localhost:8000/api',
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || window.RIDESAFE_CONFIG?.SOCKET_URL || 'http://localhost:8000',
  API_TIMEOUT: 30000,

  // Maps (now using free OpenStreetMap)
  // GOOGLE_MAPS_API_KEY: No longer needed - using free OpenStreetMap

  // App Configuration
  APP_NAME: 'RideSafe',
  APP_VERSION: '1.0.0',
  APP_BUNDLE_ID: 'com.ridesafe.web',

  // Feature Flags
  ENABLE_MAPS: true,
  ENABLE_PUSH_NOTIFICATIONS: 'Notification' in window,
  ENABLE_GEOLOCATION: 'geolocation' in navigator,
  ENABLE_OFFLINE_MODE: 'serviceWorker' in navigator,

  // UI Configuration
  THEME: 'light',
  PRIMARY_COLOR: '#FF5722',
  SECONDARY_COLOR: '#2196F3',

  // Ride Configuration
  MAX_RIDE_DISTANCE_KM: 100,
  DEFAULT_RIDE_RADIUS_KM: 10,
  GEOFENCE_RADIUS: 100, // meters
  LOCATION_UPDATE_INTERVAL: 5000, // milliseconds

  // Payment Configuration (placeholders)
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
  RAZORPAY_KEY: process.env.REACT_APP_RAZORPAY_KEY || '',

  // Analytics and Monitoring
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || '',
  GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GOOGLE_ANALYTICS_ID || '',

  // Security
  ENABLE_CSP: true,
  ENABLE_HTTPS_ONLY: process.env.NODE_ENV === 'production',

  // Storage
  STORAGE_PREFIX: 'ridesafe_',
  TOKEN_STORAGE_KEY: 'ridesafe_auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'ridesafe_refresh_token',
  USER_STORAGE_KEY: 'ridesafe_user_data',

  // Network
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000,

  // Maps & Location
  DEFAULT_LOCATION: {
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'New Delhi',
    country: 'India'
  },

  // Emergency
  EMERGENCY_CONTACT: '+91-100',
  SOS_TIMEOUT: 30000,

  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50,

  // Validation
  validateConfig() {
    const warnings = [];
    const errors = [];

    // Check required environment variables
    // No longer needed - using free OpenStreetMap
    // if (!this.GOOGLE_MAPS_API_KEY) {
    //   warnings.push('Google Maps API key not configured - maps functionality will be limited');
    // }

    if (!this.API_URL) {
      errors.push('API URL not configured');
    }

    if (!this.SOCKET_URL) {
      warnings.push('Socket URL not configured - real-time features will be disabled');
    }

    // Log warnings and errors
    if (warnings.length > 0) {
      console.warn('Environment configuration warnings:', warnings);
    }

    if (errors.length > 0) {
      console.error('Environment configuration errors:', errors);
      throw new Error(`Invalid environment configuration: ${errors.join(', ')}`);
    }

    return true;
  },

  // Get configuration for specific feature
  getFeatureConfig(feature) {
    const configs = {
      maps: {
        enabled: this.ENABLE_MAPS, // Now using free OpenStreetMap
        provider: 'OpenStreetMap', // Free alternative
        defaultLocation: this.DEFAULT_LOCATION
      },
      api: {
        baseUrl: this.API_URL,
        timeout: this.API_TIMEOUT,
        retryAttempts: this.RETRY_ATTEMPTS
      },
      socket: {
        url: this.SOCKET_URL,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      },
      location: {
        enabled: this.ENABLE_GEOLOCATION,
        updateInterval: this.LOCATION_UPDATE_INTERVAL,
        geofenceRadius: this.GEOFENCE_RADIUS
      },
      notifications: {
        enabled: this.ENABLE_PUSH_NOTIFICATIONS,
        requirePermission: true
      }
    };

    return configs[feature] || {};
  }
};

// Validate configuration on load
if (env.IS_DEV) {
  try {
    env.validateConfig();
    console.log('✅ Environment configuration validated successfully');
  } catch (error) {
    console.error('❌ Environment configuration validation failed:', error);
  }
}

export default env;
