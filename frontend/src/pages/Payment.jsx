import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CreditCard, Smartphone, ShieldCheck, Landmark, Wallet, 
  Sparkles, CheckCircle2, ChevronRight, Lock, Calendar, 
  MapPin, Users, Info, ShieldAlert, AlertCircle 
} from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const bookingDetails = location.state?.bookingDetails;
  
  // State variables
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking, wallet
  const [upiOption, setUpiOption] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [paymentOption, setPaymentOption] = useState('advance'); // advance or full
  
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Redirect if booking details are missing
  useEffect(() => {
    if (!bookingDetails) {
      navigate('/dashboard');
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    return null;
  }

  // Cost breakdown
  const {
    hallId,
    hallName,
    hallLocation,
    hallImage,
    eventType,
    eventDate,
    selectedServices,
    guestsCount,
    baseHallPrice,
    servicesTotalPrice,
    grandTotalPrice,
    advanceAmount,
    balanceAmount
  } = bookingDetails;

  const convenienceFee = 150;
  const totalWithFee = grandTotalPrice + convenienceFee;
  const advanceWithFee = advanceAmount + convenienceFee;
  
  const activePayAmount = paymentOption === 'advance' ? advanceWithFee : totalWithFee;

  // Validation functions
  const validateUpi = (id) => {
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id);
  };

  const handlePay = async () => {
    setValidationError(null);
    setErrorMsg(null);

    // Verify method inputs
    if (paymentMethod === 'upi' && upiOption === 'custom') {
      if (!upiId) {
        setValidationError('Please enter your UPI ID.');
        return;
      }
      if (!validateUpi(upiId)) {
        setValidationError('Invalid UPI ID format. Example: mobile@okaxis.');
        return;
      }
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNo.replace(/\s+/g, '');
      if (cleanCard.length < 16) {
        setValidationError('Please enter a valid 16-digit Card Number.');
        return;
      }
      if (!cardHolder.trim()) {
        setValidationError('Please enter the Card Holder Name.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setValidationError('Expiry must be in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setValidationError('Please enter your 3-digit CVV code.');
        return;
      }
    }

    if (paymentMethod === 'netbanking' && !selectedBank) {
      setValidationError('Please select a Net Banking bank.');
      return;
    }

    if (paymentMethod === 'wallet' && !selectedWallet) {
      setValidationError('Please select a digital Wallet.');
      return;
    }

    setProcessing(true);

    try {
      // Simulate 1.8s payment processing loader
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Trigger confirm booking endpoint on successful simulation
      const res = await axios.post('/bookings/confirm', {
        bookingDetails,
        paymentDetails: {
          amount: activePayAmount,
          paymentMethod: `${paymentMethod.toUpperCase()}_${paymentMethod === 'upi' ? upiOption.toUpperCase() : 'DIRECT'}`,
          transactionId: `TXN_${Date.now()}`,
          paymentType: paymentOption === 'advance' ? 'Advance' : 'Full'
        }
      });

      if (res.data.success) {
        navigate('/booking/success', { 
          state: { 
            booking: res.data.booking, 
            payment: res.data.payment,
            hallImage,
            hallName,
            hallLocation,
            guestsCount
          } 
        });
      } else {
        setErrorMsg(res.data.message || 'Payment simulation failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Payment verification failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Secure Booking Checkout</h1>
        
        {/* Alerts */}
        {validationError && (
          <div className="mb-6 flex items-center space-x-3 rounded-xl bg-amber-50 p-4 text-amber-800 border border-amber-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <span className="text-sm font-medium">{validationError}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center space-x-3 rounded-xl bg-red-50 p-4 text-red-800 border border-red-200">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Payment Options */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Lock className="mr-2 h-5 w-5 text-brand-500" /> Payment Methods
              </h2>

              {/* Payment Tabs */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {[
                  { id: 'upi', label: 'UPI', icon: Smartphone },
                  { id: 'card', label: 'Cards', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Bank', icon: Landmark },
                  { id: 'wallet', label: 'Wallets', icon: Wallet }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setPaymentMethod(item.id); setValidationError(null); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                        isActive 
                          ? 'border-brand-500 bg-brand-50/50 text-brand-600 font-semibold' 
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-1.5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="min-h-[220px]">
                {/* UPI Content */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    {[
                      { id: 'gpay', label: 'Google Pay', logo: 'GP' },
                      { id: 'phonepe', label: 'PhonePe', logo: 'PP' },
                      { id: 'paytm', label: 'Paytm UPI', logo: 'PY' },
                      { id: 'bhim', label: 'BHIM UPI', logo: 'BH' }
                    ].map(app => (
                      <label 
                        key={app.id} 
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer hover:bg-slate-50 transition-colors ${
                          upiOption === app.id ? 'border-brand-500 bg-brand-50/10' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="upi_option"
                            checked={upiOption === app.id}
                            onChange={() => setUpiOption(app.id)}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
                          />
                          <span className="font-semibold text-slate-800 text-sm">{app.label}</span>
                        </div>
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 tracking-tighter">
                          {app.logo}
                        </span>
                      </label>
                    ))}

                    {/* Custom UPI ID */}
                    <label 
                      className={`flex flex-col p-4 rounded-2xl border cursor-pointer hover:bg-slate-50 transition-colors ${
                        upiOption === 'custom' ? 'border-brand-500 bg-brand-50/10' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="upi_option"
                            checked={upiOption === 'custom'}
                            onChange={() => setUpiOption('custom')}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
                          />
                          <span className="font-semibold text-slate-800 text-sm">Enter UPI ID</span>
                        </div>
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                          ID
                        </span>
                      </div>
                      
                      {upiOption === 'custom' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="username@bankname"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Card Content */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="flex space-x-2 text-xs font-bold text-slate-400 mb-2">
                      <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">VISA</span>
                      <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">MASTERCARD</span>
                      <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">RUPAY</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Card Number</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        value={cardNo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const matches = val.match(/\d{4}/g);
                          const extra = val.slice(matches ? matches.join('').length : 0);
                          setCardNo(matches ? matches.join(' ') + (extra ? ' ' + extra : '') : extra);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Card Holder Name</label>
                      <input
                        type="text"
                        placeholder="Pradeep Molleti"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/29"
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (val.length >= 2) {
                              setCardExpiry(`${val.slice(0,2)}/${val.slice(2)}`);
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">CVV Code</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Major Bank</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'State Bank of India',
                        'HDFC Bank',
                        'ICICI Bank',
                        'Axis Bank',
                        'Kotak Mahindra Bank',
                        'Canara Bank',
                        'Union Bank of India',
                        'Punjab National Bank'
                      ].map(bank => (
                        <button
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 text-left rounded-xl border text-sm font-semibold transition-all ${
                            selectedBank === bank 
                              ? 'border-brand-500 bg-brand-50/50 text-brand-600' 
                              : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wallets */}
                {paymentMethod === 'wallet' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Wallet</label>
                    <div className="space-y-2">
                      {[
                        { id: 'paytm', label: 'Paytm Wallet' },
                        { id: 'amazon', label: 'Amazon Pay' },
                        { id: 'mobikwik', label: 'MobiKwik' }
                      ].map(wallet => (
                        <label 
                          key={wallet.id} 
                          className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors ${
                            selectedWallet === wallet.id ? 'border-brand-500 bg-brand-50/10' : 'border-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name="wallet_option"
                            checked={selectedWallet === wallet.id}
                            onChange={() => setSelectedWallet(wallet.id)}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
                          />
                          <span className="font-semibold text-slate-800 text-sm">{wallet.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shield Notice */}
            <div className="flex items-start space-x-3 rounded-2xl bg-slate-100 p-4 border border-slate-200">
              <ShieldCheck className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Secure 256-bit SSL Encryption</h4>
                <p className="text-xs text-slate-500 mt-1">Your transaction is completely safe and private. Credentials details are handled with mock gateway authorization blocks.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm sticky top-6">
              {/* Hall Header */}
              <div className="relative h-44 bg-slate-900">
                <img 
                  src={hallImage} 
                  alt={hallName}
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                  <span className="inline-block text-[10px] uppercase font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full mb-1.5 self-start">
                    {eventType}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight">{hallName}</h3>
                  <p className="text-slate-300 text-xs flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {hallLocation}
                  </p>
                </div>
              </div>

              {/* Summary Details */}
              <div className="p-5 border-b border-slate-100 space-y-3.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center"><Calendar className="h-4 w-4 mr-1 text-slate-400" /> Event Date</span>
                  <span className="font-bold text-slate-800">{new Date(eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center"><Users className="h-4 w-4 mr-1 text-slate-400" /> Guest Count</span>
                  <span className="font-bold text-slate-800">{guestsCount} Guests</span>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="p-5 border-b border-slate-100">
                <label className="block text-xs font-extrabold text-slate-400 uppercase mb-3">Choose Payment Amount</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('advance')}
                    className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                      paymentOption === 'advance'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">Pay 30% Advance</span>
                    <span className="text-base font-extrabold mt-1">₹{advanceAmount.toLocaleString()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('full')}
                    className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                      paymentOption === 'full'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">Pay Full Amount</span>
                    <span className="text-base font-extrabold mt-1">₹{grandTotalPrice.toLocaleString()}</span>
                  </button>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-slate-50/50 p-5 space-y-3 border-b border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Base Hall Rent</span>
                  <span>₹{baseHallPrice.toLocaleString()}</span>
                </div>
                {servicesTotalPrice > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Packages & Services</span>
                    <span>₹{servicesTotalPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Additional Surcharges</span>
                  <span>₹10,000</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>GST (18%)</span>
                  <span>₹{Math.round((baseHallPrice + servicesTotalPrice + 10000) * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 border-b border-dashed border-slate-200 pb-2">
                  <span>Gateway Convenience Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-1">
                  <span>Total Amount Paid</span>
                  <span className="text-brand-600">₹{activePayAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 bg-white">
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className={`w-full flex items-center justify-center bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-brand-500/25 transition-all transform active:scale-[0.99] ${
                    processing ? 'opacity-75 cursor-wait' : ''
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Simulating Secure Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-5 w-5" />
                      <span>Pay ₹{activePayAmount.toLocaleString()} Now</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
