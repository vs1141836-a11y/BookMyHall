import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    halls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FunctionHall',
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
