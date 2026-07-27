import Wishlist from '../models/Wishlist.js';
import FunctionHall from '../models/FunctionHall.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const mockDbPath = path.resolve('mock_db.json');

const readMockDB = () => {
  if (!fs.existsSync(mockDbPath)) {
    return { users: [], bookings: [], payments: [], wishlist: [] };
  }
  const db = JSON.parse(fs.readFileSync(mockDbPath, 'utf8'));
  db.wishlist = db.wishlist || [];
  return db;
};

const writeMockDB = (data) => {
  fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2), 'utf8');
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userWishlist = mockDB.wishlist.find(w => w.customer === req.user._id);
      
      const FALLBACK_HALLS = [
        { _id: 'fb_hall_1', name: 'Grand Palace Convention Center', city: 'Bangalore', area: 'Palace Grounds', basePrice: 150000, capacity: 1500, diningCapacity: 800, parkingCapacity: 400, isAC: true, roomsCount: 12, rating: 4.8, photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'] },
        { _id: 'fb_hall_2', name: 'Tulip Celebration Banquet', city: 'Bangalore', area: 'Indiranagar', basePrice: 45000, capacity: 350, diningCapacity: 150, parkingCapacity: 30, isAC: true, roomsCount: 4, rating: 4.5, photos: ['https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600'] }
      ];

      const hallsList = userWishlist ? FALLBACK_HALLS.filter(h => userWishlist.halls.includes(h._id)) : [];
      return res.status(200).json({
        success: true,
        data: hallsList
      });
    }

    let wishlist = await Wishlist.findOne({ customer: req.user._id }).populate({
      path: 'halls',
      populate: { path: 'owner', select: 'name email phone' }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ customer: req.user._id, halls: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist.halls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle hall in wishlist (Add/Remove)
// @route   POST /api/wishlist/toggle/:hallId
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { hallId } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      let userWishIdx = mockDB.wishlist.findIndex(w => w.customer === req.user._id);
      if (userWishIdx === -1) {
        mockDB.wishlist.push({ customer: req.user._id, halls: [] });
        userWishIdx = mockDB.wishlist.length - 1;
      }

      const index = mockDB.wishlist[userWishIdx].halls.indexOf(hallId);
      let message = '';
      if (index === -1) {
        mockDB.wishlist[userWishIdx].halls.push(hallId);
        message = 'Hall added to wishlist';
      } else {
        mockDB.wishlist[userWishIdx].halls.splice(index, 1);
        message = 'Hall removed from wishlist';
      }
      writeMockDB(mockDB);
      return res.status(200).json({
        success: true,
        message,
        data: mockDB.wishlist[userWishIdx].halls
      });
    }
    
    // Check if hall exists
    const hall = await FunctionHall.findById(hallId);
    if (!hall) {
      return res.status(404).json({ success: false, message: 'Hall not found' });
    }

    let wishlist = await Wishlist.findOne({ customer: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ customer: req.user._id, halls: [] });
    }

    const index = wishlist.halls.indexOf(hallId);
    let message = '';
    
    if (index === -1) {
      wishlist.halls.push(hallId);
      message = 'Hall added to wishlist';
    } else {
      wishlist.halls.splice(index, 1);
      message = 'Hall removed from wishlist';
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message,
      data: wishlist.halls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare halls side by side (Supports up to 3 halls)
// @route   GET /api/wishlist/compare
// @access  Public
export const compareHalls = async (req, res, next) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide hall ids to compare' });
    }

    if (ids.length > 3) {
      return res.status(400).json({ success: false, message: 'You can compare at most 3 halls at a time' });
    }

    if (mongoose.connection.readyState !== 1) {
      const FALLBACK_HALLS = [
        { _id: 'fb_hall_1', name: 'Grand Palace Convention Center', city: 'Bangalore', area: 'Palace Grounds', basePrice: 150000, capacity: 1500, diningCapacity: 800, parkingCapacity: 400, isAC: true, roomsCount: 12, rating: 4.8, photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'], amenities: ['Central AC', 'Valet Parking', 'Bridal Suites'], address: 'Palace Grounds, Gate 4' },
        { _id: 'fb_hall_2', name: 'Tulip Celebration Banquet', city: 'Bangalore', area: 'Indiranagar', basePrice: 45000, capacity: 350, diningCapacity: 150, parkingCapacity: 30, isAC: true, roomsCount: 4, rating: 4.5, photos: ['https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600'], amenities: ['Air Conditioning', 'DJ Sound Setup System'], address: '80 Feet Road, HAL Stage 2' }
      ];
      const halls = FALLBACK_HALLS.filter(h => ids.includes(h._id));
      return res.status(200).json({
        success: true,
        data: halls
      });
    }

    const halls = await FunctionHall.find({ _id: { $in: ids } }).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      data: halls
    });
  } catch (error) {
    next(error);
  }
};
