import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Check, Eye, EyeOff, Sparkles, X, ShieldAlert, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Forgot Password state
  const [email, setEmail] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  // Reset Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000);
  };

  // Password criteria validations
  const pLength = password.length >= 8;
  const pUpper = /[A-Z]/.test(password);
  const pLower = /[a-z]/.test(password);
  const pDigit = /\d/.test(password);
  const pSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = pLength && pUpper && pLower && pDigit && pSpecial;
  const isConfirmPasswordValid = confirmPassword && confirmPassword === password;

  const getPasswordStrength = () => {
    let score = 0;
    if (pLength) score++;
    if (pUpper) score++;
    if (pLower) score++;
    if (pDigit) score++;
    if (pSpecial) score++;
    return score;
  };

  // Handler for requesting reset link
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      triggerToast('Please enter your email address.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      triggerToast('Invalid email format.');
      return;
    }

    setLoading(true);
    setDevResetUrl('');
    try {
      const response = await axios.post('/auth/forgot-password', { email: cleanEmail });
      setResetRequested(true);
      triggerToast('Reset instructions sent!', 'success');
      
      // If dev mode / sandbox mode returns resetUrl directly, capture it
      if (response.data.resetUrl) {
        // Convert API reset URL to frontend path URL
        const tokenPart = response.data.resetUrl.split('/reset-password/')[1];
        if (tokenPart) {
          setDevResetUrl(`/reset-password/${tokenPart}`);
        }
      }
    } catch (error) {
      console.error('Reset request error:', error);
      triggerToast(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for setting new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      triggerToast('Password does not meet complexity rules.');
      return;
    }
    if (!isConfirmPasswordValid) {
      triggerToast('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/auth/reset-password/${token}`, { password });
      triggerToast('Password reset successful! Redirecting to login...', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      triggerToast(error.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = getPasswordStrength();

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

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-100 bg-white p-8 sm:p-12 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-slate-900 bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            {token ? 'Reset Password' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {token 
              ? 'Please choose a strong password and confirm it below.' 
              : 'Enter your registered email and we will send you password reset instructions.'
            }
          </p>
        </div>

        {/* 1. Request Reset Link Form (No Token) */}
        {!token && (
          <div className="space-y-6">
            {resetRequested ? (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-6 space-y-3 text-center">
                <Check className="h-8 w-8 text-green-600 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-green-900">Email Dispatched</h3>
                <p className="text-xs text-green-800 leading-normal">
                  If the email exists in our system, you will receive reset instructions shortly.
                </p>
                {devResetUrl && (
                  <div className="mt-4 bg-white border border-green-300 rounded-xl p-3 text-left">
                    <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-2">Development Reset Link:</p>
                    <Link 
                      to={devResetUrl} 
                      onClick={() => setResetRequested(false)}
                      className="block text-center w-full bg-green-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-green-700 transition-all shadow"
                    >
                      Click Here to Reset Password
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleRequestReset} noValidate>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                      placeholder="name@example.com"
                    />
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
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}

            <div className="text-center">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* 2. Set New Password Form (Token Present) */}
        {token && (
          <form className="space-y-4" onSubmit={handleResetPassword} noValidate>
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
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
              {/* Strength Checklist */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        strengthScore <= 2 ? 'w-1/3 bg-red-500' : strengthScore <= 4 ? 'w-2/3 bg-yellow-500' : 'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>STRENGTH:</span>
                    <span className={
                      strengthScore <= 2 ? 'text-red-500' : strengthScore <= 4 ? 'text-yellow-600' : 'text-green-600'
                    }>
                      {strengthScore <= 2 ? 'WEAK' : strengthScore <= 4 ? 'MEDIUM' : 'STRONG'}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-medium text-slate-400">
                    <li className={`flex items-center space-x-1 ${pLength ? 'text-green-600' : 'text-slate-400'}`}>
                      <Check className="h-3 w-3" /> <span>8+ Characters</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${pUpper ? 'text-green-600' : 'text-slate-400'}`}>
                      <Check className="h-3 w-3" /> <span>1 Upper Case</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${pLower ? 'text-green-600' : 'text-slate-400'}`}>
                      <Check className="h-3 w-3" /> <span>1 Lower Case</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${pDigit ? 'text-green-600' : 'text-slate-400'}`}>
                      <Check className="h-3 w-3" /> <span>1 Number</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${pSpecial ? 'text-green-600' : 'text-slate-400'}`}>
                      <Check className="h-3 w-3" /> <span>1 Special Char</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
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
              {confirmPassword && !isConfirmPasswordValid && (
                <p className="mt-1 text-xs text-red-500 font-medium">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !isConfirmPasswordValid}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:shadow-lg transition-all hover:from-brand-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Save Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
