import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LocationSearchPage from './pages/LocationSearchPage';
import BookRidePage from './pages/BookRidePage';
import RentCarPage from './pages/RentCarPage';
import BookDriverPage from './pages/BookDriverPage';
import BookDriverDetailsPage from './pages/BookDriverDetailsPage';
import RidesPage from './pages/RidesPage';
import RideDetailsPage from './pages/RideDetailsPage';
import DriverOTPPage from './pages/DriverOTPPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';

// Import CSS
import './styles/index.css';

// Enhanced theme creation function with better dark mode support
const createAppTheme = (isDarkMode) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#D84315',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: isDarkMode ? '#121212' : '#f8f9fa',
      paper: isDarkMode ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: isDarkMode ? '#ffffff' : '#212529',
      secondary: isDarkMode ? '#b0b0b0' : '#6c757d',
    },
    divider: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 6px 16px rgba(0, 0, 0, 0.12)',
    '0px 8px 24px rgba(0, 0, 0, 0.15)',
    '0px 12px 32px rgba(0, 0, 0, 0.18)',
    '0px 16px 40px rgba(0, 0, 0, 0.20)',
    '0px 20px 48px rgba(0, 0, 0, 0.22)',
    '0px 24px 56px rgba(0, 0, 0, 0.24)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isDarkMode ? '#121212' : '#f8f9fa',
          color: isDarkMode ? '#ffffff' : '#212529',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
        html: {
          backgroundColor: isDarkMode ? '#121212' : '#f8f9fa',
        },
        '#root': {
          backgroundColor: isDarkMode ? '#121212' : '#f8f9fa',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(255, 87, 34, 0.04)',
          },
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#212529',
          borderRadius: 16,
          boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.08)',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#212529',
          boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#212529',
          borderRadius: 12,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF5722',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&.MuiChip-filled': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          borderColor: 'transparent',
        },
        standardSuccess: {
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
          borderColor: 'rgba(76, 175, 80, 0.3)',
        },
        standardError: {
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
          borderColor: 'rgba(244, 67, 54, 0.3)',
        },
        standardWarning: {
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
          borderColor: 'rgba(255, 152, 0, 0.3)',
        },
        standardInfo: {
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
          borderColor: 'rgba(33, 150, 243, 0.3)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 87, 34, 0.08)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

// Create theme context for better state management
const ThemeContext = React.createContext();

const useAppTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

// Component to conditionally show navigation
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  return (
    <>
      {!isAuthPage && <Navigation />}
      <Box 
        sx={{ 
          minHeight: '100vh',
          paddingBottom: { xs: 7, md: 0 } // Account for bottom navigation on mobile
        }}
      >
        {children}
      </Box>
    </>
  );
};

// Simple placeholder component for missing pages
const PlaceholderPage = ({ title }) => (
  <Box sx={{ p: 3, textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <h2>{title}</h2>
    <p>This page is under construction. Please check back later!</p>
  </Box>
);

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('ridesafe_dark_mode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('ridesafe_dark_mode', JSON.stringify(newMode));
      return newMode;
    });
  };

  const theme = createAppTheme(isDarkMode);
  
  const themeContextValue = {
    isDarkMode,
    toggleDarkMode,
    theme
  };

  useEffect(() => {
    document.body.classList.add('app-loaded');
    // Apply theme class to body for global styles
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <SocketProvider>
              <Router>
                <AppLayout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/search-location" element={
                      <ProtectedRoute>
                        <LocationSearchPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/home" element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/book-ride" element={
                      <ProtectedRoute>
                        <BookRidePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/rent-car" element={
                      <ProtectedRoute>
                        <RentCarPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/rent-car/book" element={
                      <ProtectedRoute>
                        <PlaceholderPage title="Complete Car Rental" />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/book-driver" element={
                      <ProtectedRoute>
                        <BookDriverPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/book-driver/details" element={
                      <ProtectedRoute>
                        <BookDriverDetailsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/book-driver/book" element={
                      <ProtectedRoute>
                        <PlaceholderPage title="Complete Driver Booking" />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/rides" element={
                      <ProtectedRoute>
                        <RidesPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/ride/:rideId" element={
                      <ProtectedRoute>
                        <RideDetailsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/driver/otp/:rideId" element={
                      <ProtectedRoute requiredRole="DRIVER">
                        <DriverOTPPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/driver" element={
                      <ProtectedRoute requiredRole="DRIVER">
                        <PlaceholderPage title="Driver Dashboard" />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/emergency" element={
                      <ProtectedRoute>
                        <PlaceholderPage title="Emergency SOS" />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  
                  {/* Global Toast Notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: isDarkMode ? '#2e2e2e' : '#333',
                        color: '#fff',
                        borderRadius: '12px',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      },
                      success: {
                        style: {
                          background: '#4caf50',
                          color: '#ffffff',
                        },
                      },
                      error: {
                        style: {
                          background: '#f44336',
                          color: '#ffffff',
                        },
                      },
                    }}
                  />
                </AppLayout>
              </Router>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

export { useAppTheme };
export default App;