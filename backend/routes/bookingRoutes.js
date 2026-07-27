import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  getOwnerBookings,
  getBookingById,
  approveRejectBooking,
  updateTimelineStatus,
  initiatePaymentOrder,
  verifyPayment,
  cancelBooking,
  confirmPaymentAndBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.post('/confirm', confirmPaymentAndBooking);
router.get('/customer/my-bookings', getCustomerBookings);
router.get('/owner/my-bookings', getOwnerBookings);

router.post('/verify-payment', verifyPayment);

router.route('/:id')
  .get(getBookingById);

router.put('/:id/approve', approveRejectBooking);
router.put('/:id/status', updateTimelineStatus);
router.put('/:id/cancel', cancelBooking);
router.post('/:id/payment-order', initiatePaymentOrder);

export default router;
