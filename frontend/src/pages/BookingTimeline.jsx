import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2, ChevronRight, Download, Receipt, Star, AlertCircle, FileText, Award } from 'lucide-react';
import axios from 'axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BookingTimeline() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Review states
  const [rating, setRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Simulation state
  const [mockPaymentData, setMockPaymentData] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const res = await axios.get(`/bookings/${id}`);
      setBooking(res.data.data);
      
      // Check if already reviewed
      const reviewCheck = await axios.get(`/reviews/hall/${res.data.data.hall._id}`);
      const alreadyReviewed = reviewCheck.data.data.some(r => r.booking === id);
      setHasReviewed(alreadyReviewed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentType) => {
    setErrorMsg('');
    setPaying(true);
    try {
      const res = await axios.post(`/bookings/${id}/payment-order`, { paymentType });
      const data = res.data;

      if (data.order.id.startsWith('rzp_mock_')) {
        // Show simulated mock verification dialog on-screen
        setMockPaymentData({
          orderId: data.order.id,
          paymentId: data.paymentId,
          amount: data.order.amount / 100,
          paymentType
        });
        setPaying(false);
        return;
      }

      // Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Razorpay SDK failed to load. Make sure you are online.');
        setPaying(false);
        return;
      }

      // Configure Razorpay checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'BookMyHall',
        description: `${paymentType} Booking Deposit`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            setPaying(true);
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.paymentId
            };
            
            await axios.post('/bookings/verify-payment', verifyPayload);
            fetchBookingDetails();
          } catch (verifyErr) {
            console.error(verifyErr);
            setErrorMsg('Payment verification failed on server.');
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: '#ef4444'
        }
      };

      const rzpObj = new window.Razorpay(options);
      rzpObj.open();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to initialize payment.');
    } finally {
      setPaying(false);
    }
  };

  // Simulated Mock payment verification bypass helper
  const triggerMockPaymentBypass = async () => {
    if (!mockPaymentData) return;
    setPaying(true);
    try {
      const payload = {
        razorpay_order_id: mockPaymentData.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature_bypass',
        paymentId: mockPaymentData.paymentId
      };
      
      await axios.post('/bookings/verify-payment', payload);
      setMockPaymentData(null);
      fetchBookingDetails();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process mock payment.');
    } finally {
      setPaying(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    setReviewSubmitting(true);
    try {
      await axios.post('/reviews', {
        bookingId: id,
        hallId: booking.hall._id,
        rating,
        serviceRating,
        comment
      });
      setHasReviewed(true);
      fetchBookingDetails();
    } catch (err) {
      console.error(err);
      alert('Review submission failed.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getTimelineSteps = () => {
    // 8 stages of real scheduling timeline
    const allSteps = [
      { name: 'Pending Approval', label: 'Booking Request Placed' },
      { name: 'Approved', label: 'Owner Confirmed' },
      { name: 'Advance Paid', label: 'Advance Payment Received' },
      { name: 'Decoration Started', label: 'Floral & Stage Decor Started' },
      { name: 'Catering Confirmed', label: 'Catering Confirmations' },
      { name: 'Photography Confirmed', label: 'Photographers Confirmed' },
      { name: 'Event Ready', label: 'Event Preparations Finished' },
      { name: 'Event Completed', label: 'Celebration Finished' }
    ];

    const currentStatusIndex = allSteps.findIndex(s => s.name === booking.bookingStatus);

    return allSteps.map((step, idx) => {
      let isCompleted = false;
      let isActive = false;

      if (idx < currentStatusIndex) {
        isCompleted = true;
      } else if (idx === currentStatusIndex) {
        isActive = true;
      }
      
      // Specific timeline overrides for Rejected or Cancelled
      if (booking.bookingStatus === 'Rejected' && step.name === 'Approved') {
        return { ...step, label: 'Rejected by Venue Owner', isRejected: true };
      }
      if (booking.bookingStatus === 'Cancelled' && idx > 0) {
        return { ...step, label: 'Cancelled', isCancelled: true };
      }

      return { ...step, isCompleted, isActive };
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-brand-500"></div>
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center py-20 text-slate-500">Booking details not found.</div>;
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Booking Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Booking Tracker</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{booking.hall.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Category: <b>{booking.eventType}</b> &bull; Event Date: <b>{new Date(booking.eventDate).toLocaleDateString()}</b>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Booking ID</span>
          <span className="block font-mono text-slate-700 text-sm font-semibold uppercase">{booking._id}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Vertical Stepper Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 text-lg">Event Schedule Timeline</h3>
            
            {/* Timeline Step Visualizer */}
            <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-8 py-2">
              {timelineSteps.map((step, idx) => {
                const log = booking.timeline.find(t => t.status === step.name);
                
                return (
                  <div key={idx} className="relative">
                    {/* Circle Indicator */}
                    <div className="absolute -left-10 top-0.5 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white">
                      {step.isCompleted ? (
                        <CheckCircle2 className="h-7 w-7 text-green-500 fill-white" />
                      ) : step.isActive ? (
                        <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-brand-500 animate-ping"></div>
                        </div>
                      ) : step.isRejected ? (
                        <CheckCircle2 className="h-7 w-7 text-red-500 fill-white" />
                      ) : (
                        <div className="h-4.5 w-4.5 rounded-full bg-slate-200"></div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className={`block text-xs font-bold uppercase tracking-wider ${step.isActive ? 'text-brand-600' : 'text-slate-700'}`}>
                        {step.label}
                      </span>
                      {log ? (
                        <>
                          <p className="text-xs text-slate-400 leading-normal">{log.description}</p>
                          <span className="block text-[9px] text-slate-300 font-semibold">{new Date(log.timestamp).toLocaleString()}</span>
                        </>
                      ) : step.isActive ? (
                        <p className="text-xs text-slate-400">Awaiting status update...</p>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">Scheduled phase</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Review Box after Event Completed */}
          {booking.bookingStatus === 'Event Completed' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-brand-500" />
                <h3 className="font-extrabold text-slate-800 text-lg">Leave Venue Review</h3>
              </div>
              
              {hasReviewed ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-green-700 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>You have successfully submitted your review for this venue event. Thank you!</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase">Venue Rating (1-5)</label>
                      <div className="flex items-center space-x-1 mt-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setRating(s)}
                            className={`h-5 w-5 cursor-pointer ${s <= rating ? 'fill-current' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase">Services Rating (1-5)</label>
                      <div className="flex items-center space-x-1 mt-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setServiceRating(s)}
                            className={`h-5 w-5 cursor-pointer ${s <= serviceRating ? 'fill-current' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase">Write Review Comment</label>
                    <textarea
                      required
                      rows="3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience booking this venue, food details, and service management..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 mt-1 focus:outline-none focus:bg-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl py-2 px-5 shadow-md flex items-center justify-center disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Billing & Payments Desk */}
        <div className="space-y-6">
          {/* Billing Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-50 pb-2">Billing Breakdown</h3>
            <div className="space-y-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Hall rent (Base)</span>
                <span className="font-semibold text-slate-700">₹{booking.baseHallPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Services customized</span>
                <span className="font-semibold text-slate-700">₹{booking.servicesTotalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-800">
                <span>Total Budget</span>
                <span>₹{booking.grandTotalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Total Paid</span>
                <span className="font-bold">₹{booking.paidAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Selected Services Listing */}
            {booking.selectedServices.length > 0 && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom Services booked</span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {booking.selectedServices.map((srv, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-500">
                      <span>{srv.name} (x{srv.quantity})</span>
                      <span className="font-medium">₹{(srv.price * srv.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Button desk based on milestones */}
            {booking.bookingStatus === 'Approved' && (
              <button
                onClick={() => handlePayment('Advance')}
                disabled={paying}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-3 text-xs shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {paying ? 'Processing...' : `Pay Advance Deposit (₹${booking.advanceAmount.toLocaleString()})`}
              </button>
            )}

            {booking.bookingStatus === 'Advance Paid' && (
              <button
                onClick={() => handlePayment('Balance')}
                disabled={paying}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl py-3 text-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {paying ? 'Processing...' : `Pay Final Balance (₹${booking.balanceAmount.toLocaleString()})`}
              </button>
            )}

            {booking.paymentStatus === 'Fully Paid' && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-700 text-center text-xs font-bold">
                Budget Fully Settled
              </div>
            )}
          </div>

          {/* Invoice Receipts List */}
          {booking.payments.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-50 pb-2">Receipts & Invoices</h3>
              <div className="space-y-3">
                {booking.payments.map((pmt) => (
                  <div key={pmt._id} className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="block font-bold text-slate-700 capitalize">{pmt.paymentType} Payment</span>
                      <span className="block text-[10px] text-slate-400">₹{pmt.amount.toLocaleString()} &bull; {new Date(pmt.createdAt).toLocaleDateString()}</span>
                    </div>
                    {pmt.invoiceUrl && (
                      <a
                        href={pmt.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-brand-500 transition-colors shadow-sm hover:shadow"
                        title="Download PDF Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Sandbox Payment Verification Bypass Dialog (Only visible in Local Developer Mock Mode) */}
      {mockPaymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto h-12 w-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Razorpay Sandbox Simulator</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We detected that you are running the project in <b>Mock / Local Developer mode</b>. You don't need real credit cards or Razorpay API keys configured to test.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 text-left text-xs font-semibold space-y-1.5 text-slate-600">
              <div className="flex justify-between"><span>Payment Type:</span><span className="text-slate-800">{mockPaymentData.paymentType}</span></div>
              <div className="flex justify-between"><span>Amount due:</span><span className="text-slate-800">₹{mockPaymentData.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Mock Order:</span><span className="text-slate-800 font-mono">{mockPaymentData.orderId}</span></div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={triggerMockPaymentBypass}
                disabled={paying}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-2.5 text-xs shadow-md shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {paying ? 'Verifying...' : 'Simulate Payment Success'}
              </button>
              <button
                type="button"
                onClick={() => setMockPaymentData(null)}
                className="text-xs text-slate-400 font-medium py-1.5 hover:text-slate-600"
              >
                Cancel Sandbox Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
