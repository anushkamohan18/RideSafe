import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Rating,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CarRental,
  LocationOn,
  Schedule,
  Star,
  Verified,
  Person,
  Speed,
  LocalGasStation,
  AcUnit,
  Bluetooth,
  Gps,
  Security,
  DirectionsCar,
  CalendarToday,
  AccessTime,
  Payment,
  Check,
  Clear,
  FilterList,
  Search,
  MyLocation,
  Info
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RentCarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
    carType: '',
    priceRange: '',
    transmission: '',
    fuelType: ''
  });
  
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    extras: [],
    driverRequired: false,
    insurance: 'basic',
    totalCost: 0
  });

  // Sample car data - In real app, this would come from API
  const sampleCars = [
    {
      id: 1,
      name: 'Honda City',
      type: 'Sedan',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop',
      pricePerDay: 2500,
      rating: 4.5,
      reviewCount: 128,
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: 5,
      year: 2022,
      features: ['AC', 'Bluetooth', 'GPS'],
      location: 'Mumbai Central',
      available: true,
      owner: {
        name: 'Raj Motors',
        rating: 4.8,
        totalCars: 25
      },
      specs: {
        mileage: '16 km/l',
        engine: '1.5L',
        power: '119 HP'
      }
    },
    {
      id: 2,
      name: 'Maruti Swift',
      type: 'Hatchback',
      image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500&h=300&fit=crop',
      pricePerDay: 1800,
      rating: 4.3,
      reviewCount: 95,
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: 5,
      year: 2023,
      features: ['AC', 'Music System'],
      location: 'Andheri West',
      available: true,
      owner: {
        name: 'Swift Rentals',
        rating: 4.6,
        totalCars: 15
      },
      specs: {
        mileage: '22 km/l',
        engine: '1.2L',
        power: '82 HP'
      }
    },
    {
      id: 3,
      name: 'Toyota Innova',
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=300&fit=crop',
      pricePerDay: 4500,
      rating: 4.7,
      reviewCount: 203,
      transmission: 'Manual',
      fuelType: 'Diesel',
      seats: 8,
      year: 2022,
      features: ['AC', 'GPS', 'Bluetooth', 'USB Charging'],
      location: 'Bandra',
      available: true,
      owner: {
        name: 'Premium Car Rental',
        rating: 4.9,
        totalCars: 40
      },
      specs: {
        mileage: '14 km/l',
        engine: '2.4L',
        power: '148 HP'
      }
    },
    {
      id: 4,
      name: 'Hyundai i20',
      type: 'Hatchback',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&h=300&fit=crop',
      pricePerDay: 2200,
      rating: 4.4,
      reviewCount: 156,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 5,
      year: 2023,
      features: ['AC', 'Bluetooth', 'Touchscreen', 'Reverse Camera'],
      location: 'Powai',
      available: true,
      owner: {
        name: 'Auto Hub',
        rating: 4.7,
        totalCars: 30
      },
      specs: {
        mileage: '18 km/l',
        engine: '1.2L',
        power: '88 HP'
      }
    },
    {
      id: 5,
      name: 'Mahindra Scorpio',
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop',
      pricePerDay: 3800,
      rating: 4.2,
      reviewCount: 87,
      transmission: 'Manual',
      fuelType: 'Diesel',
      seats: 7,
      year: 2021,
      features: ['AC', 'GPS', 'Music System'],
      location: 'Thane',
      available: false,
      owner: {
        name: 'Adventure Rentals',
        rating: 4.5,
        totalCars: 20
      },
      specs: {
        mileage: '15 km/l',
        engine: '2.2L',
        power: '130 HP'
      }
    }
  ];

  const extraServices = [
    { id: 'driver', name: 'Driver Service', price: 800, description: 'Professional driver for your trip' },
    { id: 'gps', name: 'GPS Navigation', price: 200, description: 'Latest GPS device with real-time traffic' },
    { id: 'childSeat', name: 'Child Seat', price: 300, description: 'Safety-certified child seat' },
    { id: 'wifi', name: 'WiFi Hotspot', price: 400, description: 'High-speed internet on the go' },
    { id: 'fuel', name: 'Full Tank', price: 0, description: 'Car delivered with full fuel tank' }
  ];

  const steps = ['Vehicle Details', 'Pickup & Return', 'Extras & Insurance', 'Payment'];

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, cars]);

  const loadCars = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCars(sampleCars);
      setFilteredCars(sampleCars.filter(car => car.available));
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = cars.filter(car => car.available);

    if (filters.location) {
      filtered = filtered.filter(car => 
        car.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.carType) {
      filtered = filtered.filter(car => car.type === filters.carType);
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
    }

    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuelType === filters.fuelType);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(car => car.pricePerDay >= min && car.pricePerDay <= max);
    }

    setFilteredCars(filtered);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleBookNow = (car) => {
    setSelectedCar(car);
    setBookingData({
      ...bookingData,
      pickupLocation: car.location,
      dropoffLocation: car.location
    });
    setBookingDialogOpen(true);
  };

  const handleBookingDataChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExtraToggle = (extraId) => {
    setBookingData(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(id => id !== extraId)
        : [...prev.extras, extraId]
    }));
  };

  const calculateTotalCost = () => {
    if (!selectedCar || !bookingData.pickupDate || !bookingData.returnDate) return 0;

    const pickup = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);
    const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));

    let total = selectedCar.pricePerDay * days;

    // Add driver cost
    if (bookingData.driverRequired) {
      total += 800 * days;
    }

    // Add extras
    bookingData.extras.forEach(extraId => {
      const extra = extraServices.find(e => e.id === extraId);
      if (extra) {
        total += extra.price * days;
      }
    });

    // Add insurance
    if (bookingData.insurance === 'comprehensive') {
      total += 500 * days;
    } else if (bookingData.insurance === 'premium') {
      total += 300 * days;
    }

    return total;
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      
      const bookingPayload = {
        carId: selectedCar.id,
        ...bookingData,
        totalCost: calculateTotalCost(),
        userId: user.id
      };

      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Car booked successfully!');
      setBookingDialogOpen(false);
      setActiveStep(0);
      
      // Navigate to booking confirmation or rides page
      navigate('/rides');
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book car');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode this
          setFilters(prev => ({ ...prev, location: 'Current Location' }));
          toast.success('Location updated');
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    }
  };

  const CarCard = ({ car }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={car.image}
        alt={car.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {car.name}
          </Typography>
          <Chip
            label={car.type}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating value={car.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            {car.rating} ({car.reviewCount} reviews)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {car.location}
          </Typography>
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="caption">{car.seats} seats</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Speed fontSize="small" color="action" />
              <Typography variant="caption">{car.transmission}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalGasStation fontSize="small" color="action" />
              <Typography variant="caption">{car.fuelType}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="caption">{car.year}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Features:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {car.features.map((feature, index) => (
              <Chip key={index} label={feature} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                ₹{car.pricePerDay}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                per day
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Owner: {car.owner.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star fontSize="small" color="warning" />
                <Typography variant="caption">
                  {car.owner.rating} • {car.owner.totalCars} cars
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => handleBookNow(car)}
            disabled={!car.available}
            sx={{ py: 1.5 }}
          >
            {car.available ? 'Book Now' : 'Not Available'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Rent a Car
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Find and book the perfect car for your journey
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            Search & Filter
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                value={filters.location}
                onChange={handleFilterChange('location')}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <IconButton size="small" onClick={getCurrentLocation}>
                      <MyLocation />
                    </IconButton>
                  )
                }}
                placeholder="Search by area..."
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Pickup Date"
                type="date"
                value={filters.pickupDate}
                onChange={handleFilterChange('pickupDate')}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Return Date"
                type="date"
                value={filters.returnDate}
                onChange={handleFilterChange('returnDate')}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: filters.pickupDate || new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Car Type</InputLabel>
                <Select
                  value={filters.carType}
                  onChange={handleFilterChange('carType')}
                  label="Car Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Hatchback">Hatchback</MenuItem>
                  <MenuItem value="Sedan">Sedan</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Luxury">Luxury</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={filters.priceRange}
                  onChange={handleFilterChange('priceRange')}
                  label="Price Range"
                >
                  <MenuItem value="">Any Price</MenuItem>
                  <MenuItem value="0-2000">Under ₹2,000</MenuItem>
                  <MenuItem value="2000-3000">₹2,000 - ₹3,000</MenuItem>
                  <MenuItem value="3000-5000">₹3,000 - ₹5,000</MenuItem>
                  <MenuItem value="5000-10000">Above ₹5,000</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Transmission</InputLabel>
                <Select
                  value={filters.transmission}
                  onChange={handleFilterChange('transmission')}
                  label="Transmission"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Manual">Manual</MenuItem>
                  <MenuItem value="Automatic">Automatic</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  value={filters.fuelType}
                  onChange={handleFilterChange('fuelType')}
                  label="Fuel Type"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Petrol">Petrol</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Electric">Electric</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading available cars...
          </Typography>
        </Box>
      ) : filteredCars.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CarRental sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No cars found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Try adjusting your filters or search criteria
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setFilters({
                location: '',
                pickupDate: '',
                returnDate: '',
                carType: '',
                priceRange: '',
                transmission: '',
                fuelType: ''
              })}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {filteredCars.length} cars available
            </Typography>
            <Chip
              icon={<DirectionsCar />}
              label={`${filteredCars.length} available`}
              color="success"
              variant="outlined"
            />
          </Box>

          <Grid container spacing={3}>
            {filteredCars.map((car) => (
              <Grid item xs={12} md={6} lg={4} key={car.id}>
                <CarCard car={car} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Book {selectedCar?.name}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {index === 0 && (
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Vehicle Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <img
                            src={selectedCar?.image}
                            alt={selectedCar?.name}
                            style={{ width: '100%', borderRadius: 8 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h5" gutterBottom>
                            {selectedCar?.name}
                          </Typography>
                          <Typography variant="h4" color="primary" gutterBottom>
                            ₹{selectedCar?.pricePerDay}/day
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon><Person /></ListItemIcon>
                              <ListItemText primary={`${selectedCar?.seats} seats`} />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><Speed /></ListItemIcon>
                              <ListItemText primary={selectedCar?.transmission} />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon><LocalGasStation /></ListItemIcon>
                              <ListItemText primary={selectedCar?.fuelType} />
                            </ListItem>
                          </List>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {index === 1 && (
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Pickup & Return Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Pickup Location"
                            value={bookingData.pickupLocation}
                            onChange={handleBookingDataChange('pickupLocation')}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Drop-off Location"
                            value={bookingData.dropoffLocation}
                            onChange={handleBookingDataChange('dropoffLocation')}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Pickup Date"
                            type="date"
                            value={bookingData.pickupDate}
                            onChange={handleBookingDataChange('pickupDate')}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Pickup Time"
                            type="time"
                            value={bookingData.pickupTime}
                            onChange={handleBookingDataChange('pickupTime')}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Return Date"
                            type="date"
                            value={bookingData.returnDate}
                            onChange={handleBookingDataChange('returnDate')}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Return Time"
                            type="time"
                            value={bookingData.returnTime}
                            onChange={handleBookingDataChange('returnTime')}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {index === 2 && (
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Extra Services & Insurance
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bookingData.driverRequired}
                            onChange={handleBookingDataChange('driverRequired')}
                          />
                        }
                        label="Include Driver (₹800/day)"
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="subtitle1" gutterBottom>
                        Additional Services:
                      </Typography>
                      {extraServices.map((extra) => (
                        <FormControlLabel
                          key={extra.id}
                          control={
                            <Checkbox
                              checked={bookingData.extras.includes(extra.id)}
                              onChange={() => handleExtraToggle(extra.id)}
                            />
                          }
                          label={`${extra.name} - ₹${extra.price}${extra.id === 'fuel' ? '' : '/day'}`}
                          sx={{ display: 'block', mb: 1 }}
                        />
                      ))}

                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                        Insurance:
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={bookingData.insurance}
                          onChange={handleBookingDataChange('insurance')}
                        >
                          <MenuItem value="basic">Basic (Included)</MenuItem>
                          <MenuItem value="comprehensive">Comprehensive (+₹300/day)</MenuItem>
                          <MenuItem value="premium">Premium (+₹500/day)</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  {index === 3 && (
                    <Box sx={{ py: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h4" color="primary" align="center">
                          Total: ₹{calculateTotalCost()}
                        </Typography>
                      </Card>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Secure payment processing. Your booking will be confirmed immediately.
                        </Typography>
                      </Alert>
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
                        onClick={handleBookingSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                      >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={
                          (index === 1 && (!bookingData.pickupDate || !bookingData.returnDate))
                        }
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RentCarPage;
