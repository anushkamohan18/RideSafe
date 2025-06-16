import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  DirectionsCar,
  History,
  Person,
  Settings,
  ExitToApp,
  Notifications,
  ReportProblem,
  Add,
  ArrowBack,
  Login,
  Search
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Find Location', icon: <Search />, path: '/search-location' },
    { text: 'Book Ride', icon: <Add />, path: '/book-ride' },
    { text: 'Rides', icon: <History />, path: '/rides' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Settings', icon: <Settings />, path: '/settings' }
  ];

  const bottomNavItems = [
    { label: 'Home', icon: <Home />, value: '/' },
    { label: 'Search', icon: <Search />, value: '/search-location' },
    { label: 'Book Ride', icon: <Add />, value: '/book-ride' },
    { label: 'Rides', icon: <History />, value: '/rides' },
    { label: 'Profile', icon: <Person />, value: '/profile' }
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setAnchorEl(null);
    navigate('/login');
  };

  const handleBackNavigation = () => {
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

  const currentBottomNavValue = bottomNavItems.find(item => item.value === location.pathname)?.value || '/';

  const DrawerContent = () => (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role?.toUpperCase() || 'USER'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <List>
        {menuItems
          .filter(item => !item.role || item.role === user?.role)
          .map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        
        <ListItem button onClick={() => handleNavigation('/emergency')}>
          <ListItemIcon>
            <ReportProblem color="error" />
          </ListItemIcon>
          <ListItemText primary="Emergency" />
        </ListItem>
      </List>
    </Box>
  );

  // Check if current page is home page
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          {/* Navigation Arrows */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            {!isHomePage && (
              <IconButton
                onClick={handleBackNavigation}
                sx={{ 
                  color: 'text.primary',
                  bgcolor: 'rgba(255, 87, 34, 0.08)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 87, 34, 0.15)',
                    transform: 'scale(1.05)',
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
          </Box>

          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: 'text.primary',
              '&:hover': { bgcolor: 'rgba(255, 87, 34, 0.08)' }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
              }}
            >
              <DirectionsCar sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={handleHomeClick}
            >
              RideSafe
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {/* Home Button */}
            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={handleHomeClick}
              sx={{
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                display: { xs: 'none', lg: 'flex' }
              }}
            >
              Home
            </Button>

            {/* Find Location Button */}
            {user && (
              <Button
                color="inherit"
                startIcon={<Search />}
                onClick={() => navigate('/search-location')}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  display: { xs: 'none', lg: 'flex' }
                }}
              >
                Find Location
              </Button>
            )}

            {/* Book Ride Button */}
            {user && (
              <Button
                color="inherit"
                startIcon={<Add />}
                onClick={handleBookRideClick}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  bgcolor: 'rgba(255,255,255,0.1)',
                  display: { xs: 'none', md: 'flex' }
                }}
              >
                Book Ride
              </Button>
            )}

            {!isConnected && (
              <Typography variant="body2" color="inherit" sx={{ opacity: 0.7 }}>
                Offline
              </Typography>
            )}
            
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Login/Profile Button */}
            {user ? (
              <IconButton color="inherit" onClick={handleMenuClick}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
          </Box>

          {/* Mobile Navigation Buttons */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
            <IconButton
              color="inherit"
              onClick={handleHomeClick}
            >
              <Home />
            </IconButton>
            
            {/* Find Location Mobile Button */}
            {user && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/search-location')}
              >
                <Search />
              </IconButton>
            )}
            
            {user ? (
              <IconButton color="inherit" onClick={handleMenuClick}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                onClick={handleLoginClick}
              >
                <Login />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleNavigation('/profile'); handleMenuClose(); }}>
          <ListItemIcon><Person /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleNavigation('/settings'); handleMenuClose(); }}>
          <ListItemIcon><Settings /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <DrawerContent />
      </Drawer>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNavigation
          value={currentBottomNavValue}
          onChange={(event, newValue) => {
            navigate(newValue);
          }}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}
    </>
  );
};

export default Navigation;