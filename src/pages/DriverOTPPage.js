import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Error
} from '@mui/icons-material';

const DriverOTPPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const handleOTPChange = (event) => {
    const value = event.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 4) {
      setOtp(value);
      setError('');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      setError('Please enter a 4-digit OTP');
      return;
    }

    setVerifying(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      // For demo, any 4-digit OTP works
      setVerified(true);
      setVerifying(false);
      
      // Redirect to trip tracking after verification
      setTimeout(() => {
        navigate(`/driver/trip/${rideId}`);
      }, 2000);
    }, 1500);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && otp.length === 4) {
      handleVerifyOTP();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Security sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Enter Passenger OTP
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ask the passenger for their 4-digit ride OTP to start the trip
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {!verified ? (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                Ride #{rideId}
              </Typography>
              
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={handleOTPChange}
                onKeyPress={handleKeyPress}
                placeholder="0000"
                disabled={verifying}
                inputProps={{
                  maxLength: 4,
                  style: { 
                    textAlign: 'center', 
                    fontSize: '2rem',
                    letterSpacing: '1rem'
                  }
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '2rem'
                  }
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Error />
                    {error}
                  </Box>
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerifyOTP}
                disabled={otp.length !== 4 || verifying}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {verifying ? 'Verifying...' : 'Verify OTP & Start Trip'}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                The passenger will provide you with a 4-digit OTP
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
                OTP Verified Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Trip has started. Redirecting to navigation...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default DriverOTPPage;
