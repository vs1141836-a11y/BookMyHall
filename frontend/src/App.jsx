import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import HallSearch from './pages/HallSearch';
import HallDetails from './pages/HallDetails';
import CompareHalls from './pages/CompareHalls';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Contact from './pages/Contact';

// Customer Protected Pages
import Dashboard from './pages/Dashboard';
import BookingTimeline from './pages/BookingTimeline';
import Payment from './pages/Payment';
import BookingSuccess from './pages/BookingSuccess';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/halls" element={<HallSearch />} />
              <Route path="/halls/:id" element={<HallDetails />} />
              <Route path="/compare" element={<CompareHalls />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Customer Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bookings/:id" element={<BookingTimeline />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/booking/success" element={<BookingSuccess />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Legacy Route Redirects */}
              <Route path="/bookings" element={<Navigate to="/dashboard" replace />} />
              <Route path="/wishlist" element={<Navigate to="/dashboard" replace />} />
              <Route path="/verify-email" element={<Navigate to="/dashboard" replace />} />
              <Route path="/owner/*" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
