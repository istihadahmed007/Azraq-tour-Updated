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

  // Internal view modes: 'email_otp' | 'otp_verify' | 'profile_setup' | 'password_login' | 'register' | 'forgot_password'
  const [internalView, setInternalView] = useState<
    'email_otp' | 'otp_verify' | 'profile_setup' | 'password_login' | 'register' | 'forgot_password'
  >('email_otp');

  // Form states
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Traditional password fields
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
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

  // Sync internal view when authModalView updates from context
  useEffect(() => {
    if (!authModalOpen) return;
    setErrorMessage('');
    setSuccessMessage('');

    if (authModalView === 'profile_setup') {
      setInternalView('profile_setup');
    } else if (authModalView === 'otp_verify') {
      setInternalView('otp_verify');
    } else if (authModalView === 'forgot_password') {
      setInternalView('forgot_password');
    } else if (authModalView === 'register') {
      setInternalView('register');
    } else if (authModalView === 'login') {
      setInternalView('email_otp');
    } else {
      setInternalView('email_otp');
    }
  }, [authModalOpen, authModalView]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Smart redirect helper on final completion
  const handleFinalSuccessRedirect = () => {
    closeAuthModal();

    // 1. Execute pending user action if any
    if (pendingAction?.onExecute) {
      try {
        pendingAction.onExecute();
      } catch (err) {
        console.warn('Pending action execution error:', err);
      }
    }

    // 2. Smart Redirect (returnTo preservation)
    if (returnTo) {
      const target = returnTo;
      setReturnTo(null);
      if (onNavigate) {
        onNavigate(target);
      } else if (typeof window !== 'undefined' && target.startsWith('/')) {
        window.location.href = target;
      }
    }
  };

  // 1. Send Email OTP (Step 1 -> Step 2)
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    const rate = checkRateLimit();
    if (!rate.allowed) {
      setErrorMessage(`Too many attempts. For your security, please wait ${rate.retryMinutes} minute(s).`);
      return;
    }

    try {
      setIsSubmitting(true);
      recordAuthAttempt();

      const res = await sendEmailOtp(cleanEmail);
      if (res.success) {
        resetRateLimitOnSuccess();
        setSuccessMessage(`A 6-digit one-time code has been sent to ${cleanEmail}.`);
        if (res.demoOtp) {
          setDemoOtpCode(res.demoOtp);
        }
        setResendTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        setInternalView('otp_verify');
        // Auto-focus first digit on next tick
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to send 6-digit code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error sending verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle OTP digit input changes
  const handleOtpDigitChange = (index: number, val: string) => {
    setErrorMessage('');
    const cleaned = val.replace(/\D/g, '');

    // Handle paste of full 6 digits
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      chars.forEach((c, idx) => {
        if (idx < 6) newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      const focusIndex = Math.min(chars.length, 5);
      otpInputRefs.current[focusIndex]?.focus();

      // If full 6 digits pasted, auto-verify
      if (chars.length === 6) {
        verifyCodeString(newDigits.join(''));
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if 6 digits completed
    if (cleaned && index === 5 && newDigits.every((d) => d.length === 1)) {
      verifyCodeString(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Verify OTP (Step 3)
  const verifyCodeString = async (code: string) => {
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const res = await verifyEmailOtp(email.trim().toLowerCase(), code);

      if (res.success) {
        resetRateLimitOnSuccess();
        // Check if user should be shown optional profile setup
        if (res.isNewUser) {
          setInternalView('profile_setup');
        } else {
          handleFinalSuccessRedirect();
        }
      } else {
        setErrorMessage(res.error || 'Invalid or expired 6-digit code. Please try again.');
        // Highlight inputs
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
    verifyCodeString(fullCode);
  };

  // 4. One-Click Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleProcessing(true);
      setErrorMessage('');
      const res = await loginWithGoogle();
      if (res.success) {
        resetRateLimitOnSuccess();
        handleFinalSuccessRedirect();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Sign-In could not be completed.');
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  // 5. Traditional Password Login (Fallback)
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      recordAuthAttempt();
      const res = await loginWithEmail(email.trim(), loginPassword, rememberMe);
      if (res.success) {
        resetRateLimitOnSuccess();
        handleFinalSuccessRedirect();
      } else {
        setErrorMessage(res.error || 'Incorrect email or password. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign in error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Registration Submit (Fallback)
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
      const cleanPhone = regPhone.replace(/\D/g, '');
      const fullPhone = cleanPhone ? `${regCountryCode} ${cleanPhone}` : '';

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
        setInternalView('profile_setup');
      } else {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Password Reset Submit
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="fixed inset-0 bg-[#073B4C]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer (Right Side on desktop, Full screen on mobile) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-screen max-w-md sm:max-w-lg bg-[#FFFFFF] border-l border-[#EAF7F8] shadow-2xl flex flex-col justify-between overflow-hidden text-[#17212B] z-10"
        >
          {/* Header Panel */}
          <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#073B4C] via-[#086788] to-[#073B4C] flex items-center justify-between sticky top-0 z-20 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5 border border-white/30 shrink-0">
                <AzraqLogo size={40} className="w-full h-full" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white font-serif-display leading-tight tracking-wide flex items-center gap-2">
                  <span>{brandTitle}</span>
                  <span className="text-[10px] font-sans uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#17BEBB]/20 text-[#17BEBB] border border-[#17BEBB]/30">
                    VIP Portal
                  </span>
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {internalView === 'profile_setup'
                    ? 'Complete Your Traveler Profile'
                    : internalView === 'otp_verify'
                    ? 'Verify 6-Digit Code'
                    : 'Tours & Travels • Seamless Sign In'}
                </p>
              </div>
            </div>

            {/* Close Button (44x44 Touch Target) */}
            <button
              onClick={closeAuthModal}
              className="w-11 h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all border border-white/20 shadow-xs cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAFC]">
            {/* Banner/Error Notifications */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs animate-shake">
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
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-[#EAF7F8] border border-[#17BEBB]/40 text-[#073B4C] text-xs flex items-start gap-2.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#17BEBB] shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed font-medium">{successMessage}</div>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-[#086788] hover:text-[#073B4C] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* VIEW 1: EMAIL ENTRY (PASSWORDLESS OTP) */}
            {internalView === 'email_otp' && (
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  {/* Hero Intro */}
                  <div className="text-center pt-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EAF7F8] text-[#086788] mb-3 border border-[#17BEBB]/30">
                      <Mail className="w-6 h-6 text-[#086788]" />
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display text-[#073B4C]">
                      Welcome to Azraq Trips
                    </h2>
                    <p className="text-sm text-[#64748B] mt-1 max-w-sm mx-auto leading-relaxed">
                      Enter your email to sign in or create an account with a fast 6-digit one-time code.
                    </p>
                  </div>

                  {/* 1-Click Google Sign-In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleProcessing || isSubmitting}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#17212B] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#086788]" />
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

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-slate-200" />
                    <span className="bg-[#F8FAFC] px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Or with email OTP
                    </span>
                  </div>

                  {/* Email Entry Form */}
                  <form onSubmit={handleSendEmailOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
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
                          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] text-[#17212B] transition-all font-medium shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Coral CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending 6-Digit Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send 6-Digit Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Secondary options */}
                <div className="pt-4 border-t border-slate-200/80 flex flex-col gap-2 text-center text-xs text-[#64748B]">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setInternalView('password_login')}
                      className="text-[#086788] hover:text-[#073B4C] font-semibold hover:underline cursor-pointer"
                    >
                      Sign in with Password
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setInternalView('register')}
                      className="text-[#086788] hover:text-[#073B4C] font-semibold hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: OTP VERIFICATION (STEP 3) */}
            {internalView === 'otp_verify' && (
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  {/* Top Bar Back button */}
                  <button
                    type="button"
                    onClick={() => setInternalView('email_otp')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#086788] hover:text-[#073B4C] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change email</span>
                  </button>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EAF7F8] text-[#17BEBB] mb-3 border border-[#17BEBB]/30">
                      <KeyRound className="w-6 h-6 text-[#086788]" />
                    </div>
                    <h2 className="text-2xl font-bold font-serif-display text-[#073B4C]">
                      Verify Your Email
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xs mx-auto leading-relaxed">
                      We sent a 6-digit verification code to{' '}
                      <span className="font-bold text-[#073B4C]">{email}</span>
                    </p>
                  </div>

                  {/* Demo OTP Helper if present */}
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
                        className="text-[11px] font-bold text-[#086788] hover:underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  {/* 6-Digit OTP Form */}
                  <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-center text-[#64748B]">
                        Enter 6-Digit Code
                      </label>
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
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
                            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-white focus:outline-none transition-all shadow-xs ${
                              digit
                                ? 'border-[#086788] text-[#073B4C] ring-2 ring-[#086788]/20'
                                : 'border-slate-200 text-slate-900 focus:ring-2 focus:ring-[#17BEBB] focus:border-[#17BEBB]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Verify CTA */}
                    <button
                      type="submit"
                      disabled={isSubmitting || otpDigits.some((d) => !d)}
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Resend Timer */}
                  <div className="text-center pt-2">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-[#64748B]">
                        Resend code in <span className="font-bold text-[#073B4C]">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendEmailOtp()}
                        disabled={isSubmitting}
                        className="text-xs font-bold text-[#086788] hover:text-[#073B4C] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend 6-Digit Code</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400">
                  Secured by Azraq Trips Authentication
                </div>
              </div>
            )}

            {/* VIEW 3: OPTIONAL PROFILE SETUP (STEP 4) */}
            {internalView === 'profile_setup' && (
              <ProfileSetupWizard onFinished={handleFinalSuccessRedirect} />
            )}

            {/* VIEW 4: TRADITIONAL PASSWORD LOGIN (FALLBACK) */}
            {internalView === 'password_login' && (
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setInternalView('email_otp')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#086788] hover:text-[#073B4C] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Passwordless OTP</span>
                  </button>

                  <div>
                    <h2 className="text-2xl font-bold font-serif-display text-[#073B4C]">
                      Password Sign In
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Sign in using your email and existing password.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
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
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] text-[#17212B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setInternalView('forgot_password')}
                          className="text-xs font-semibold text-[#086788] hover:underline cursor-pointer"
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
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] text-[#17212B]"
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
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* VIEW 5: REGISTER WITH DETAILS (FALLBACK) */}
            {internalView === 'register' && (
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setInternalView('email_otp')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#086788] hover:text-[#073B4C] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Email OTP</span>
                  </button>

                  <div>
                    <h2 className="text-2xl font-bold font-serif-display text-[#073B4C]">
                      Create Your Account
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Join Azraq Trips for VIP tour bookings and AI itinerary planning.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Tanvir Ahmed"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={regCountryCode}
                          onChange={(e) => setRegCountryCode(e.target.value)}
                          className="w-28 py-2 px-2 text-xs bg-white border border-slate-200 rounded-xl"
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
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB]"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="accent-[#FF6B5A] w-4 h-4 rounded"
                      />
                      <span>I agree to the Terms of Service & Privacy Policy</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <span>Create Account</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* VIEW 6: FORGOT PASSWORD */}
            {internalView === 'forgot_password' && (
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setInternalView('password_login')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#086788] hover:text-[#073B4C] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Login</span>
                  </button>

                  <div>
                    <h2 className="text-2xl font-bold font-serif-display text-[#073B4C]">
                      Reset Password
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Enter your email to receive password reset instructions.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
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
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <span>Send Reset Instructions</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
