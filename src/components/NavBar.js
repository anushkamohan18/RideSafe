import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Home,
  DirectionsCar,
  Login,
  ArrowBack,
  ArrowForward,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleBookRideClick = () => {
    navigate('/book-ride');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  const handleForwardNavigation = () => {
    navigate(1);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      sx={{ 
        bgcolor: '#FF5722', // Orange color matching your design
        '& .MuiToolbar-root': {
          minHeight: { xs: 56, sm: 64 }
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        {/* Left side - Navigation arrows */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            color="inherit"
            onClick={handleBackNavigation}
            size="small"
            sx={{ 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleForwardNavigation}
            size="small"
            sx={{ 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              display: { xs: 'none', sm: 'inline-flex' }
            }}
          >
            <ArrowForward />
          </IconButton>
        </Box>

        {/* Center - Logo */}
        <Box
          onClick={handleLogoClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            },
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <DirectionsCar sx={{ mr: 1, fontSize: { xs: 24, md: 28 } }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              letterSpacing: '0.5px',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            RideSafe
          </Typography>
        </Box>

        {/* Right side - Navigation buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Home Button */}
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={handleHomeClick}
            sx={{
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              display: { xs: 'none', md: 'flex' }
            }}
          >
            Home
          </Button>

          {/* Book Ride Button */}
          <Button
            color="inherit"
            startIcon={<DirectionsCar />}
            onClick={handleBookRideClick}
            sx={{
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              bgcolor: 'rgba(255,255,255,0.1)',
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            Book Ride
          </Button>

          {/* Notifications */}
          <IconButton
            color="inherit"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Notifications />
          </IconButton>

          {/* Login/Profile Button */}
          {user ? (
            <IconButton
              onClick={handleProfileClick}
              sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          ) : (
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={handleLoginClick}
              sx={{
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                bgcolor: 'rgba(255,255,255,0.1)'
              }}
            >
              Login
            </Button>
          )}

          {/* Mobile Home Icon */}
          <IconButton
            color="inherit"
            onClick={handleHomeClick}
            sx={{ 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              display: { xs: 'inline-flex', md: 'none' }
            }}
          >
            <Home />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
