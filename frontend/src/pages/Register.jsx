import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Lock, Phone, Check, AlertCircle, 
  Eye, EyeOff, Sparkles, X, ShieldAlert 
} from 'lucide-react';

export default function Register() {
  const { register, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field interaction states for inline validation
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error/Success state
  const [toast, setToast] = useState(null);

  // Refs for auto-focusing
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const triggerToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Validation Checkers
  const isNameValid = fullName && /^[a-zA-Z\s]+$/.test(fullName.trim());
  const isEmailValid = email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim().toLowerCase());
  const isPhoneValid = phone && /^\d{10,12}$/.test(phone.trim());
  const isPasswordValid = password && password.length >= 8;
  const isConfirmPasswordValid = confirmPassword && confirmPassword === password;

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    // Run focusing for the first invalid field
    if (!isNameValid) {
      fullNameRef.current?.focus();
      triggerToast('Please enter a valid name (letters and spaces only).');
      return;
    }
    if (!isEmailValid) {
      emailRef.current?.focus();
      triggerToast('Please enter a valid email address.');
      return;
    }
    if (!isPhoneValid) {
      phoneRef.current?.focus();
      triggerToast('Phone number must be 10 to 12 digits.');
      return;
    }
    if (!isPasswordValid) {
      passwordRef.current?.focus();
      triggerToast('Password must be at least 8 characters.');
      return;
    }
    if (!isConfirmPasswordValid) {
      confirmPasswordRef.current?.focus();
      triggerToast('Passwords do not match.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password
    };

    const res = await register(payload);
    if (res.success) {
      triggerToast('Account created successfully! Welcome to BookMyHall.', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      triggerToast(res.message);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-brand-50/10 via-white to-slate-50 relative overflow-hidden">
      {/* Toast Container */}
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
            Join BookMyHall
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Create your customer account to search and book function halls</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                id="fullName"
                ref={fullNameRef}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`block w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm ${
                  touched.fullName ? (isNameValid ? 'border-green-300 focus:ring-green-100' : 'border-red-300 focus:ring-red-100') : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
                placeholder="Vijay Kumar"
              />
              {touched.fullName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isNameValid ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              )}
            </div>
            {touched.fullName && !isNameValid && (
              <p className="mt-1 text-xs text-red-500 font-medium">Name is required and must contain only letters.</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`block w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm ${
                  touched.email ? (isEmailValid ? 'border-green-300 focus:ring-green-100' : 'border-red-300 focus:ring-red-100') : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
                placeholder="name@example.com"
              />
              {touched.email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isEmailValid ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              )}
            </div>
            {touched.email && !isEmailValid && (
              <p className="mt-1 text-xs text-red-500 font-medium">Please enter a valid email format.</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
              <input
                id="phone"
                ref={phoneRef}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('phone')}
                maxLength={12}
                className={`block w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm ${
                  touched.phone ? (isPhoneValid ? 'border-green-300 focus:ring-green-100' : 'border-red-300 focus:ring-red-100') : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
                placeholder="9876543210"
              />
              {touched.phone && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isPhoneValid ? <Check className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              )}
            </div>
            {touched.phone && !isPhoneValid && (
              <p className="mt-1 text-xs text-red-500 font-medium">Phone number must contain 10 to 12 digits.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`block w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm ${
                  touched.password ? (isPasswordValid ? 'border-green-300 focus:ring-green-100' : 'border-red-300 focus:ring-red-100') : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
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
            {touched.password && !isPasswordValid && (
              <p className="mt-1 text-xs text-red-500 font-medium">Password must be at least 8 characters.</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirmPassword"
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`block w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm ${
                  touched.confirmPassword ? (isConfirmPasswordValid ? 'border-green-300 focus:ring-green-100' : 'border-red-300 focus:ring-red-100') : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {touched.confirmPassword && !isConfirmPasswordValid && (
              <p className="mt-1 text-xs text-red-500 font-medium">Passwords do not match.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:shadow-lg transition-all hover:from-brand-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 hover:underline transition-all">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
