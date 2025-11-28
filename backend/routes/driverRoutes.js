import express from 'express';
import * as driverController from '../controllers/driverController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All driver routes require authentication
router.use(authMiddleware);

// Driver Profile
router.get('/profile', driverController.getProfile);
router.put('/profile', driverController.updateProfile);

// Driver Status
router.post('/status', driverController.updateStatus);

// Driver Location
router.post('/location', driverController.updateLocation);

// Driver Earnings
router.get('/earnings', driverController.getEarnings);

// Rides Management
router.get('/rides', driverController.getRides);
router.post('/rides/:rideId/accept', driverController.acceptRide);
router.post('/rides/:rideId/start', driverController.startRide);
router.post('/rides/:rideId/complete', driverController.completeRide);
router.post('/rides/:rideId/cancel', driverController.cancelRide);

// Incentives
router.get('/incentives', driverController.getIncentives);

// Notifications
router.get('/notifications', driverController.getNotifications);

// Support
router.post('/support', driverController.contactSupport);

// Emergency SOS
router.post('/sos', driverController.triggerSOS);

// Analytics
router.get('/analytics', driverController.getAnalytics);

export default router;
