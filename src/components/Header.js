import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Home,
  Menu
} from '@mui/icons-material';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  const handleForwardNavigation = () => {
    navigate(1);
  };

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Navigation Arrows */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleBackNavigation}
            size="small"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleForwardNavigation}
            size="small"
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <ArrowForward />
          </IconButton>
        </Box>

        {/* Logo - Clickable and Responsive */}
        <Box
          onClick={handleLogoClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          <Home sx={{ mr: 1, fontSize: { xs: 24, md: 28 } }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              letterSpacing: '0.5px'
            }}
          >
            RideSafe
          </Typography>
        </Box>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            onClick={handleLogoClick}
            sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <Home />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
