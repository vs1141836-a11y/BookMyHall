import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, X, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login, loading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Show redirect message if available
  useEffect(() => {
    if (location.state?.message) {
      triggerToast(location.state.message, 'error');
      // Clear message from history state
      navigate(location.pathname, { replace: true, state: { ...location.state, message: null } });
    }
  }, [location, navigate]);

  const triggerToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowSuggestion(false);
    
    // Trim spaces
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      triggerToast('Please enter both email and password.');
      return;
    }

    const res = await login(cleanEmail, cleanPassword);
    if (res.success) {
      triggerToast('Logged in successfully!', 'success');
      setShowSuggestion(false);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } else {
      triggerToast(res.message);
      setShowSuggestion(true);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-brand-50/10 via-white to-slate-50 relative overflow-hidden">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex max-w-md items-center space-x-3 rounded-2xl p-4 shadow-xl border animate-slide-in ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex-shrink-0">
            {toast.type === 'success' ? <Sparkles className="h-6 w-6 text-green-600 animate-pulse" /> : <ShieldAlert className="h-6 w-6 text-red-600" />}
          </div>
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-100 bg-white p-8 sm:p-12 shadow-2xl relative z-10 transition-all">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Sign in to manage and book your function halls</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:shadow-lg transition-all hover:from-brand-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Suggestion Banner */}
        {showSuggestion && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-sm font-semibold text-slate-700">Don't have an account? Create one.</p>
            <Link
              to="/register"
              className="mt-2.5 inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-2 hover:shadow-md transition-colors"
            >
              Sign Up Now
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 font-semibold pt-2">
          New to BookMyHall?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 hover:underline transition-all">Create account</Link>
        </p>
      </div>
    </div>
  );
}
