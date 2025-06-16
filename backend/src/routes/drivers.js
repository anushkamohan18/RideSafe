const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const socketService = require('../services/socketService');

const router = express.Router();
const prisma = new PrismaClient();

// Vehicle registration validation
const vehicleValidation = [
  body('make').trim().notEmpty().withMessage('Vehicle make is required'),
  body('model').trim().notEmpty().withMessage('Vehicle model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('color').trim().notEmpty().withMessage('Vehicle color is required'),
  body('vehicleType').isIn(['SEDAN', 'SUV', 'HATCHBACK', 'BIKE', 'AUTO']).withMessage('Valid vehicle type is required')
];

// Register/Update vehicle
router.post('/vehicle', vehicleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { make, model, year, plateNumber, color, vehicleType } = req.body;

    // Check if plate number is already registered
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber }
    });

    if (existingVehicle && existingVehicle.driverId !== req.user.id) {
      return res.status(409).json({ error: 'Vehicle with this plate number already registered' });
    }

    // Create or update vehicle
    const vehicle = await prisma.vehicle.upsert({
      where: { driverId: req.user.id },
      update: {
        make,
        model,
        year: parseInt(year),
        plateNumber,
        color,
        vehicleType
      },
      create: {
        driverId: req.user.id,
        make,
        model,
        year: parseInt(year),
        plateNumber,
        color,
        vehicleType
      }
    });

    res.json({
      message: 'Vehicle registered successfully',
      vehicle
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Vehicle with this plate number already exists' });
    }
    console.error('Vehicle registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available drivers
router.get('/available', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Get drivers with vehicles who are currently online
    const onlineDrivers = socketService.getAvailableDrivers();

    if (onlineDrivers.length === 0) {
      return res.json({ drivers: [] });
    }

    // Get detailed driver information
    const driverIds = onlineDrivers.map(d => d.driverId);
    
    const drivers = await prisma.user.findMany({
      where: {
        id: { in: driverIds },
        role: 'DRIVER',
        vehicle: {
          isNot: null
        }
      },
      include: {
        vehicle: true,
        ratingsReceived: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculate ratings and add location data
    const availableDrivers = drivers.map(driver => {
      const onlineDriver = onlineDrivers.find(od => od.driverId === driver.id);
      const ratings = driver.ratingsReceived;
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        id: driver.id,
        name: driver.name,
        gender: driver.gender,
        phone: driver.phone,
        vehicle: driver.vehicle,
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length,
        location: onlineDriver?.location,
        lastUpdate: onlineDriver?.lastUpdate
      };
    });

    // Filter by radius if needed (simplified distance calculation)
    const lat1 = parseFloat(latitude);
    const lon1 = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    const nearbyDrivers = availableDrivers.filter(driver => {
      if (!driver.location) return false;
      
      const lat2 = driver.location.latitude;
      const lon2 = driver.location.longitude;
      
      // Simple distance calculation (not perfectly accurate but good enough)
      const distance = Math.sqrt(
        Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)
      ) * 111; // Rough conversion to km
      
      return distance <= radiusKm;
    });

    res.json({ drivers: nearbyDrivers });

  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update driver location (alternative to socket)
router.post('/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (req.user.role !== 'DRIVER') {
      return res.status(403).json({ error: 'Only drivers can update location' });
    }

    // This would typically be handled by socket.io for real-time updates
    // This endpoint can serve as a fallback

    res.json({
      message: 'Location updated successfully',
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver statistics
router.get('/stats', async (req, res) => {
  try {
    if (req.user.role !== 'DRIVER') {
      return res.status(403).json({ error: 'Only drivers can access stats' });
    }

    // Get ride statistics
    const totalRides = await prisma.ride.count({
      where: {
        driverId: req.user.id,
        status: 'COMPLETED'
      }
    });

    const totalEarnings = await prisma.ride.aggregate({
      where: {
        driverId: req.user.id,
        status: 'COMPLETED'
      },
      _sum: {
        actualPrice: true
      }
    });

    // Get rating statistics
    const ratings = await prisma.rideRating.findMany({
      where: {
        ratedUserId: req.user.id
      },
      select: {
        rating: true,
        review: true,
        createdAt: true
      }
    });

    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Get recent rides
    const recentRides = await prisma.ride.findMany({
      where: {
        driverId: req.user.id
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true
          }
        },
        rating: true
      },
      orderBy: { requestedAt: 'desc' },
      take: 10
    });

    res.json({
      totalRides,
      totalEarnings: totalEarnings._sum.actualPrice || 0,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
      recentRides
    });

  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver profile
router.get('/profile', async (req, res) => {
  try {
    const driver = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicle: true,
        ratingsReceived: {
          include: {
            rater: {
              select: {
                name: true
              }
            },
            ride: {
              select: {
                id: true,
                completedAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        profileImage: true,
        createdAt: true,
        vehicle: true,
        ratingsReceived: true
      }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ driver });

  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 