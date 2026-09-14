import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Plane,
  ChevronRight,
  Check,
} from 'lucide-react';
import { ProfileSetupWizard } from './ProfileSetupWizard';
import { AzraqLogo } from './AzraqLogo';
import { getOptimizedUnsplashUrl } from '../utils/imageOptimization';

const COUNTRY_CODES = [
  { code: '+880', country: 'BD', name: 'Bangladesh (+880)' },
  { code: '+1', country: 'US', name: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', name: 'United Kingdom (+44)' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia (+966)' },
  { code: '+971', country: 'AE', name: 'UAE / Dubai (+971)' },
  { code: '+60', country: 'MY', name: 'Malaysia (+60)' },
  { code: '+65', country: 'SG', name: 'Singapore (+65)' },
  { code: '+66', country: 'TH', name: 'Thailand (+66)' },
  { code: '+91', country: 'IN', name: 'India (+91)' },
  { code: '+974', country: 'QA', name: 'Qatar (+974)' },
  { code: '+90', country: 'TR', name: 'Turkey (+90)' },
];

const RATE_LIMIT_KEY = 'azraq_auth_attempts';
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins

function checkRateLimit(): { allowed: boolean; remainingAttempts: number; retryMinutes: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    let history: number[] = raw ? JSON.parse(raw) : [];
    history = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (history.length >= RATE_LIMIT_MAX) {
      const oldest = Math.min(...history);
      const retryMs = oldest + RATE_LIMIT_WINDOW_MS - now;
      return { allowed: false, remainingAttempts: 0, retryMinutes: Math.ceil(retryMs / 60000) };
    }
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX - history.length, retryMinutes: 0 };
  } catch {
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX, retryMinutes: 0 };
  }
}

function recordAuthAttempt() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    let history: number[] = raw ? JSON.parse(raw) : [];
    history = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    history.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(history));
  } catch {}
}

function resetRateLimitOnSuccess() {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {}
}

interface AuthModalProps {
  brandTitle?: string;
  onNavigate?: (view: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  brandTitle = 'AZRAQ TRIPS',
  onNavigate,
}) => {
  const {
    authModalOpen,
    authModalView,
    returnTo,
    pendingAction,
    closeAuthModal,
    setAuthModalView,
    setReturnTo,
    sendEmailOtp,
    verifyEmailOtp,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    showToast,
    isLoading: authGlobalLoading,
  } = useAuth();

  // Internal view modes: 'email_otp' | 'otp_verify' | 'profile_setup' | 'password_login' | 'register' | 'forgot_password' | 'google_prompt'
  const [internalView, setInternalView] = useState<
    'email_otp' | 'otp_verify' | 'profile_setup' | 'password_login' | 'register' | 'forgot_password' | 'google_prompt'
  >('password_login');

  // Form states
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Google Confirmation fields (for popup fallback)
  const [googleConfirmEmail, setGoogleConfirmEmail] = useState('');
  const [googleConfirmName, setGoogleConfirmName] = useState('');

  // Traditional password fields
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+880');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync with global authModalView
  useEffect(() => {
    if (authModalView === 'register') {
      setInternalView('register');
    } else if (authModalView === 'login') {
      setInternalView('password_login');
    } else if (authModalView === 'profile_setup') {
      setInternalView('profile_setup');
    } else if (authModalView === 'google_prompt') {
      setInternalView('google_prompt');
      if (email && !googleConfirmEmail) {
        setGoogleConfirmEmail(email);
      }
    }
  }, [authModalView, email, googleConfirmEmail]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset errors when view changes
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [internalView]);

  // 1. Passwordless OTP: Send Code
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const limit = checkRateLimit();
    if (!limit.allowed) {
      setErrorMessage(`Too many login attempts. Please wait ${limit.retryMinutes} minutes.`);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      recordAuthAttempt();
      const res = await sendEmailOtp(email.trim());

      if (res.success) {
        setSuccessMessage('A 6-digit verification code has been sent to your email.');
        const testCode = res.demoOtp || res.demoCode;
        if (testCode) {
          setDemoOtpCode(testCode);
        }
        setResendTimer(60);
        setInternalView('otp_verify');
        // Auto focus first OTP input after view transition
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error while sending verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle OTP input digits
  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      // Paste behavior
      const pasted = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextEmpty = newDigits.findIndex((d) => !d);
      const targetIdx = nextEmpty === -1 ? 5 : nextEmpty;
      otpInputRefs.current[targetIdx]?.focus();

      if (newDigits.every((d) => d !== '')) {
        verifyCodeString(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = clean;
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      verifyCodeString(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Verify OTP Code
  const verifyCodeString = async (code: string) => {
    setErrorMessage('');
    try {
      setIsSubmitting(true);
      const res = await verifyEmailOtp(email.trim(), code);

      if (res.success) {
        resetRateLimitOnSuccess();
        if (res.isNewUser) {
          setInternalView('profile_setup');
        } else {
          handleFinalSuccessRedirect();
        }
      } else {
        setErrorMessage(res.error || 'Invalid or expired code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }
    verifyCodeString(fullCode);
  };

  // 4. Final Success Routing
  const handleFinalSuccessRedirect = () => {
    closeAuthModal();
    if (pendingAction?.onExecute) {
      try {
        pendingAction.onExecute();
      } catch (err) {
        console.warn('Pending action execution error:', err);
      }
    } else if (returnTo) {
      if (onNavigate) onNavigate(returnTo);
      setReturnTo(null);
    }
  };

  // 5. Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    try {
      setIsGoogleProcessing(true);
      const res = await loginWithGoogle();
      if (res.success) {
        resetRateLimitOnSuccess();
        handleFinalSuccessRedirect();
      } else {
        if (res.error?.includes('restricted') || res.error?.includes('confirm') || res.error?.includes('closed')) {
          setInternalView('google_prompt');
          if (email && !googleConfirmEmail) {
            setGoogleConfirmEmail(email);
          }
        }
        setErrorMessage(res.error || 'Google sign-in could not be completed.');
      }
    } catch (err: any) {
      setInternalView('google_prompt');
      setErrorMessage(err?.message || 'Google sign-in encountered an error.');
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  // 5b. Google Account Confirmation Submit (Popup fallback)
  const handleGoogleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanGoogleEmail = googleConfirmEmail.trim().toLowerCase();
    if (!cleanGoogleEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanGoogleEmail)) {
      setErrorMessage('Please enter a valid Google account email.');
      return;
    }

    try {
      setIsGoogleProcessing(true);
      const res = await loginWithGoogle(
        cleanGoogleEmail,
        googleConfirmName.trim()
      );
      if (res.success) {
        resetRateLimitOnSuccess();
        handleFinalSuccessRedirect();
      } else {
        setErrorMessage(res.error || 'Could not verify Google account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google account verification failed.');
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  // 6. Traditional Password Login
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const limit = checkRateLimit();
    if (!limit.allowed) {
      setErrorMessage(`Too many login attempts. Please wait ${limit.retryMinutes} minutes.`);
      return;
    }

    if (!email.trim() || !loginPassword) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      recordAuthAttempt();
      const res = await loginWithEmail(email.trim(), loginPassword);

      if (res.success) {
        resetRateLimitOnSuccess();
        handleFinalSuccessRedirect();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Traditional Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      let cleanDigits = regPhone.replace(/\D/g, '');
      if (regCountryCode === '+880' && cleanDigits.startsWith('0')) {
        cleanDigits = cleanDigits.substring(1);
      }
      const fullPhone = cleanDigits ? `${regCountryCode}${cleanDigits}` : '+880';

      const res = await registerWithEmail(
        regFullName.trim(),
        email.trim(),
        fullPhone,
        'Bangladesh',
        regPassword,
        agreeTerms
      );

      if (res.success) {
        resetRateLimitOnSuccess();
        handleFinalSuccessRedirect();
      } else {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. Password Reset Submit
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email to receive reset instructions.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await sendPasswordReset(email.trim());
      if (res.success) {
        setSuccessMessage(res.message || 'Password reset link sent to your email.');
        setResendTimer(60);
      } else {
        setErrorMessage(res.error || 'Failed to send reset email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error sending password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-[#071A33]/60 backdrop-blur-lg transition-opacity"
      />

      {/* Two-Column Editorial Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-4xl bg-white/90 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(7,26,51,0.2)] border border-white/70 flex flex-col md:flex-row my-auto"
      >
        {/* LEFT COLUMN: Editorial Visual Brand Panel (Desktop only) */}
        <div className="hidden md:flex md:w-5/12 bg-[#071A33] relative overflow-hidden flex-col justify-between p-8 text-white shrink-0">
          <img
            src={getOptimizedUnsplashUrl(
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
              800,
              80
            )}
            alt="Scenic coastal shoreline"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A33] via-[#071A33]/85 to-[#071A33]/60" />

          {/* Top: Brand Header */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5 border border-white/20">
                <AzraqLogo size={36} className="w-full h-full" />
              </div>
              <div>
                <span className="font-bold text-base tracking-wider text-white font-serif-display block">
                  {brandTitle}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">Tours & Travels • Dhaka</span>
              </div>
            </div>
          </div>

          {/* Middle: Brand Motto & Verified Pillars */}
          <div className="relative z-10 space-y-6 my-auto py-8">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#17BEBB] font-mono">
                VIP Access
              </span>
              <h3 className="text-2xl font-normal font-serif-display text-white leading-snug">
                Travel farther. Plan better. Experience more.
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200 font-inter">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#17BEBB]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#17BEBB]" />
                </div>
                <span>Direct partner flight booking from Dhaka</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#17BEBB]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#17BEBB]" />
                </div>
                <span>Custom AI itineraries grounded in live maps</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#17BEBB]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#17BEBB]" />
                </div>
                <span>Dedicated Banani concierge assistance</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 font-inter">
            Licensed Travel Agency Desk • Banani, Dhaka
          </div>
        </div>

        {/* RIGHT COLUMN: Focused Auth Form */}
        <div className="w-full md:w-7/12 flex flex-col justify-between p-6 sm:p-8 bg-white/85 backdrop-blur-xl overflow-y-auto max-h-[85vh] sm:max-h-[90vh]">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            {/* Mobile Brand indicator */}
            <div className="md:hidden flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-xs flex items-center justify-center p-0.5 border border-slate-200">
                <AzraqLogo size={28} className="w-full h-full" />
              </div>
              <span className="font-bold text-sm text-[#071A33] font-serif-display">{brandTitle}</span>
            </div>

            <div className="hidden md:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                {internalView === 'register' ? 'New Traveler Registration' : 'Secure Authentication'}
              </span>
            </div>

            {/* Close Button (44x44 Touch Target) */}
            <button
              onClick={closeAuthModal}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="py-4 space-y-5">
            {/* Top Segmented Navigation Tabs */}
            {internalView !== 'profile_setup' && (
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    setInternalView('password_login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    internalView === 'password_login' || internalView === 'email_otp' || internalView === 'otp_verify' || internalView === 'forgot_password' || internalView === 'google_prompt'
                      ? 'bg-white text-[#071A33] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInternalView('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    internalView === 'register'
                      ? 'bg-white text-[#071A33] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Alert Banners */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed font-medium">{errorMessage}</div>
                <button
                  onClick={() => setErrorMessage('')}
                  className="text-rose-500 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-[#EAF7F8] border border-[#17BEBB]/40 text-[#071A33] text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#17BEBB] shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed font-medium">{successMessage}</div>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-[#071A33] hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* VIEW 1: EMAIL ENTRY (PASSWORDLESS OTP) */}
            {internalView === 'email_otp' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-normal font-serif-display text-[#071A33]">
                    Sign In to Azraq
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-inter">
                    Access saved itineraries, flight bookings, and priority visa concierge.
                  </p>
                </div>

                {/* 1-Click Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleProcessing || isSubmitting}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGoogleProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#071A33]" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200" />
                  <span className="bg-white px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    Or with email OTP
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.name@example.com"
                        autoFocus
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] text-slate-900 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#17BEBB]" />
                        <span>Sending 6-Digit Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="w-4 h-4 text-[#17BEBB]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Secondary navigation */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500 font-inter">
                  <button
                    type="button"
                    onClick={() => setInternalView('password_login')}
                    className="text-[#071A33] hover:underline font-semibold cursor-pointer"
                  >
                    Sign in with Password
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setInternalView('register')}
                    className="text-[#071A33] hover:underline font-semibold cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: OTP VERIFICATION */}
            {internalView === 'otp_verify' && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setInternalView('email_otp')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change email</span>
                </button>

                <div className="text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#071A33]/5 text-[#071A33] mb-2">
                    <KeyRound className="w-6 h-6 text-[#17BEBB]" />
                  </div>
                  <h2 className="text-2xl font-normal font-serif-display text-[#071A33]">
                    Verify Your Email
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                    We sent a 6-digit code to <span className="font-bold text-slate-800">{email}</span>
                  </p>
                </div>

                {demoOtpCode && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Test Code:</span>
                      <code className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-bold text-amber-900">
                        {demoOtpCode}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = demoOtpCode.split('');
                        setOtpDigits(digits);
                        verifyCodeString(demoOtpCode);
                      }}
                      className="text-[11px] font-bold text-[#071A33] hover:underline cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-center text-slate-500">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-white focus:outline-none transition-all ${
                            digit
                              ? 'border-[#071A33] text-[#071A33] ring-2 ring-[#071A33]/15'
                              : 'border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#17BEBB] focus:border-[#17BEBB]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpDigits.some((d) => !d)}
                    className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#17BEBB]" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4 text-[#17BEBB]" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-1">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-slate-500">
                      Resend code in <span className="font-bold text-slate-800">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendEmailOtp()}
                      disabled={isSubmitting}
                      className="text-xs font-bold text-[#071A33] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend 6-Digit Code</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: PROFILE SETUP */}
            {internalView === 'profile_setup' && (
              <ProfileSetupWizard onFinished={handleFinalSuccessRedirect} />
            )}

            {/* VIEW 4: PASSWORD SIGN IN */}
            {internalView === 'password_login' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#071A33]">
                    Welcome Back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Sign in to access your flight bookings, saved itineraries, and visa concierge.
                  </p>
                </div>

                {/* 1-Click Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleProcessing || isSubmitting}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGoogleProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#071A33]" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200" />
                  <span className="bg-white px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    Or with email & password
                  </span>
                </div>

                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setInternalView('forgot_password')}
                        className="text-xs font-semibold text-[#071A33] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] text-slate-900 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#17BEBB]" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 text-[#17BEBB]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Passwordless OTP toggle */}
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setInternalView('email_otp');
                      setErrorMessage('');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#071A33] bg-slate-50/70 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-[#071A33] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#17BEBB]" />
                    <span>Prefer passwordless? Sign in with 6-Digit Email Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 5: REGISTRATION FORM */}
            {internalView === 'register' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#071A33]">
                    Create Traveler Account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Save customized itineraries, track live flight bookings, and access concierge care.
                  </p>
                </div>

                {/* 1-Click Google Sign-Up */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleProcessing || isSubmitting}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGoogleProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#071A33]" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign up with Google</span>
                </button>

                {/* Subtle Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200" />
                  <span className="bg-white px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    Or register with email
                  </span>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Farhan Ahmed"
                      className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Mobile / WhatsApp Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={regCountryCode}
                        onChange={(e) => setRegCountryCode(e.target.value)}
                        className="w-28 min-h-[42px] py-2 px-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="01712345678"
                        className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33] font-medium"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="accent-[#071A33] w-4 h-4 rounded"
                    />
                    <span>I agree to the Terms of Service & Privacy Policy</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#17BEBB]" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 text-[#17BEBB]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 6: FORGOT PASSWORD */}
            {internalView === 'forgot_password' && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setInternalView('password_login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>

                <div>
                  <h2 className="text-2xl font-normal font-serif-display text-[#071A33]">
                    Reset Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your registered email to receive reset instructions.
                  </p>
                </div>

                <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071A33]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto text-[#17BEBB]" />
                    ) : (
                      <span>Send Reset Instructions</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 7: GOOGLE ACCOUNT CONFIRMATION */}
            {internalView === 'google_prompt' && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setInternalView('password_login')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs mx-auto mb-1">
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold tracking-[-0.025em] text-[#071A33]">
                    Confirm Google Sign-In
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Browser popup restrictions prevented the automatic Google window. Confirm your Google email below to sign in directly.
                  </p>
                </div>

                <form onSubmit={handleGoogleConfirmSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Google Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={googleConfirmEmail}
                        onChange={(e) => setGoogleConfirmEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        autoFocus
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Full Name (Optional)
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={googleConfirmName}
                        onChange={(e) => setGoogleConfirmName(e.target.value)}
                        placeholder="e.g. Istihad Ahmed"
                        className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4285F4] text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGoogleProcessing || !googleConfirmEmail.trim()}
                    className="w-full min-h-[44px] py-3 px-5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying Google Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with Google Account</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-inter">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Popup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInternalView('password_login')}
                    className="text-[#071A33] hover:underline font-semibold cursor-pointer"
                  >
                    Use Password Instead
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-inter">
            Protected by Azraq Encrypted Authentication Desk
          </div>
        </div>
      </motion.div>
    </div>
  );
};
