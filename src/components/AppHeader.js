import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton,
  Badge
} from '@mui/material';
import { Menu, Notifications } from '@mui/icons-material';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import { useAuth } from '../context/AuthContext';

const AppHeader = ({ title = 'RideSafe', onMenuClick }) => {
  const { user, isOnline } = useAuth();

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OnlineStatusIndicator variant="chip" />
          
          {user && (
            <>
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <Typography variant="body2" sx={{ color: 'white' }}>
                Welcome, {user.name}
              </Typography>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
