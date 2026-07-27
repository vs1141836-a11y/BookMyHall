import mongoose from 'mongoose';

const functionHallSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a hall name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
      index: true,
    },
    area: {
      type: String,
      required: [true, 'Please add an area'],
      trim: true,
      index: true,
    },
    coordinates: {
      lat: { type: Number, default: 12.9716 }, // Default Bangalore lat
      lng: { type: Number, default: 77.5946 }  // Default Bangalore lng
    },
    capacity: {
      type: Number,
      required: [true, 'Please add seating capacity'],
    },
    diningCapacity: {
      type: Number,
      required: [true, 'Please add dining capacity'],
    },
    parkingCapacity: {
      type: Number,
      default: 0,
    },
    isAC: {
      type: Boolean,
      default: false,
    },
    roomsCount: {
      type: Number,
      default: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [],
    },
    cancellationPolicy: {
      type: String,
      required: [true, 'Please add a cancellation policy'],
    },
    photos: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    virtualTour360Url: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price per day'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5'],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-find hook to exclude soft-deleted halls
functionHallSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const FunctionHall = mongoose.model('FunctionHall', functionHallSchema);
export default FunctionHall;
