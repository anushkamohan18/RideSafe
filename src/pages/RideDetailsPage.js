import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  LinearProgress,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import {
  LocationOn,
  DirectionsCar,
  Phone,
  Cancel,
  Star,
  Timer,
  Navigation,
  Refresh,
  LocalTaxi,
  AirportShuttle,
  TwoWheeler,
  MyLocation,
  Route,
  Add
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { rideAPI } from '../services/api/rideService';
import toast from 'react-hot-toast';

const RideDetailsPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [driverETA, setDriverETA] = useState(null);
  const [actualETA, setActualETA] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(30);
  const [noDriversFound, setNoDriversFound] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // New OTP related states
  const [rideOTP, setRideOTP] = useState(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [tripInProgress, setTripInProgress] = useState(false);
  const [destinationETA, setDestinationETA] = useState(null);

  const vehicleTypes = [
    { value: 'car', label: 'Standard Car', icon: DirectionsCar },
    { value: 'suv', label: 'Premium SUV', icon: AirportShuttle },
    { value: 'auto', label: 'Auto Rickshaw', icon: LocalTaxi },
    { value: 'bike', label: 'Motorcycle', icon: TwoWheeler }
  ];

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  useEffect(() => {
    if (ride && ride.status === 'pending') {
      startDriverSearch();
    }
  }, [ride]);

  useEffect(() => {
    if (ride && ride.driver && mapLoaded) {
      initializeMap();
    }
  }, [ride, mapLoaded]);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await rideAPI.getRideById(rideId);
      if (response.data) {
        const rideData = response.data.ride || response.data;
        setRide(rideData);
        
        if (rideData.driver && rideData.driver.currentLocation) {
          setDriverLocation(rideData.driver.currentLocation);
        }
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      toast.error('Failed to load ride details');
      navigate('/rides');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L || !ride) return;

    // Clear existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const pickupLat = ride.pickupLatitude || ride.pickup_latitude;
    const pickupLng = ride.pickupLongitude || ride.pickup_longitude;

    // Initialize map centered on pickup location
    const map = window.L.map(mapRef.current).setView([pickupLat, pickupLng], 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add pickup marker
    const pickupIcon = window.L.divIcon({
      html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      className: 'pickup-marker'
    });

    window.L.marker([pickupLat, pickupLng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup('Pickup Location');

    // Add dropoff marker
    const dropoffLat = ride.dropoffLatitude || ride.dropoff_latitude;
    const dropoffLng = ride.dropoffLongitude || ride.dropoff_longitude;

    const dropoffIcon = window.L.divIcon({
      html: '<div style="background-color: #F44336; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      className: 'dropoff-marker'
    });

    window.L.marker([dropoffLat, dropoffLng], { icon: dropoffIcon })
      .addTo(map)
      .bindPopup('Destination');

    mapInstanceRef.current = map;

    // Add driver marker if driver exists
    if (ride.driver && driverLocation) {
      updateDriverOnMap(driverLocation);
      calculateAndDisplayRoute(driverLocation, { lat: pickupLat, lng: pickupLng });
    }
  };

  const updateDriverOnMap = (location) => {
    if (!mapInstanceRef.current || !window.L) return;

    // Remove existing driver marker
    if (driverMarkerRef.current) {
      mapInstanceRef.current.removeLayer(driverMarkerRef.current);
    }

    // Create driver marker
    const driverIcon = window.L.divIcon({
      html: `<div style="background-color: #2196F3; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
               <div style="color: white; font-size: 12px;">🚗</div>
             </div>`,
      iconSize: [24, 24],
      className: 'driver-marker'
    });

    driverMarkerRef.current = window.L.marker([location.latitude, location.longitude], { 
      icon: driverIcon 
    }).addTo(mapInstanceRef.current)
      .bindPopup(`${ride.driver.name} - Your Driver`);

    // Update map bounds to include driver
    const bounds = window.L.latLngBounds([
      [ride.pickupLatitude || ride.pickup_latitude, ride.pickupLongitude || ride.pickup_longitude],
      [location.latitude, location.longitude]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
  };

  const calculateAndDisplayRoute = async (from, to) => {
    try {
      // Use OpenRouteService for routing (free alternative to Google Directions)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248YOUR_API_KEY&start=${from.longitude},${from.latitude}&end=${to.lng},${to.lat}`
      ).catch(() => {
        // If OpenRouteService fails, create a simple straight line
        return null;
      });

      let route;
      let distance = 0;
      let duration = 0;

      if (response && response.ok) {
        const data = await response.json();
        if (data.features && data.features[0]) {
          const coordinates = data.features[0].geometry.coordinates;
          route = coordinates.map(coord => [coord[1], coord[0]]); // Flip lat/lng
          distance = data.features[0].properties.summary.distance / 1000; // Convert to km
          duration = data.features[0].properties.summary.duration / 60; // Convert to minutes
        }
      }

      if (!route) {
        // Fallback: create straight line route
        route = [
          [from.latitude, from.longitude],
          [to.lat, to.lng]
        ];
        // Calculate approximate distance and time
        distance = calculateDistance(from.latitude, from.longitude, to.lat, to.lng);
        duration = (distance / 30) * 60; // Assume 30 km/h average speed
      }

      // Remove existing route
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      }

      // Add route to map
      routeLayerRef.current = window.L.polyline(route, {
        color: '#2196F3',
        weight: 4,
        opacity: 0.8
      }).addTo(mapInstanceRef.current);

      // Update ETA
      setActualETA({
        distance: distance.toFixed(1),
        duration: Math.ceil(duration)
      });

      setRouteData({ route, distance, duration });

    } catch (error) {
      console.error('Error calculating route:', error);
      
      // Fallback ETA calculation
      const distance = calculateDistance(
        from.latitude, from.longitude, to.lat, to.lng
      );
      const duration = (distance / 30) * 60; // 30 km/h average
      
      setActualETA({
        distance: distance.toFixed(1),
        duration: Math.ceil(duration)
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startDriverSearch = () => {
    if (ride?.status !== 'pending') return;
    
    setSearching(true);
    setNoDriversFound(false);
    toast.loading('Searching for available drivers...', { id: 'driver-search' });

    const searchTimeout = setTimeout(() => {
      // Check if ride was cancelled during search
      if (ride?.status === 'cancelled') {
        setSearching(false);
        toast.dismiss('driver-search');
        console.log('Driver search cancelled - ride was cancelled');
        return;
      }

      const found = Math.random() > 0.3; // 70% chance of finding driver
      
      if (found) {
        // Double check ride status before proceeding
        if (ride?.status === 'cancelled') {
          setSearching(false);
          toast.dismiss('driver-search');
          return;
        }

        const pickupLat = ride.pickupLatitude || ride.pickup_latitude;
        const pickupLng = ride.pickupLongitude || ride.pickup_longitude;

        // Generate random driver location near pickup
        const mockDriverLocation = {
          latitude: pickupLat + (Math.random() - 0.5) * 0.02,
          longitude: pickupLng + (Math.random() - 0.5) * 0.02
        };

        const mockDriver = {
          id: 1,
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          rating: 4.8,
          total_rides: 245,
          vehicle: {
            make: 'Honda',
            model: 'City',
            license_plate: 'MH 01 AB 1234',
            color: 'White'
          },
          currentLocation: mockDriverLocation
        };

        setRide(prev => ({
          ...prev,
          driver: mockDriver,
          status: 'accepted'
        }));

        setDriverLocation(mockDriverLocation);

        // Calculate initial ETA
        const distance = calculateDistance(
          mockDriverLocation.latitude,
          mockDriverLocation.longitude,
          pickupLat,
          pickupLng
        );
        const eta = Math.ceil((distance / 30) * 60); // 30 km/h average speed
        setDriverETA(eta);
        
        toast.success(`${mockDriver.name} accepted your ride!`, { id: 'driver-search' });
        setSearching(false);

        // Start driver movement simulation only if ride is still active
        setTimeout(() => {
          if (ride?.status !== 'cancelled') {
            simulateDriverMovement();
          }
        }, 2000);

      } else {
        setNoDriversFound(true);
        setSearching(false);
        toast.error('No drivers available at the moment', { id: 'driver-search' });
      }
    }, 3000 + Math.random() * 2000);

    // Store timeout reference to clear it if needed
    window.driverSearchTimeout = searchTimeout;
  };

  const handleOTPVerification = () => {
    // Check if ride was cancelled
    if (ride?.status === 'cancelled') {
      toast.error('Ride has been cancelled');
      return;
    }

    // Simulate OTP verification (in real app, this would be done by driver)
    setOtpVerified(true);
    setShowOTPDialog(false);
    setRide(prev => ({ ...prev, status: 'in_progress' }));
    setTripInProgress(true);
    
    toast.success('OTP verified! Your trip has started.');
    
    // Start movement to destination
    setTimeout(() => {
      simulateDestinationTrip();
    }, 2000);
  };

  const simulateDriverMovement = () => {
    if (!ride || !ride.driver || !driverLocation || ride.status === 'cancelled') return;

    const pickupLat = ride.pickupLatitude || ride.pickup_latitude;
    const pickupLng = ride.pickupLongitude || ride.pickup_longitude;

    // Simulate driver moving towards pickup
    const interval = setInterval(() => {
      // Check if ride was cancelled
      if (ride?.status === 'cancelled') {
        clearInterval(interval);
        return;
      }

      setDriverLocation(prevLocation => {
        if (!prevLocation || ride?.status === 'cancelled') return null;

        // Calculate movement towards pickup (small increments)
        const latDiff = pickupLat - prevLocation.latitude;
        const lngDiff = pickupLng - prevLocation.longitude;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

        if (distance < 0.001) { // Very close to pickup
          clearInterval(interval);
          setRide(prev => ({ ...prev, status: 'arrived' }));
          
          // Generate OTP when driver arrives
          const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
          setRideOTP(otp);
          setShowOTPDialog(true);
          
          toast.success('Driver has arrived at pickup location!');
          toast.success(`Your ride OTP is: ${otp}`, { duration: 10000 });
          
          return prevLocation;
        }

        // Move 10% closer each update
        const newLocation = {
          latitude: prevLocation.latitude + latDiff * 0.1,
          longitude: prevLocation.longitude + lngDiff * 0.1
        };

        // Update map
        updateDriverOnMap(newLocation);
        calculateAndDisplayRoute(
          newLocation, 
          { lat: pickupLat, lng: pickupLng }
        );

        return newLocation;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  const simulateDestinationTrip = () => {
    if (!ride || !driverLocation || ride.status === 'cancelled') return;

    const dropoffLat = ride.dropoffLatitude || ride.dropoff_latitude;
    const dropoffLng = ride.dropoffLongitude || ride.dropoff_longitude;

    // Calculate initial ETA to destination
    const distance = calculateDistance(
      driverLocation.latitude,
      driverLocation.longitude,
      dropoffLat,
      dropoffLng
    );
    const eta = Math.ceil((distance / 30) * 60); // 30 km/h average speed
    setDestinationETA(eta);

    // Update map to show route to destination
    calculateAndDisplayRoute(
      driverLocation,
      { lat: dropoffLat, lng: dropoffLng }
    );

    // Simulate driver moving towards destination
    const interval = setInterval(() => {
      // Check if ride was cancelled
      if (ride?.status === 'cancelled') {
        clearInterval(interval);
        return;
      }

      setDriverLocation(prevLocation => {
        if (!prevLocation || ride?.status === 'cancelled') return null;

        // Calculate movement towards destination
        const latDiff = dropoffLat - prevLocation.latitude;
        const lngDiff = dropoffLng - prevLocation.longitude;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

        if (distance < 0.001) { // Very close to destination
          clearInterval(interval);
          setRide(prev => ({ ...prev, status: 'completed' }));
          setTripInProgress(false);
          setDestinationETA(null);
          
          toast.success('Trip completed! Thank you for using RideSafe.');
          
          // Redirect to rides page after completion
          setTimeout(() => {
            navigate('/rides');
          }, 3000);
          
          return prevLocation;
        }

        // Move towards destination
        const newLocation = {
          latitude: prevLocation.latitude + latDiff * 0.08,
          longitude: prevLocation.longitude + lngDiff * 0.08
        };

        // Update destination ETA
        const remainingDistance = calculateDistance(
          newLocation.latitude,
          newLocation.longitude,
          dropoffLat,
          dropoffLng
        );
        const newETA = Math.ceil((remainingDistance / 30) * 60);
        setDestinationETA(newETA);

        // Update map
        updateDriverOnMap(newLocation);
        calculateAndDisplayRoute(
          newLocation,
          { lat: dropoffLat, lng: dropoffLng }
        );

        return newLocation;
      });
    }, 3000); // Update every 3 seconds for faster movement

    return () => clearInterval(interval);
  };

  const handleCancelRide = async () => {
    try {
      // Clear any ongoing search timeouts
      if (window.driverSearchTimeout) {
        clearTimeout(window.driverSearchTimeout);
        window.driverSearchTimeout = null;
      }

      // Dismiss any pending toasts
      toast.dismiss('driver-search');

      await rideAPI.cancelRide(rideId);
      
      // Update ride status to cancelled immediately
      setRide(prev => ({ ...prev, status: 'cancelled' }));
      
      // Stop all ongoing processes
      setSearching(false);
      setNoDriversFound(false);
      setTripInProgress(false);
      setOtpVerified(false);
      setShowOTPDialog(false);
      setDestinationETA(null);
      setActualETA(null);
      setDriverLocation(null);
      
      toast.success('Ride cancelled successfully');
      
      // Redirect to rides page after short delay
      setTimeout(() => {
        navigate('/rides');
      }, 2000);
      
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error('Failed to cancel ride');
    }
    setCancelDialogOpen(false);
  };

  const handleRetrySearch = () => {
    setNoDriversFound(false);
    startDriverSearch();
  };

  const handleChangeVehicleType = () => {
    navigate('/book-ride');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'arrived': return 'success';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Finding Driver';
      case 'accepted': return 'Driver En Route';
      case 'arrived': return 'Driver Arrived';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status?.replace('_', ' ').toUpperCase();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading ride details...
        </Typography>
      </Container>
    );
  }

  if (!ride) {
    return (
      <Container maxWidth="md" sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="h6">Ride not found</Typography>
        <Button onClick={() => navigate('/rides')} sx={{ mt: 2 }}>
          Back to Rides
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Ride #{ride.id}
      </Typography>

      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={getStatusText(ride.status)}
                color={getStatusColor(ride.status)}
                size="large"
                sx={{ fontWeight: 'bold' }}
              />
              {searching && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Searching...</Typography>
                </Box>
              )}
            </Box>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              ₹{ride.estimatedCost || ride.estimated_cost}
            </Typography>
          </Box>

          {searching && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Finding the best driver for you...
              </Typography>
            </Box>
          )}

          {/* Real-time ETA Display */}
          {actualETA && ride.driver && ride.status === 'accepted' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Timer />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Driver arriving in {actualETA.duration} minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Distance: {actualETA.distance} km • Following live route
                  </Typography>
                </Box>
              </Box>
            </Alert>
          )}

          {/* Driver Arrived - OTP Display */}
          {ride.status === 'arrived' && rideOTP && !otpVerified && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  Driver has arrived! Share your OTP:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="primary.main"
                    sx={{ 
                      bgcolor: 'primary.50', 
                      px: 2, 
                      py: 1, 
                      borderRadius: 2,
                      letterSpacing: 4
                    }}
                  >
                    {rideOTP}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleOTPVerification}
                    sx={{ ml: 2 }}
                  >
                    Verify & Start Trip
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Share this OTP with your driver to start the trip
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Ride Status Updates */}
          {ride.status === 'cancelled' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Ride Cancelled
              </Typography>
              <Typography variant="body2">
                This ride has been cancelled. You can book a new ride anytime.
              </Typography>
            </Alert>
          )}

          {/* Trip In Progress */}
          {tripInProgress && destinationETA && ride.status !== 'cancelled' && (
            <Alert severity="primary" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Navigation />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Trip in progress • Arriving in {destinationETA} minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following route to your destination
                  </Typography>
                </Box>
              </Box>
            </Alert>
          )}

          {ride.status === 'completed' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Trip completed successfully! Thank you for using RideSafe.
              </Typography>
            </Alert>
          )}

          {noDriversFound && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No drivers available for {vehicleTypes.find(v => v.value === ride.vehicleType)?.label}. 
              You can try again or choose a different vehicle type.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Real-time Map - Only show if ride is not cancelled */}
      {ride.driver && mapLoaded && ride.status !== 'cancelled' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Route color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {tripInProgress ? 'Trip Progress' : 'Live Tracking'}
              </Typography>
              {ride.status === 'accepted' && (
                <Chip 
                  label="Driver En Route" 
                  color="info" 
                  size="small"
                  icon={<Navigation />}
                />
              )}
              {tripInProgress && (
                <Chip 
                  label="Trip in Progress" 
                  color="primary" 
                  size="small"
                  icon={<DirectionsCar />}
                />
              )}
            </Box>
            <Paper
              ref={mapRef}
              sx={{
                height: 350,
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'divider'
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                  <Typography variant="body2">Pickup</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%' }} />
                  <Typography variant="body2">Destination</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: '50%' }} />
                  <Typography variant="body2">Driver</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {tripInProgress ? 'Updates every 3 seconds' : 'Updates every 5 seconds'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Driver Information - Only show if ride is not cancelled and driver exists */}
      {ride.driver && ride.status !== 'cancelled' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Driver
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {ride.driver.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {ride.driver.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Typography variant="body2">
                    {ride.driver.rating || '4.8'} ({ride.driver.total_rides || '150'} rides)
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {ride.driver.vehicle?.make} {ride.driver.vehicle?.model} • {ride.driver.vehicle?.license_plate}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<Phone />}
                onClick={() => window.open(`tel:${ride.driver.phone}`, '_self')}
              >
                Call
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Trip Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Trip Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <LocationOn color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Pickup Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ride.pickupAddress || ride.pickup_address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <LocationOn color="secondary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Destination
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ride.dropoffAddress || ride.dropoff_address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Distance
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {ride.distance} km
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {ride.estimatedDuration || ride.estimated_duration} min
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Vehicle Type
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {vehicleTypes.find(v => v.value === ride.vehicleType)?.label}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Ride Type
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {ride.rideType === 'now' ? 'Immediate' : 'Scheduled'}
              </Typography>
            </Grid>
          </Grid>

          {ride.notes && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body2">
                {ride.notes}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {ride.status === 'cancelled' && (
          <>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/book-ride')}
              sx={{ flex: 1 }}
            >
              Book Another Ride
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/rides')}
              sx={{ flex: 1 }}
            >
              View All Rides
            </Button>
          </>
        )}

        {noDriversFound && ride.status !== 'cancelled' && (
          <>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRetrySearch}
              sx={{ flex: 1 }}
            >
              Retry Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<DirectionsCar />}
              onClick={handleChangeVehicleType}
              sx={{ flex: 1 }}
            >
              Change Vehicle Type
            </Button>
          </>
        )}

        {(ride.status === 'pending' || ride.status === 'accepted') && ride.status !== 'cancelled' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => setCancelDialogOpen(true)}
            disabled={ride.status === 'in_progress' || ride.status === 'completed'}
          >
            Cancel Ride
          </Button>
        )}

        {ride.status !== 'cancelled' && (
          <Button
            variant="outlined"
            onClick={() => navigate('/rides')}
          >
            Back to Rides
          </Button>
        )}
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Ride</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this ride? 
            {ride.driver && ' Your driver has already been assigned.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Ride
          </Button>
          <Button onClick={handleCancelRide} color="error">
            Cancel Ride
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Driver Arrived!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Your driver has arrived at the pickup location.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Please share this OTP with your driver:
            </Typography>
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              color="primary.main"
              sx={{ 
                bgcolor: 'primary.50', 
                px: 3, 
                py: 2, 
                borderRadius: 3,
                letterSpacing: 8,
                my: 3
              }}
            >
              {rideOTP}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The driver will enter this OTP to start your trip
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleOTPVerification}
            sx={{ px: 4 }}
          >
            Verify & Start Trip
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RideDetailsPage;