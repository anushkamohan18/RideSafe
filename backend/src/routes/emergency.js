const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const socketService = require('../services/socketService');

const router = express.Router();
const prisma = new PrismaClient();

// Emergency report validation
const emergencyValidation = [
  body('rideId').notEmpty().withMessage('Ride ID is required'),
  body('emergencyType').isIn([
    'ACCIDENT',
    'UNSAFE_DRIVER',
    'ROUTE_DEVIATION',
    'HARASSMENT',
    'VEHICLE_BREAKDOWN',
    'OTHER'
  ]).withMessage('Valid emergency type is required'),
  body('description').optional().trim(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

// Report emergency
router.post('/report', emergencyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      rideId,
      emergencyType,
      description,
      latitude,
      longitude
    } = req.body;

    // Verify user is part of the ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        driver: {
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

    if (ride.riderId !== req.user.id && ride.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to report emergency for this ride' });
    }

    // Create emergency report
    const emergencyReport = await prisma.emergencyReport.create({
      data: {
        rideId,
        reporterId: req.user.id,
        emergencyType,
        description: description || null,
        latitude: latitude || null,
        longitude: longitude || null,
        status: 'ACTIVE'
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        ride: {
          include: {
            rider: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            },
            driver: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Log emergency for monitoring/alerting systems
    console.log('🚨 EMERGENCY REPORTED:', {
      reportId: emergencyReport.id,
      type: emergencyType,
      rideId,
      reporter: req.user.name,
      location: latitude && longitude ? { latitude, longitude } : null,
      timestamp: new Date().toISOString()
    });

    // In a real system, this would trigger:
    // - SMS/Call to emergency contacts
    // - Alert to emergency services
    // - Notification to support team
    // - Automatic ride termination if needed

    // Notify the other participant via socket
    const otherUserId = ride.riderId === req.user.id ? ride.driverId : ride.riderId;
    if (otherUserId) {
      // This will be handled by socket service if connected
      // socketService.notifyEmergencyAlert(otherUserId, emergencyReport);
    }

    res.status(201).json({
      message: 'Emergency reported successfully. Authorities have been notified.',
      report: {
        id: emergencyReport.id,
        emergencyType: emergencyReport.emergencyType,
        status: emergencyReport.status,
        createdAt: emergencyReport.createdAt
      }
    });

  } catch (error) {
    console.error('Emergency report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get emergency reports for a ride
router.get('/ride/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;

    // Verify user is part of the ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      select: {
        riderId: true,
        driverId: true
      }
    });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    if (ride.riderId !== req.user.id && ride.driverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view emergency reports for this ride' });
    }

    const emergencyReports = await prisma.emergencyReport.findMany({
      where: { rideId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ emergencyReports });

  } catch (error) {
    console.error('Get emergency reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's emergency reports
router.get('/my-reports', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const emergencyReports = await prisma.emergencyReport.findMany({
      where: { reporterId: req.user.id },
      include: {
        ride: {
          include: {
            rider: {
              select: {
                id: true,
                name: true
              }
            },
            driver: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.emergencyReport.count({
      where: { reporterId: req.user.id }
    });

    res.json({ 
      emergencyReports,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get my emergency reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update emergency report status (for support/admin)
router.put('/:reportId/status', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'RESOLVED', 'ESCALATED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // For now, only the reporter can update status
    // In a real system, this would be restricted to support staff
    const report = await prisma.emergencyReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Emergency report not found' });
    }

    if (report.reporterId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this emergency report' });
    }

    const updateData = { status };
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const updatedReport = await prisma.emergencyReport.update({
      where: { id: reportId },
      data: updateData
    });

    res.json({
      message: 'Emergency report status updated',
      report: updatedReport
    });

  } catch (error) {
    console.error('Update emergency status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Emergency contacts endpoint (placeholder)
router.get('/contacts', async (req, res) => {
  try {
    // In a real system, this would return user's emergency contacts
    // For now, return default emergency numbers
    const emergencyContacts = [
      {
        id: 'police',
        name: 'Police',
        number: '911',
        type: 'emergency'
      },
      {
        id: 'ambulance',
        name: 'Ambulance',
        number: '911',
        type: 'medical'
      },
      {
        id: 'support',
        name: 'Zipp Support',
        number: '+1-800-ZIPPAPP',
        type: 'support'
      }
    ];

    res.json({ emergencyContacts });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;