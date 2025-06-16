import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  DirectionsCar,
  Payment,
  Schedule,
  Cancel,
  AccessTime,
  Search,
  Clear,
  LocalTaxi,
  AirportShuttle,
  TwoWheeler
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { rideAPI } from '../services/api/rideService';
import toast from 'react-hot-toast';

const BookRidePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requestRide, getNearbyDrivers } = useSocket();
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    vehicleType: 'car',
    scheduledTime: '',
    notes: ''
  });
  const [locations, setLocations] = useState({
    pickup: null,
    dropoff: null
  });
  const [estimate, setEstimate] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [rideBooked, setRideBooked] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [rideType, setRideType] = useState('now'); // 'now' or 'scheduled'
  const [locationSuggestions, setLocationSuggestions] = useState({
    pickup: [],
    dropoff: []
  });
  const [showSuggestions, setShowSuggestions] = useState({
    pickup: false,
    dropoff: false
  });
  const [searchLoading, setSearchLoading] = useState({
    pickup: false,
    dropoff: false
  });

  const vehicleTypes = [
    { 
      value: 'car', 
      label: 'Standard Car', 
      price: '₹25/km', 
      icon: DirectionsCar,
      description: 'Comfortable sedan for 1-4 passengers'
    },
    { 
      value: 'suv', 
      label: 'Premium SUV', 
      price: '₹60/km', 
      icon: AirportShuttle,
      description: 'Spacious SUV for 1-6 passengers'
    },
    { 
      value: 'auto', 
      label: 'Auto Rickshaw', 
      price: '₹10/km', 
      icon: LocalTaxi,
      description: 'Economical 3-wheeler for short trips'
    },
    { 
      value: 'bike', 
      label: 'Motorcycle', 
      price: '₹8/km', 
      icon: TwoWheeler,
      description: 'Quick bike ride for solo travel'
    }
  ];

  // Function to get real address from coordinates
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // Function to geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Calculate price based on distance and vehicle type
  const calculatePrice = (distance, vehicleType) => {
    const baseFare = 30.00; // Base fare in rupees
    const pricePerKm = {
      'car': 25.00,      // ₹25 per km (updated from 15)
      'suv': 60.00,      // ₹60 per km (updated from 20)
      'auto': 10.00,     // ₹10 per km
      'bike': 8.00       // ₹8 per km
    };
    
    const rate = pricePerKm[vehicleType] || pricePerKm['car'];
    const total = baseFare + (distance * rate);
    
    return {
      distance: distance.toFixed(1),
      duration: Math.ceil(distance * 3), // Estimate 3 minutes per km
      baseFare: baseFare.toFixed(2),
      cost: total.toFixed(2),
      pricePerKm: rate.toFixed(2)
    };
  };

  // Remove auto-location fetching on page load
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setLocations(prev => ({
  //           ...prev,
  //           pickup: { latitude, longitude }
  //         }));
          
  //         // Get real address from coordinates
  //         const address = await reverseGeocode(latitude, longitude);
  //         setFormData(prev => ({
  //           ...prev,
  //           pickupAddress: address
  //         }));
  //       },
  //       (error) => {
  //         console.error('Error getting location:', error);
  //         toast.error('Unable to get your current location');
  //       }
  //     );
  //   }
  // }, []);

  // Estimate ride cost when addresses change
  useEffect(() => {
    if (locations.pickup && locations.dropoff) {
      const distance = calculateDistance(
        locations.pickup.latitude,
        locations.pickup.longitude,
        locations.dropoff.latitude,
        locations.dropoff.longitude
      );
      
      const pricing = calculatePrice(distance, formData.vehicleType);
      setEstimate(pricing);
    }
  }, [locations.pickup, locations.dropoff, formData.vehicleType]);

  // Enhanced debounced search function with better performance
  const debouncedSearch = (field, query) => {
    setSearchLoading(prev => ({ ...prev, [field]: true }));
    
    // Clear previous timeout
    if (window[`searchTimeout_${field}`]) {
      clearTimeout(window[`searchTimeout_${field}`]);
    }
    
    window[`searchTimeout_${field}`] = setTimeout(async () => {
      if (query.length >= 2) { // Reduced from 3 to 2 for better UX
        const suggestions = await searchLocations(query);
        setLocationSuggestions(prev => ({ ...prev, [field]: suggestions }));
        setShowSuggestions(prev => ({ ...prev, [field]: true }));
      } else {
        setLocationSuggestions(prev => ({ ...prev, [field]: [] }));
        setShowSuggestions(prev => ({ ...prev, [field]: false }));
      }
      setSearchLoading(prev => ({ ...prev, [field]: false }));
    }, 300); // Reduced debounce time for faster response
  };

  // Enhanced search function with better filtering and prioritization
  const searchLocations = async (query) => {
    if (query.length < 2) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=in&extratags=1&namedetails=1`
      );
      const data = await response.json();
      
      // Enhanced filtering and prioritization
      return data
        .map(item => ({
          id: item.place_id,
          display_name: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: item.type,
          class: item.class,
          importance: item.importance || 0,
          // Extract key parts for better display
          name: item.namedetails?.name || item.display_name.split(',')[0],
          address: item.display_name,
          city: item.address?.city || item.address?.town || item.address?.village || '',
          state: item.address?.state || '',
          postcode: item.address?.postcode || ''
        }))
        .sort((a, b) => {
          // Prioritize exact matches
          const queryLower = query.toLowerCase();
          const aNameMatch = a.name.toLowerCase().includes(queryLower);
          const bNameMatch = b.name.toLowerCase().includes(queryLower);
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          
          // Then sort by importance
          return b.importance - a.importance;
        });
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  };

  // Enhanced manual validation function
  const validateManualAddress = (address) => {
    if (!address || address.length < 5) {
      return { valid: false, message: 'Address must be at least 5 characters long' };
    }
    
    // Check for common address patterns
    const hasNumber = /\d/.test(address);
    const hasComma = address.includes(',');
    const wordCount = address.split(' ').length;
    
    if (!hasNumber && !hasComma && wordCount < 3) {
      return { 
        valid: false, 
        message: 'Please provide a more detailed address (e.g., street name, area, city)' 
      };
    }
    
    return { valid: true, message: '' };
  };

  // Enhanced manual address confirmation
  const handleManualAddressConfirm = async (field) => {
    const addressField = field === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    const address = formData[addressField];
    
    // Validate address
    const validation = validateManualAddress(address);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    
    setIsEstimating(true);
    toast.loading('Searching for location coordinates...', { id: 'location-search' });
    
    try {
      // Try to geocode the manual address
      const geocoded = await geocodeAddress(address);
      
      if (geocoded) {
        setLocations(prev => ({
          ...prev,
          [field]: {
            latitude: geocoded.latitude,
            longitude: geocoded.longitude
          }
        }));
        
        // Update address with the geocoded one for consistency
        setFormData(prev => ({
          ...prev,
          [addressField]: geocoded.display_name
        }));
        
        toast.success(`${field === 'pickup' ? 'Pickup' : 'Destination'} location confirmed`, { id: 'location-search' });
        
        // Trigger calculation
        setTimeout(triggerEstimateCalculation, 500);
      } else {
        toast.error('Unable to find this address. Please try a more specific location.', { id: 'location-search' });
      }
    } catch (error) {
      console.error('Manual address confirmation error:', error);
      toast.error('Failed to confirm address. Please try again.', { id: 'location-search' });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleLocationChange = (field) => (event) => {
    const value = event.target.value;
    const addressField = field === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    
    setFormData(prev => ({
      ...prev,
      [addressField]: value
    }));

    // Clear location and estimate when user starts typing
    setLocations(prev => ({
      ...prev,
      [field]: null
    }));
    setEstimate(null);

    // Start search for suggestions
    if (value.length >= 2) {
      debouncedSearch(field, value);
    } else {
      setLocationSuggestions(prev => ({ ...prev, [field]: [] }));
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
    }
  };

  // Enhanced suggestion selection
  const handleSuggestionSelect = (field, suggestion) => {
    const addressField = field === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    
    setFormData(prev => ({
      ...prev,
      [addressField]: suggestion.display_name
    }));
    
    setLocations(prev => ({
      ...prev,
      [field]: {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude
      }
    }));
    
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
    setLocationSuggestions(prev => ({ ...prev, [field]: [] }));
    
    toast.success(`${field === 'pickup' ? 'Pickup' : 'Destination'} location set`);
    
    // Trigger calculation after state update
    setTimeout(triggerEstimateCalculation, 300);
  };

  // Get current location for destination
  const getCurrentLocationForDestination = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });

        const { latitude, longitude } = position.coords;
        setLocations(prev => ({
          ...prev,
          dropoff: { latitude, longitude }
        }));
        
        // Get real address from coordinates
        const address = await reverseGeocode(latitude, longitude);
        setFormData(prev => ({
          ...prev,
          dropoffAddress: address
        }));
        
        toast.success('Destination set to current location');
      } catch (error) {
        console.error('Location error:', error);
        toast.error('Unable to get current location for destination');
      }
    }
  };

  // Force recalculation when "Current" location buttons are used
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });

        const { latitude, longitude } = position.coords;
        setLocations(prev => ({
          ...prev,
          pickup: { latitude, longitude }
        }));
        
        // Get real address from coordinates
        const address = await reverseGeocode(latitude, longitude);
        setFormData(prev => ({
          ...prev,
          pickupAddress: address
        }));
        
        toast.success('Current location updated');
        
        // Trigger calculation if we also have destination
        setTimeout(triggerEstimateCalculation, 500);
      } catch (error) {
        console.error('Location error:', error);
        toast.error('Unable to get current location');
      }
    }
  };

  // Clear field function (keep only one)
  const handleClearField = (field) => {
    const addressField = field === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    setFormData(prev => ({
      ...prev,
      [addressField]: ''
    }));
    
    setLocations(prev => ({
      ...prev,
      [field]: null
    }));
    
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
    setLocationSuggestions(prev => ({ ...prev, [field]: [] }));
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Enhanced book ride with driver matching flow
  const handleBookRide = async () => {
    try {
      console.log('Attempting to book ride...');
      console.log('Current locations:', locations);
      console.log('Current estimate:', estimate);

      // Validate locations first
      if (!locations.pickup || !locations.dropoff) {
        console.log('Missing location coordinates, attempting to geocode');
        
        let pickupCoords = locations.pickup;
        let dropoffCoords = locations.dropoff;
        
        // Try to geocode pickup if missing
        if (!pickupCoords && formData.pickupAddress) {
          console.log('Geocoding pickup address:', formData.pickupAddress);
          const pickupGeo = await geocodeAddress(formData.pickupAddress);
          if (pickupGeo) {
            pickupCoords = { latitude: pickupGeo.latitude, longitude: pickupGeo.longitude };
            setLocations(prev => ({ ...prev, pickup: pickupCoords }));
            toast.success('Pickup location found');
          }
        }
        
        // Try to geocode dropoff if missing
        if (!dropoffCoords && formData.dropoffAddress) {
          console.log('Geocoding dropoff address:', formData.dropoffAddress);
          const dropoffGeo = await geocodeAddress(formData.dropoffAddress);
          if (dropoffGeo) {
            dropoffCoords = { latitude: dropoffGeo.latitude, longitude: dropoffGeo.longitude };
            setLocations(prev => ({ ...prev, dropoff: dropoffCoords }));
            toast.success('Destination location found');
          }
        }
        
        // If still missing coordinates, show error
        if (!pickupCoords || !dropoffCoords) {
          toast.error('Please ensure both pickup and destination locations are properly set');
          return;
        }
        
        // Calculate estimate with new coordinates
        const distance = calculateDistance(
          pickupCoords.latitude,
          pickupCoords.longitude,
          dropoffCoords.latitude,
          dropoffCoords.longitude
        );
        
        if (distance > 0) {
          const pricing = calculatePrice(distance, formData.vehicleType);
          setEstimate(pricing);
          console.log('New estimate calculated:', pricing);
        }
        
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!estimate) {
        toast.error('Unable to calculate ride cost. Please check your locations.');
        return;
      }

      // Validate required fields
      if (!locations.pickup?.latitude || !locations.pickup?.longitude) {
        toast.error('Pickup location coordinates are missing');
        return;
      }

      if (!locations.dropoff?.latitude || !locations.dropoff?.longitude) {
        toast.error('Destination location coordinates are missing');
        return;
      }

      if (!formData.pickupAddress.trim()) {
        toast.error('Pickup address is required');
        return;
      }

      if (!formData.dropoffAddress.trim()) {
        toast.error('Destination address is required');
        return;
      }

      if (!formData.vehicleType) {
        toast.error('Please select a vehicle type');
        return;
      }

      if (rideType === 'scheduled' && !formData.scheduledTime) {
        toast.error('Please select a scheduled time for your ride');
        return;
      }

      setIsLoading(true);

      // Prepare ride data with proper validation
      const rideData = {
        pickupLatitude: parseFloat(locations.pickup.latitude.toFixed(6)),
        pickupLongitude: parseFloat(locations.pickup.longitude.toFixed(6)),
        pickupAddress: formData.pickupAddress.trim(),
        dropoffLatitude: parseFloat(locations.dropoff.latitude.toFixed(6)),
        dropoffLongitude: parseFloat(locations.dropoff.longitude.toFixed(6)),
        dropoffAddress: formData.dropoffAddress.trim(),
        vehicleType: formData.vehicleType,
        estimatedCost: parseFloat(estimate.cost),
        distance: parseFloat(estimate.distance),
        estimatedDuration: parseInt(estimate.duration),
        scheduledTime: formData.scheduledTime || null,
        notes: formData.notes?.trim() || '',
        rideType: rideType
      };

      console.log('Booking ride with validated data:', rideData);

      // Check if rideAPI exists and has createRide method
      if (!rideAPI || typeof rideAPI.createRide !== 'function') {
        console.error('rideAPI.createRide is not available');
        toast.error('Booking service is not available. Please try again later.');
        return;
      }

      const response = await rideAPI.createRide(rideData);
      
      console.log('Ride booking response:', response);

      // Check if response is successful
      if (response && response.data) {
        const rideData = response.data.ride || response.data;
        const rideId = rideData.id;
        
        // Store ride data in sessionStorage for retrieval in RideDetailsPage
        sessionStorage.setItem(`ride_${rideId}`, JSON.stringify({
          ...rideData,
          // Ensure we preserve the original booking data
          pickupLatitude: parseFloat(locations.pickup.latitude.toFixed(6)),
          pickupLongitude: parseFloat(locations.pickup.longitude.toFixed(6)),
          pickupAddress: formData.pickupAddress.trim(),
          dropoffLatitude: parseFloat(locations.dropoff.latitude.toFixed(6)),
          dropoffLongitude: parseFloat(locations.dropoff.longitude.toFixed(6)),
          dropoffAddress: formData.dropoffAddress.trim(),
          vehicleType: formData.vehicleType,
          estimatedCost: parseFloat(estimate.cost),
          distance: parseFloat(estimate.distance),
          estimatedDuration: parseInt(estimate.duration),
          scheduledTime: formData.scheduledTime || null,
          notes: formData.notes?.trim() || '',
          rideType: rideType,
          createdAt: new Date().toISOString()
        }));
        
        // Emit socket event for real-time updates (if socket is available)
        if (requestRide && typeof requestRide === 'function') {
          try {
            requestRide(rideData);
          } catch (socketError) {
            console.warn('Socket emission failed:', socketError);
            // Don't fail the booking if socket fails
          }
        }

        setCurrentRide(rideData);
        setRideBooked(true);
        toast.success('Ride requested successfully! Finding available drivers...');
        
        // Redirect to ride tracking page
        setTimeout(() => {
          navigate(`/ride/${rideId}`);
        }, 1500);
        
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Error booking ride:', error);
      
      // More specific error handling
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error('Server error response:', {
          status,
          data: errorData
        });
        
        if (status === 422 || status === 400) {
          // Validation error
          if (errorData?.errors) {
            // Handle Laravel validation errors
            const errorMessages = Object.values(errorData.errors).flat();
            toast.error(`Validation Error: ${errorMessages.join(', ')}`);
          } else if (errorData?.message) {
            toast.error(`Validation Error: ${errorData.message}`);
          } else {
            toast.error('Please check your input data and try again.');
          }
        } else if (status === 500) {
          toast.error('Server error. Please try again in a few moments.');
        } else if (status === 401) {
          toast.error('Authentication failed. Please log in again.');
          navigate('/login');
        } else {
          toast.error(errorData?.message || errorData?.error || 'Failed to book ride');
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        console.error('Booking error:', error.message);
        toast.error(error.message || 'Failed to book ride');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!currentRide) return;

    try {
      setIsLoading(true);
      
      await rideAPI.cancelRide(currentRide.id);
      
      setCurrentRide(null);
      setRideBooked(false);
      toast.success('Ride cancelled successfully!');
      
      // Reset form
      setFormData({
        pickupAddress: '',
        dropoffAddress: '',
        vehicleType: 'car',
        scheduledTime: '',
        notes: ''
      });
      setEstimate(null);
      
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel ride');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRideDetails = () => {
    if (currentRide) {
      navigate(`/ride/${currentRide.id}`);
    }
  };

  // Enhanced estimate calculation with better debugging and triggers
  useEffect(() => {
    const calculateEstimate = async () => {
      console.log('Calculate estimate triggered:', {
        pickup: locations.pickup,
        dropoff: locations.dropoff,
        vehicleType: formData.vehicleType
      });

      if (locations.pickup && locations.dropoff) {
        setIsEstimating(true);
        
        try {
          const distance = calculateDistance(
            locations.pickup.latitude,
            locations.pickup.longitude,
            locations.dropoff.latitude,
            locations.dropoff.longitude
          );
          
          console.log('Distance calculated:', distance);
          
          if (distance > 0) {
            const pricing = calculatePrice(distance, formData.vehicleType);
            setEstimate(pricing);
            console.log('Estimate set:', pricing);
            
            // Show success notification
            toast.success(`Trip estimated: ${distance.toFixed(1)} km • ₹${pricing.cost}`, {
              duration: 3000
            });
          } else {
            console.warn('Distance is 0 or invalid');
            setEstimate(null);
          }
        } catch (error) {
          console.error('Error calculating estimate:', error);
          setEstimate(null);
          toast.error('Failed to calculate trip estimate');
        } finally {
          setIsEstimating(false);
        }
      } else {
        console.log('Missing coordinates for estimate calculation');
        setEstimate(null);
        setIsEstimating(false);
      }
    };

    calculateEstimate();
  }, [locations.pickup, locations.dropoff, formData.vehicleType]);

  // Force calculation when addresses are manually typed and geocoded
  const triggerEstimateCalculation = () => {
    if (locations.pickup && locations.dropoff) {
      const distance = calculateDistance(
        locations.pickup.latitude,
        locations.pickup.longitude,
        locations.dropoff.latitude,
        locations.dropoff.longitude
      );
      
      if (distance > 0) {
        const pricing = calculatePrice(distance, formData.vehicleType);
        setEstimate(pricing);
        console.log('Manual estimate calculation:', pricing);
        toast.success(`Trip estimated: ${distance.toFixed(1)} km • ₹${pricing.cost}`);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Book a Ride
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Enter your pickup and destination to request a ride
      </Typography>

      <Grid container spacing={3}>
        {/* Location Selection */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trip Details
              </Typography>

              <Box sx={{ mb: 3, position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  value={formData.pickupAddress}
                  onChange={handleLocationChange('pickup')}
                  onFocus={() => {
                    if (locationSuggestions.pickup.length > 0) {
                      setShowSuggestions(prev => ({ ...prev, pickup: true }));
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(prev => ({ ...prev, pickup: false })), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && formData.pickupAddress && !locations.pickup) {
                      e.preventDefault();
                      handleManualAddressConfirm('pickup');
                    }
                  }}
                  InputProps={{
                    startAdornment: <LocationOn color="primary" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {searchLoading.pickup && <CircularProgress size={20} />}
                        {formData.pickupAddress && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleClearField('pickup')}
                              title="Clear address"
                            >
                              <Clear />
                            </IconButton>
                            {!locations.pickup && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleManualAddressConfirm('pickup')}
                                sx={{ minWidth: 'auto', px: 1 }}
                                title="Confirm this address"
                              >
                                ✓
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="small"
                          startIcon={<MyLocation />}
                          onClick={getCurrentLocation}
                        >
                          Current
                        </Button>
                      </Box>
                    )
                  }}
                  margin="normal"
                  placeholder="Type your pickup address (e.g., 123 Main St, Downtown, Mumbai)..."
                  helperText={
                    !locations.pickup && formData.pickupAddress && formData.pickupAddress.length > 5
                      ? "Press Enter or click ✓ to confirm this address"
                      : locations.pickup
                      ? "✓ Location confirmed"
                      : "Start typing to search for locations"
                  }
                  sx={{
                    '& .MuiFormHelperText-root': {
                      color: locations.pickup ? 'success.main' : 'text.secondary'
                    }
                  }}
                />

                {/* Enhanced Pickup Suggestions Dropdown */}
                {showSuggestions.pickup && locationSuggestions.pickup.length > 0 && (
                  <Card
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: 300,
                      overflow: 'auto',
                      mt: 1,
                      boxShadow: 3
                    }}
                  >
                    {locationSuggestions.pickup.map((suggestion) => (
                      <Box
                        key={suggestion.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:last-child': { borderBottom: 'none' }
                        }}
                        onClick={() => handleSuggestionSelect('pickup', suggestion)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {suggestion.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {suggestion.address}
                            </Typography>
                            {suggestion.city && (
                              <Typography variant="caption" color="primary.main">
                                {suggestion.city}{suggestion.state && `, ${suggestion.state}`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Card>
                )}

                <TextField
                  fullWidth
                  label="Destination"
                  value={formData.dropoffAddress}
                  onChange={handleLocationChange('dropoff')}
                  onFocus={() => {
                    if (locationSuggestions.dropoff.length > 0) {
                      setShowSuggestions(prev => ({ ...prev, dropoff: true }));
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(prev => ({ ...prev, dropoff: false })), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && formData.dropoffAddress && !locations.dropoff) {
                      e.preventDefault();
                      handleManualAddressConfirm('dropoff');
                    }
                  }}
                  InputProps={{
                    startAdornment: <LocationOn color="secondary" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {searchLoading.dropoff && <CircularProgress size={20} />}
                        {formData.dropoffAddress && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleClearField('dropoff')}
                              title="Clear address"
                            >
                              <Clear />
                            </IconButton>
                            {!locations.dropoff && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleManualAddressConfirm('dropoff')}
                                sx={{ minWidth: 'auto', px: 1 }}
                                title="Confirm this address"
                              >
                                ✓
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="small"
                          startIcon={<MyLocation />}
                          onClick={getCurrentLocationForDestination}
                        >
                          Current
                        </Button>
                      </Box>
                    )
                  }}
                  margin="normal"
                  placeholder="Type your destination address (e.g., Airport Terminal 2, Andheri East)..."
                  helperText={
                    !locations.dropoff && formData.dropoffAddress && formData.dropoffAddress.length > 5
                      ? "Press Enter or click ✓ to confirm this address"
                      : locations.dropoff
                      ? "✓ Location confirmed"
                      : "Start typing to search for locations"
                  }
                  sx={{
                    '& .MuiFormHelperText-root': {
                      color: locations.dropoff ? 'success.main' : 'text.secondary'
                    }
                  }}
                />

                {/* Enhanced Destination Suggestions Dropdown */}
                {showSuggestions.dropoff && locationSuggestions.dropoff.length > 0 && (
                  <Card
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: 300,
                      overflow: 'auto',
                      mt: 1,
                      boxShadow: 3
                    }}
                  >
                    {locationSuggestions.dropoff.map((suggestion) => (
                      <Box
                        key={suggestion.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:last-child': { borderBottom: 'none' }
                        }}
                        onClick={() => handleSuggestionSelect('dropoff', suggestion)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOn color="secondary" fontSize="small" sx={{ mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {suggestion.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {suggestion.address}
                            </Typography>
                            {suggestion.city && (
                              <Typography variant="caption" color="secondary.main">
                                {suggestion.city}{suggestion.state && `, ${suggestion.state}`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Card>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                When do you need this ride?
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant={rideType === 'now' ? 'contained' : 'outlined'}
                    size="large"
                    startIcon={<AccessTime />}
                    onClick={() => {
                      setRideType('now');
                      setFormData(prev => ({ ...prev, scheduledTime: '' }));
                    }}
                    sx={{
                      py: 2,
                      bgcolor: rideType === 'now' ? 'primary.main' : 'transparent',
                      borderColor: rideType === 'now' ? 'primary.main' : 'divider',
                      color: rideType === 'now' ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: rideType === 'now' ? 'primary.dark' : 'primary.light',
                        color: rideType === 'now' ? 'white' : 'primary.main'
                      }
                    }}
                  >
                    Ride Now
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant={rideType === 'scheduled' ? 'contained' : 'outlined'}
                    size="large"
                    startIcon={<Schedule />}
                    onClick={() => setRideType('scheduled')}
                    sx={{
                      py: 2,
                      bgcolor: rideType === 'scheduled' ? 'primary.main' : 'transparent',
                      borderColor: rideType === 'scheduled' ? 'primary.main' : 'divider',
                      color: rideType === 'scheduled' ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: rideType === 'scheduled' ? 'primary.dark' : 'primary.light',
                        color: rideType === 'scheduled' ? 'white' : 'primary.main'
                      }
                    }}
                  >
                    Schedule for Later
                  </Button>
                </Grid>
              </Grid>

              {rideType === 'scheduled' && (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Schedule Time"
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={handleInputChange('scheduledTime')}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <Schedule color="action" sx={{ mr: 1 }} />
                    }}
                    inputProps={{
                      min: new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16) // Minimum 15 minutes from now
                    }}
                    helperText="Schedule your ride at least 15 minutes in advance"
                    margin="normal"
                    sx={{
                      '& .MuiInputBase-input': {
                        cursor: 'pointer'
                      },
                      '& .MuiInputBase-root': {
                        cursor: 'pointer'
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }
                    }}
                    onClick={(e) => {
                      // Make the entire field clickable to open the datetime picker
                      const input = e.currentTarget.querySelector('input[type="datetime-local"]');
                      if (input) {
                        input.showPicker();
                      }
                    }}
                  />
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Vehicle Type
              </Typography>
              <Grid container spacing={2}>
                {vehicleTypes.map((vehicle) => {
                  const IconComponent = vehicle.icon;
                  return (
                    <Grid item xs={6} sm={3} key={vehicle.value}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          height: '120px', // Reduced from 160px
                          border: formData.vehicleType === vehicle.value ? 2 : 1,
                          borderColor: formData.vehicleType === vehicle.value ? 'primary.main' : 'divider',
                          backgroundColor: formData.vehicleType === vehicle.value ? 'primary.50' : 'background.paper',
                          transform: formData.vehicleType === vehicle.value ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.3s ease-in-out',
                          boxShadow: formData.vehicleType === vehicle.value ? 4 : 1,
                          '&:hover': { 
                            borderColor: 'primary.main',
                            transform: 'scale(1.02)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, vehicleType: vehicle.value }))}
                      >
                        <CardContent 
                          sx={{ 
                            textAlign: 'center', 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5 // Reduced padding
                          }}
                        >
                          <Box sx={{ 
                            width: 36, // Reduced from 48
                            height: 36, // Reduced from 48
                            borderRadius: '50%', 
                            bgcolor: formData.vehicleType === vehicle.value ? 'primary.main' : 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 0.5 // Reduced margin
                          }}>
                            <IconComponent 
                              sx={{ 
                                fontSize: 20, // Reduced from 24
                                color: formData.vehicleType === vehicle.value ? 'white' : 'grey.600'
                              }} 
                            />
                          </Box>
                          
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography 
                              variant="body2" // Changed from body1
                              fontWeight="bold"
                              sx={{
                                color: formData.vehicleType === vehicle.value ? 'primary.main' : 'text.primary',
                                mb: 0.25, // Reduced margin
                                fontSize: '0.875rem'
                              }}
                            >
                              {vehicle.label}
                            </Typography>
                            
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                display: 'block',
                                mb: 0.5, // Reduced margin
                                minHeight: '24px', // Reduced from 32px
                                lineHeight: 1.1,
                                fontSize: '0.7rem'
                              }}
                            >
                              {vehicle.description}
                            </Typography>
                          </Box>

                          <Chip
                            label={vehicle.price}
                            size="small"
                            color={formData.vehicleType === vehicle.value ? 'primary' : 'default'}
                            variant={formData.vehicleType === vehicle.value ? 'filled' : 'outlined'}
                            sx={{
                              fontWeight: 'bold',
                              minWidth: '60px', // Reduced from 70px
                              fontSize: '0.7rem'
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  margin="normal"
                  placeholder="Special instructions for the driver..."
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Estimate & Booking */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trip Summary
              </Typography>

              {/* Ride Type Display */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ride Type:
                </Typography>
                <Chip
                  icon={rideType === 'now' ? <AccessTime /> : <Schedule />}
                  label={rideType === 'now' ? 'Ride Now' : 'Scheduled Ride'}
                  color={rideType === 'now' ? 'success' : 'primary'}
                  variant="outlined"
                />
                {rideType === 'scheduled' && formData.scheduledTime && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Scheduled for: {new Date(formData.scheduledTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })} at {new Date(formData.scheduledTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Enhanced Trip Summary Section */}
              {isEstimating ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Calculating trip cost...
                  </Typography>
                </Box>
              ) : estimate ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Distance:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {estimate.distance} km
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Est. Duration:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {estimate.duration} min
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Base fare:</Typography>
                    <Typography variant="body2">₹{estimate.baseFare}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Rate per km:</Typography>
                    <Typography variant="body2">₹{estimate.pricePerKm}/km</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{estimate.cost}
                    </Typography>
                  </Box>
                  
                  {/* Vehicle Type Display */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Selected Vehicle:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(() => {
                        const selectedVehicle = vehicleTypes.find(v => v.value === formData.vehicleType);
                        const IconComponent = selectedVehicle?.icon;
                        return (
                          <>
                            {IconComponent && <IconComponent color="primary" />}
                            <Typography variant="body1" fontWeight="bold">
                              {selectedVehicle?.label}
                            </Typography>
                          </>
                        );
                      })()}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enter pickup and destination locations to see cost estimate
                  </Alert>
                  
                  {/* Show manual calculation button if addresses exist but no coordinates */}
                  {(formData.pickupAddress && formData.dropoffAddress) && (!locations.pickup || !locations.dropoff) && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={async () => {
                        setIsEstimating(true);
                        
                        // Try to geocode both addresses
                        let pickup = locations.pickup;
                        let dropoff = locations.dropoff;
                        
                        if (!pickup && formData.pickupAddress) {
                          const pickupGeo = await geocodeAddress(formData.pickupAddress);
                          if (pickupGeo) {
                            pickup = { latitude: pickupGeo.latitude, longitude: pickupGeo.longitude };
                            setLocations(prev => ({ ...prev, pickup }));
                          }
                        }
                        
                        if (!dropoff && formData.dropoffAddress) {
                          const dropoffGeo = await geocodeAddress(formData.dropoffAddress);
                          if (dropoffGeo) {
                            dropoff = { latitude: dropoffGeo.latitude, longitude: dropoffGeo.longitude };
                            setLocations(prev => ({ ...prev, dropoff }));
                          }
                        }
                        
                        setIsEstimating(false);
                        
                        if (pickup && dropoff) {
                          triggerEstimateCalculation();
                        } else {
                          toast.error('Unable to find coordinates for entered addresses');
                        }
                      }}
                      sx={{ mt: 1 }}
                    >
                      Calculate Trip Cost
                    </Button>
                  )}
                </Box>
              )}

              {estimate && !rideBooked && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={isLoading ? <CircularProgress size={20} /> : <DirectionsCar />}
                    onClick={handleBookRide}
                    disabled={
                      isLoading || 
                      !formData.pickupAddress || 
                      !formData.dropoffAddress ||
                      (rideType === 'scheduled' && !formData.scheduledTime)
                    }
                    sx={{ 
                      py: 1.5,
                      bgcolor: rideType === 'now' ? 'success.main' : 'primary.main',
                      '&:hover': {
                        bgcolor: rideType === 'now' ? 'success.dark' : 'primary.dark'
                      }
                    }}
                  >
                    {isLoading ? 'Booking...' : 
                     rideType === 'now' ? 'Book Ride Now' : 'Schedule Ride'}
                  </Button>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    {rideType === 'now' 
                      ? 'Your ride will be requested immediately'
                      : 'Your ride will be scheduled for the selected time'
                    }
                  </Typography>
                </Box>
              )}

              {rideBooked && currentRide && (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Ride requested successfully! Waiting for driver acceptance.
                  </Alert>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleViewRideDetails}
                    sx={{ py: 1.5, mb: 1 }}
                  >
                    View Ride Details
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    color="error"
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Cancel />}
                    onClick={handleCancelRide}
                    disabled={isLoading || currentRide?.status === 'accepted' || currentRide?.status === 'in_progress'}
                    sx={{ py: 1.5 }}
                  >
                    {isLoading ? 'Cancelling...' : 'Cancel Ride'}
                  </Button>
                  
                  {(currentRide?.status === 'accepted' || currentRide?.status === 'in_progress') && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      Ride cannot be cancelled once accepted by driver
                    </Typography>
                  )}
                </Box>
              )}

              {nearbyDrivers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {nearbyDrivers.length} drivers nearby
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Debug information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            Debug Info:
          </Typography>
          <Typography variant="caption" display="block">
            Pickup: {locations.pickup ? `${locations.pickup.latitude}, ${locations.pickup.longitude}` : 'Not set'}
          </Typography>
          <Typography variant="caption" display="block">
            Dropoff: {locations.dropoff ? `${locations.dropoff.latitude}, ${locations.dropoff.longitude}` : 'Not set'}
          </Typography>
          <Typography variant="caption" display="block">
            Estimate: {estimate ? 'Available' : 'Not calculated'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BookRidePage;