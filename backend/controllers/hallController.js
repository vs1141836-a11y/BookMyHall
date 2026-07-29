import FunctionHall from '../models/FunctionHall.js';
import Booking from '../models/Booking.js';
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

const FALLBACK_HALLS = [
  {
    _id: 'fb_hall_1',
    name: 'Grand Palace Convention Center',
    panoramaUrl: '/hall_panorama.jpg',
    description: 'Experience majestic grandeur at our flagship luxury palace convention center. Suitable for ultra-premium weddings, cultural events, and high-profile exhibitions.',
    address: 'Palace Grounds, Gate 4, Sadashivanagar',
    city: 'Bangalore',
    area: 'Palace Grounds',
    coordinates: { lat: 13.0035, lng: 77.5891 },
    capacity: 1500,
    diningCapacity: 800,
    parkingCapacity: 400,
    isAC: true,
    roomsCount: 12,
    amenities: ['Central Air Conditioning', 'Valet Parking', 'Bridal Suites'],
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'
    ],
    basePrice: 150000,
    rating: 4.8
  },
  {
    _id: 'fb_hall_2',
    name: 'Tulip Celebration Banquet',
    panoramaUrl: '/hall_panorama.jpg',
    description: 'A cozy yet fully-equipped elegant banquet hall, perfect for corporate meetings, birthday celebrations, baby showers, naming ceremonies, and family functions.',
    address: '80 Feet Road, HAL Stage 2',
    city: 'Bangalore',
    area: 'Indiranagar',
    coordinates: { lat: 12.9649, lng: 77.6394 },
    capacity: 350,
    diningCapacity: 150,
    parkingCapacity: 50,
    isAC: true,
    roomsCount: 3,
    amenities: ['Air Conditioning', 'DJ Sound Setup System', 'Stage Lights'],
    photos: [
      'https://images.unsplash.com/photo-1505232458627-a7272664a040?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1520854221256-17451cc3595a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200'
    ],
    basePrice: 45000,
    rating: 4.5
  },
  {
    _id: 'fb_hall_3',
    name: 'Royal Heritage Gardens',
    description: 'Breathtaking open-air lawn and high-capacity luxury glass mansion. Ideal for grand outdoor reception nights, cocktail parties, and traditional style events.',
    address: 'Kanankapura Main Road, South Bangalore',
    city: 'Bangalore',
    area: 'Kanakapura Road',
    coordinates: { lat: 12.8752, lng: 77.5453 },
    capacity: 2500,
    diningCapacity: 1200,
    parkingCapacity: 600,
    isAC: false,
    roomsCount: 15,
    amenities: ['Open lawn garden area', 'Eco-friendly backdrop setup', 'Valet Parking Lot'],
    photos: [
      'https://images.unsplash.com/photo-1507504038482-762ef9524197?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=1200'
    ],
    basePrice: 220000,
    rating: 4.9
  },
  {
    _id: 'fb_hall_4',
    name: 'Sapphire AC Hall',
    description: 'A modern state-of-the-art centrally air-conditioned function venue with stunning modular lighting, sound reinforcement, and an in-house catering prep kitchen.',
    address: 'Near Outer Ring Road, Hebbal',
    city: 'Bangalore',
    area: 'Hebbal',
    coordinates: { lat: 13.0358, lng: 77.5978 },
    capacity: 600,
    diningCapacity: 300,
    parkingCapacity: 120,
    isAC: true,
    roomsCount: 6,
    amenities: ['Central Air Conditioning', 'Modern LED Panel Wall', 'Passenger Lift Elevators'],
    photos: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1531058020387-3be344559767?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1561501900-3701fa9a0c55?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200'
    ],
    basePrice: 85000,
    rating: 4.6
  }
];

// @desc    Get all halls with search and filters
// @route   GET /api/halls
// @access  Public
export const getHalls = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let halls = [...FALLBACK_HALLS];
      if (req.query.city) {
        halls = halls.filter(h => h.city.toLowerCase().includes(req.query.city.toLowerCase()));
      }
      if (req.query.area) {
        halls = halls.filter(h => h.area.toLowerCase().includes(req.query.area.toLowerCase()));
      }
      if (req.query.minPrice) {
        halls = halls.filter(h => h.basePrice >= Number(req.query.minPrice));
      }
      if (req.query.maxPrice) {
        halls = halls.filter(h => h.basePrice <= Number(req.query.maxPrice));
      }
      if (req.query.capacity) {
        halls = halls.filter(h => h.capacity >= Number(req.query.capacity));
      }
      if (req.query.isAC !== undefined) {
        halls = halls.filter(h => h.isAC === (req.query.isAC === 'true'));
      }
      return res.status(200).json({
        success: true,
        count: halls.length,
        data: halls,
        isNearbySuggestions: false,
        searchedLocation: req.query.city || ''
      });
    }

    const querySpec = { isApproved: true, isDeleted: false };

    // Search filters
    if (req.query.city) {
      querySpec.city = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.area) {
      querySpec.area = { $regex: req.query.area, $options: 'i' };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      querySpec.basePrice = {};
      if (req.query.minPrice) {
        querySpec.basePrice.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        querySpec.basePrice.$lte = Number(req.query.maxPrice);
      }
    }

    if (req.query.capacity) {
      querySpec.capacity = { $gte: Number(req.query.capacity) };
    }

    if (req.query.rating) {
      querySpec.rating = { $gte: Number(req.query.rating) };
    }

    if (req.query.isAC !== undefined) {
      querySpec.isAC = req.query.isAC === 'true';
    }

    if (req.query.hasParking === 'true') {
      querySpec.parkingCapacity = { $gt: 0 };
    }

    if (req.query.roomsCount) {
      querySpec.roomsCount = { $gte: Number(req.query.roomsCount) };
    }

    // Availability Date Filter
    if (req.query.availabilityDate) {
      const targetDate = new Date(req.query.availabilityDate);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const bookedHalls = await Booking.find({
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        bookingStatus: { $nin: ['Rejected', 'Cancelled'] }
      }).distinct('hall');

      querySpec._id = { $nin: bookedHalls };
    }

    let halls = await FunctionHall.find(querySpec).populate('owner', 'name email phone');
    let isNearbySuggestions = false;

    // If 0 halls are found in the selected location, fetch nearby cities
    if (halls.length === 0 && req.query.city) {
      isNearbySuggestions = true;
      const searchedCity = req.query.city.trim().toLowerCase();
      
      const CITY_COORDINATES = {
        bangalore: { lat: 12.9716, lng: 77.5946 },
        bengaluru: { lat: 12.9716, lng: 77.5946 },
        mumbai: { lat: 19.0760, lng: 72.8777 },
        bombay: { lat: 19.0760, lng: 72.8777 },
        chennai: { lat: 13.0827, lng: 80.2707 },
        madras: { lat: 13.0827, lng: 80.2707 },
        delhi: { lat: 28.6139, lng: 77.2090 },
        hyderabad: { lat: 17.3850, lng: 78.4867 },
        kolkata: { lat: 22.5726, lng: 88.3639 },
        pune: { lat: 18.5204, lng: 73.8567 },
        ahmedabad: { lat: 23.0225, lng: 72.5714 },
        jaipur: { lat: 26.9124, lng: 75.7873 },
        lucknow: { lat: 26.8467, lng: 80.9462 },
        goa: { lat: 15.2993, lng: 74.1240 },
        kochi: { lat: 9.9312, lng: 76.2673 }
      };

      const refCoords = CITY_COORDINATES[searchedCity] || { lat: 12.9716, lng: 77.5946 };

      const fallbackQuery = { isApproved: true, isDeleted: false };
      if (req.query.minPrice || req.query.maxPrice) {
        fallbackQuery.basePrice = querySpec.basePrice;
      }
      if (req.query.capacity) {
        fallbackQuery.capacity = querySpec.capacity;
      }
      if (req.query.isAC !== undefined) {
        fallbackQuery.isAC = querySpec.isAC;
      }

      const allHalls = await FunctionHall.find(fallbackQuery).populate('owner', 'name email phone');

      const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const hallsWithDistances = allHalls.map(hall => {
        const hObj = hall.toObject();
        const lat = hall.coordinates?.lat || 12.9716;
        const lng = hall.coordinates?.lng || 77.5946;
        const distance = getDistance(refCoords.lat, refCoords.lng, lat, lng);
        hObj.distance = Number(distance.toFixed(1));
        
        const minutes = Math.round((distance / 50) * 60);
        if (minutes < 60) {
          hObj.travelTime = `${minutes} mins`;
        } else {
          const hrs = Math.floor(minutes / 60);
          const mins = minutes % 60;
          hObj.travelTime = mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hrs`;
        }
        return hObj;
      });

      hallsWithDistances.sort((a, b) => a.distance - b.distance);
      halls = hallsWithDistances;
    }

    res.status(200).json({
      success: true,
      count: halls.length,
      data: halls,
      isNearbySuggestions,
      searchedLocation: req.query.city || ''
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hall details
// @route   GET /api/halls/:id
// @access  Public
export const getHallById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const hall = FALLBACK_HALLS.find(h => h._id === req.params.id);
      if (!hall) {
        return res.status(404).json({ success: false, message: 'Function hall not found' });
      }
      const mockDB = readMockDB();
      const bookings = mockDB.bookings.filter(b => b.hall === hall._id && b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Rejected');
      const bookedDates = bookings.map(b => b.eventDate);
      return res.status(200).json({
        success: true,
        data: hall,
        bookedDates
      });
    }

    const hall = await FunctionHall.findById(req.params.id).populate('owner', 'name email phone profilePicture');

    if (!hall || hall.isDeleted) {
      return res.status(404).json({ success: false, message: 'Function hall not found' });
    }

    const bookings = await Booking.find({
      hall: hall._id,
      bookingStatus: { $nin: ['Rejected', 'Cancelled'] },
      eventDate: { $gte: new Date() }
    }).select('eventDate bookingStatus');

    const bookedDates = bookings.map(b => b.eventDate.toISOString().split('T')[0]);

    res.status(200).json({
      success: true,
      data: hall,
      bookedDates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new function hall
// @route   POST /api/halls
// @access  Private (Owner/Admin)
export const createHall = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        data: req.body,
        message: 'Hall listing created successfully! It is pending approval by the Admin.'
      });
    }

    if (req.user.role === 'owner' && !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending verification. You cannot list function halls yet.',
      });
    }

    req.body.owner = req.user._id;

    if (req.user.role === 'admin') {
      req.body.isApproved = true;
    } else {
      req.body.isApproved = false;
    }

    const hall = await FunctionHall.create(req.body);

    res.status(201).json({
      success: true,
      data: hall,
      message: 'Hall listing created successfully! It is pending approval by the Admin.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update function hall details
// @route   PUT /api/halls/:id
// @access  Private (Owner/Admin)
export const updateHall = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: req.body
      });
    }

    let hall = await FunctionHall.findById(req.params.id);

    if (!hall || hall.isDeleted) {
      return res.status(404).json({ success: false, message: 'Function hall not found' });
    }

    if (hall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this hall listing',
      });
    }

    hall = await FunctionHall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: hall,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete function hall
// @route   DELETE /api/halls/:id
// @access  Private (Owner/Admin)
export const deleteHall = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Function hall deleted successfully'
      });
    }

    const hall = await FunctionHall.findById(req.params.id);

    if (!hall || hall.isDeleted) {
      return res.status(404).json({ success: false, message: 'Function hall not found' });
    }

    if (hall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this hall listing',
      });
    }

    hall.isDeleted = true;
    await hall.save();

    res.status(200).json({
      success: true,
      message: 'Function hall deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's halls
// @route   GET /api/halls/owner/my-halls
// @access  Private (Owner only)
export const getOwnerHalls = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: FALLBACK_HALLS.length,
        data: FALLBACK_HALLS
      });
    }

    const halls = await FunctionHall.find({ owner: req.user._id });

    res.status(200).json({
      success: true,
      count: halls.length,
      data: halls,
    });
  } catch (error) {
    next(error);
  }
};
