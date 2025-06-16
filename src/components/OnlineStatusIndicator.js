import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Wifi, WifiOff, SignalWifi4Bar, SignalWifiOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const OnlineStatusIndicator = ({ variant = 'chip' }) => {
  const { isOnline } = useAuth();

  if (variant === 'chip') {
    return (
      <Chip
        icon={isOnline ? <Wifi /> : <WifiOff />}
        label={isOnline ? 'Online' : 'Offline'}
        color={isOnline ? 'success' : 'error'}
        size="small"
        sx={{
          fontWeight: 'bold',
          '& .MuiChip-icon': {
            fontSize: '1rem'
          }
        }}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: isOnline ? 'success.50' : 'error.50',
          border: 1,
          borderColor: isOnline ? 'success.main' : 'error.main'
        }}
      >
        {isOnline ? (
          <SignalWifi4Bar sx={{ fontSize: '1rem', color: 'success.main' }} />
        ) : (
          <SignalWifiOff sx={{ fontSize: '1rem', color: 'error.main' }} />
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 'bold',
            color: isOnline ? 'success.main' : 'error.main'
          }}
        >
          {isOnline ? 'Online' : 'Offline'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {isOnline ? (
        <Wifi sx={{ color: 'success.main', fontSize: '1.2rem' }} />
      ) : (
        <WifiOff sx={{ color: 'error.main', fontSize: '1.2rem' }} />
      )}
      <Typography
        variant="body2"
        sx={{
          color: isOnline ? 'success.main' : 'error.main',
          fontWeight: 'bold'
        }}
      >
        {isOnline ? 'Online' : 'Offline'}
      </Typography>
    </Box>
  );
};

export default OnlineStatusIndicator;
