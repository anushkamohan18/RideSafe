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
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Emergency,
  Phone,
  Message,
  LocationOn,
  Share,
  Warning,
  Security,
  LocalHospital,
  LocalPolice,
  LocalFireDepartment,
  PersonAdd,
  Edit,
  Delete,
  Close,
  Send,
  MyLocation,
  ContactPhone,
  SOS
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EmergencySOSPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [sosActivated, setSosActivated] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);

  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const [personalContacts, setPersonalContacts] = useState([
    { id: 1, name: 'Mom', phone: '+91 9876543210', relationship: 'Mother' },
    { id: 2, name: 'Dad', phone: '+91 9876543211', relationship: 'Father' },
    { id: 3, name: 'Emergency Contact', phone: '+91 9876543212', relationship: 'Friend' }
  ]);

  const emergencyServices = [
    {
      id: 'police',
      name: 'Police',
      phone: '100',
      icon: <LocalPolice />,
      color: 'primary',
      description: 'Law enforcement and crime reporting'
    },
    {
      id: 'ambulance',
      name: 'Ambulance',
      phone: '108',
      icon: <LocalHospital />,
      color: 'error',
      description: 'Medical emergencies and hospital transport'
    },
    {
      id: 'fire',
      name: 'Fire Department',
      phone: '101',
      icon: <LocalFireDepartment />,
      color: 'warning',
      description: 'Fire emergencies and rescue services'
    },
    {
      id: 'women-helpline',
      name: 'Women Helpline',
      phone: '1091',
      icon: <Security />,
      color: 'secondary',
      description: 'Women safety and harassment reporting'
    }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let interval;
    if (sosCountdown > 0) {
      interval = setInterval(() => {
        setSosCountdown(prev => prev - 1);
      }, 1000);
    } else if (sosCountdown === 0 && sosActivated) {
      triggerEmergencyAlert();
    }
    return () => clearInterval(interval);
  }, [sosCountdown, sosActivated]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
              {
                headers: { 'User-Agent': 'RideSafeApp/1.0' }
              }
            );
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setCurrentLocation({ latitude, longitude, address });
          } catch (error) {
            setCurrentLocation({ latitude, longitude, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationLoading(false);
          toast.error('Unable to get current location');
        }
      );
    }
  };

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleMessage = (contact) => {
    setSelectedContact(contact);
    setEmergencyMessage(`🚨 EMERGENCY! I need help. My current location: ${currentLocation?.address || 'Location unavailable'}. Please contact me immediately.`);
    setMessageDialogOpen(true);
  };

  const sendMessage = () => {
    const message = encodeURIComponent(emergencyMessage);
    window.location.href = `sms:${selectedContact.phone}?body=${message}`;
    setMessageDialogOpen(false);
    toast.success(`Emergency message sent to ${selectedContact.name}`);
  };

  const activateSOS = () => {
    setSosActivated(true);
    setSosCountdown(10); // 10 second countdown
    setEmergencyDialogOpen(true);
    toast.error('SOS Activated! Emergency services will be contacted in 10 seconds');
  };

  const cancelSOS = () => {
    setSosActivated(false);
    setSosCountdown(0);
    setEmergencyDialogOpen(false);
    toast.success('SOS Cancelled');
  };

  const triggerEmergencyAlert = () => {
    // Send emergency alert to all contacts
    personalContacts.forEach(contact => {
      const message = `🚨 EMERGENCY ALERT! ${user?.name} has activated SOS. Location: ${currentLocation?.address || 'Location unavailable'}. Please contact immediately or call emergency services.`;
      const encodedMessage = encodeURIComponent(message);
      // In a real app, this would use SMS API
      console.log(`Sending emergency SMS to ${contact.phone}: ${message}`);
    });
    
    setSosActivated(false);
    setEmergencyDialogOpen(false);
    toast.success('Emergency alerts sent to all contacts');
  };

  const shareLocation = () => {
    if (currentLocation) {
      const locationText = `My current location: ${currentLocation.address}\nGoogle Maps: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Location',
          text: locationText
        });
      } else {
        navigator.clipboard.writeText(locationText);
        toast.success('Location copied to clipboard');
      }
    } else {
      toast.error('Location not available');
    }
  };

  const addPersonalContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = {
        id: Date.now(),
        ...newContact
      };
      setPersonalContacts(prev => [...prev, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setAddContactDialogOpen(false);
      toast.success('Emergency contact added');
    }
  };

  const removeContact = (contactId) => {
    setPersonalContacts(prev => prev.filter(contact => contact.id !== contactId));
    toast.success('Contact removed');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="error.main" gutterBottom>
          Emergency SOS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quick access to emergency services and contacts
        </Typography>
      </Box>

      {/* Current Location */}
      <Card sx={{ mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <LocationOn color="primary" />
            <Typography variant="h6">Current Location</Typography>
            <IconButton onClick={getCurrentLocation} disabled={locationLoading}>
              <MyLocation />
            </IconButton>
          </Box>
          {locationLoading && <LinearProgress sx={{ mb: 2 }} />}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {currentLocation?.address || 'Location unavailable'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={shareLocation}
            disabled={!currentLocation}
          >
            Share Location
          </Button>
        </CardContent>
      </Card>

      {/* SOS Button */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Fab
          color="error"
          size="large"
          onClick={activateSOS}
          sx={{
            width: 120,
            height: 120,
            fontSize: '2rem',
            animation: sosActivated ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          <SOS sx={{ fontSize: '3rem' }} />
        </Fab>
        <Typography variant="h6" color="error.main" sx={{ mt: 1 }}>
          Emergency SOS
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Hold to activate emergency alert
        </Typography>
      </Box>

      {/* Emergency Services */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Emergency Services
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {emergencyServices.map((service) => (
          <Grid item xs={12} sm={6} key={service.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${service.color}.main` }}>
                    {service.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{service.name}</Typography>
                    <Typography variant="h5" color={`${service.color}.main`} fontWeight="bold">
                      {service.phone}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {service.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color={service.color}
                    startIcon={<Phone />}
                    onClick={() => handleCall(service.phone)}
                    fullWidth
                  >
                    Call
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Personal Emergency Contacts */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Personal Contacts
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={() => setAddContactDialogOpen(true)}
        >
          Add Contact
        </Button>
      </Box>

      <Card>
        <List>
          {personalContacts.map((contact, index) => (
            <React.Fragment key={contact.id}>
              <ListItem>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ContactPhone />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={contact.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {contact.phone}
                      </Typography>
                      <Chip label={contact.relationship} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleCall(contact.phone)}
                    >
                      <Phone />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="secondary"
                      onClick={() => handleMessage(contact)}
                    >
                      <Message />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => removeContact(contact.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              {index < personalContacts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>

      {/* SOS Activation Dialog */}
      <Dialog open={emergencyDialogOpen} onClose={cancelSOS}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            SOS Activated
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Emergency services will be contacted in {sosCountdown} seconds
          </Alert>
          <Typography variant="body1">
            Emergency alerts will be sent to all your contacts with your current location.
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(10 - sosCountdown) * 10} 
            sx={{ mt: 2 }}
            color="error"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSOS} color="primary" variant="contained">
            Cancel SOS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={addContactDialogOpen} onClose={() => setAddContactDialogOpen(false)}>
        <DialogTitle>Add Emergency Contact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Mother, Friend, Colleague"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddContactDialogOpen(false)}>Cancel</Button>
          <Button onClick={addPersonalContact} variant="contained">Add Contact</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)}>
        <DialogTitle>Send Emergency Message</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To: {selectedContact?.name} ({selectedContact?.phone})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={emergencyMessage}
            onChange={(e) => setEmergencyMessage(e.target.value)}
            placeholder="Emergency message..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button onClick={sendMessage} variant="contained" startIcon={<Send />}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmergencySOSPage;
