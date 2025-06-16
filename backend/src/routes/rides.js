const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const socketService = require('../services/socketService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const createRideValidation = [
  body('pickupLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
  body('pickupLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('dropLatitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid drop latitude'),
  body('dropLongitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid drop longitude'),
  body('dropAddress').trim().notEmpty().withMessage('Drop address is required')
];

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Helper function to estimate ride duration (based on average speed of 30 km/h)
const estimateDuration = (distance) => {
  const avgSpeed = 30; // km/h
  return Math.round((distance / avgSpeed) * 60); // Convert to minutes
};

// Helper function to calculate ride cost
const calculateRideCost = (distance, vehicleType = 'car') => {
  const baseFare = 5.00; // Base fare in dollars
  const perKmRate = {
    'car': 2.50,
    'suv': 3.25,
    'luxury': 4.50,
    'bike': 1.75
  };
  
  const rate = perKmRate[vehicleType] || perKmRate['car'];
  const cost = baseFare + (distance * rate);
  
  return {
    baseFare,
    distanceCost: distance * rate,
    cost: Math.round(cost * 100) / 100 // Round to 2 decimal places
  };
};

// Estimate ride cost
router.post('/estimate', async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType } = req.body;

    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ error: 'Pickup and dropoff locations are required' });
    }

    if (!pickupLocation.latitude || !pickupLocation.longitude || 
        !dropoffLocation.latitude || !dropoffLocation.longitude) {
      return res.status(400).json({ error: 'Invalid location coordinates' });
    }

    // Calculate distance
    const distance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      dropoffLocation.latitude,
      dropoffLocation.longitude
    );

    // Estimate duration
    const duration = estimateDuration(distance);

    // Calculate cost
    const costBreakdown = calculateRideCost(distance, vehicleType);

    res.json({
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      duration,
      baseFare: costBreakdown.baseFare,
      distanceCost: costBreakdown.distanceCost,
      cost: costBreakdown.cost,
      vehicleType,
      currency: 'USD'
    });

  } catch (error) {
    console.error('Estimate ride cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new ride
router.post('/', createRideValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      pickupLatitude,
      pickupLongitude,
      pickupAddress,
      dropLatitude,
      dropLongitude,
      dropAddress,
      estimatedPrice
    } = req.body;

    const ride = await prisma.ride.create({
      data: {
        riderId: req.user.id,
        pickupLatitude,
        pickupLongitude,
        pickupAddress,
        dropLatitude,
        dropLongitude,
        dropAddress,
        estimatedPrice: estimatedPrice || null,
        status: 'PENDING'
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true
          }
        }
      }
    });

    // Notify available drivers about new ride request
    socketService.notifyAvailableDrivers(ride);

    res.status(201).json({
      message: 'Ride created successfully',
      ride
    });

  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's rides
router.get('/', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    const where = {
      OR: [
        { riderId: req.user.id },
        { driverId: req.user.id }
      ]
    };

    if (status) {
      where.status = status;
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
            vehicle: true
          }
        },
        rating: true
      },
      orderBy: { requestedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ rides });

  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific ride
router.get('/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
            vehicle: true
          }
        },
        rating: true,
        emergencyReports: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Check if user is authorized to view this ride
    if (ride.riderId !== req.user.id && ride.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this ride' });
    }

    res.json({ ride });

  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept ride (driver only)
router.put('/:rideId/accept', async (req, res) => {
  try {
    const { rideId } = req.params;

    // Verify user is a driver
    if (req.user.role !== 'DRIVER') {
      return res.status(403).json({ error: 'Only drivers can accept rides' });
    }

    // Check if driver has a vehicle
    const driver = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { vehicle: true }
    });

    if (!driver.vehicle) {
      return res.status(400).json({ error: 'Driver must have a registered vehicle' });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'PENDING') {
      return res.status(400).json({ error: 'Ride is no longer available' });
    }

    // Update ride status
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: req.user.id,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
            vehicle: true
          }
        }
      }
    });

    // Notify rider
    socketService.notifyRideUpdate(updatedRide);

    res.json({
      message: 'Ride accepted successfully',
      ride: updatedRide
    });

  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ride status
router.put('/:rideId/status', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;

    const validStatuses = ['EN_ROUTE', 'PICKED_UP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Check authorization
    if (ride.riderId !== req.user.id && ride.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this ride' });
    }

    // Status transition validation
    const statusTransitions = {
      'ACCEPTED': ['EN_ROUTE', 'CANCELLED'],
      'EN_ROUTE': ['PICKED_UP', 'CANCELLED'],
      'PICKED_UP': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED']
    };

    if (!statusTransitions[ride.status]?.includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    // Update data object
    const updateData = { status };
    
    switch (status) {
      case 'PICKED_UP':
        updateData.startedAt = new Date();
        break;
      case 'COMPLETED':
        updateData.completedAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        break;
    }

    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: updateData,
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            gender: true,
            vehicle: true
          }
        }
      }
    });

    // Notify participants
    socketService.notifyRideUpdate(updatedRide);

    res.json({
      message: 'Ride status updated successfully',
      ride: updatedRide
    });

  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rate ride
router.post('/:rideId/rate', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { rating: true }
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only rate completed rides' });
    }

    if (ride.rating) {
      return res.status(400).json({ error: 'Ride already rated' });
    }

    // Determine who is being rated
    let ratedUserId;
    if (ride.riderId === req.user.id) {
      ratedUserId = ride.driverId; // Rider rating driver
    } else if (ride.driverId === req.user.id) {
      ratedUserId = ride.riderId; // Driver rating rider
    } else {
      return res.status(403).json({ error: 'Not authorized to rate this ride' });
    }

    const rideRating = await prisma.rideRating.create({
      data: {
        rideId,
        raterId: req.user.id,
        ratedUserId,
        rating: parseInt(rating),
        review: review || null
      }
    });

    res.json({
      message: 'Rating submitted successfully',
      rating: rideRating
    });

  } catch (error) {
    console.error('Rate ride error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 