import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import hallRoutes from './routes/hallRoutes.js';
import eventTypeRoutes from './routes/eventTypeRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: '*', // In production, replace with specific frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static assets (invoices and local uploads)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/invoices', express.static(path.join(__dirname, 'public/invoices')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Root API status
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'BookMyHall API Server is running!' });
});

// Test API status
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BookMyHall API is online and healthy!' });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
