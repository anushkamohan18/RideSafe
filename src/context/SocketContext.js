import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, accessToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [activeRide, setActiveRide] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && accessToken && user) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      const newSocket = io(socketUrl, {
        auth: {
          token: accessToken,
          userId: user.id,
          userRole: user.role
        },
        transports: ['websocket', 'polling'],
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        toast.success('Connected to live updates');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        toast.error('Connection error. Retrying...');
      });

      // User status events
      newSocket.on('user_online', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user_offline', (userId) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(new Set(users));
      });

      // Ride tracking events
      newSocket.on('ride_request', (rideData) => {
        if (user.role === 'driver') {
          toast.success(`New ride request in ${rideData.pickup_address}`);
        }
      });

      newSocket.on('ride_accepted', (rideData) => {
        setActiveRide(rideData);
        toast.success('Your ride has been accepted!');
      });

      newSocket.on('ride_cancelled', (rideData) => {
        setActiveRide(null);
        toast.error('Ride has been cancelled');
      });

      newSocket.on('driver_location_update', (locationData) => {
        if (activeRide && activeRide.driver_id === locationData.driverId) {
          setActiveRide(prev => ({
            ...prev,
            driver_location: locationData.location
          }));
        }
      });

      newSocket.on('ride_started', (rideData) => {
        setActiveRide(rideData);
        toast.success('Your ride has started!');
      });

      newSocket.on('ride_completed', (rideData) => {
        setActiveRide(null);
        toast.success('Ride completed successfully!');
      });

      // Message events
      newSocket.on('new_message', (messageData) => {
        toast.success(`New message from ${messageData.sender_name}`);
      });

      // Emergency events
      newSocket.on('emergency_alert', (emergencyData) => {
        toast.error(`Emergency alert: ${emergencyData.description}`, {
          duration: 10000,
          style: {
            background: '#f44336',
            color: 'white'
          }
        });
      });

      // Driver notification events (for drivers only)
      if (user.role === 'driver') {
        newSocket.on('driver_status_update', (statusData) => {
          toast.success(`Status updated: ${statusData.status}`);
        });
      }

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
        socketRef.current = null;
      };
    }
  }, [isAuthenticated, accessToken, user]);

  // Socket action functions
  const socketActions = {
    // Join ride room for real-time updates
    joinRideRoom: (rideId) => {
      if (socket) {
        socket.emit('join_ride', { rideId });
      }
    },

    // Leave ride room
    leaveRideRoom: (rideId) => {
      if (socket) {
        socket.emit('leave_ride', { rideId });
      }
    },

    // Update driver location
    updateDriverLocation: (location) => {
      if (socket && user?.role === 'driver') {
        socket.emit('driver_location_update', {
          driverId: user.id,
          location
        });
      }
    },

    // Send message
    sendMessage: (rideId, message) => {
      if (socket) {
        socket.emit('send_message', {
          rideId,
          message,
          senderId: user.id,
          senderName: user.name
        });
      }
    },

    // Request ride
    requestRide: (rideData) => {
      if (socket) {
        socket.emit('ride_request', rideData);
      }
    },

    // Accept ride (driver)
    acceptRide: (rideId) => {
      if (socket && user?.role === 'driver') {
        socket.emit('accept_ride', {
          rideId,
          driverId: user.id
        });
      }
    },

    // Cancel ride
    cancelRide: (rideId, reason) => {
      if (socket) {
        socket.emit('cancel_ride', {
          rideId,
          reason,
          userId: user.id
        });
      }
    },

    // Start ride (driver)
    startRide: (rideId) => {
      if (socket && user?.role === 'driver') {
        socket.emit('start_ride', {
          rideId,
          driverId: user.id
        });
      }
    },

    // Complete ride (driver)
    completeRide: (rideId) => {
      if (socket && user?.role === 'driver') {
        socket.emit('complete_ride', {
          rideId,
          driverId: user.id
        });
      }
    },

    // Send emergency alert
    sendEmergencyAlert: (emergencyData) => {
      if (socket) {
        socket.emit('emergency_alert', {
          ...emergencyData,
          userId: user.id,
          userName: user.name
        });
      }
    },

    // Update driver status
    updateDriverStatus: (status) => {
      if (socket && user?.role === 'driver') {
        socket.emit('driver_status_update', {
          driverId: user.id,
          status
        });
      }
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    activeRide,
    setActiveRide,
    ...socketActions
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 