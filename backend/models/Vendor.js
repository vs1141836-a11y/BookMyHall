import mongoose from 'mongoose';

const vendorPackageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    required: true, // e.g. Bronze, Silver, Gold, Platinum, Custom
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  services: {
    type: [String],
    default: [], // e.g. ["2 Photographers", "1 Videographer", "Standard Album"]
  }
});

const vendorSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add vendor name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add vendor category'], // Decorators, Caterers, Photographers, etc.
      trim: true,
      index: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Please add contact phone number'],
    },
    pricing: {
      type: String,
      default: '', // e.g., "₹500/plate" or "Fixed ₹50,000"
    },
    description: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    packages: [vendorPackageSchema]
  },
  {
    timestamps: true,
  }
);

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
