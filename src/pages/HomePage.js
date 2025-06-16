import React, { useState, useEffect } from 'react';
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
  IconButton,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  History,
  Settings,
  ReportProblem,
  Add,
  Navigation,
  People,
  CarRental,
  PersonAdd,
  Search,
  Star,
  ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { rideAPI } from '../services/api/rideService';
import LoadingScreen from '../components/LoadingScreen';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isConnected, onlineUsers, activeRide } = useSocket();
  
  const [recentRides, setRecentRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);

  useEffect(() => {
    fetchRecentRides();
  }, []);

  const fetchRecentRides = async () => {
    try {
      setLoadingRides(true);
      const response = await rideAPI.getUserRides(1, 3); // Fetch latest 3 rides
      setRecentRides(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching recent rides:', error);
      setRecentRides([]);
    } finally {
      setLoadingRides(false);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const RecentRideCard = ({ ride }) => (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[4],
        },
        // Enhanced theme-oriented styling for cancelled rides
        ...(ride.status === 'cancelled' && {
          background: 'linear-gradient(135deg, #424242 0%, #212121 100%)',
          color: 'white',
          border: '1px solid #616161',
          '& .MuiTypography-root': {
            color: 'white'
          },
          '& .MuiChip-root': {
            backgroundColor: (theme) => theme.palette.error.main,
            color: 'white',
            fontWeight: 600,
          },
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }
        })
      }} 
      onClick={() => navigate(`/ride/${ride.id}`)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: ride.status === 'cancelled' ? 'rgba(255,255,255,0.2)' : 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DirectionsCar 
                sx={{ 
                  fontSize: 20,
                  color: ride.status === 'cancelled' ? 'white' : 'primary.main'
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight="600"
                sx={{ 
                  color: ride.status === 'cancelled' ? 'white' : 'text.primary',
                  fontSize: '1.1rem'
                }}
              >
                Ride #{ride.id}
              </Typography>
              <Chip
                label={ride.status === 'cancelled' ? 'CANCELLED' : getStatusText(ride.status)}
                color={getStatusColor(ride.status)}
                size="small"
                sx={{ 
                  fontSize: '0.75rem', 
                  height: 24,
                  fontWeight: 600,
                  ...(ride.status === 'cancelled' && {
                    backgroundColor: (theme) => theme.palette.error.main,
                    color: 'white'
                  })
                }}
              />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="h5" 
              color={ride.status === 'cancelled' ? 'white' : 'primary.main'} 
              fontWeight="bold"
            >
              ₹{ride.estimated_cost || '0.00'}
            </Typography>
            <Typography 
              variant="caption" 
              color={ride.status === 'cancelled' ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
            >
              {formatDate(ride.created_at)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn 
              sx={{ 
                fontSize: 18,
                color: ride.status === 'cancelled' ? 'rgba(255,255,255,0.8)' : 'success.main'
              }} 
            />
            <Typography 
              variant="body2" 
              color={ride.status === 'cancelled' ? 'rgba(255,255,255,0.9)' : 'text.primary'} 
              sx={{ flex: 1, fontWeight: 500 }}
            >
              {ride.pickup_address || 'Unknown location'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn 
              sx={{ 
                fontSize: 18,
                color: ride.status === 'cancelled' ? 'rgba(255,255,255,0.8)' : 'error.main'
              }} 
            />
            <Typography 
              variant="body2" 
              color={ride.status === 'cancelled' ? 'rgba(255,255,255,0.9)' : 'text.primary'} 
              sx={{ flex: 1, fontWeight: 500 }}
            >
              {ride.dropoff_address || 'Unknown destination'}
            </Typography>
          </Box>
        </Box>

        {ride.driver && ride.status !== 'cancelled' && (
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main',
                boxShadow: (theme) => theme.shadows[2]
              }}
            >
              {ride.driver.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="600">
                {ride.driver.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {ride.driver.rating || '4.8'} • {ride.driver.total_rides || '150'} rides
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {ride.status === 'cancelled' && (
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: 1, 
            borderColor: 'rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight="600">
              This ride was cancelled
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (authLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'search-location':
        navigate('/search-location');
        break;
      case 'book-ride':
        navigate('/book-ride');
        break;
      case 'rent-car':
        navigate('/rent-car');
        break;
      case 'book-driver':
        navigate('/book-driver');
        break;
      case 'ride-history':
        navigate('/rides');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'driver-mode':
        navigate('/driver');
        break;
      case 'emergency':
        navigate('/emergency');
        break;
      default:
        break;
    }
  };

  const QuickActionCard = ({ icon, title, description, action, color = 'primary' }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: (theme) => `linear-gradient(135deg, ${theme.palette[color].light}15 0%, ${theme.palette[color].main}08 100%)`,
        border: (theme) => `1px solid ${theme.palette[color].light}30`,
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: 6,
          background: (theme) => `linear-gradient(135deg, ${theme.palette[color].light}25 0%, ${theme.palette[color].main}15 100%)`,
        }
      }}
      onClick={() => handleQuickAction(action)}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: (theme) => `0 4px 16px ${theme.palette[color].main}40`,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 24 } })}
        </Box>
        <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh', 
      pt: 2,
      transition: 'background-color 0.3s ease',
    }} 
    className="main-content"
    >
      <Container maxWidth="lg">
        {/* Enhanced Header Section */}
        <Box sx={{ mb: 5 }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
            color: 'white',
            border: 'none',
            mb: 3
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight="700" gutterBottom>
                    Welcome back, {user?.name || 'User'}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    Ready for your next journey?
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    {onlineUsers.size > 0 && (
                      <Chip
                        icon={<People />}
                        label={`${onlineUsers.size} users online`}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 500
                        }}
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                <IconButton
                  size="large"
                  onClick={() => handleQuickAction('emergency')}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    width: 64,
                    height: 64,
                    '&:hover': { 
                      bgcolor: 'error.dark',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <ReportProblem sx={{ fontSize: 28 }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Connection Status Alert */}
          {!isConnected && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You're currently offline. Some features may not work properly.
            </Alert>
          )}

          {/* Active Ride Alert */}
          {activeRide && (
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => navigate(`/ride/${activeRide.id}`)}
                >
                  View Details
                </Button>
              }
              sx={{ mb: 2 }}
            >
              You have an active ride in progress
            </Alert>
          )}
        </Box>

        {/* Quick Actions Section */}
        <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <QuickActionCard
              icon={<Search />}
              title="Find Location"
              description="Search places on map"
              action="search-location"
              color="info"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <QuickActionCard
              icon={<Add />}
              title="Book a Ride"
              description="Request a ride to your destination"
              action="book-ride"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <QuickActionCard
              icon={<CarRental />}
              title="Rent a Car"
              description="Rent a car for self-driving"
              action="rent-car"
              color="success"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <QuickActionCard
              icon={<PersonAdd />}
              title="Book a Driver"
              description="Hire a driver for your own car"
              action="book-driver"
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <QuickActionCard
              icon={<History />}
              title="Ride History"
              description="View your past rides and receipts"
              action="ride-history"
              color="secondary"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <QuickActionCard
              icon={<Settings />}
              title="Profile Settings"
              description="Update your account information"
              action="profile"
              color="info"
            />
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Recent Activity
              </Typography>
              {recentRides.length > 0 && (
                <Button
                  variant="text"
                  endIcon={<ArrowForward />}
                  onClick={() => handleQuickAction('ride-history')}
                  size="small"
                >
                  View All
                </Button>
              )}
            </Box>

            {loadingRides ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading recent rides...
                </Typography>
              </Box>
            ) : recentRides.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No recent activity to show
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Book your first ride to see your activity here
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleQuickAction('book-ride')}
                >
                  Book a Ride
                </Button>
              </Box>
            ) : (
              <Box>
                {recentRides.map((ride, index) => (
                  <React.Fragment key={ride.id}>
                    <RecentRideCard ride={ride} />
                    {index < recentRides.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
                
                {recentRides.length === 3 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<History />}
                      onClick={() => handleQuickAction('ride-history')}
                    >
                      View All Rides
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;