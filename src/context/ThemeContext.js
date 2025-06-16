import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

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
      grey: isDarkMode ? '#2e2e2e' : '#f5f5f5',
    },
    text: {
      primary: isDarkMode ? '#ffffff' : '#212529',
      secondary: isDarkMode ? '#b0b0b0' : '#6c757d',
      disabled: isDarkMode ? '#666666' : '#adb5bd',
    },
    grey: {
      50: isDarkMode ? '#fafafa' : '#fafafa',
      100: isDarkMode ? '#f5f5f5' : '#f5f5f5',
      200: isDarkMode ? '#eeeeee' : '#eeeeee',
      300: isDarkMode ? '#e0e0e0' : '#e0e0e0',
      400: isDarkMode ? '#bdbdbd' : '#bdbdbd',
      500: isDarkMode ? '#9e9e9e' : '#9e9e9e',
      600: isDarkMode ? '#757575' : '#757575',
      700: isDarkMode ? '#616161' : '#616161',
      800: isDarkMode ? '#424242' : '#424242',
      900: isDarkMode ? '#212121' : '#212121',
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
  components: {
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
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
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
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('ridesafe_dark_mode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const theme = createAppTheme(isDarkMode);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('ridesafe_dark_mode', JSON.stringify(newMode));
      return newMode;
    });
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    theme
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
