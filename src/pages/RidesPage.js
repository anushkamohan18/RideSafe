import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Tab,
  Tabs,
  Avatar,
  Divider
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  Schedule,
  Star,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { rideAPI } from '../services/api/rideService';
import LoadingScreen from '../components/LoadingScreen';

const RidesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchRides();
  }, [tabValue]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const status = tabValue === 0 ? null : 
                   tabValue === 1 ? 'pending' :
                   tabValue === 2 ? 'in_progress' : 'completed';
      
      const response = await rideAPI.getUserRides(1, 20, status);
      setRides(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'arrived': return 'info';
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

  const RideCard = ({ ride }) => (
    <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate(`/ride/${ride.id}`)}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionsCar color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {ride.vehicle_type?.toUpperCase() || 'RIDE'} - #{ride.id}
              </Typography>
              <Chip
                label={getStatusText(ride.status)}
                color={getStatusColor(ride.status)}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {new Date(ride.created_at).toLocaleDateString()} at {new Date(ride.created_at).toLocaleTimeString()}
            </Typography>
          </Box>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            ₹{ride.estimated_cost || '0.00'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn color="primary" fontSize="small" />
              <Typography variant="body2" fontWeight="500">From:</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {ride.pickup_address || 'Unknown location'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn color="secondary" fontSize="small" />
              <Typography variant="body2" fontWeight="500">To:</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {ride.dropoff_address || 'Unknown destination'}
            </Typography>
          </Grid>
        </Grid>

        {ride.driver && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {ride.driver.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="500">
                  {ride.driver.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {ride.driver.rating || '4.8'} • {ride.driver.vehicle?.make} {ride.driver.vehicle?.model}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LoadingScreen message="Loading your rides..." />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Your Rides
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and manage your ride history
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Rides" />
          <Tab label="Pending" />
          <Tab label="Active" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      {rides.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No rides found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You haven't taken any rides yet. Book your first ride to get started!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/book-ride')}
              sx={{ mt: 2 }}
            >
              Book a Ride
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default RidesPage;