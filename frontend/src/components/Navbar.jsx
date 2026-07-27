import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, Heart, Calendar, Landmark, Settings, LogOut, ShieldAlert, BarChart3, User, RefreshCw, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const { user, logout, isAuthenticated, isCustomer, isOwner, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleNotificationRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                BookMyHall
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link to="/halls" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
                Discover Halls
              </Link>
              <Link to="/compare" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
                Compare
              </Link>
              <Link to="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
                About
              </Link>
              <Link to="/contact" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-500 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center">
                    <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin Panel
                  </Link>
                )}
                <Link to="/dashboard?tab=bookings" className="text-sm font-medium text-slate-600 hover:text-brand-500 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
                  My Bookings
                </Link>
                <Link to="/dashboard?tab=profile" className="text-sm font-medium text-slate-600 hover:text-brand-500 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <LogOut className="mr-1.5 h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 px-5 py-2.5 rounded-full shadow-md shadow-brand-500/10 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-50 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-2 shadow-inner animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-1 px-4 py-2">
            <Link to="/halls" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Discover Halls
            </Link>
            <Link to="/compare" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Compare
            </Link>
            <Link to="/about" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-3 py-2 text-base font-semibold text-brand-600 rounded-lg hover:bg-slate-50 flex items-center" onClick={() => setIsOpen(false)}>
                    <ShieldCheck className="mr-2 h-5 w-5" /> Admin Panel
                  </Link>
                )}
                <Link to="/dashboard?tab=bookings" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  My Bookings
                </Link>
                <Link to="/dashboard?tab=profile" className="block px-3 py-2 text-base font-medium text-slate-600 rounded-lg hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full text-left flex items-center px-3 py-2 text-base font-medium text-red-600 rounded-lg hover:bg-red-50 mt-4"
                >
                  <LogOut className="mr-2 h-5 w-5" /> Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-4">
                <Link to="/login" className="block text-center text-base font-medium text-slate-600 hover:text-slate-900 py-2.5 rounded-lg border border-slate-200" onClick={() => setIsOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="block text-center text-base font-semibold text-white bg-brand-500 hover:bg-brand-600 py-2.5 rounded-lg" onClick={() => setIsOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
