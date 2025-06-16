import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  IconButton,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  Search,
  MyLocation,
  LocationOn,
  Clear,
  Add,
  CarRental,
  PersonAdd,
  DirectionsCar,
  Close,
  GpsFixed
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const LocationSearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default to Delhi
  const [mapZoom, setMapZoom] = useState(13);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [mapMarker, setMapMarker] = useState(null);
  const mapRef = useRef();

  const services = [
    {
      id: 'book-ride',
      title: 'Book a Ride',
      description: 'Request a ride to your destination',
      icon: <Add />,
      color: 'primary',
      path: '/book-ride'
    },
    {
      id: 'rent-car',
      title: 'Rent a Car',
      description: 'Rent a car for self-driving',
      icon: <CarRental />,
      color: 'success',
      path: '/rent-car'
    },
    {
      id: 'book-driver',
      title: 'Book a Driver',
      description: 'Hire a driver for your car',
      icon: <PersonAdd />,
      color: 'warning',
      path: '/book-driver'
    }
  ];

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setMapMarker({ lat, lng });
        
        // Reverse geocode the clicked location
        try {
          const address = await reverseGeocode(lat, lng);
          setSelectedLocation({
            latitude: lat,
            longitude: lng,
            address: address,
            name: address.split(',')[0]
          });
          toast.success('Location selected on map');
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Failed to get address for selected location');
        }
      }
    });
    return null;
  };

  // Auto-detect location when component mounts
  useEffect(() => {
    const autoDetectLocation = async () => {
      // Only auto-detect if user hasn't manually set a location yet
      if (!currentLocation && !selectedLocation) {
        console.log('Auto-detecting location on page load...');
        
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
            
            // Reverse geocode to get address
            const address = await reverseGeocode(latitude, longitude);
            
            const location = {
              latitude,
              longitude,
              address,
              name: 'Current Location'
            };
            
            setCurrentLocation(location);
            setMapCenter([latitude, longitude]);
            setMapZoom(16);
            
            console.log('Auto-detected location:', location);
            toast.success('Location auto-detected');
          } catch (error) {
            console.log('Auto-location detection failed:', error);
            // Don't show error toast for auto-detection failure
            // Users can manually trigger location detection if needed
          }
        }
      }
    };

    // Add a small delay to let the component mount properly
    const timeoutId = setTimeout(autoDetectLocation, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array - only run once on mount

  // Enhanced MapContainer with auto-centering on current location
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const map = mapRef.current;
      if (map) {
        // Smoothly animate to current location
        map.flyTo([currentLocation.latitude, currentLocation.longitude], 16, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [currentLocation]);

  // Get current location with enhanced feedback
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
      
      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      
      const location = {
        latitude,
        longitude,
        address,
        name: 'Current Location'
      };
      
      setCurrentLocation(location);
      setSelectedLocation(location);
      setMapCenter([latitude, longitude]);
      setMapZoom(16);
      setMapMarker({ lat: latitude, lng: longitude });
      
      toast.success('Current location detected');
    } catch (error) {
      console.error('Location error:', error);
      
      // Provide more specific error messages
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions.');
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please check your GPS settings.');
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again.');
      } else {
        toast.error('Unable to get your current location');
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // Reverse geocoding
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // Search locations
  const searchLocations = async (query) => {
    if (query.length < 2) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=in`
      );
      const data = await response.json();
      
      return data.map(item => ({
        id: item.place_id,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
        importance: item.importance || 0
      })).sort((a, b) => b.importance - a.importance);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearchLoading(true);
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowResults(true);
        setSearchLoading(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search result selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setShowResults(false);
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(16);
    setMapMarker({ lat: location.latitude, lng: location.longitude });
    toast.success(`Selected: ${location.name}`);
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    if (selectedLocation) {
      // Navigate to service page with location data
      navigate(service.path, {
        state: {
          selectedLocation: selectedLocation,
          fromLocationSearch: true
        }
      });
    } else {
      toast.error('Please select a location first');
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedLocation(null);
    setMapMarker(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Find Location
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Search for a location or select on the map to get started
        {currentLocation && (
          <Chip 
            icon={<MyLocation />} 
            label="Location detected" 
            color="success" 
            size="small" 
            sx={{ ml: 1 }}
          />
        )}
      </Typography>

      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
            <CardContent>
              {/* Auto-detection status */}
              {!currentLocation && !locationLoading && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Tip: Allow location access for automatic positioning on the map
                  </Typography>
                </Alert>
              )}

              {/* Search Bar */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search for places, landmarks, addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  InputProps={{
                    startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {searchLoading && <CircularProgress size={20} />}
                        {searchQuery && (
                          <IconButton size="small" onClick={handleClearSearch}>
                            <Clear />
                          </IconButton>
                        )}
                      </Box>
                    )
                  }}
                />

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
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
                    {searchResults.map((result) => (
                      <Box
                        key={result.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:last-child': { borderBottom: 'none' }
                        }}
                        onClick={() => handleLocationSelect(result)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {result.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {result.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Card>
                )}
              </Box>

              {/* Enhanced Current Location Button */}
              <Button
                fullWidth
                variant={currentLocation ? "outlined" : "contained"}
                startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocation />}
                onClick={getCurrentLocation}
                disabled={locationLoading}
                sx={{ 
                  mb: 2,
                  bgcolor: currentLocation ? 'transparent' : 'primary.main',
                  borderColor: currentLocation ? 'success.main' : 'primary.main',
                  color: currentLocation ? 'success.main' : 'white',
                  '&:hover': {
                    bgcolor: currentLocation ? 'success.light' : 'primary.dark',
                    borderColor: currentLocation ? 'success.main' : 'primary.dark',
                    color: currentLocation ? 'success.main' : 'white'
                  }
                }}
              >
                {locationLoading ? 'Getting Location...' : 
                 currentLocation ? 'Update Current Location' : 'Use Current Location'}
              </Button>

              {/* Selected Location Display */}
              {selectedLocation && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      Selected Location:
                    </Typography>
                    <Typography variant="body2">
                      {selectedLocation.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedLocation.address}
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Service Selection */}
              {selectedLocation && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    What would you like to do?
                  </Typography>
                  <Grid container spacing={1}>
                    {services.map((service) => (
                      <Grid item xs={12} key={service.id}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={service.icon}
                          onClick={() => handleServiceSelect(service)}
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            textAlign: 'left',
                            borderColor: `${service.color}.main`,
                            color: `${service.color}.main`,
                            '&:hover': {
                              borderColor: `${service.color}.main`,
                              bgcolor: `${service.color}.light`,
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {service.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {service.description}
                            </Typography>
                          </Box>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Map Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', position: 'relative' }}>
            {/* Loading overlay for initial location detection */}
            {!currentLocation && locationLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001,
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary">
                  Detecting your location...
                </Typography>
              </Box>
            )}

            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler />
              
              {/* Selected location marker */}
              {mapMarker && (
                <Marker 
                  position={[mapMarker.lat, mapMarker.lng]}
                  icon={createCustomIcon('#FF5722')}
                >
                  <Popup>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        Selected Location
                      </Typography>
                      {selectedLocation && (
                        <Typography variant="caption">
                          {selectedLocation.name}
                        </Typography>
                      )}
                    </Box>
                  </Popup>
                </Marker>
              )}
              
              {/* Current location marker with pulsing effect */}
              {currentLocation && (
                <Marker 
                  position={[currentLocation.latitude, currentLocation.longitude]}
                  icon={createCustomIcon('#4CAF50')}
                >
                  <Popup>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        Your Current Location
                      </Typography>
                      <Typography variant="caption">
                        Auto-detected via GPS
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Enhanced Map Controls */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
              <Fab
                size="small"
                color={currentLocation ? "success" : "primary"}
                onClick={getCurrentLocation}
                disabled={locationLoading}
                sx={{ 
                  mb: 1,
                  bgcolor: currentLocation ? 'success.main' : 'primary.main',
                  '&:hover': {
                    bgcolor: currentLocation ? 'success.dark' : 'primary.dark'
                  }
                }}
                title={currentLocation ? "Update location" : "Get current location"}
              >
                {locationLoading ? <CircularProgress size={20} color="inherit" /> : <GpsFixed />}
              </Fab>
            </Box>

            {/* Enhanced Map Legend with current location status */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                left: 16, 
                zIndex: 1000,
                bgcolor: 'rgba(255,255,255,0.95)',
                p: 1.5,
                borderRadius: 2,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
                Legend:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: '#FF5722',
                  border: '2px solid white'
                }} />
                <Typography variant="caption">Selected Location</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: '#4CAF50',
                  border: '2px solid white'
                }} />
                <Typography variant="caption">
                  Your Location {currentLocation ? '(Detected)' : '(Not detected)'}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LocationSearchPage;
