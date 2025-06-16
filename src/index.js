import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { reportWebVitals } from './utils/reportWebVitals';

// Initialize environment variables
const {
  REACT_APP_API_URL,
  REACT_APP_SOCKET_URL,
  // REACT_APP_GOOGLE_MAPS_API_KEY, // No longer needed - using free OpenStreetMap
  REACT_APP_ENV
} = process.env;

// Basic environment validation
if (!REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL is not set. API calls may fail.');
}

// No longer needed - using free OpenStreetMap
// if (!REACT_APP_GOOGLE_MAPS_API_KEY) {
//   console.warn('REACT_APP_GOOGLE_MAPS_API_KEY is not set. Maps functionality will be limited.');
// }

// Set global configuration
window.RIDESAFE_CONFIG = {
  API_URL: REACT_APP_API_URL || 'http://localhost:8000/api',
  SOCKET_URL: REACT_APP_SOCKET_URL || 'http://localhost:8000',
  // GOOGLE_MAPS_API_KEY: No longer needed - using free OpenStreetMap
  ENV: REACT_APP_ENV || 'development',
  VERSION: '1.0.0'
};

console.log('⚡ RideSafe Platform Initializing...');
console.log('🔧 Environment:', window.RIDESAFE_CONFIG.ENV);
console.log('🌐 API Endpoint:', window.RIDESAFE_CONFIG.API_URL);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Web Vitals Reporting
if (window.RIDESAFE_CONFIG.ENV === 'production') {
  reportWebVitals(console.log);
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator && window.RIDESAFE_CONFIG.ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('⚙️ Service Worker registered:', registration);
      })
      .catch((registrationError) => {
        console.log('❌ Service Worker registration failed:', registrationError);
      });
  });
}
