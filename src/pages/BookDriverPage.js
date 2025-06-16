import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  IconButton,
  Badge
} from '@mui/material';
import {
  PersonAdd,
  Star,
  Verified,
  Language,
  Schedule,
  LocationOn,
  Phone,
  Message,
  FilterList,
  Search,
  MyLocation,
  DriveEta,
  DirectionsCar,
  Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BookDriverPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    experience: '',
    rating: '',
    language: '',
    availability: '',
    priceRange: '',
    location: '',
    bookingType: 'driver-only',
    gender: '' // New gender filter
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Enhanced driver data with car availability
  const drivers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.8,
      reviews: 245,
      experience: 8,
      languages: ['Hindi', 'English'],
      location: 'Mumbai',
      hourlyRate: 200,
      dailyRate: 1500,
      specialities: ['City Tours', 'Airport Transfers', 'Long Distance'],
      verified: true,
      available: true,
      responseTime: '5 min',
      completedTrips: 1240,
      distance: null,
      hasOwnCar: true,
      carDetails: {
        make: 'Maruti',
        model: 'Swift Dzire',
        year: 2020,
        fuelType: 'Petrol',
        seats: 5,
        carHourlyRate: 300,
        carDailyRate: 2200
      }
    },
    {
      id: 2,
      name: 'Mohammed Ali',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4.9,
      reviews: 189,
      experience: 12,
      languages: ['Hindi', 'English', 'Urdu'],
      location: 'Delhi',
      hourlyRate: 250,
      dailyRate: 1800,
      specialities: ['Corporate Travel', 'VIP Service', 'Night Drives'],
      verified: true,
      available: false,
      responseTime: '3 min',
      completedTrips: 2100,
      distance: null,
      hasOwnCar: true,
      carDetails: {
        make: 'Honda',
        model: 'City',
        year: 2021,
        fuelType: 'Petrol',
        seats: 5,
        carHourlyRate: 400,
        carDailyRate: 2800
      }
    },
    {
      id: 3,
      name: 'Suresh Patel',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      rating: 4.6,
      reviews: 156,
      experience: 6,
      languages: ['Hindi', 'Gujarati'],
      location: 'Ahmedabad',
      hourlyRate: 180,
      dailyRate: 1200,
      specialities: ['Local Area Expert', 'Family Trips'],
      verified: true,
      available: true,
      responseTime: '8 min',
      completedTrips: 890,
      distance: null,
      hasOwnCar: false // Driver only
    },
    {
      id: 4,
      name: 'David Wilson',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      rating: 4.7,
      reviews: 98,
      experience: 5,
      languages: ['English', 'Hindi'],
      location: 'Bangalore',
      hourlyRate: 300,
      dailyRate: 2200,
      specialities: ['Tech Park Shuttles', 'International Clients'],
      verified: true,
      available: true,
      responseTime: '4 min',
      completedTrips: 560,
      distance: null
    },
    {
      id: 5,
      name: 'Ravi Sharma',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      rating: 4.5,
      reviews: 203,
      experience: 10,
      languages: ['Hindi', 'English', 'Punjabi'],
      location: 'Chandigarh',
      hourlyRate: 220,
      dailyRate: 1600,
      specialities: ['Hill Station Trips', 'Adventure Tours'],
      verified: true,
      available: true,
      responseTime: '6 min',
      completedTrips: 1450,
      distance: null
    },
    {
      id: 6,
      name: 'Priya Nair',
      gender: 'female',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b739?w=150',
      rating: 4.9,
      reviews: 167,
      experience: 7,
      languages: ['English', 'Malayalam', 'Hindi'],
      location: 'Kochi',
      hourlyRate: 240,
      dailyRate: 1700,
      specialities: ['Women Passengers', 'Corporate Travel', 'Backwater Tours'],
      verified: true,
      available: true,
      responseTime: '3 min',
      completedTrips: 1100,
      distance: null
    },
    {
      id: 7,
      name: 'Amit Singh',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1507919909716-c8262e491cde?w=150',
      rating: 4.4,
      reviews: 134,
      experience: 4,
      languages: ['Hindi', 'English'],
      location: 'Jaipur',
      hourlyRate: 190,
      dailyRate: 1400,
      specialities: ['Heritage Tours', 'Desert Safari', 'Photography Tours'],
      verified: true,
      available: true,
      responseTime: '7 min',
      completedTrips: 780,
      distance: null
    },
    {
      id: 8,
      name: 'Lakshmi Devi',
      gender: 'female',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 4.8,
      reviews: 198,
      experience: 9,
      languages: ['Tamil', 'English', 'Hindi'],
      location: 'Chennai',
      hourlyRate: 210,
      dailyRate: 1550,
      specialities: ['Temple Tours', 'Cultural Tours', 'Women Safety'],
      verified: true,
      available: true,
      responseTime: '5 min',
      completedTrips: 1320,
      distance: null
    },
    {
      id: 9,
      name: 'Arjun Reddy',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=150',
      rating: 4.6,
      reviews: 176,
      experience: 6,
      languages: ['Telugu', 'Hindi', 'English'],
      location: 'Hyderabad',
      hourlyRate: 200,
      dailyRate: 1500,
      specialities: ['IT Corridor', 'Business Travel', 'Tech Events'],
      verified: true,
      available: false,
      responseTime: '6 min',
      completedTrips: 980,
      distance: null
    },
    {
      id: 10,
      name: 'Vikram Joshi',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      rating: 4.7,
      reviews: 212,
      experience: 11,
      languages: ['Marathi', 'Hindi', 'English'],
      location: 'Pune',
      hourlyRate: 230,
      dailyRate: 1650,
      specialities: ['Corporate Shuttles', 'Airport Transfers', 'Event Transport'],
      verified: true,
      available: true,
      responseTime: '4 min',
      completedTrips: 1680,
      distance: null
    },
    {
      id: 11,
      name: 'Fatima Khan',
      gender: 'female',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      rating: 4.8,
      reviews: 143,
      experience: 5,
      languages: ['Urdu', 'Hindi', 'English'],
      location: 'Lucknow',
      hourlyRate: 185,
      dailyRate: 1350,
      specialities: ['City Tours', 'Women Passengers', 'Cultural Heritage'],
      verified: true,
      available: true,
      responseTime: '8 min',
      completedTrips: 720,
      distance: null
    },
    {
      id: 12,
      name: 'Karan Verma',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: 4.5,
      reviews: 189,
      experience: 8,
      languages: ['Hindi', 'English', 'Haryanvi'],
      location: 'Gurgaon',
      hourlyRate: 260,
      dailyRate: 1900,
      specialities: ['Corporate Travel', 'Cyber City', 'Executive Transport'],
      verified: true,
      available: true,
      responseTime: '5 min',
      completedTrips: 1240,
      distance: null
    },
    {
      id: 13,
      name: 'Meera Bhatia',
      gender: 'female',
      photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
      rating: 4.9,
      reviews: 156,
      experience: 6,
      languages: ['Hindi', 'English', 'Punjabi'],
      location: 'Amritsar',
      hourlyRate: 195,
      dailyRate: 1450,
      specialities: ['Golden Temple Tours', 'Border Tours', 'Religious Sites'],
      verified: true,
      available: true,
      responseTime: '6 min',
      completedTrips: 890,
      distance: null
    },
    {
      id: 14,
      name: 'Rohit Kapoor',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150',
      rating: 4.4,
      reviews: 167,
      experience: 7,
      languages: ['Hindi', 'English'],
      location: 'Noida',
      hourlyRate: 225,
      dailyRate: 1600,
      specialities: ['Metro Connectivity', 'Tech Hubs', 'Shopping Malls'],
      verified: true,
      available: false,
      responseTime: '7 min',
      completedTrips: 1050,
      distance: null
    },
    {
      id: 15,
      name: 'Anita Desai',
      gender: 'female',
      photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
      rating: 4.7,
      reviews: 198,
      experience: 9,
      languages: ['Gujarati', 'Hindi', 'English'],
      location: 'Surat',
      hourlyRate: 205,
      dailyRate: 1520,
      specialities: ['Textile Tours', 'Diamond Market', 'Business Travel'],
      verified: true,
      available: true,
      responseTime: '5 min',
      completedTrips: 1300,
      distance: null
    },
    {
      id: 16,
      name: 'Sandeep Yadav',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4.6,
      reviews: 145,
      experience: 10,
      languages: ['Hindi', 'English'],
      location: 'Agra',
      hourlyRate: 180,
      dailyRate: 1300,
      specialities: ['Taj Mahal Tours', 'Heritage Sites', 'Photography Tours'],
      verified: true,
      available: true,
      responseTime: '9 min',
      completedTrips: 1150,
      distance: null
    },
    {
      id: 17,
      name: 'Kavya Menon',
      gender: 'female',
      photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
      rating: 4.8,
      reviews: 134,
      experience: 4,
      languages: ['Malayalam', 'English', 'Tamil'],
      location: 'Trivandrum',
      hourlyRate: 190,
      dailyRate: 1400,
      specialities: ['Beach Tours', 'Ayurveda Centers', 'Women Safety'],
      verified: true,
      available: true,
      responseTime: '6 min',
      completedTrips: 650,
      distance: null
    },
    {
      id: 18,
      name: 'Hardeep Singh',
      gender: 'male',
      photo: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=150',
      rating: 4.5,
      reviews: 176,
      experience: 12,
      languages: ['Punjabi', 'Hindi', 'English'],
      location: 'Ludhiana',
      hourlyRate: 200,
      dailyRate: 1500,
      specialities: ['Industrial Tours', 'Agricultural Tours', 'Rural Areas'],
      verified: true,
      available: true,
      responseTime: '8 min',
      completedTrips: 1420,
      distance: null
    }
  ];

  const availableLocations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Kochi', 'Gurgaon', 'Noida', 'Surat', 'Agra', 'Trivandrum', 'Ludhiana', 'Lucknow', 'Amritsar'];

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get city name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      
      const city = data.address?.city || data.address?.town || data.address?.state_district || 'Unknown';
      
      setCurrentLocation({ latitude, longitude, city });
      setFilters(prev => ({ ...prev, location: city }));
      
      toast.success(`Location detected: ${city}`);
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Unable to detect your location. Please select manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Calculate distance between two locations (simplified)
  const calculateDistance = (userLat, userLon, driverLocation) => {
    // This is a simplified distance calculation
    const locationCoords = {
      'Mumbai': { lat: 19.0760, lon: 72.8777 },
      'Delhi': { lat: 28.7041, lon: 77.1025 },
      'Bangalore': { lat: 12.9716, lon: 77.5946 },
      'Chennai': { lat: 13.0827, lon: 80.2707 },
      'Kolkata': { lat: 22.5726, lon: 88.3639 },
      'Pune': { lat: 18.5204, lon: 73.8567 },
      'Hyderabad': { lat: 17.3850, lon: 78.4867 },
      'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'Jaipur': { lat: 26.9124, lon: 75.7873 },
      'Kochi': { lat: 9.9312, lon: 76.2673 },
      'Gurgaon': { lat: 28.4595, lon: 77.0266 },
      'Noida': { lat: 28.5355, lon: 77.3910 },
      'Surat': { lat: 21.1702, lon: 72.8311 },
      'Agra': { lat: 27.1767, lon: 78.0081 },
      'Trivandrum': { lat: 8.5241, lon: 76.9366 },
      'Ludhiana': { lat: 30.9010, lon: 75.8573 },
      'Lucknow': { lat: 26.8467, lon: 80.9462 },
      'Amritsar': { lat: 31.6340, lon: 74.8723 }
    };

    const coords = locationCoords[driverLocation];
    if (!coords) return null;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (coords.lat - userLat) * Math.PI / 180;
    const dLon = (coords.lon - userLon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(coords.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleBookDriver = (driver) => {
    if (!driver.available) {
      toast.error('This driver is currently not available');
      return;
    }
    
    // Navigate to detailed booking page
    navigate('/book-driver/details', { state: { driver } });
  };

  const handleContactDriver = (driver) => {
    toast.info(`Connecting you with ${driver.name}...`);
  };

  // Enhanced filtering with gender preference
  const filteredDrivers = drivers.filter(driver => {
    if (searchQuery && !driver.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !driver.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.experience && driver.experience < parseInt(filters.experience)) {
      return false;
    }
    if (filters.rating && driver.rating < parseFloat(filters.rating)) {
      return false;
    }
    if (filters.language && !driver.languages.includes(filters.language)) {
      return false;
    }
    if (filters.availability === 'available' && !driver.available) {
      return false;
    }
    if (filters.location && driver.location !== filters.location) {
      return false;
    }
    if (filters.gender && driver.gender !== filters.gender) {
      return false;
    }
    // New booking type filter
    if (filters.bookingType === 'with-car' && !driver.hasOwnCar) {
      return false;
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => parseInt(p.replace('+', '')));
      if (max) {
        if (driver.hourlyRate < min || driver.hourlyRate > max) return false;
      } else {
        if (driver.hourlyRate <= min) return false;
      }
    }
    return true;
  }).map(driver => {
    // Add distance if current location is available
    if (currentLocation) {
      const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, driver.location);
      return { ...driver, distance };
    }
    return driver;
  }).sort((a, b) => {
    // Sort by distance if available, otherwise by rating
    if (a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    return b.rating - a.rating;
  });

  // Enhanced DriverCard with booking type support
  const DriverCard = ({ driver }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              driver.verified ? (
                <Verified sx={{ fontSize: 20, color: 'primary.main' }} />
              ) : null
            }
          >
            <Avatar
              src={driver.photo}
              sx={{ 
                width: 80, 
                height: 80,
                border: driver.gender === 'female' ? '3px solid #e91e63' : '3px solid #2196f3'
              }}
            >
              {driver.name.charAt(0)}
            </Avatar>
          </Badge>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {driver.name}
              </Typography>
              <Chip 
                label={driver.gender === 'female' ? 'Female' : 'Male'} 
                size="small" 
                color={driver.gender === 'female' ? 'secondary' : 'primary'}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              {driver.available ? (
                <Chip label="Available" color="success" size="small" />
              ) : (
                <Chip label="Busy" color="error" size="small" />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={driver.rating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" color="text.secondary">
                {driver.rating} ({driver.reviews} reviews)
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2">{driver.location}</Typography>
              <Typography variant="body2" color="primary.main">
                • {driver.experience} years exp
              </Typography>
            </Box>

            {/* Service Type Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {driver.hasOwnCar ? (
                <Chip 
                  icon={<DirectionsCar />}
                  label="Driver + Car Available" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              ) : (
                <Chip 
                  icon={<Person />}
                  label="Driver Only" 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              )}
            </Box>

            {/* Distance Display */}
            {driver.distance !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip 
                  label={`${driver.distance} km away`} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Pricing Section */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={filters.bookingType === 'with-car' && driver.hasOwnCar ? 6 : 12}>
            <Typography variant="body2" color="text.secondary">
              Driver Rate
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              ₹{driver.hourlyRate}/hr
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ₹{driver.dailyRate}/day
            </Typography>
          </Grid>
          
          {/* Show car rates if booking with car and driver has car */}
          {filters.bookingType === 'with-car' && driver.hasOwnCar && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total (Driver + Car)
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                ₹{driver.hourlyRate + driver.carDetails.carHourlyRate}/hr
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ₹{driver.dailyRate + driver.carDetails.carDailyRate}/day
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Car Details for with-car bookings */}
        {filters.bookingType === 'with-car' && driver.hasOwnCar && (
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

        {/* Languages */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Languages:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {driver.languages.map((language, index) => (
              <Chip
                key={index}
                label={language}
                size="small"
                variant="outlined"
                icon={<Language />}
              />
            ))}
          </Box>
        </Box>

        {/* Specialities */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Specialities:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {driver.specialities.map((speciality, index) => (
              <Chip key={index} label={speciality} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Completed Trips
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {driver.completedTrips.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Response Time
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {driver.responseTime}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Message />}
            onClick={() => handleContactDriver(driver)}
            sx={{ flex: 1 }}
          >
            Contact
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleBookDriver(driver)}
            disabled={!driver.available || (filters.bookingType === 'with-car' && !driver.hasOwnCar)}
            sx={{ flex: 2 }}
          >
            {!driver.available 
              ? 'Not Available' 
              : filters.bookingType === 'with-car' && !driver.hasOwnCar
                ? 'No Car Available'
                : 'Book Now'
            }
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Book a Driver
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Hire a professional driver for your transportation needs
      </Typography>

      {/* Booking Type Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            What do you need?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: filters.bookingType === 'driver-only' ? 2 : 1,
                  borderColor: filters.bookingType === 'driver-only' ? 'primary.main' : 'divider',
                  transform: filters.bookingType === 'driver-only' ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    borderColor: 'primary.main',
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => setFilters(prev => ({ ...prev, bookingType: 'driver-only' }))}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Person sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    Driver Only
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Hire a driver for your own car
                  </Typography>
                  <Chip 
                    label="From ₹150/hr" 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: filters.bookingType === 'with-car' ? 2 : 1,
                  borderColor: filters.bookingType === 'with-car' ? 'success.main' : 'divider',
                  transform: filters.bookingType === 'with-car' ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    borderColor: 'success.main',
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => setFilters(prev => ({ ...prev, bookingType: 'with-car' }))}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <DriveEta sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    Driver + Car
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Complete transportation solution
                  </Typography>
                  <Chip 
                    label="From ₹400/hr" 
                    color="success" 
                    variant="outlined" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>
            <Chip 
              label={filters.bookingType === 'driver-only' ? 'Driver Only' : 'Driver + Car'} 
              color={filters.bookingType === 'driver-only' ? 'primary' : 'success'}
              size="small"
              variant="outlined"
            />
          </Box>
          
          <Grid container spacing={2}>
            {/* Gender Preference - Top Left */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Gender Preference</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender Preference"
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="male">Male Drivers</MenuItem>
                  <MenuItem value="female">Female Drivers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                placeholder="Search drivers or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={filters.location}
                  label="Location"
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  endAdornment={
                    <IconButton
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      size="small"
                      sx={{ mr: 2 }}
                    >
                      <MyLocation color={locationLoading ? 'disabled' : 'primary'} />
                    </IconButton>
                  }
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {availableLocations.map(location => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={filters.experience}
                  label="Experience"
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="1">1+ years</MenuItem>
                  <MenuItem value="3">3+ years</MenuItem>
                  <MenuItem value="5">5+ years</MenuItem>
                  <MenuItem value="10">10+ years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Min Rating</InputLabel>
                <Select
                  value={filters.rating}
                  label="Min Rating"
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="4.0">4.0+</MenuItem>
                  <MenuItem value="4.5">4.5+</MenuItem>
                  <MenuItem value="4.8">4.8+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={filters.language}
                  label="Language"
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Hindi">Hindi</MenuItem>
                  <MenuItem value="Gujarati">Gujarati</MenuItem>
                  <MenuItem value="Punjabi">Punjabi</MenuItem>
                  <MenuItem value="Urdu">Urdu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={filters.availability}
                  label="Availability"
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="available">Available Now</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setFilters({ 
                    experience: '', 
                    rating: '', 
                    language: '', 
                    availability: '', 
                    priceRange: '', 
                    location: '',
                    bookingType: 'driver-only',
                    gender: ''
                  });
                  setCurrentLocation(null);
                }}
                sx={{ height: '56px' }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Current Location Display */}
      {currentLocation && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<MyLocation />}
            label={`Your location: ${currentLocation.city}`}
            color="primary"
            variant="outlined"
            onDelete={() => {
              setCurrentLocation(null);
              setFilters(prev => ({ ...prev, location: '' }));
            }}
          />
        </Box>
      )}

      {/* Results */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          {filteredDrivers.length} drivers available
          {filters.location && ` in ${filters.location}`}
          {currentLocation && filters.location === currentLocation.city && ' near you'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing {filters.bookingType === 'driver-only' ? 'driver-only' : 'driver + car'} options
        </Typography>
      </Box>

      {/* Drivers Grid */}
      <Grid container spacing={3}>
        {filteredDrivers.map((driver) => (
          <Grid item xs={12} sm={6} md={4} key={driver.id}>
            <DriverCard driver={driver} />
          </Grid>
        ))}
      </Grid>

      {filteredDrivers.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PersonAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No drivers found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {filters.bookingType === 'with-car' 
                ? 'No drivers with cars available. Try "Driver Only" option or adjust your filters.'
                : 'Try adjusting your filters to see more options.'
              }
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                bookingType: filters.bookingType === 'with-car' ? 'driver-only' : 'with-car' 
              }))}
              sx={{ mt: 1 }}
            >
              Switch to {filters.bookingType === 'with-car' ? 'Driver Only' : 'Driver + Car'}
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default BookDriverPage;
