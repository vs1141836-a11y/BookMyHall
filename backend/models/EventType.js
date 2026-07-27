import mongoose from 'mongoose';

const defaultServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  defaultPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  isOptional: {
    type: Boolean,
    default: true,
  },
  isCustomizable: {
    type: Boolean,
    default: true,
  }
});

const eventTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add event name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'gift', // default font-awesome or simple icon tag
    },
    defaultServices: [defaultServiceSchema],
    isCustom: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const EventType = mongoose.model('EventType', eventTypeSchema);
export default EventType;
