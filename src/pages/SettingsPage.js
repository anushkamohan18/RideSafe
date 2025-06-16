import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Language,
  Palette,
  Help,
  Info,
  ExitToApp,
  Edit,
  Delete,
  LocationOn,
  Payment,
  Star,
  Share,
  Feedback,
  Add,
  People,
  Shield,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../App';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  
  // Use the global theme hook
  const { isDarkMode, toggleDarkMode: toggleTheme } = useAppTheme();
  
  const [settings, setSettings] = useState({
    // Appearance Settings
    fontSize: 'medium',
    darkMode: false,
    notifications: true,
    locationSharing: true,
    autoBooking: false,
    
    // Safety & Privacy Settings
    genderPreference: 'any',
    nightGenderPreference: 'any',
    verificationBadges: {
      backgroundCheck: true,
      license: true,
      rating: true,
      photoVerification: true
    },
    audioRecording: false,
    hideRealName: false,
    maskPhoneNumber: true,
    rideHistoryLock: false,
    
    // Personal Safety Settings
    liveLocationSharing: true,
    autoShareLocation: false,
    sosEnabled: true,
    
    // Trusted Contacts
    trustedContacts: [],
    emergencyContacts: []
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactType, setContactType] = useState('trusted');
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    // Load settings from user profile or localStorage
    loadUserSettings();
  }, [user]);

  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem('ridesafe_settings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      localStorage.setItem('ridesafe_settings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleVerificationChange = (badge) => (event) => {
    setSettings(prev => ({
      ...prev,
      verificationBadges: {
        ...prev.verificationBadges,
        [badge]: event.target.checked
      }
    }));
  };

  const handleFontSizeChange = (event, newValue) => {
    const fontSizes = ['small', 'medium', 'large', 'extra-large'];
    const selectedSize = fontSizes[newValue];
    setSettings(prev => ({
      ...prev,
      fontSize: selectedSize
    }));
    // Apply font size immediately
    document.documentElement.style.fontSize = getFontSizeValue(selectedSize);
  };

  const getFontSizeValue = (size) => {
    switch (size) {
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      case 'extra-large': return '20px';
      default: return '16px';
    }
  };

  const toggleDarkMode = (event) => {
    toggleTheme();
    toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const contactList = contactType === 'trusted' ? 'trustedContacts' : 'emergencyContacts';
    setSettings(prev => ({
      ...prev,
      [contactList]: [...prev[contactList], { ...newContact, id: Date.now() }]
    }));

    setNewContact({ name: '', phone: '' });
    setDialogOpen(false);
    toast.success(`${contactType} contact added successfully!`);
  };

  const removeContact = (contactId, type) => {
    const contactList = type === 'trusted' ? 'trustedContacts' : 'emergencyContacts';
    setSettings(prev => ({
      ...prev,
      [contactList]: prev[contactList].filter(contact => contact.id !== contactId)
    }));
    toast.success('Contact removed');
  };

  const handleEditProfile = () => {
    setEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    // Here you would typically save to backend
    console.log('Saving profile:', profileData);
    toast.success('Profile updated successfully');
    setEditProfileOpen(false);
  };

  const handleDeleteAccount = () => {
    setDeleteAccountOpen(true);
  };

  const confirmDeleteAccount = () => {
    // Here you would typically call delete API
    console.log('Deleting account...');
    toast.success('Account deletion requested');
    setDeleteAccountOpen(false);
    // Redirect to login after account deletion
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          primary: 'Edit Profile',
          secondary: 'Update your personal information',
          icon: <Person />,
          action: 'button',
          onClick: handleEditProfile
        },
        {
          primary: 'Payment Methods',
          secondary: 'Manage your payment options',
          icon: <Payment />,
          action: 'button',
          onClick: () => navigate('/payment-methods')
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          primary: 'Push Notifications',
          secondary: 'Receive ride updates and alerts',
          icon: <Notifications />,
          action: 'switch',
          checked: settings.notifications,
          onChange: handleSettingChange('notifications')
        },
        {
          primary: 'Location Sharing',
          secondary: 'Share location for better ride matching',
          icon: <LocationOn />,
          action: 'switch',
          checked: settings.locationSharing,
          onChange: handleSettingChange('locationSharing')
        },
        {
          primary: 'Auto Booking',
          secondary: 'Automatically book rides based on schedule',
          icon: <Star />,
          action: 'switch',
          checked: settings.autoBooking,
          onChange: handleSettingChange('autoBooking')
        }
      ]
    },
    {
      title: 'App',
      items: [
        {
          primary: 'Language',
          secondary: 'English',
          icon: <Language />,
          action: 'button',
          onClick: () => toast('Language settings coming soon')
        },
        {
          primary: 'Theme',
          secondary: 'App appearance',
          icon: <Palette />,
          action: 'button',
          onClick: () => toast('Theme settings coming soon')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          primary: 'Help Center',
          secondary: 'Get help and support',
          icon: <Help />,
          action: 'button',
          onClick: () => navigate('/help')
        },
        {
          primary: 'Send Feedback',
          secondary: 'Share your thoughts',
          icon: <Feedback />,
          action: 'button',
          onClick: () => toast('Feedback form coming soon')
        },
        {
          primary: 'Share App',
          secondary: 'Invite friends to RideSafe',
          icon: <Share />,
          action: 'button',
          onClick: () => {
            if (navigator.share) {
              navigator.share({
                title: 'RideSafe',
                text: 'Check out RideSafe - the safest way to travel!',
                url: window.location.origin
              });
            } else {
              toast.success('Share link copied to clipboard');
            }
          }
        },
        {
          primary: 'About',
          secondary: 'App version and info',
          icon: <Info />,
          action: 'button',
          onClick: () => navigate('/about')
        }
      ]
    }
  ];

  const SettingSection = ({ title, icon, children }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  const ContactList = ({ contacts, type, title }) => (
    <Box sx={{ p: 2, mb: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => {
            setContactType(type);
            setDialogOpen(true);
          }}
          size="small"
        >
          Add
        </Button>
      </Box>
      <List dense>
        {contacts.map((contact) => (
          <ListItem key={contact.id}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {contact.name.charAt(0)}
            </Avatar>
            <ListItemText
              primary={contact.name}
              secondary={contact.phone}
            />
            <IconButton
              edge="end"
              onClick={() => removeContact(contact.id, type)}
              size="small"
              color="error"
            >
              <Delete />
            </IconButton>
          </ListItem>
        ))}
        {contacts.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No contacts added yet
          </Typography>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      transition: 'background-color 0.3s ease',
    }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize your RideSafe experience and safety preferences
        </Typography>

        {/* Profile Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {user?.name || 'User Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email || 'user@example.com'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role?.toUpperCase() || 'RIDER'} • Member since {new Date().getFullYear()}
                </Typography>
              </Box>
              <IconButton onClick={handleEditProfile}>
                <Edit />
              </IconButton>
            </Box>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <SettingSection title="Appearance" icon={<Brightness4 color="primary" />}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Font Size</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={['small', 'medium', 'large', 'extra-large'].indexOf(settings.fontSize)}
                  onChange={handleFontSizeChange}
                  step={1}
                  marks={[
                    { value: 0, label: 'Small' },
                    { value: 1, label: 'Medium' },
                    { value: 2, label: 'Large' },
                    { value: 3, label: 'XL' }
                  ]}
                  min={0}
                  max={3}
                />
              </Box>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    icon={<Brightness7 />}
                    checkedIcon={<Brightness4 />}
                  />
                }
                label="Dark Theme"
              />
            </Box>
          </Box>
        </SettingSection>

        {/* Driver Preferences */}
        <SettingSection title="Driver Preferences" icon={<People color="primary" />}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Gender Preference</InputLabel>
                <Select
                  value={settings.genderPreference}
                  onChange={handleSettingChange('genderPreference')}
                  label="Gender Preference"
                >
                  <MenuItem value="any">Any Gender</MenuItem>
                  <MenuItem value="same">Same Gender Only</MenuItem>
                  <MenuItem value="female">Female Drivers Only</MenuItem>
                  <MenuItem value="male">Male Drivers Only</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Night Time Preference</InputLabel>
                <Select
                  value={settings.nightGenderPreference}
                  onChange={handleSettingChange('nightGenderPreference')}
                  label="Night Time Preference"
                >
                  <MenuItem value="any">Any Gender</MenuItem>
                  <MenuItem value="female">Women Drivers Only</MenuItem>
                  <MenuItem value="same">Same Gender Only</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Required Driver Verification Badges
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.entries(settings.verificationBadges).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={handleVerificationChange(key)}
                        size="small"
                      />
                    }
                    label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </SettingSection>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {group.title}
              </Typography>
              <List disablePadding>
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <ListItem
                      sx={{
                        px: 0,
                        cursor: item.action === 'button' ? 'pointer' : 'default',
                        '&:hover': item.action === 'button' ? { bgcolor: 'action.hover' } : {},
                        borderRadius: 1
                      }}
                      onClick={item.action === 'button' ? item.onClick : undefined}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.primary}
                        secondary={item.secondary}
                      />
                      <ListItemSecondaryAction>
                        {item.action === 'switch' && (
                          <Switch
                            checked={item.checked}
                            onChange={item.onChange}
                            color="primary"
                          />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {itemIndex < group.items.length - 1 && (
                      <Divider component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}

        {/* Privacy & Security */}
        <SettingSection title="Privacy & Security" icon={<Security color="primary" />}>
          <List>
            <ListItem>
              <ListItemText
                primary="Hide Real Name from Driver"
                secondary="Use display name or initials only"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.hideRealName}
                  onChange={handleSettingChange('hideRealName')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="Mask Phone Number"
                secondary="Always use VoIP for rider-driver calls"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.maskPhoneNumber}
                  onChange={handleSettingChange('maskPhoneNumber')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Ride History Access Lock"
                secondary="Require biometric/PIN to view past rides"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.rideHistoryLock}
                  onChange={handleSettingChange('rideHistoryLock')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Driver Audio Recording"
                secondary="Auto-record audio when safety is triggered"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.audioRecording}
                  onChange={handleSettingChange('audioRecording')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </SettingSection>

        {/* Personal Safety */}
        <SettingSection title="Personal Safety" icon={<Shield color="primary" />}>
          <List>
            <ListItem>
              <ListItemText
                primary="Live Location Sharing"
                secondary="Share location with trusted contacts during rides"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.liveLocationSharing}
                  onChange={handleSettingChange('liveLocationSharing')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="Auto-Share with Trusted Contacts"
                secondary="Automatically notify trusted contacts when ride starts"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.autoShareLocation}
                  onChange={handleSettingChange('autoShareLocation')}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary="SOS Emergency Alerts"
                secondary="Enable emergency button and automatic alerts"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.sosEnabled}
                  onChange={handleSettingChange('sosEnabled')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          {/* Trusted Contacts */}
          <ContactList
            contacts={settings.trustedContacts}
            type="trusted"
            title="Trusted Contacts"
          />

          {/* Emergency Contacts */}
          <ContactList
            contacts={settings.emergencyContacts}
            type="emergency"
            title="Emergency Contacts"
          />
        </SettingSection>

        {/* Save Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={saveSettings}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>

        {/* Add Contact Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Add {contactType === 'trusted' ? 'Trusted' : 'Emergency'} Contact
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              margin="normal"
              type="tel"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addContact} variant="contained">Add Contact</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)}>
          <DialogTitle color="error">Delete Account</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </Alert>
            <Typography variant="body2" paragraph>
              Are you sure you want to delete your account? This will:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Permanently delete your profile</li>
              <li>Remove all ride history</li>
              <li>Cancel any active bookings</li>
              <li>Delete all saved payment methods</li>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAccountOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={confirmDeleteAccount}>
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SettingsPage;
