import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import FunctionHall from '../models/FunctionHall.js';

// @desc    Create a review for a hall
// @route   POST /api/reviews
// @access  Private (Customer only)
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, hallId, rating, serviceRating, comment, photos, videos } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking belongs to this customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review bookings you made yourself.' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this event booking.' });
    }

    const review = await Review.create({
      customer: req.user._id,
      booking: bookingId,
      hall: hallId,
      rating,
      serviceRating,
      comment,
      photos,
      videos
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a function hall
// @route   GET /api/reviews/hall/:hallId
// @access  Public
export const getHallReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hall: req.params.hallId })
      .populate('customer', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
