const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Update profile validation
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('genderPreference').optional().isIn(['MALE', 'FEMALE']).withMessage('Invalid gender preference')
];

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicle: true,
        ratingsReceived: {
          select: {
            rating: true
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        gender: true,
        profileImage: true,
        dateOfBirth: true,
        address: true,
        genderPreference: true,
        createdAt: true,
        vehicle: true,
        ratingsReceived: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate average rating
    const ratings = user.ratingsReceived;
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    const userProfile = {
      ...user,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
      ratingsReceived: undefined // Remove the detailed ratings from response
    };

    res.json({ user: userProfile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      name,
      phone,
      gender,
      dateOfBirth,
      address,
      genderPreference
    } = req.body;

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (address !== undefined) updateData.address = address;
    if (genderPreference !== undefined) updateData.genderPreference = genderPreference;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        gender: true,
        profileImage: true,
        dateOfBirth: true,
        address: true,
        genderPreference: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's ride history
router.get('/rides', async (req, res) => {
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

    const total = await prisma.ride.count({ where });

    res.json({ 
      rides,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Total rides as rider
    const ridesAsRider = await prisma.ride.count({
      where: {
        riderId: userId,
        status: 'COMPLETED'
      }
    });

    // Total rides as driver (if applicable)
    const ridesAsDriver = await prisma.ride.count({
      where: {
        driverId: userId,
        status: 'COMPLETED'
      }
    });

    // Total spent (as rider)
    const totalSpent = await prisma.ride.aggregate({
      where: {
        riderId: userId,
        status: 'COMPLETED'
      },
      _sum: {
        actualPrice: true
      }
    });

    // Total earned (as driver)
    const totalEarned = await prisma.ride.aggregate({
      where: {
        driverId: userId,
        status: 'COMPLETED'
      },
      _sum: {
        actualPrice: true
      }
    });

    // Average rating received
    const ratings = await prisma.rideRating.findMany({
      where: {
        ratedUserId: userId
      },
      select: {
        rating: true
      }
    });

    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      ridesAsRider,
      ridesAsDriver,
      totalSpent: totalSpent._sum.actualPrice || 0,
      totalEarned: totalEarned._sum.actualPrice || 0,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.id;

    // Check for active rides
    const activeRides = await prisma.ride.findMany({
      where: {
        OR: [
          { riderId: userId },
          { driverId: userId }
        ],
        status: {
          in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'PICKED_UP', 'IN_PROGRESS']
        }
      }
    });

    if (activeRides.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with active rides. Please complete or cancel all active rides first.' 
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get preferences
router.get('/preferences', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        genderPreference: true,
        biometricEnabled: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ preferences: user });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update preferences
router.put('/preferences', async (req, res) => {
  try {
    const { genderPreference, biometricEnabled } = req.body;

    const updateData = {};
    if (genderPreference !== undefined) updateData.genderPreference = genderPreference;
    if (biometricEnabled !== undefined) updateData.biometricEnabled = biometricEnabled;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        genderPreference: true,
        biometricEnabled: true
      }
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences: user
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 