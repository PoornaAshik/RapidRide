import Ride from "../models/Ride.js";
import User from "../models/User.js";

// Get rider profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Request a new ride
export const requestRide = async (req, res) => {
  try {
    const { pickup, drop, rideType } = req.body;
    if (!pickup || !drop) return res.status(400).json({ success: false, message: 'pickup and drop required' });

    const ride = await Ride.create({
      rider: req.user.userId,
      pickupLocation: { address: pickup },
      dropoffLocation: { address: drop },
      type: rideType || 'economy',
      status: 'searching'
    });

    return res.status(201).json({ success: true, ride });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCurrentRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({ rider: req.user.userId, status: { $nin: ['completed', 'cancelled'] } }).sort({ createdAt: -1 }).populate('driver', 'name');
    return res.json({ success: true, ride });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRideDetails = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver', 'name');
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (String(ride.rider) !== req.user.userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    return res.json({ success: true, ride });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (String(ride.rider) !== req.user.userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    if (['completed','cancelled'].includes(ride.status)) return res.status(400).json({ success: false, message: 'Cannot cancel' });

    ride.status = 'cancelled';
    await ride.save();

    return res.json({ success: true, ride });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRideHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await Ride.find({ rider: req.user.userId, status: { $in: ['completed','cancelled'] } }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Ride.countDocuments({ rider: req.user.userId, status: { $in: ['completed','cancelled'] } });

    return res.json({ success: true, items, total, page });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const estimateFare = async (req, res) => {
  try {
    const { pickup, drop, rideType } = req.body;
    // Simple stub: fare based on rideType
    const base = { economy: 120, comfort: 180, premium: 250, shared: 80 };
    const fareMin = base[rideType] || 120;
    const fareMax = Math.round(fareMin * 1.25);
    return res.json({ success: true, estimate: `${fareMin} - ${fareMax}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const scheduleRide = async (req, res) => {
  try {
    const { pickup, drop, rideType, scheduledAt } = req.body;
    if (!pickup || !drop || !scheduledAt) return res.status(400).json({ success: false, message: 'Missing fields' });

    const ride = await Ride.create({
      rider: req.user.userId,
      pickupLocation: { address: pickup },
      dropoffLocation: { address: drop },
      type: rideType || 'economy',
      scheduledAt: new Date(scheduledAt),
      status: 'searching'
    });

    return res.status(201).json({ success: true, ride });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getScheduledRides = async (req, res) => {
  try {
    const rides = await Ride.find({ rider: req.user.userId, scheduledAt: { $ne: null } }).sort({ scheduledAt: 1 });
    return res.json({ success: true, rides });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Rewards / coupons (stubs)
export const getRewardPoints = async (req, res) => {
  return res.json({ success: true, points: 850, coupons: [] });
};

export const applyCoupon = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'No code' });
  return res.json({ success: true, applied: true, code });
};

// Notifications (stubs)
export const getNotifications = async (req, res) => {
  return res.json({ success: true, notifications: [] });
};

export const markNotificationRead = async (req, res) => {
  return res.json({ success: true });
};

// Support
export const submitSupportRequest = async (req, res) => {
  const ticketId = 'TICKET-' + Date.now();
  return res.status(201).json({ success: true, ticketId });
};

// Emergency
export const triggerSOS = async (req, res) => {
  console.log('SOS from', req.user.userId, req.body);
  return res.json({ success: true, sos: true });
};

// Analytics
export const getRideAnalytics = async (req, res) => {
  try {
    // sample series for last 7 days
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const rides = [12,19,8,15,22,10,18];
    const totalRides = rides.reduce((a,b)=>a+b,0);
    return res.json({ success: true, totalRides, series: { labels, rides } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Invoice stub
export const getInvoice = async (req, res) => {
  // For simplicity return JSON; frontend can adapt to blob if needed
  return res.json({ success: true, invoiceUrl: `/invoices/${req.params.id}.pdf` });
};
