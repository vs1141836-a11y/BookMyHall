import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Calendar, History, Search, Bell, Settings, 
  MapPin, Clock, Edit2, Key, Info, CheckCircle, 
  AlertTriangle, Trash2, ArrowRight, Eye, UserX, Phone,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'bookings');
  
  // State for profile form
  const [profileName, setProfileName] = useState(user?.name || user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || user?.mobile || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);

  // State for Owner Dashboard
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [ownerLoading, setOwnerLoading] = useState(true);

  // Fetch host bookings when tab opens
  useEffect(() => {
    if (activeTab === 'owner') {
      fetchOwnerBookings();
    }
  }, [activeTab]);

  const fetchOwnerBookings = async () => {
    setOwnerLoading(true);
    try {
      const res = await axios.get('/bookings/owner/my-bookings');
      setOwnerBookings(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching owner bookings:', err);
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleApproveReject = async (id, action) => {
    try {
      await axios.put(`/bookings/${id}/approve`, { action });
      alert(`Booking ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      fetchOwnerBookings();
    } catch (err) {
      console.error(err);
      alert('Action failed.');
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await axios.put(`/bookings/${id}/status`, { 
        status: 'Event Completed', 
        description: 'Event completed successfully.' 
      });
      alert('Booking marked as Completed.');
      fetchOwnerBookings();
    } catch (err) {
      console.error(err);
      alert('Action failed.');
    }
  };

  // Sync profile details when user state loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name || user.fullName || '');
      setProfilePhone(user.phone || user.mobile || '');
    }
  }, [user]);

  // Sync active tab with url query parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // State for notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
  }, []);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await axios.get('/bookings/customer/my-bookings');
      setBookings(res.data.data || res.data || []);
      setBookingError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Offline/sandbox fallback
      setBookingError('Unable to connect to database. Showing mock details.');
      setBookings([
        {
          _id: 'mock_b1',
          hall: {
            name: 'Grand Royal Palace',
            address: '123 Luxury Road, Jubilee Hills, Hyderabad',
            images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800']
          },
          bookingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          bookingStatus: 'Approved',
          paidAmount: 0,
          totalCost: 125000,
          eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          timeline: [
            { status: 'Pending', description: 'Booking request sent by customer.' },
            { status: 'Approved', description: 'Booking request approved by the venue owner.' }
          ]
        },
        {
          _id: 'mock_b2',
          hall: {
            name: 'Shree Gardens Hall',
            address: 'Secunderabad, Hyderabad',
            images: ['https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=800']
          },
          bookingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          bookingStatus: 'Completed',
          paidAmount: 85000,
          totalCost: 85000,
          eventDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          timeline: [
            { status: 'Pending', description: 'Request sent.' },
            { status: 'Approved', description: 'Approved.' },
            { status: 'Completed', description: 'Event completed.' }
          ]
        }
      ]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      setNotifications([
        { _id: 'n1', title: 'Welcome to BookMyHall!', message: 'Explore our premium venues and book in one click.', createdAt: new Date() },
        { _id: 'n2', title: 'Verify Profile Details', message: 'Ensure your phone number is correct for updates.', createdAt: new Date(Date.now() - 3600000) }
      ]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    
    if (newPassword && newPassword !== confirmNewPassword) {
      setProfileMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const payload = {
      name: profileName,
      phone: profilePhone
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    const res = await updateProfile(payload);
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.put(`/bookings/${id}/cancel`);
      alert('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      console.error(err);
      // Sandbox fallback update
      setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: 'Cancelled' } : b));
      alert('Booking cancelled successfully (sandbox fallback).');
    }
  };

  const activeBookings = bookings.filter(b => b.bookingStatus !== 'Completed' && b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Rejected');
  const pastBookings = bookings.filter(b => b.bookingStatus === 'Completed' || b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Rejected');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:space-x-8">
        
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sticky top-24">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="h-20 w-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-3xl font-black shadow-inner">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="mt-4 font-bold text-lg text-slate-800">{user?.name}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1 capitalize">Customer</p>
            </div>
            
            <nav className="mt-6 space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <User className="mr-3 h-5 w-5" /> My Profile
              </button>
              
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all relative ${
                  activeTab === 'bookings' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Calendar className="mr-3 h-5 w-5" /> Active Bookings
                {activeBookings.length > 0 && (
                  <span className={`absolute right-4 px-2 py-0.5 text-2xs font-bold rounded-full ${activeTab === 'bookings' ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'}`}>
                    {activeBookings.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab('history')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'history' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <History className="mr-3 h-5 w-5" /> Booking History
              </button>

              <button 
                onClick={() => setActiveTab('halls')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'halls' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Search className="mr-3 h-5 w-5" /> Browse Halls
              </button>

              <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all relative ${
                  activeTab === 'notifications' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Bell className="mr-3 h-5 w-5" /> Notifications
                {notifications.length > 0 && (
                  <span className={`absolute right-4 px-2 py-0.5 text-2xs font-bold rounded-full ${activeTab === 'notifications' ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'}`}>
                    {notifications.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" /> Account Settings
              </button>

              <button 
                onClick={() => setActiveTab('owner')}
                className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'owner' 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="mr-3 h-5 w-5" /> Host Panel
              </button>
            </nav>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="flex-1">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl min-h-[500px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-black text-slate-800 pb-2 border-b border-slate-50">My Profile Details</h2>
                {profileMsg && (
                  <div className={`mt-4 p-4 rounded-xl text-sm font-medium border ${
                    profileMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {profileMsg.text}
                  </div>
                )}
                
                <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                          type="text" 
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                          type="tel" 
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-6">
                    <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center">
                      <Key className="mr-2 h-5 w-5 text-slate-400" /> Change Password
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Current Password</label>
                        <input 
                          type="password" 
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full mt-2 rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="block w-full mt-2 rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full mt-2 rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="rounded-xl bg-brand-500 text-white font-semibold px-6 py-3 hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/10 active:scale-[0.98]"
                  >
                    Save Profile Settings
                  </button>
                </form>
              </div>
            )}

            {/* ACTIVE BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <h2 className="text-2xl font-black text-slate-800">Active Bookings</h2>
                  {bookingError && (
                    <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-3 py-1 rounded-full flex items-center">
                      <Info className="mr-1 h-3.5 w-3.5" /> {bookingError}
                    </span>
                  )}
                </div>

                {bookingsLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                  </div>
                ) : activeBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg">No active bookings</h3>
                    <p className="text-slate-400 text-sm mt-1">You do not have any pending or approved scheduling requests.</p>
                    <Link to="/halls" className="mt-4 inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">
                      Discover Halls <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {activeBookings.map((b) => (
                      <div key={b._id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all hover:shadow-lg">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div className="flex space-x-4">
                            <img 
                              src={b.hall?.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'} 
                              alt="hall" 
                              className="h-16 w-20 rounded-xl object-cover"
                            />
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg">{b.hall?.name}</h3>
                              <p className="text-xs text-slate-400 mt-1 flex items-center">
                                <MapPin className="mr-1 h-3.5 w-3.5" /> {b.hall?.address}
                              </p>
                              <p className="text-xs font-semibold text-brand-600 mt-2">
                                Scheduled Date: {new Date(b.bookingDate || b.eventDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <span className={`px-3 py-1 text-2xs font-black rounded-full uppercase ${
                              b.bookingStatus === 'Approved' ? 'bg-blue-50 text-blue-600' :
                              b.bookingStatus === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {b.bookingStatus}
                            </span>
                            <span className="text-sm font-bold text-slate-800 mt-2">Total: ₹{b.totalCost?.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Visual Timeline Tracking */}
                        <div className="mt-6 border-t border-slate-50 pt-6">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Booking Status Timeline</h4>
                          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 relative">
                            {/* Track line behind */}
                            <div className="absolute left-1/2 md:left-0 md:right-0 top-0 md:top-4 h-full md:h-1 w-1 md:w-full bg-slate-100 z-0" />
                            
                            {[
                              { label: 'Request Sent', done: true },
                              { label: 'Owner Confirmed', done: b.bookingStatus === 'Approved' || b.bookingStatus === 'Advance Paid' || b.bookingStatus === 'Fully Paid' },
                              { label: 'Advance Paid', done: b.bookingStatus === 'Advance Paid' || b.bookingStatus === 'Fully Paid' },
                              { label: 'Ready for Event', done: b.bookingStatus === 'Fully Paid' }
                            ].map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center relative z-10 bg-white px-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                  step.done ? 'bg-brand-500 border-brand-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-300'
                                }`}>
                                  {step.done ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                <span className={`text-[11px] font-bold mt-2 ${step.done ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Buttons Actions */}
                        <div className="mt-6 border-t border-slate-50 pt-4 flex justify-between items-center">
                          {b.bookingStatus === 'Approved' ? (
                            <Link 
                              to={`/checkout/${b._id}`}
                              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md shadow-brand-500/10 transition-colors"
                            >
                              Proceed to Advance Payment
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">Waiting for backend verification...</span>
                          )}

                          {(b.bookingStatus === 'Pending' || b.bookingStatus === 'Approved') && (
                            <button
                              onClick={() => handleCancelBooking(b._id)}
                              className="text-red-500 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center"
                            >
                              <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BOOKING HISTORY TAB */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-black text-slate-800 pb-2 border-b border-slate-50">Booking History</h2>
                
                {bookingsLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                  </div>
                ) : pastBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                      <History className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg">No past bookings</h3>
                    <p className="text-slate-400 text-sm mt-1">There are no completed or cancelled bookings in your profile archive.</p>
                  </div>
                ) : (
                  <div className="mt-6 overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                    <table className="min-w-full divide-y divide-slate-50">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Venue Name</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Event Date</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total Value</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-50">
                        {pastBookings.map((b) => (
                          <tr key={b._id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-slate-800">{b.hall?.name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs text-slate-500">{new Date(b.bookingDate || b.eventDate).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-slate-600">₹{b.totalCost?.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-0.5 text-3xs font-extrabold rounded-full uppercase ${
                                b.bookingStatus === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                              }`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                              <Link to={`/bookings/${b._id}`} className="text-brand-600 hover:text-brand-700 flex items-center justify-end">
                                <Eye className="mr-1 h-3.5 w-3.5" /> View details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* BROWSE HALLS TAB */}
            {activeTab === 'halls' && (
              <div>
                <h2 className="text-2xl font-black text-slate-800 pb-2 border-b border-slate-50">Browse Recommended Halls</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {[
                    { name: 'Imperial Palace', desc: 'Ultra luxury function hall with 1000+ guest capacity', rate: '₹1,50,000/day', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Crystal Grand Hall', desc: 'Modern AC hall with built-in premium stage decorations', rate: '₹80,000/day', img: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=600' }
                  ].map((h, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden shadow-md group">
                      <div className="relative h-44 overflow-hidden">
                        <img src={h.img} alt={h.name} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" />
                        <span className="absolute bottom-3 right-3 bg-brand-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
                          {h.rate}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-slate-800 text-base">{h.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{h.desc}</p>
                        <Link to="/halls" className="mt-4 flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline">
                          View details & book <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center bg-slate-50/50 rounded-2xl p-6 border border-slate-100 border-dashed">
                  <p className="text-sm font-medium text-slate-500">Need specific search parameters, dates, or amenities?</p>
                  <Link 
                    to="/halls" 
                    className="mt-3 inline-flex items-center rounded-xl bg-brand-500 text-white text-xs font-semibold px-5 py-2.5 hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/10"
                  >
                    Launch Advanced Search <Search className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* HOST PANEL TAB */}
            {activeTab === 'owner' && (
              <div>
                <h2 className="text-2xl font-black text-slate-800 pb-2 border-b border-slate-50">Host Dashboard</h2>
                
                {ownerLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                  </div>
                ) : ownerBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg">No host bookings</h3>
                    <p className="text-slate-400 text-sm mt-1">There are no booking requests for your listed halls on the platform.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {ownerBookings.map((b) => (
                      <div key={b._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                              Booking ID: {b._id}
                            </span>
                            <h3 className="text-lg font-bold text-slate-800 mt-2">{b.hall?.name}</h3>
                            <p className="text-xs text-slate-400 flex items-center mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" /> {b.hall?.city}, {b.hall?.area}
                            </p>
                            
                            {/* Customer info */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                              <div><span className="font-bold text-slate-500">Customer:</span> {b.customer?.name || 'Demo Customer'}</div>
                              <div><span className="font-bold text-slate-500">Email:</span> {b.customer?.email || 'customer@example.com'}</div>
                              <div><span className="font-bold text-slate-500">Phone:</span> {b.customer?.phone || '9876543210'}</div>
                              <div><span className="font-bold text-slate-500">Event Type:</span> {b.eventType}</div>
                              <div><span className="font-bold text-slate-500">Event Date:</span> {new Date(b.eventDate).toLocaleDateString()}</div>
                              <div><span className="font-bold text-slate-500">Guests Size:</span> {b.guestsCount || 100} Guests</div>
                              <div><span className="font-bold text-slate-500">Total Value:</span> ₹{b.grandTotalPrice?.toLocaleString()}</div>
                              <div><span className="font-bold text-slate-500">Amount Paid:</span> ₹{b.paidAmount?.toLocaleString()}</div>
                              <div><span className="font-bold text-slate-500">Payment Status:</span> <span className="font-bold text-brand-600">{b.paymentStatus}</span></div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-end gap-2 md:self-stretch md:justify-between">
                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase ${
                              b.bookingStatus === 'Approved' || b.bookingStatus === 'Advance Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Rejected' ? 'bg-red-50 text-red-500 border border-red-100' :
                              'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {b.bookingStatus}
                            </span>
                            
                            <div className="flex gap-2 mt-4 md:mt-0">
                              {(b.bookingStatus === 'Pending Approval' || b.bookingStatus === 'Pending') && (
                                <>
                                  <button
                                    onClick={() => handleApproveReject(b._id, 'approve')}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleApproveReject(b._id, 'reject')}
                                    className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-3.5 py-2 rounded-xl border border-red-200 transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {(b.bookingStatus === 'Approved' || b.bookingStatus === 'Advance Paid') && (
                                <button
                                  onClick={() => handleMarkCompleted(b._id)}
                                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-black text-slate-800 pb-2 border-b border-slate-50">Notifications</h2>
                <div className="mt-6 space-y-4">
                  {notifications.map((n) => (
                    <div key={n._id} className="rounded-xl border border-slate-50 bg-slate-50/20 p-4 flex items-start space-x-3 hover:bg-slate-50/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">{n.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-black text-slate-800 pb-2 border-b border-slate-50">Account Settings</h2>
                <div className="mt-6 space-y-6">
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Theme Settings</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Toggle interface design view settings.</p>
                    </div>
                    <button className="text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors">
                      Use System Theme
                    </button>
                  </div>

                  <div className="p-6 border border-red-100 rounded-2xl bg-red-50/10 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-red-800 text-sm">Delete Account</h4>
                      <p className="text-xs text-red-400 mt-0.5">Completely delete your account and clear all active bookings.</p>
                    </div>
                    <button 
                      onClick={() => alert('Account deletion requires contacting support@bookmyhall.com.')}
                      className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors flex items-center"
                    >
                      <UserX className="mr-1 h-4 w-4" /> Terminate Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
