import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Disable Mongoose command buffering so queries fail immediately if DB is offline
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookmyhall');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Warning: ${error.message}. Running backend in sandbox mode.`);
  }
};

export default connectDB;
