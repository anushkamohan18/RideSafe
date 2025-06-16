import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Phone,
  Visibility,
  VisibilityOff,
  DirectionsCar
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'PASSENGER',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'agreeToTerms' ? event.target.checked : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { confirmPassword, agreeToTerms, ...registrationData } = formData;
    const result = await register(registrationData);
    
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Box className="auth-page">
      <Card className="auth-card" elevation={8} sx={{ maxWidth: 500 }}>
        <CardContent>
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <DirectionsCar sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Join RideSafe
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to get started
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    )
                  }}
                  autoComplete="name"
                  autoFocus
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    )
                  }}
                  autoComplete="email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    )
                  }}
                  autoComplete="tel"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleInputChange('role')}
                    label="Account Type"
                  >
                    <MenuItem value="PASSENGER">Passenger</MenuItem>
                    <MenuItem value="DRIVER">Driver</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  autoComplete="new-password"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange('agreeToTerms')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to the{' '}
                      <Link to="/terms" style={{ color: '#FF5722' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" style={{ color: '#FF5722' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.agreeToTerms && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.agreeToTerms}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Navigation Links */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#FF5722',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage; 