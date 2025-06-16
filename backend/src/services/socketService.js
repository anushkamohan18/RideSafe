const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.driverLocations = new Map(); // driverId -> { lat, lng, timestamp }
  }

  initialize(io) {
    this.io = io;

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            role: true,
            email: true
          }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User ${socket.user.name} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // If user is a driver, join drivers room
      if (socket.user.role === 'DRIVER') {
        socket.join('drivers');
      }

      // Handle driver location updates
      socket.on('driver_location_update', (data) => {
        this.handleDriverLocationUpdate(socket, data);
      });

      // Handle ride messages
      socket.on('send_message', (data) => {
        this.handleSendMessage(socket, data);
      });

      // Handle emergency reports
      socket.on('emergency_report', (data) => {
        this.handleEmergencyReport(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.name} disconnected`);
        this.connectedUsers.delete(socket.userId);
        
        // Remove driver location if they disconnect
        if (socket.user.role === 'DRIVER') {
          this.driverLocations.delete(socket.userId);
        }
      });
    });

    console.log('Socket.io service initialized');
  }

  // Handle driver location updates
  async handleDriverLocationUpdate(socket, data) {
    if (socket.user.role !== 'DRIVER') {
      return;
    }

    const { latitude, longitude, rideId } = data;

    if (!latitude || !longitude) {
      return;
    }

    // Store driver location
    this.driverLocations.set(socket.userId, {
      latitude,
      longitude,
      timestamp: Date.now(),
      rideId
    });

    // If driver is in an active ride, notify the rider
    if (rideId) {
      try {
        const ride = await prisma.ride.findUnique({
          where: { id: rideId },
          select: { riderId: true, status: true }
        });

        if (ride && ['ACCEPTED', 'EN_ROUTE', 'PICKED_UP', 'IN_PROGRESS'].includes(ride.status)) {
          this.io.to(`user_${ride.riderId}`).emit('driver_location', {
            driverId: socket.userId,
            latitude,
            longitude,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Error handling driver location update:', error);
      }
    }
  }

  // Handle sending messages
  async handleSendMessage(socket, data) {
    try {
      const { rideId, content, receiverId } = data;

      // Validate ride access
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        select: { riderId: true, driverId: true }
      });

      if (!ride || (ride.riderId !== socket.userId && ride.driverId !== socket.userId)) {
        return;
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          rideId,
          senderId: socket.userId,
          receiverId,
          content,
          messageType: 'TEXT'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Send to both participants
      this.io.to(`user_${receiverId}`).emit('new_message', message);
      socket.emit('message_sent', message);

    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  }

  // Handle emergency reports
  async handleEmergencyReport(socket, data) {
    try {
      const { rideId, emergencyType, description, latitude, longitude } = data;

      // Validate ride access
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        select: { riderId: true, driverId: true }
      });

      if (!ride || (ride.riderId !== socket.userId && ride.driverId !== socket.userId)) {
        return;
      }

      // Create emergency report
      const emergencyReport = await prisma.emergencyReport.create({
        data: {
          rideId,
          reporterId: socket.userId,
          emergencyType,
          description,
          latitude,
          longitude,
          status: 'ACTIVE'
        }
      });

      // Notify emergency services (in production, this would alert actual emergency services)
      console.log('EMERGENCY ALERT:', emergencyReport);

      // Notify the other participant in the ride
      const otherUserId = ride.riderId === socket.userId ? ride.driverId : ride.riderId;
      if (otherUserId) {
        this.io.to(`user_${otherUserId}`).emit('emergency_alert', {
          rideId,
          emergencyType,
          description,
          reporterId: socket.userId
        });
      }

      socket.emit('emergency_reported', { success: true });

    } catch (error) {
      console.error('Error handling emergency report:', error);
      socket.emit('emergency_error', { error: 'Failed to report emergency' });
    }
  }

  // Notify available drivers about new ride requests
  notifyAvailableDrivers(ride) {
    if (!this.io) return;

    this.io.to('drivers').emit('new_ride_request', {
      rideId: ride.id,
      pickup: {
        latitude: ride.pickupLatitude,
        longitude: ride.pickupLongitude,
        address: ride.pickupAddress
      },
      drop: {
        latitude: ride.dropLatitude,
        longitude: ride.dropLongitude,
        address: ride.dropAddress
      },
      estimatedPrice: ride.estimatedPrice,
      rider: ride.rider
    });
  }

  // Notify participants about ride updates
  notifyRideUpdate(ride) {
    if (!this.io) return;

    const updateData = {
      rideId: ride.id,
      status: ride.status,
      rider: ride.rider,
      driver: ride.driver,
      acceptedAt: ride.acceptedAt,
      startedAt: ride.startedAt,
      completedAt: ride.completedAt
    };

    // Notify rider
    this.io.to(`user_${ride.riderId}`).emit('ride_update', updateData);

    // Notify driver if assigned
    if (ride.driverId) {
      this.io.to(`user_${ride.driverId}`).emit('ride_update', updateData);
    }
  }

  // Get driver's current location
  getDriverLocation(driverId) {
    return this.driverLocations.get(driverId);
  }

  // Get all connected drivers with their locations
  getAvailableDrivers() {
    const availableDrivers = [];
    
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && socket.user.role === 'DRIVER') {
        const location = this.driverLocations.get(userId);
        if (location) {
          availableDrivers.push({
            driverId: userId,
            name: socket.user.name,
            location: {
              latitude: location.latitude,
              longitude: location.longitude
            },
            lastUpdate: location.timestamp
          });
        }
      }
    }

    return availableDrivers;
  }
}

module.exports = new SocketService(); 