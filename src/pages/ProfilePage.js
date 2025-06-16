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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  MyLocation,
  Edit,
  Save,
  Cancel,
  Cake,
  Wc,
  Home,
  Security,
  NightsStay,
  Search,
  Clear
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api/authService';
import toast from 'react-hot-toast';
import '../styles/index.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [error, setError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    nighttimeGenderPreference: false
  });

  // Simple reverse geocoding function
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      return {
        formattedAddress: data.display_name || `${latitude}, ${longitude}`
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        formattedAddress: `${latitude}, ${longitude}`
      };
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        nighttimeGenderPreference: user.nighttimeGenderPreference || false
      });
    }
  }, [user]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Function to search addresses
  const searchAddresses = async (query) => {
    if (query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`
      );
      const data = await response.json();
      
      return data.map(item => ({
        id: item.place_id,
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Address search error:', error);
      return [];
    }
  };

  // Debounced address search
  const debouncedAddressSearch = (query) => {
    setAddressSearchLoading(true);
    
    if (window.addressSearchTimeout) {
      clearTimeout(window.addressSearchTimeout);
    }
    
    window.addressSearchTimeout = setTimeout(async () => {
      if (query.length >= 3) {
        const suggestions = await searchAddresses(query);
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
      setAddressSearchLoading(false);
    }, 500);
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Start address search for address field
    if (field === 'address' && value.length >= 2) {
      debouncedAddressSearch(value);
    } else if (field === 'address') {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
    
    if (error) setError('');
  };

  // Handle address suggestion selection
  const handleAddressSuggestionSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.display_name
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  // Clear address field
  const handleClearAddress = () => {
    setFormData(prev => ({
      ...prev,
      address: ''
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleLocationDetect = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 60000 
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      const locationData = await reverseGeocode(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        address: locationData.formattedAddress
      }));

      toast.success('Location detected successfully!');
      setShowLocationDialog(false);
      
    } catch (error) {
      console.error('Location detection error:', error);
      let errorMessage = 'Failed to detect location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location services.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required fields
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }

      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return;
      }

      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender || null,
        address: formData.address.trim() || null,
        nighttimeGenderPreference: formData.nighttimeGenderPreference
      };

      if (formData.dateOfBirth) {
        updateData.dateOfBirth = formData.dateOfBirth;
      }

      const response = await authAPI.updateProfile(updateData);
      
      if (response.data.user) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }

    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      address: user?.address || '',
      nighttimeGenderPreference: user?.nighttimeGenderPreference || false
    });
    setIsEditing(false);
    setError('');
  };

  // Check if user is female
  const isFemaleUser = formData.gender === 'FEMALE' || formData.gender === 'TRANSGENDER_WOMAN';

  const userAge = calculateAge(formData.dateOfBirth);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card className="custom-card">
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  fontWeight: 'bold'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {user?.name || 'User Profile'}
                </Typography>
                <Chip 
                  label={user?.role?.toUpperCase() || 'USER'} 
                  color="primary" 
                  size="small"
                />
              </Box>
            </Box>
            
            <IconButton
              color="primary"
              onClick={() => setIsEditing(!isEditing)}
              sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
            >
              <Edit />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ mb: 4 }} />

          {/* Profile Form */}
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                disabled={!isEditing}
                variant="outlined"
                InputProps={{
                  startAdornment: <Person color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                disabled
                variant="outlined"
                InputProps={{
                  startAdornment: <Email color="action" sx={{ mr: 1 }} />
                }}
                helperText="Email cannot be changed"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={!isEditing}
                variant="outlined"
                InputProps={{
                  startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!isEditing} variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleInputChange('gender')}
                  label="Gender"
                  startAdornment={<Wc color="action" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="">
                    <em>Prefer not to say</em>
                  </MenuItem>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="TRANSGENDER_WOMAN">Transgender Woman</MenuItem>
                  <MenuItem value="TRANSGENDER_MAN">Transgender Man</MenuItem>
                  <MenuItem value="NON_BINARY">Non-Binary</MenuItem>
                  <MenuItem value="AGENDER">Agender</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                disabled={!isEditing}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <Cake color="action" sx={{ mr: 1 }} />
                }}
                helperText={userAge ? `Age: ${userAge} years` : ''}
              />
            </Grid>

            {/* Safety Preferences - Only show for female users */}
            {isFemaleUser && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Security color="primary" />
                    Safety Preferences
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!isEditing} variant="outlined">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <NightsStay color="action" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          Nighttime Gender Preference
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Prefer female drivers for rides between 9 PM and 6 AM for enhanced safety
                        </Typography>
                      </Box>
                      <FormControl>
                        <Select
                          value={formData.nighttimeGenderPreference}
                          onChange={handleInputChange('nighttimeGenderPreference')}
                          disabled={!isEditing}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={false}>No Preference</MenuItem>
                          <MenuItem value={true}>Female Drivers Only</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <LocationOn color="primary" />
                Location Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowAddressSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click
                    setTimeout(() => setShowAddressSuggestions(false), 200);
                  }}
                  disabled={!isEditing}
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Search for your address..."
                  InputProps={{
                    startAdornment: <Home color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                    endAdornment: isEditing && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignSelf: 'flex-start', mt: 1 }}>
                        {addressSearchLoading && <CircularProgress size={16} />}
                        {formData.address && (
                          <IconButton
                            size="small"
                            onClick={handleClearAddress}
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )
                  }}
                />
                
                {/* Address Suggestions Dropdown */}
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <Card
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: isEditing ? 60 : 0,
                      zIndex: 1000,
                      maxHeight: 200,
                      overflow: 'auto',
                      mt: 1
                    }}
                  >
                    {addressSuggestions.map((suggestion) => (
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
                        onClick={() => handleAddressSuggestionSelect(suggestion)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {suggestion.display_name.split(',')[0]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {suggestion.display_name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Card>
                )}

                {isEditing && (
                  <IconButton
                    color="primary"
                    onClick={() => setShowLocationDialog(true)}
                    sx={{ mt: 1 }}
                    disabled={locationLoading}
                  >
                    {locationLoading ? <CircularProgress size={24} /> : <MyLocation />}
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Location Detection Dialog */}
      <Dialog open={showLocationDialog} onClose={() => setShowLocationDialog(false)}>
        <DialogTitle>Detect Current Location</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Allow the app to access your location to automatically fill in your address?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will use your device's GPS to determine your current location and convert it to a readable address.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLocationDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleLocationDetect}
            variant="contained"
            disabled={locationLoading}
            startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocation />}
          >
            {locationLoading ? 'Detecting...' : 'Detect Location'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
