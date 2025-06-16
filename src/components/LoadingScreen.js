import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';

const LoadingScreen = ({ 
  message = 'Loading...', 
  fullScreen = true,
  showLogo = true 
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4
      }}
    >
      {showLogo && (
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          <DirectionsCar sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      )}

      <CircularProgress 
        size={40} 
        thickness={4}
        sx={{ 
          color: 'primary.main',
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} 
      />

      <Typography 
        variant="h6" 
        color="text.primary"
        sx={{ 
          fontWeight: 500,
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>

      {showLogo && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          RideSafe - Safe ride sharing for everyone
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        minHeight: 200
      }}
    >
      {content}
    </Paper>
  );
};

export default LoadingScreen; 