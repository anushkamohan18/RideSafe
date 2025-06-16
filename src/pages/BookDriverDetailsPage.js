import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  PersonAdd,
  LocationOn,
  Schedule,
  Payment,
  Phone,
  Star,
  Check,
  DirectionsCar,
  Person,
  AccessTime,
  CalendarToday,
  Notes,
  Security,
  Verified,
  MyLocation,
  GpsFixed,
  People
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import OnlineStatusIndicator from '../components/OnlineStatusIndicator';

const BookDriverDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isOnline } = useAuth();
  const { driver } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState({
    pickup: false,
    dropoff: false
  });
  
  const [bookingData, setBookingData] = useState({
    // Trip Details
    pickupLocation: '',
    dropoffLocation: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    duration: 'hourly',
    estimatedHours: 2,
    
    // Service Type
    serviceType: driver?.hasOwnCar ? 'with-car' : 'driver-only',
    
    // Contact Information
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    alternatePhone: '',
    
    // Special Requirements
    specialInstructions: '',
    requirementsNotes: '',
    genderPreference: 'no-preference',
    
    // Pricing
    totalCost: 0,
    
    // Payment
    paymentMethod: 'cash'
  });

  const steps = [
    'Trip Details',
    'Contact Information', 
    'Special Requirements',
    'Review & Confirm'
  ];

  const durationOptions = [
    { value: 'hourly', label: 'Hourly Booking', description: 'Book by the hour' },
    { value: 'half-day', label: 'Half Day (4 hours)', description: 'Up to 4 hours' },
    { value: 'full-day', label: 'Full Day (8 hours)', description: 'Up to 8 hours' },
    { value: 'custom', label: 'Custom Duration', description: 'Specify exact duration' }
  ];

  React.useEffect(() => {
    if (!driver) {
      navigate('/book-driver');
      return;
    }
    calculateCost();
  }, [driver, bookingData.duration, bookingData.estimatedHours, bookingData.serviceType]);

  const calculateCost = () => {
    if (!driver) return;

    let cost = 0;
    let hours = bookingData.estimatedHours;

    switch (bookingData.duration) {
      case 'hourly':
        hours = bookingData.estimatedHours;
        break;
      case 'half-day':
        hours = 4;
        break;
      case 'full-day':
        hours = 8;
        break;
      case 'custom':
        hours = bookingData.estimatedHours;
        break;
    }

    // Driver cost
    cost = driver.hourlyRate * hours;
    
    // Add car cost if applicable
    if (bookingData.serviceType === 'with-car' && driver.hasOwnCar) {
      cost += driver.carDetails.carHourlyRate * hours;
    }

    setBookingData(prev => ({ ...prev, totalCost: cost }));
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Trip Details
        if (!bookingData.pickupLocation.trim()) {
          toast.error('Please enter pickup location');
          return false;
        }
        if (!bookingData.bookingDate) {
          toast.error('Please select booking date');
          return false;
        }
        if (!bookingData.startTime) {
          toast.error('Please select start time');
          return false;
        }
        break;
      case 1: // Contact Information
        if (!bookingData.contactName.trim()) {
          toast.error('Please enter contact name');
          return false;
        }
        if (!bookingData.contactPhone.trim()) {
          toast.error('Please enter contact phone');
          return false;
        }
        break;
      case 2: // Special Requirements - Optional
        break;
      default:
        break;
    }
    return true;
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      
      const bookingPayload = {
        driverId: driver.id,
        ...bookingData,
        userId: user.id,
        status: 'pending'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Driver booked successfully!');
      setConfirmDialogOpen(false);
      
      // Navigate to booking confirmation
      navigate('/bookings', { 
        state: { 
          bookingConfirmed: true, 
          booking: { ...bookingPayload, id: Date.now() } 
        } 
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book driver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (field = 'pickup') => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(prev => ({ ...prev, [field]: true }));
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use multiple geocoding services for better address names
          let address = '';
          
          try {
            // Primary: OpenStreetMap Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'RideSafeApp/1.0'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.address) {
                const addr = data.address;
                // Prioritize locality/suburb names for cleaner addresses
                const locationParts = [
                  addr.suburb || addr.neighbourhood || addr.locality,
                  addr.city || addr.town || addr.village,
                  addr.state
                ].filter(Boolean);
                
                if (locationParts.length > 0) {
                  address = locationParts.slice(0, 2).join(', ');
                } else if (data.display_name) {
                  // Fallback to formatted display name
                  const parts = data.display_name.split(',');
                  address = parts.slice(0, 3).join(', ').trim();
                }
              }
            }
          } catch (error) {
            console.log('Primary geocoding failed:', error);
          }
          
          // Secondary: BigDataCloud for better locality names
          if (!address) {
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              
              if (response.ok) {
                const data = await response.json();
                const locationParts = [
                  data.locality,
                  data.city || data.principalSubdivision
                ].filter(Boolean);
                
                if (locationParts.length > 0) {
                  address = locationParts.join(', ');
                }
              }
            } catch (error) {
              console.log('Secondary geocoding failed:', error);
            }
          }
          
          // Tertiary: Google-style format using coordinates with area detection
          if (!address) {
            try {
              // This is a simplified approach - in production you'd use Google Maps API
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&language=en&pretty=1&no_annotations=1`
              );
              
              if (response.ok) {
                const data = await response.json();
                if (data.results && data.results[0]) {
                  const result = data.results[0];
                  const components = result.components;
                  
                  const locationParts = [
                    components.suburb || components.neighbourhood || components.locality,
                    components.city || components.town
                  ].filter(Boolean);
                  
                  address = locationParts.length > 0 ? locationParts.join(', ') : result.formatted;
                }
              }
            } catch (error) {
              console.log('Tertiary geocoding failed:', error);
            }
          }
          
          // Final fallback
          if (!address) {
            address = `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          
          const fieldName = field === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
          setBookingData(prev => ({ 
            ...prev, 
            [fieldName]: address 
          }));
          
          toast.success(`${address} set as ${field === 'pickup' ? 'pickup' : 'destination'} location`);
          
        } catch (error) {
          console.error('Location detection error:', error);
          const { latitude, longitude } = position.coords;
          const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const fieldName = field === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
          setBookingData(prev => ({ 
            ...prev, 
            [fieldName]: coordsAddress 
          }));
          toast.success(`Coordinates set for ${field === 'pickup' ? 'pickup' : 'destination'}`);
        } finally {
          setLocationLoading(prev => ({ ...prev, [field]: false }));
        }
      },
      (error) => {
        setLocationLoading(prev => ({ ...prev, [field]: false }));
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('Unable to retrieve location. Please enter manually.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  if (!driver) {
    return (
      <Container maxWidth="md" sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="h6">Driver information not found</Typography>
        <Button onClick={() => navigate('/book-driver')} sx={{ mt: 2 }}>
          Back to Driver Selection
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header with Online Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Book {driver.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete your driver booking details
          </Typography>
        </Box>
        <OnlineStatusIndicator variant="badge" />
      </Box>

      {/* Offline Warning */}
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You are currently offline. Some features may not work properly. Please check your internet connection.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Driver Information Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              {/* Online Status in Card Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  Driver Information
                </Typography>
                <OnlineStatusIndicator variant="chip" />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={driver.photo}
                  sx={{ width: 60, height: 60 }}
                >
                  {driver.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {driver.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={driver.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {driver.rating} ({driver.reviews})
                    </Typography>
                  </Box>
                  {driver.verified && (
                    <Chip
                      icon={<Verified />}
                      label="Verified"
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Experience
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {driver.experience} years
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {driver.location}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Response Time
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {driver.responseTime}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Completed Trips
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {driver.completedTrips.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Service Type */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Service Type:
                </Typography>
                <Chip
                  icon={bookingData.serviceType === 'with-car' ? <DirectionsCar /> : <Person />}
                  label={bookingData.serviceType === 'with-car' ? 'Driver + Car' : 'Driver Only'}
                  color={bookingData.serviceType === 'with-car' ? 'success' : 'primary'}
                  variant="outlined"
                />
              </Box>

              {/* Car Details */}
              {bookingData.serviceType === 'with-car' && driver.hasOwnCar && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Car Details:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {driver.carDetails.make} {driver.carDetails.model} ({driver.carDetails.year})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {driver.carDetails.fuelType} • {driver.carDetails.seats} seats
                  </Typography>
                </Box>
              )}

              {/* Pricing */}
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Estimated Cost
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Driver Rate:</Typography>
                  <Typography variant="body2">₹{driver.hourlyRate}/hr</Typography>
                </Box>
                {bookingData.serviceType === 'with-car' && driver.hasOwnCar && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Car Rate:</Typography>
                    <Typography variant="body2">₹{driver.carDetails.carHourlyRate}/hr</Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary.main">
                    ₹{bookingData.totalCost}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {/* Step 0: Trip Details */}
                      {index === 0 && (
                        <Box sx={{ py: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                            Pickup & Return Details
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Pickup Location
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                <TextField
                                  fullWidth
                                  value={bookingData.pickupLocation}
                                  onChange={handleInputChange('pickupLocation')}
                                  placeholder="Enter pickup address..."
                                  required
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: 'grey.900',
                                      color: 'white',
                                      '& fieldset': {
                                        borderColor: 'grey.700',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'grey.600',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                      },
                                    },
                                    '& .MuiInputBase-input': {
                                      color: 'white',
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                      color: 'grey.400',
                                    }
                                  }}
                                />
                                <Button
                                  variant="outlined"
                                  onClick={() => getCurrentLocation('pickup')}
                                  disabled={locationLoading.pickup}
                                  startIcon={locationLoading.pickup ? <CircularProgress size={16} /> : <GpsFixed />}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    height: '56px',
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                      borderColor: 'primary.dark',
                                      backgroundColor: 'primary.50'
                                    }
                                  }}
                                >
                                  {locationLoading.pickup ? 'Locating...' : 'Current'}
                                </Button>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Drop-off Location
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                <TextField
                                  fullWidth
                                  value={bookingData.dropoffLocation}
                                  onChange={handleInputChange('dropoffLocation')}
                                  placeholder="Enter destination address (if applicable)..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: 'grey.900',
                                      color: 'white',
                                      '& fieldset': {
                                        borderColor: 'grey.700',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'grey.600',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'secondary.main',
                                      },
                                    },
                                    '& .MuiInputBase-input': {
                                      color: 'white',
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                      color: 'grey.400',
                                    }
                                  }}
                                />
                                <Button
                                  variant="outlined"
                                  onClick={() => getCurrentLocation('dropoff')}
                                  disabled={locationLoading.dropoff}
                                  startIcon={locationLoading.dropoff ? <CircularProgress size={16} /> : <GpsFixed />}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    height: '56px',
                                    borderColor: 'secondary.main',
                                    color: 'secondary.main',
                                    '&:hover': {
                                      borderColor: 'secondary.dark',
                                      backgroundColor: 'secondary.50'
                                    }
                                  }}
                                >
                                  {locationLoading.dropoff ? 'Locating...' : 'Current'}
                                </Button>
                              </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Pickup Date
                              </Typography>
                              <TextField
                                fullWidth
                                type="date"
                                value={bookingData.bookingDate}
                                onChange={handleInputChange('bookingDate')}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                  min: new Date().toISOString().split('T')[0]
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Pickup Time
                              </Typography>
                              <TextField
                                fullWidth
                                type="time"
                                value={bookingData.startTime}
                                onChange={handleInputChange('startTime')}
                                InputLabelProps={{ shrink: true }}
                                required
                              />
                            </Grid>

                            {/* Gender Preference - Moved to Trip Details for better visibility */}
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: 'primary.main' }}>
                                Driver Preference:
                              </Typography>
                              <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2, bgcolor: 'grey.50' }}>
                                <RadioGroup
                                  value={bookingData.genderPreference}
                                  onChange={handleInputChange('genderPreference')}
                                  row
                                  sx={{ justifyContent: 'space-around' }}
                                >
                                  <FormControlLabel
                                    value="no-preference"
                                    control={<Radio />}
                                    label={
                                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <People color="primary" />
                                        <Typography variant="body2" fontWeight="bold">Any Driver</Typography>
                                        <Typography variant="caption" color="text.secondary">No Preference</Typography>
                                      </Box>
                                    }
                                  />
                                  <FormControlLabel
                                    value="male"
                                    control={<Radio />}
                                    label={
                                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <Person color="primary" />
                                        <Typography variant="body2" fontWeight="bold">Male Driver</Typography>
                                        <Typography variant="caption" color="text.secondary">Preferred</Typography>
                                      </Box>
                                    }
                                  />
                                  <FormControlLabel
                                    value="female"
                                    control={<Radio />}
                                    label={
                                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <Person color="secondary" />
                                        <Typography variant="body2" fontWeight="bold">Female Driver</Typography>
                                        <Typography variant="caption" color="text.secondary">Preferred</Typography>
                                      </Box>
                                    }
                                  />
                                </RadioGroup>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                  Choose your preferred driver for comfort and safety
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>
                                Duration Type:
                              </Typography>
                              <RadioGroup
                                value={bookingData.duration}
                                onChange={handleInputChange('duration')}
                              >
                                {durationOptions.map((option) => (
                                  <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={
                                      <Box>
                                        <Typography variant="body1">{option.label}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {option.description}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                ))}
                              </RadioGroup>
                            </Grid>
                            {(bookingData.duration === 'hourly' || bookingData.duration === 'custom') && (
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Estimated Hours"
                                  type="number"
                                  value={bookingData.estimatedHours}
                                  onChange={handleInputChange('estimatedHours')}
                                  inputProps={{ min: 1, max: 24 }}
                                  helperText="Minimum 1 hour, maximum 24 hours"
                                />
                              </Grid>
                            )}
                            {driver.hasOwnCar && (
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Service Type:
                                </Typography>
                                <RadioGroup
                                  value={bookingData.serviceType}
                                  onChange={handleInputChange('serviceType')}
                                >
                                  <FormControlLabel
                                    value="driver-only"
                                    control={<Radio />}
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person />
                                        <Box>
                                          <Typography variant="body1">Driver Only</Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            ₹{driver.hourlyRate}/hour - Use your own vehicle
                                          </Typography>
                                        </Box>
                                      </Box>
                                    }
                                  />
                                  <FormControlLabel
                                    value="with-car"
                                    control={<Radio />}
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DirectionsCar />
                                        <Box>
                                          <Typography variant="body1">Driver + Car</Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            ₹{driver.hourlyRate + driver.carDetails.carHourlyRate}/hour - Complete solution
                                          </Typography>
                                        </Box>
                                      </Box>
                                    }
                                  />
                                </RadioGroup>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}

                      {/* Step 1: Contact Information */}
                      {index === 1 && (
                        <Box sx={{ py: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Contact Name"
                                value={bookingData.contactName}
                                onChange={handleInputChange('contactName')}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Contact Phone"
                                value={bookingData.contactPhone}
                                onChange={handleInputChange('contactPhone')}
                                InputProps={{
                                  startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                                }}
                                required
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Alternate Phone (Optional)"
                                value={bookingData.alternatePhone}
                                onChange={handleInputChange('alternatePhone')}
                                InputProps={{
                                  startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* Step 2: Special Requirements - Remove gender preference from here since it's now in Trip Details */}
                      {index === 2 && (
                        <Box sx={{ py: 2 }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                            Special Instructions & Additional Notes
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Special Instructions"
                                multiline
                                rows={3}
                                value={bookingData.specialInstructions}
                                onChange={handleInputChange('specialInstructions')}
                                placeholder="Any specific requirements or instructions for the driver..."
                                InputProps={{
                                  startAdornment: <Notes color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Additional Notes"
                                multiline
                                rows={2}
                                value={bookingData.requirementsNotes}
                                onChange={handleInputChange('requirementsNotes')}
                                placeholder="Any other requirements or preferences..."
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* Step 3: Review & Confirm */}
                      {index === 3 && (
                        <Box sx={{ py: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Booking Summary
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon><LocationOn /></ListItemIcon>
                              <ListItemText
                                primary="Pickup Location"
                                secondary={bookingData.pickupLocation}
                              />
                            </ListItem>
                            {bookingData.dropoffLocation && (
                              <ListItem>
                                <ListItemIcon><LocationOn color="secondary" /></ListItemIcon>
                                <ListItemText
                                  primary="Drop-off Location"
                                  secondary={bookingData.dropoffLocation}
                                />
                              </ListItem>
                            )}
                            <ListItem>
                              <ListItemIcon><CalendarToday /></ListItemIcon>
                              <ListItemText
                                primary="Date & Time"
                                secondary={`${new Date(bookingData.bookingDate).toLocaleDateString()} at ${bookingData.startTime}`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><AccessTime /></ListItemIcon>
                              <ListItemText
                                primary="Duration"
                                secondary={
                                  bookingData.duration === 'hourly' ? `${bookingData.estimatedHours} hours` :
                                  bookingData.duration === 'half-day' ? '4 hours (Half Day)' :
                                  bookingData.duration === 'full-day' ? '8 hours (Full Day)' :
                                  `${bookingData.estimatedHours} hours (Custom)`
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                {bookingData.serviceType === 'with-car' ? <DirectionsCar /> : <Person />}
                              </ListItemIcon>
                              <ListItemText
                                primary="Service Type"
                                secondary={bookingData.serviceType === 'with-car' ? 'Driver + Car' : 'Driver Only'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><People /></ListItemIcon>
                              <ListItemText
                                primary="Gender Preference"
                                secondary={
                                  bookingData.genderPreference === 'no-preference' ? 'No Preference' :
                                  bookingData.genderPreference === 'male' ? 'Male Driver' :
                                  'Female Driver'
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Payment /></ListItemIcon>
                              <ListItemText
                                primary="Total Cost"
                                secondary={`₹${bookingData.totalCost}`}
                              />
                            </ListItem>
                          </List>
                        </Box>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                        >
                          Back
                        </Button>
                        {index === steps.length - 1 ? (
                          <Button
                            variant="contained"
                            onClick={() => setConfirmDialogOpen(true)}
                            startIcon={<Check />}
                          >
                            Confirm Booking
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={handleNext}
                          >
                            Continue
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Confirm Driver Booking
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to book {driver.name} for ₹{bookingData.totalCost}
          </Alert>
          <Typography variant="body1" gutterBottom>
            Please review your booking details:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Driver:</strong> {driver.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Date:</strong> {new Date(bookingData.bookingDate).toLocaleDateString()} at {bookingData.startTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Service:</strong> {bookingData.serviceType === 'with-car' ? 'Driver + Car' : 'Driver Only'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Gender Preference:</strong> {
                bookingData.genderPreference === 'no-preference' ? 'No Preference' :
                bookingData.genderPreference === 'male' ? 'Male Driver' :
                'Female Driver'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Cost:</strong> ₹{bookingData.totalCost}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The driver will be notified immediately and will contact you to confirm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          >
            {loading ? 'Booking...' : 'Confirm & Book'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookDriverDetailsPage;
