import mongoose from 'mongoose';
import FunctionHall from './FunctionHall.js';

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // Only one review per booking
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FunctionHall',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
    },
    photos: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (hallId) {
  const obj = await this.aggregate([
    {
      $match: { hall: hallId }
    },
    {
      $group: {
        _id: '$hall',
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await FunctionHall.findByIdAndUpdate(hallId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewsCount: obj[0].reviewsCount
      });
    } else {
      await FunctionHall.findByIdAndUpdate(hallId, {
        rating: 0,
        reviewsCount: 0
      });
    }
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.hall);
});

// Call getAverageRating before remove
reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.hall);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
