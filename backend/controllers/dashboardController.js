import Booking from '../models/Booking.js';
import FunctionHall from '../models/FunctionHall.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Report from '../models/Report.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const mockDbPath = path.resolve('mock_db.json');

const readMockDB = () => {
  if (!fs.existsSync(mockDbPath)) {
    return { users: [], bookings: [], payments: [] };
  }
  return JSON.parse(fs.readFileSync(mockDbPath, 'utf8'));
};

const writeMockDB = (data) => {
  fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2), 'utf8');
};

// @desc    Get Owner Dashboard Analytics
// @route   GET /api/dashboard/owner
// @access  Private (Owner/Admin)
export const getOwnerDashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const ownerBookings = mockDB.bookings;
      const totalBookings = ownerBookings.length;
      const totalRevenue = ownerBookings.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
      const pendingBookings = ownerBookings.filter(b => b.bookingStatus === 'Pending' || b.bookingStatus === 'Pending Approval');
      
      return res.status(200).json({
        success: true,
        data: {
          totalBookings,
          totalRevenue,
          pendingBookings,
          monthlyAnalytics: [
            { month: 'Jun', bookings: totalBookings, revenue: totalRevenue }
          ],
          popularHalls: [],
          popularEvents: [],
          recentReviews: []
        }
      });
    }

    // Get all halls of this owner
    const ownedHalls = await FunctionHall.find({ owner: req.user._id }).distinct('_id');

    // Total bookings for these halls
    const totalBookings = await Booking.countDocuments({ hall: { $in: ownedHalls } });

    // Pending bookings
    const pendingBookings = await Booking.find({
      hall: { $in: ownedHalls },
      bookingStatus: 'Pending Approval'
    }).populate('customer', 'name email phone').populate('hall', 'name');

    // Revenue calculation (total amount paid from successful payments for these bookings)
    const bookings = await Booking.find({ hall: { $in: ownedHalls } }).distinct('_id');
    const successfulPayments = await Payment.find({
      booking: { $in: bookings },
      status: 'Success'
    });
    const totalRevenue = successfulPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Monthly Analytics (grouped by month of eventDate)
    const monthlyStats = await Booking.aggregate([
      { $match: { hall: { $in: ownedHalls }, bookingStatus: { $nin: ['Rejected', 'Cancelled'] } } },
      {
        $group: {
          _id: { $month: '$eventDate' },
          bookingsCount: { $sum: 1 },
          revenue: { $sum: '$paidAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Mapping months to names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyData = monthlyStats.map(stat => ({
      month: months[stat._id - 1],
      bookings: stat.bookingsCount,
      revenue: stat.revenue
    }));

    // Popular halls based on booking count
    const popularHallsStats = await Booking.aggregate([
      { $match: { hall: { $in: ownedHalls }, bookingStatus: { $nin: ['Rejected', 'Cancelled'] } } },
      {
        $group: {
          _id: '$hall',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const popularHalls = await FunctionHall.populate(popularHallsStats, { path: '_id', select: 'name city basePrice photos' });

    // Popular event types
    const popularEvents = await Booking.aggregate([
      { $match: { hall: { $in: ownedHalls }, bookingStatus: { $nin: ['Rejected', 'Cancelled'] } } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent reviews
    const recentReviews = await Review.find({ hall: { $in: ownedHalls } })
      .populate('customer', 'name profilePicture')
      .populate('hall', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        pendingBookings,
        monthlyAnalytics: formattedMonthlyData,
        popularHalls: popularHalls.map(ph => ({ hall: ph._id, bookingCount: ph.count })),
        popularEvents: popularEvents.map(pe => ({ name: pe._id, count: pe.count })),
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const totalUsers = mockDB.users.filter(u => u.role === 'customer').length;
      const totalOwners = mockDB.users.filter(u => u.role === 'owner').length;
      const totalHalls = 4;
      const totalRevenue = mockDB.payments.reduce((acc, curr) => acc + curr.amount, 0);

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalOwners,
          totalHalls,
          totalRevenue,
          pendingHalls: [],
          pendingOwners: [],
          pendingReportsCount: 0,
          recentReports: [],
          revenueTrends: [
            { month: 'Jun', revenue: totalRevenue }
          ]
        }
      });
    }

    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalHalls = await FunctionHall.countDocuments();
    
    // Revenue calculations (all successful payments)
    const payments = await Payment.find({ status: 'Success' });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Pending listings
    const pendingHalls = await FunctionHall.find({ isApproved: false })
      .populate('owner', 'name email phone');

    // Pending owners verification
    const pendingOwners = await User.find({ role: 'owner', isVerified: false });

    // Complaints summary
    const pendingReportsCount = await Report.countDocuments({ status: 'Pending' });
    const recentReports = await Report.find({ status: 'Pending' })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly platform revenue trends
    const platformMonthlyRevenue = await Payment.aggregate([
      { $match: { status: 'Success' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrendsData = platformMonthlyRevenue.map(stat => ({
      month: months[stat._id - 1],
      revenue: stat.revenue
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOwners,
        totalHalls,
        totalRevenue,
        pendingHalls,
        pendingOwners,
        pendingReportsCount,
        recentReports,
        revenueTrends: revenueTrendsData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Verify owner account
// @route   PUT /api/dashboard/admin/verify-owner/:ownerId
// @access  Private (Admin only)
export const verifyOwner = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userIdx = mockDB.users.findIndex(u => u._id === req.params.ownerId);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'Owner user not found' });
      }
      mockDB.users[userIdx].isVerified = true;
      writeMockDB(mockDB);
      return res.status(200).json({
        success: true,
        message: `Owner verified successfully`,
        data: mockDB.users[userIdx]
      });
    }

    const owner = await User.findById(req.params.ownerId);

    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ success: false, message: 'Owner user not found' });
    }

    owner.isVerified = true;
    await owner.save();

    res.status(200).json({
      success: true,
      message: `Owner ${owner.name} verified successfully`,
      data: owner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve function hall listing
// @route   PUT /api/dashboard/admin/approve-hall/:hallId
// @access  Private (Admin only)
export const approveHall = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: `Hall listing approved successfully`
      });
    }

    const hall = await FunctionHall.findById(req.params.hallId);

    if (!hall) {
      return res.status(404).json({ success: false, message: 'Function hall not found' });
    }

    hall.isApproved = true;
    await hall.save();

    res.status(200).json({
      success: true,
      message: `Hall listing "${hall.name}" approved successfully`,
      data: hall
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban or suspend user/owner account
// @route   PUT /api/dashboard/admin/suspend-user/:userId
// @access  Private (Admin only)
export const suspendUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userIdx = mockDB.users.findIndex(u => u._id === req.params.userId);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      mockDB.users[userIdx].isVerified = !mockDB.users[userIdx].isVerified;
      writeMockDB(mockDB);
      return res.status(200).json({
        success: true,
        message: `User verification status toggled`,
        data: mockDB.users[userIdx]
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle verification status (acting as suspension toggle)
    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} verification status toggled to: ${user.isVerified}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
