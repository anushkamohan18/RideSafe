import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import { Box, Typography, Button } from '@mui/material';
import { Lock } from '@mui/icons-material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Lock sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to access this page. 
            {requiredRole && ` This page requires ${requiredRole.toLowerCase()} access.`}
          </Typography>

          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute; 