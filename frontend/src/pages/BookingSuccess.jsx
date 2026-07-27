import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, Printer, Home, Calendar, 
  MapPin, Users, Tag, CreditCard, Sparkles 
} from 'lucide-react';

export default function BookingSuccess() {
  const location = useLocation();
  const printRef = useRef(null);

  const { booking, payment, hallImage, hallName, hallLocation, guestsCount } = location.state || {};

  if (!booking || !payment) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">No active transaction found.</h2>
          <Link to="/dashboard" className="mt-4 inline-flex items-center text-brand-600 hover:text-brand-700 font-semibold">
            Go back to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <style>{`
        @media print {
          body, html, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      {/* Printable Receipt Area - Hidden on Screen, Visible on Print */}
      <div className="hidden print:block absolute inset-0 bg-white p-10 font-sans text-slate-800 text-sm">
        <div className="max-w-3xl mx-auto border border-slate-300 p-8 rounded-lg shadow-sm">
          {/* Logo & Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-brand-600 tracking-tight uppercase">BookMyHall</h1>
              <p className="text-xs text-slate-400 mt-1">Universal Function Hall Booking Desk</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-800">Booking Receipt</h2>
              <p className="text-xs text-slate-500 mt-1">Invoice ID: INV-{payment._id.toString().slice(-8).toUpperCase()}</p>
              <p className="text-xs text-slate-400">Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Customer & Transaction Overview */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Customer Details</h4>
              <p className="font-bold text-slate-800">{booking.customerName || 'Customer'}</p>
              <p className="text-xs text-slate-500">{booking.customerEmail || 'N/A'}</p>
              <p className="text-xs text-slate-500">{booking.customerPhone || 'N/A'}</p>
            </div>
            <div className="text-right">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h4>
              <p className="text-xs text-slate-600">Booking ID: <span className="font-bold text-slate-800">{booking._id}</span></p>
              <p className="text-xs text-slate-600">Transaction ID: <span className="font-bold text-slate-800">{payment.razorpayPaymentId || 'N/A'}</span></p>
              <p className="text-xs text-slate-600">Method: <span className="font-bold text-slate-800">{payment.paymentType || 'Full'}</span></p>
            </div>
          </div>

          {/* Booking Summary Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{hallName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{hallLocation}</p>
                  </td>
                  <td className="p-3 text-right">1</td>
                  <td className="p-3 text-right">₹{booking.baseHallPrice?.toLocaleString()}</td>
                </tr>
                {booking.selectedServices?.map((service, index) => (
                  <tr key={index}>
                    <td className="p-3 text-slate-600">{service.name} ({service.category})</td>
                    <td className="p-3 text-right text-slate-600">{service.quantity || 1}</td>
                    <td className="p-3 text-right text-slate-600">₹{service.price?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <td className="p-3 text-right" colSpan="2">Subtotal</td>
                  <td className="p-3 text-right">₹{(booking.baseHallPrice + booking.servicesTotalPrice + 10000).toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-800">
                  <td className="p-3 text-right" colSpan="2">GST (18%)</td>
                  <td className="p-3 text-right">₹{Math.round((booking.baseHallPrice + booking.servicesTotalPrice + 10000) * 0.18).toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-800">
                  <td className="p-3 text-right" colSpan="2">Total Paid Amount</td>
                  <td className="p-3 text-right text-brand-600">₹{payment.amount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QR & Disclaimer */}
          <div className="flex justify-between items-center border-t border-slate-200 pt-6 mt-8">
            <div className="text-xs text-slate-400 max-w-sm">
              <p className="font-bold text-slate-600 mb-1">Thank you for your business!</p>
              <p>This is a computer generated invoice and does not require physical signatures.</p>
            </div>
            <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded border border-slate-200 text-[10px] font-black text-slate-400">
              QR CODE
            </div>
          </div>
        </div>
      </div>

      {/* Screen Presentation View */}
      <div className="mx-auto max-w-3xl print:hidden">
        {/* Success Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          <div className="mx-auto h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 animate-bounce">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">Payment Successful</h2>
          <p className="text-slate-500 text-sm mt-2">Your booking has been confirmed. A receipt was sent to your email.</p>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Booking ID</span>
              <span className="text-xs font-mono font-semibold text-slate-700">{booking._id}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase">Payment ID</span>
              <span className="text-xs font-mono font-semibold text-slate-700">{payment.razorpayPaymentId || 'N/A'}</span>
            </div>
            <div className="mt-2">
              <span className="block text-xs font-bold text-slate-400 uppercase">Total Paid</span>
              <span className="text-sm font-bold text-brand-600">₹{payment.amount?.toLocaleString()}</span>
            </div>
            <div className="mt-2">
              <span className="block text-xs font-bold text-slate-400 uppercase">Status</span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Ticket Summary Card */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm mb-8">
          <div className="relative h-48 bg-slate-900">
            <img 
              src={hallImage} 
              alt={hallName}
              className="h-full w-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
              <span className="inline-block text-[10px] uppercase font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full mb-1.5 self-start">
                {booking.eventType}
              </span>
              <h3 className="text-xl font-bold text-white leading-tight">{hallName}</h3>
              <p className="text-slate-300 text-xs flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-slate-400" /> {hallLocation}
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <span className="block text-xs text-slate-400">Scheduled Date</span>
                <span className="font-semibold text-slate-800">{new Date(booking.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <Users className="h-5 w-5 text-slate-400" />
              <div>
                <span className="block text-xs text-slate-400">Guest List Size</span>
                <span className="font-semibold text-slate-800">{guestsCount} Guests</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdowns */}
          <div className="bg-slate-50/50 p-6 space-y-2.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Venue Base Rent</span>
              <span>₹{booking.baseHallPrice?.toLocaleString()}</span>
            </div>
            {booking.servicesTotalPrice > 0 && (
              <div className="flex justify-between">
                <span>Food & Decor Packages</span>
                <span>₹{booking.servicesTotalPrice?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Surcharges</span>
              <span>₹10,000</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{Math.round((booking.baseHallPrice + booking.servicesTotalPrice + 10000) * 0.18).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center bg-white border border-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <Printer className="mr-2 h-5 w-5 text-slate-400" />
            <span>Download Invoice PDF</span>
          </button>
          
          <Link
            to="/dashboard?tab=bookings"
            className="flex items-center justify-center bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-brand-500/10 transition-all active:scale-[0.98]"
          >
            <span>View My Bookings</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98]"
          >
            <Home className="mr-2 h-5 w-5 text-slate-400" />
            <span>Dashboard Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
