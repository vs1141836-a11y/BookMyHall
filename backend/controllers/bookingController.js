import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import FunctionHall from '../models/FunctionHall.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateInvoicePDF } from '../utils/generateInvoice.js';
import sendEmail from '../utils/sendEmail.js';
import fs from 'fs';
import path from 'path';

const MOCK_DB_PATH = path.resolve('mock_db.json');

const readMockDB = () => {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
      data.bookings = data.bookings || [];
      data.payments = data.payments || [];
      data.users = data.users || [];
      return data;
    }
  } catch (err) {
    console.error('Error reading mock DB:', err);
  }
  return { users: [], bookings: [], payments: [] };
};

const writeMockDB = (data) => {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing mock DB:', err);
  }
};

// Setup Razorpay
const rzpKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_12345';
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret_12345';
const isMockRazorpay = rzpKeyId.startsWith('rzp_test_mock_');

let razorpayInstance;
if (!isMockRazorpay) {
  try {
    razorpayInstance = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret,
    });
  } catch (error) {
    console.error('Razorpay initialization failed, falling back to mock.', error);
  }
}

// Helper to send real-time notification in DB
const createNotify = async (userId, title, message, type = 'System') => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type
    });
  } catch (err) {
    console.error('Notification create error:', err);
  }
};

// @desc    Create a pending booking request
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res, next) => {
  try {
    const { hallId, eventType, eventDate, selectedServices } = req.body;

    // Sandbox bypass if database is disconnected/offline
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Sandbox Mode] Creating booking request offline`);
      return res.status(201).json({
        success: true,
        data: {
          _id: `sandbox_booking_${Date.now()}`,
          customer: req.user?._id || 'sandbox_user_id',
          hall: hallId,
          eventType: eventType || 'Custom Event',
          eventDate: eventDate || new Date().toISOString(),
          selectedServices: selectedServices || [],
          baseHallPrice: 85000,
          servicesTotalPrice: 20000,
          grandTotalPrice: 110000,
          advanceAmount: 33000,
          balanceAmount: 77000,
          bookingStatus: 'Approved',
          timeline: [
            { status: 'Approved', description: 'Your offline sandbox booking was automatically pre-approved for local testing.' }
          ]
        }
      });
    }

    const hall = await FunctionHall.findById(hallId);
    if (!hall || hall.isDeleted) {
      return res.status(404).json({ success: false, message: 'Venue function hall not found' });
    }

    // 1. Double Booking Check (Double scheduling prevention)
    const targetDate = new Date(eventDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      hall: hallId,
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $nin: ['Rejected', 'Cancelled'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This venue is already booked for the selected date. Please choose another date.'
      });
    }

    // 2. Cost calculations
    const baseHallPrice = hall.basePrice;
    let servicesTotalPrice = 0;
    
    selectedServices.forEach(service => {
      servicesTotalPrice += Number(service.price) * Number(service.quantity || 1);
    });

    const subtotal = baseHallPrice + servicesTotalPrice + 10000; // Include ₹10,000 extra charges
    const gst = Math.round(subtotal * 0.18); // 18% GST
    const grandTotalPrice = subtotal + gst;
    const advanceAmount = Math.round(grandTotalPrice * 0.3); // 30% advance
    const balanceAmount = grandTotalPrice - advanceAmount;

    // 3. Create Booking
    const booking = await Booking.create({
      customer: req.user._id,
      hall: hallId,
      eventType,
      eventDate: startOfDay,
      selectedServices,
      baseHallPrice,
      servicesTotalPrice,
      grandTotalPrice,
      advanceAmount,
      balanceAmount
    });

    // Notify the owner
    await createNotify(
      hall.owner,
      'New Booking Request Received',
      `You have received a new booking request for your hall "${hall.name}" for ${targetDate.toLocaleDateString()}.`,
      'Booking'
    );

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer's bookings
// @route   GET /api/bookings/customer/my-bookings
// @access  Private (Customer)
export const getCustomerBookings = async (req, res, next) => {
  try {
    // Sandbox bypass if database is disconnected/offline
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userId = req.user?._id || 'sandbox_user_id';
      const myBookings = mockDB.bookings.filter(b => b.customer === userId);
      
      const populated = myBookings.map(b => {
        const mockHall = mockDB.halls?.find(h => h._id === b.hall) || {
          _id: b.hall,
          name: 'Grand Palace Convention Center',
          city: 'Bangalore',
          area: 'Palace Grounds',
          photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
          basePrice: 150000
        };
        return { ...b, hall: mockHall };
      });

      return res.status(200).json({
        success: true,
        count: populated.length,
        data: populated
      });
    }

    const bookings = await Booking.find({ customer: req.user._id })
      .populate('hall', 'name city area photos basePrice')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's bookings
// @route   GET /api/bookings/owner/my-bookings
// @access  Private (Owner/Admin)
export const getOwnerBookings = async (req, res, next) => {
  try {
    // Find all halls owned by this owner
    const ownedHalls = await FunctionHall.find({ owner: req.user._id }).distinct('_id');

    const bookings = await Booking.find({ hall: { $in: ownedHalls } })
      .populate('hall', 'name city area basePrice')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const booking = mockDB.bookings.find(b => b._id === req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const mockHall = mockDB.halls?.find(h => h._id === booking.hall) || {
        _id: booking.hall,
        name: 'Grand Palace Convention Center',
        city: 'Bangalore',
        area: 'Palace Grounds',
        photos: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600'],
        basePrice: 150000
      };

      const mockCustomer = mockDB.users?.find(u => u._id === booking.customer) || {
        _id: booking.customer,
        name: 'Demo Customer',
        email: 'customer@example.com',
        phone: '9876543210'
      };

      const mockPayments = mockDB.payments?.filter(p => p.booking === booking._id) || [];

      const populatedBooking = {
        ...booking,
        hall: mockHall,
        customer: mockCustomer,
        payments: mockPayments
      };

      return res.status(200).json({
        success: true,
        data: populatedBooking
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('hall')
      .populate('customer', 'name email phone')
      .populate('payments');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check (Customer of booking, Owner of hall, or Admin)
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isOwner = booking.hall.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject booking
// @route   PUT /api/bookings/:id/approve
// @access  Private (Owner/Admin)
export const approveRejectBooking = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const bookingIdx = mockDB.bookings.findIndex(b => b._id === req.params.id);
      if (bookingIdx === -1) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const booking = mockDB.bookings[bookingIdx];
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      const desc = action === 'approve' 
        ? 'Booking request has been approved by the venue owner.'
        : 'Booking request has been rejected by the venue owner.';

      booking.bookingStatus = newStatus;
      booking.timeline = booking.timeline || [];
      booking.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        description: desc
      });

      mockDB.bookings[bookingIdx] = booking;
      writeMockDB(mockDB);

      return res.status(200).json({
        success: true,
        data: booking
      });
    }

    const booking = await Booking.findById(req.params.id).populate('hall');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.hall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    if (action === 'approve') {
      booking.bookingStatus = 'Approved';
      booking.timeline.push({
        status: 'Approved',
        description: 'Booking request has been approved by the venue owner. Please pay the advance to confirm scheduling.'
      });
      await createNotify(
        booking.customer,
        'Booking Request Approved!',
        `Your booking request for "${booking.hall.name}" has been approved. Please pay the advance amount.`,
        'Booking'
      );
    } else if (action === 'reject') {
      booking.bookingStatus = 'Rejected';
      booking.timeline.push({
        status: 'Rejected',
        description: 'Booking request has been rejected by the venue owner.'
      });
      await createNotify(
        booking.customer,
        'Booking Request Rejected',
        `Your booking request for "${booking.hall.name}" was declined.`,
        'Booking'
      );
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be approve or reject.' });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update timeline status (Decoration, Catering, Photography, Completion)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
export const updateTimelineStatus = async (req, res, next) => {
  try {
    const { status, description } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const bookingIdx = mockDB.bookings.findIndex(b => b._id === req.params.id);
      if (bookingIdx === -1) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const booking = mockDB.bookings[bookingIdx];
      booking.bookingStatus = status;
      booking.timeline = booking.timeline || [];
      booking.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        description
      });

      mockDB.bookings[bookingIdx] = booking;
      writeMockDB(mockDB);

      return res.status(200).json({
        success: true,
        data: booking
      });
    }

    const booking = await Booking.findById(req.params.id).populate('hall');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.hall.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    booking.bookingStatus = status;
    booking.timeline.push({
      status,
      description
    });

    await booking.save();

    await createNotify(
      booking.customer,
      `Booking Status Update: ${status}`,
      `Your booking status for "${booking.hall.name}" has updated to "${status}".`,
      'Booking'
    );

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate Razorpay order for booking payment
// @route   POST /api/bookings/:id/payment-order
// @access  Private (Customer)
export const initiatePaymentOrder = async (req, res, next) => {
  try {
    const { paymentType } = req.body; // 'Advance' or 'Balance'
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    let amountToPay = 0;
    if (paymentType === 'Advance') {
      if (booking.bookingStatus !== 'Approved') {
        return res.status(400).json({ success: false, message: 'Booking must be approved before paying advance' });
      }
      amountToPay = booking.advanceAmount;
    } else if (paymentType === 'Balance') {
      if (booking.bookingStatus !== 'Advance Paid') {
        return res.status(400).json({ success: false, message: 'Must pay advance before paying balance amount' });
      }
      amountToPay = booking.balanceAmount;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment type. Must be Advance or Balance' });
    }

    const orderId = `order_${Date.now()}`;
    let rzpOrder;

    if (!isMockRazorpay && razorpayInstance) {
      // Create actual Razorpay order
      rzpOrder = await razorpayInstance.orders.create({
        amount: Math.round(amountToPay * 100), // convert to paise
        currency: 'INR',
        receipt: booking._id.toString()
      });
    } else {
      // Simulating Razorpay order format
      rzpOrder = {
        id: `rzp_mock_${orderId}`,
        amount: Math.round(amountToPay * 100),
        currency: 'INR',
        receipt: booking._id.toString()
      };
    }

    // Save pending payment record
    const payment = await Payment.create({
      booking: booking._id,
      customer: req.user._id,
      amount: amountToPay,
      paymentType,
      razorpayOrderId: rzpOrder.id,
      status: 'Pending'
    });

    res.status(200).json({
      success: true,
      key: rzpKeyId,
      order: rzpOrder,
      paymentId: payment._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & update database
// @route   POST /api/bookings/verify-payment
// @access  Private (Customer)
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const booking = await Booking.findById(payment.booking).populate('hall');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated booking not found' });
    }

    const customer = await User.findById(payment.customer);
    const hall = booking.hall;

    let isSignatureValid = false;

    if (razorpay_order_id.startsWith('rzp_mock_')) {
      // Mock Signature validation
      isSignatureValid = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', rzpKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = generatedSignature === razorpay_signature;
    }

    if (!isSignatureValid) {
      payment.status = 'Failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment
    payment.status = 'Success';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    // Update Booking amounts & status
    booking.paidAmount += payment.amount;
    booking.payments.push(payment._id);

    if (payment.paymentType === 'Advance') {
      booking.bookingStatus = 'Advance Paid';
      booking.paymentStatus = 'Partially Paid';
      booking.timeline.push({
        status: 'Advance Paid',
        description: `Advance payment of ₹${payment.amount.toLocaleString()} received successfully via Razorpay. Booking is confirmed!`
      });
    } else if (payment.paymentType === 'Balance') {
      booking.bookingStatus = 'Catering Confirmed'; // or Advance forward in timeline
      booking.paymentStatus = 'Fully Paid';
      booking.timeline.push({
        status: 'Fully Paid',
        description: `Final balance payment of ₹${payment.amount.toLocaleString()} received. Complete event balance is settled.`
      });
    }

    // Generate Invoice PDF
    const invoicePath = await generateInvoicePDF(booking, payment, customer, hall);
    // Serve invoices statically. In a real cloud setup, we would upload to Cloudinary.
    const host = req.get('host');
    const protocol = req.protocol;
    const relativeInvoiceUrl = invoicePath.replace(/\\/g, '/').replace('public/', '');
    payment.invoiceUrl = `${protocol}://${host}/${relativeInvoiceUrl}`;

    await payment.save();
    await booking.save();

    // Trigger emails and notifications
    await createNotify(
      booking.customer,
      'Payment Successful',
      `Payment of ₹${payment.amount.toLocaleString()} for hall "${hall.name}" succeeded.`,
      'Payment'
    );

    await createNotify(
      hall.owner,
      'Payment Received',
      `Received ₹${payment.amount.toLocaleString()} from ${customer.name} for venue "${hall.name}".`,
      'Payment'
    );

    // Send email with billing invoice path
    try {
      await sendEmail({
        to: customer.email,
        subject: `BookMyHall - Payment Confirmation (Invoice #${payment._id.toString().slice(-8).toUpperCase()})`,
        text: `Hello ${customer.name},\n\nWe have received your payment of ₹${payment.amount.toLocaleString()} for venue booking "${hall.name}".\nYour invoice is available at: ${payment.invoiceUrl}\n\nThank you,\nBookMyHall Team`,
        html: `<h3>Hello ${customer.name},</h3><p>We have successfully received your payment of <b>₹${payment.amount.toLocaleString()}</b> for venue booking of <b>${hall.name}</b>.</p><p>You can view or download your invoice here: <a href="${payment.invoiceUrl}">Download PDF Invoice</a></p><br/><p>Thank you for booking with us,<br/>BookMyHall Team</p>`
      });
    } catch (emailErr) {
      console.error('Email sending failed after payment verification:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and transaction recorded successfully!',
      invoiceUrl: payment.invoiceUrl,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking by customer
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const bookingIdx = mockDB.bookings.findIndex(b => b._id === req.params.id);
      if (bookingIdx === -1) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const booking = mockDB.bookings[bookingIdx];
      // Verify ownership
      if (booking.customer !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
      }

      if (booking.bookingStatus === 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }

      booking.bookingStatus = 'Cancelled';
      booking.timeline = booking.timeline || [];
      booking.timeline.push({
        status: 'Cancelled',
        timestamp: new Date().toISOString(),
        description: 'Booking request has been cancelled by the customer.'
      });

      mockDB.bookings[bookingIdx] = booking;
      writeMockDB(mockDB);

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully!',
        booking
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'Cancelled';
    booking.timeline.push({
      status: 'Cancelled',
      description: 'Booking request has been cancelled by the customer.'
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully!',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking after mock payment succeeds
// @route   POST /api/bookings/confirm
// @access  Private (Customer)
export const confirmPaymentAndBooking = async (req, res, next) => {
  try {
    const { bookingDetails, paymentDetails } = req.body;
    const { hallId, eventType, eventDate, selectedServices } = bookingDetails;
    const { amount, transactionId, paymentType } = paymentDetails;

    // Sandbox bypass if database is disconnected/offline
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Sandbox Mode] Confirming payment & booking request offline`);
      const mockDB = readMockDB();

      const newBookingId = `sandbox_booking_${Date.now()}`;
      const newPaymentId = `sandbox_pay_${Date.now()}`;

      // Calculate details
      const baseHallPrice = bookingDetails.baseHallPrice || 85000;
      const servicesTotalPrice = bookingDetails.servicesTotalPrice || 0;
      const grandTotalPrice = bookingDetails.grandTotalPrice || 110000;
      const advanceAmount = bookingDetails.advanceAmount || 33000;
      const balanceAmount = bookingDetails.balanceAmount || 77000;

      const newBooking = {
        _id: newBookingId,
        customer: req.user?._id || 'sandbox_user_id',
        hall: hallId,
        eventType: eventType || 'Custom Event',
        eventDate: eventDate || new Date().toISOString(),
        selectedServices: selectedServices || [],
        baseHallPrice,
        servicesTotalPrice,
        grandTotalPrice,
        advanceAmount,
        balanceAmount,
        paidAmount: amount,
        paymentStatus: amount >= grandTotalPrice ? 'Fully Paid' : 'Partially Paid',
        bookingStatus: 'Approved',
        timeline: [
          { status: 'Pending Approval', timestamp: new Date().toISOString(), description: 'Booking request has been submitted.' },
          { status: 'Approved', timestamp: new Date().toISOString(), description: 'Your booking has been approved and confirmed after successful payment.' }
        ],
        payments: [newPaymentId],
        createdAt: new Date().toISOString()
      };

      const newPayment = {
        _id: newPaymentId,
        booking: newBookingId,
        customer: req.user?._id || 'sandbox_user_id',
        amount,
        paymentType: paymentType || 'Full',
        razorpayOrderId: `rzp_order_mock_${Date.now()}`,
        razorpayPaymentId: transactionId || `pay_mock_${Date.now()}`,
        status: 'Success',
        createdAt: new Date().toISOString()
      };

      mockDB.bookings = mockDB.bookings || [];
      mockDB.payments = mockDB.payments || [];
      mockDB.bookings.push(newBooking);
      mockDB.payments.push(newPayment);
      writeMockDB(mockDB);

      return res.status(201).json({
        success: true,
        booking: newBooking,
        payment: newPayment
      });
    }

    const hall = await FunctionHall.findById(hallId);
    if (!hall || hall.isDeleted) {
      return res.status(404).json({ success: false, message: 'Venue function hall not found' });
    }

    // Double Booking Check
    const targetDate = new Date(eventDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const conflictingBooking = await Booking.findOne({
      hall: hallId,
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      bookingStatus: { $nin: ['Rejected', 'Cancelled'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This venue is already booked for the selected date. Please choose another date.'
      });
    }

    const baseHallPrice = hall.basePrice;
    let servicesTotalPrice = 0;
    
    selectedServices.forEach(service => {
      servicesTotalPrice += Number(service.price) * Number(service.quantity || 1);
    });

    const subtotal = baseHallPrice + servicesTotalPrice + 10000;
    const gst = Math.round(subtotal * 0.18);
    const grandTotalPrice = subtotal + gst;
    const advanceAmount = Math.round(grandTotalPrice * 0.3);
    const balanceAmount = grandTotalPrice - advanceAmount;

    // Create Booking
    const booking = new Booking({
      customer: req.user._id,
      hall: hallId,
      eventType,
      eventDate: startOfDay,
      selectedServices,
      baseHallPrice,
      servicesTotalPrice,
      grandTotalPrice,
      advanceAmount,
      balanceAmount,
      paidAmount: amount,
      paymentStatus: amount >= grandTotalPrice ? 'Fully Paid' : 'Partially Paid',
      bookingStatus: 'Approved',
      timeline: [
        { status: 'Pending Approval', description: 'Booking request has been submitted.' },
        { status: 'Approved', description: 'Your booking has been approved and confirmed after successful payment.' }
      ]
    });

    // Create Payment
    const payment = new Payment({
      booking: booking._id,
      customer: req.user._id,
      amount,
      paymentType: paymentType || 'Full',
      razorpayOrderId: `rzp_order_mock_${Date.now()}`,
      razorpayPaymentId: transactionId || `pay_mock_${Date.now()}`,
      status: 'Success'
    });

    booking.payments.push(payment._id);

    await booking.save();
    await payment.save();

    // Notify Customer & Host
    await createNotify(
      booking.customer,
      'Payment & Booking Successful',
      `Your booking for hall "${hall.name}" has been confirmed after a payment of ₹${amount.toLocaleString()}.`,
      'Booking'
    );

    await createNotify(
      hall.owner,
      'New Confirmed Booking',
      `A new booking has been confirmed for "${hall.name}" on ${targetDate.toLocaleDateString()}. Payment: ₹${amount.toLocaleString()}.`,
      'Booking'
    );

    res.status(201).json({
      success: true,
      booking,
      payment
    });

  } catch (error) {
    next(error);
  }
};
