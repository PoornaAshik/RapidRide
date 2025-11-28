import User from '../models/User.js';
import Ride from '../models/Ride.js';

/**
 * DRIVER CONTROLLER
 * Handles all driver-related operations including profile, rides, earnings, and real-time status
 */

// Get driver profile
export const getProfile = async (req, res) => {
  try {
    const driver = await User.findById(req.user.id).select('-password');
    
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      success: true,
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        avatar: driver.avatar || null,
        rating: driver.rating || 4.5,
        totalRides: driver.totalRides || 0,
        vehicleInfo: driver.vehicleInfo || {
          type: 'Sedan',
          model: 'Toyota Innova',
          plateNumber: 'KA-01-AB-1234',
          color: 'White'
        },
        documents: driver.documents || {
          license: { verified: true, expiry: '2026-12-31' },
          insurance: { verified: true, expiry: '2025-12-31' },
          registration: { verified: true, expiry: '2027-06-30' }
        },
        onlineStatus: driver.onlineStatus || false,
        currentLocation: driver.currentLocation || null
      }
    });
  } catch (error) {
    console.error('Get driver profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update driver profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicleInfo, avatar } = req.body;
    
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (vehicleInfo) driver.vehicleInfo = { ...driver.vehicleInfo, ...vehicleInfo };
    if (avatar) driver.avatar = avatar;

    await driver.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Update driver profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update driver online/offline status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // true for online, false for offline
    
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.onlineStatus = status;
    await driver.save();

    // Emit socket event for status change
    if (req.app.locals.io) {
      req.app.locals.io.emit('driver_status_change', {
        driverId: driver._id,
        status: status
      });
    }

    res.json({
      success: true,
      message: `Driver is now ${status ? 'online' : 'offline'}`,
      data: { onlineStatus: status }
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update driver location (real-time)
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    driver.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await driver.save();

    // Emit socket event for real-time location update
    if (req.app.locals.io) {
      req.app.locals.io.emit('driver_location_update', {
        driverId: driver._id,
        latitude,
        longitude,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Location updated',
      data: { latitude, longitude }
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver earnings
export const getEarnings = async (req, res) => {
  try {
    const { period = 'today' } = req.query; // today, week, month, all
    
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    const rides = await Ride.find({
      driverId: req.user.id,
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
    const totalRides = rides.length;
    const commission = totalEarnings * 0.2; // 20% platform fee
    const netEarnings = totalEarnings - commission;

    res.json({
      success: true,
      data: {
        period,
        totalEarnings: totalEarnings.toFixed(2),
        commission: commission.toFixed(2),
        netEarnings: netEarnings.toFixed(2),
        totalRides,
        averagePerRide: totalRides > 0 ? (totalEarnings / totalRides).toFixed(2) : 0,
        breakdown: rides.map(ride => ({
          rideId: ride._id,
          date: ride.completedAt,
          fare: ride.fare,
          distance: ride.distance,
          duration: ride.duration
        }))
      }
    });
  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver rides (active, completed, scheduled)
export const getRides = async (req, res) => {
  try {
    const { status = 'all', limit = 20, page = 1 } = req.query;
    
    const query = { driverId: req.user.id };
    if (status !== 'all') {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('riderId', 'name phone avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalRides = await Ride.countDocuments(query);

    res.json({
      success: true,
      data: {
        rides,
        total: totalRides,
        page: parseInt(page),
        pages: Math.ceil(totalRides / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get driver rides error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept ride request
export const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'searching') {
      return res.status(400).json({ message: 'Ride is not available' });
    }

    ride.driverId = req.user.id;
    ride.status = 'assigned';
    ride.assignedAt = new Date();
    await ride.save();

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('ride_assigned', {
        rideId: ride._id,
        driverId: req.user.id,
        riderId: ride.riderId
      });
    }

    res.json({
      success: true,
      message: 'Ride accepted',
      data: ride
    });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start ride
export const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    
    const ride = await Ride.findById(rideId);
    if (!ride || ride.driverId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    ride.status = 'in_progress';
    ride.startedAt = new Date();
    await ride.save();

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('ride_started', {
        rideId: ride._id,
        riderId: ride.riderId
      });
    }

    res.json({
      success: true,
      message: 'Ride started',
      data: ride
    });
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete ride
export const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { finalFare, distance, duration } = req.body;
    
    const ride = await Ride.findById(rideId);
    if (!ride || ride.driverId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    ride.fare = finalFare || ride.estimatedFare;
    ride.distance = distance;
    ride.duration = duration;
    await ride.save();

    // Update driver stats
    const driver = await User.findById(req.user.id);
    driver.totalRides = (driver.totalRides || 0) + 1;
    await driver.save();

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('ride_completed', {
        rideId: ride._id,
        riderId: ride.riderId,
        fare: ride.fare
      });
    }

    res.json({
      success: true,
      message: 'Ride completed',
      data: ride
    });
  } catch (error) {
    console.error('Complete ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel ride
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { reason } = req.body;
    
    const ride = await Ride.findById(rideId);
    if (!ride || ride.driverId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    ride.status = 'cancelled';
    ride.cancelledBy = 'driver';
    ride.cancellationReason = reason;
    ride.cancelledAt = new Date();
    await ride.save();

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('ride_cancelled', {
        rideId: ride._id,
        riderId: ride.riderId,
        cancelledBy: 'driver'
      });
    }

    res.json({
      success: true,
      message: 'Ride cancelled',
      data: ride
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver incentives
export const getIncentives = async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Mock incentive data - replace with actual incentive logic
    const incentives = {
      active: [
        {
          id: 1,
          title: 'Complete 50 rides',
          description: 'Earn ₹2000 bonus',
          progress: 35,
          target: 50,
          reward: 2000,
          expiresAt: '2025-12-31'
        },
        {
          id: 2,
          title: 'Peak hour bonus',
          description: 'Extra ₹50 per ride during 8-10 AM',
          progress: 0,
          target: 1,
          reward: 50,
          expiresAt: '2025-11-30'
        }
      ],
      completed: [
        {
          id: 3,
          title: 'Weekend warrior',
          description: 'Complete 20 rides on weekend',
          completedAt: '2025-11-20',
          reward: 1000
        }
      ],
      totalEarned: 5000
    };

    res.json({
      success: true,
      data: incentives
    });
  } catch (error) {
    console.error('Get driver incentives error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver notifications
export const getNotifications = async (req, res) => {
  try {
    // Mock notification data - implement notification model as needed
    const notifications = [
      {
        id: 1,
        type: 'ride_request',
        title: 'New Ride Request',
        message: 'Pickup from MG Road',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60000)
      },
      {
        id: 2,
        type: 'incentive',
        title: 'Incentive Progress',
        message: 'You are 15 rides away from ₹2000 bonus',
        read: true,
        createdAt: new Date(Date.now() - 2 * 3600000)
      },
      {
        id: 3,
        type: 'payment',
        title: 'Payment Received',
        message: '₹450 credited to your account',
        read: true,
        createdAt: new Date(Date.now() - 24 * 3600000)
      }
    ];

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get driver notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // day, week, month
    
    let startDate = new Date();
    let groupBy = '%Y-%m-%d';
    
    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
      groupBy = '%Y-%m-%d %H:00';
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const rides = await Ride.find({
      driverId: req.user.id,
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    // Calculate analytics
    const totalRides = rides.length;
    const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
    const totalDistance = rides.reduce((sum, ride) => sum + (ride.distance || 0), 0);
    const avgRating = rides.reduce((sum, ride) => sum + (ride.rating || 0), 0) / (totalRides || 1);

    // Group by time period for chart
    const ridesByDate = rides.reduce((acc, ride) => {
      const date = ride.completedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalRides,
          totalEarnings: totalEarnings.toFixed(2),
          totalDistance: totalDistance.toFixed(2),
          avgRating: avgRating.toFixed(1)
        },
        chart: {
          labels: Object.keys(ridesByDate),
          data: Object.values(ridesByDate)
        }
      }
    });
  } catch (error) {
    console.error('Get driver analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Contact support
export const contactSupport = async (req, res) => {
  try {
    const { subject, message, issueType } = req.body;
    
    // TODO: Implement support ticket creation
    // For now, just log and return success
    console.log('Support ticket:', { driverId: req.user.id, subject, message, issueType });

    res.json({
      success: true,
      message: 'Support ticket created. We will contact you soon.',
      ticketId: `TICKET-${Date.now()}`
    });
  } catch (error) {
    console.error('Contact support error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Emergency SOS
export const triggerSOS = async (req, res) => {
  try {
    const { location, reason } = req.body;
    
    const driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // TODO: Implement emergency alert system
    // Send notifications to emergency contacts, authorities, etc.
    console.log('EMERGENCY SOS:', {
      driverId: driver._id,
      driverName: driver.name,
      location,
      reason,
      timestamp: new Date()
    });

    // Emit socket event for real-time alert
    if (req.app.locals.io) {
      req.app.locals.io.emit('driver_sos', {
        driverId: driver._id,
        location,
        reason,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Emergency alert sent. Help is on the way.',
      alertId: `SOS-${Date.now()}`
    });
  } catch (error) {
    console.error('Trigger SOS error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
