import mongoose from 'mongoose';

const selectedServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // Catering, Decor, Photography, DJ, etc.
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  }
});

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: '',
  }
});

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FunctionHall',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    selectedServices: [selectedServiceSchema],
    baseHallPrice: {
      type: Number,
      required: true,
    },
    servicesTotalPrice: {
      type: Number,
      required: true,
    },
    grandTotalPrice: {
      type: Number,
      required: true,
    },
    advanceAmount: {
      type: Number,
      required: true, // Typically 30% of grandTotalPrice
    },
    balanceAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Fully Paid'],
      default: 'Pending',
    },
    bookingStatus: {
      type: String,
      enum: [
        'Pending Approval',
        'Approved',
        'Rejected',
        'Advance Paid',
        'Decoration Started',
        'Catering Confirmed',
        'Photography Confirmed',
        'Event Ready',
        'Event Completed',
        'Cancelled'
      ],
      default: 'Pending Approval',
    },
    timeline: [timelineEventSchema],
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double bookings under concurrent requests
bookingSchema.index(
  { hall: 1, eventDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: { $in: ['Pending Approval', 'Approved', 'Advance Paid', 'Decoration Started', 'Catering Confirmed', 'Photography Confirmed', 'Event Ready', 'Event Completed'] }
    }
  }
);

// Auto initialize booking timeline events before saving new booking
bookingSchema.pre('save', function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: 'Pending Approval',
      description: 'Your booking request has been submitted and is awaiting owner approval.'
    });
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
