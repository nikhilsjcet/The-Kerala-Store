import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Mail, 
  User, 
  Phone,
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  KeyRound,
  RotateCcw
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithGoogle,
    sendEmailOtp,
    verifyEmailOtp
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const resetFormState = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setOtpCode('');
  };

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    resetFormState();
    setActiveTab(tab);
  };

  // 1. Continue with Google
  const handleGoogleSignIn = async () => {
    resetFormState();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setErrorMsg(res.error.message || 'Could not sign in with Google. Please try email verification.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Send 6-digit OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (activeTab === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await sendEmailOtp(cleanEmail, fullName.trim(), phoneNumber.trim());
      setIsLoading(false);

      if (error) {
        // If Supabase rate limit or provider error, provide clear guidance
        setErrorMsg(error.message || 'Failed to send OTP. Please check your email address.');
      } else {
        setOtpSent(true);
        setCountdown(45);
        setSuccessMsg(`A 6-digit verification OTP has been sent to ${cleanEmail}. Check your inbox or spam folder!`);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Network error sending OTP.');
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyEmailOtp(email.trim().toLowerCase(), cleanCode, fullName.trim(), phoneNumber.trim());
      setIsLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired OTP. Please check the code or request a new one.');
      } else {
        setSuccessMsg(activeTab === 'signup' ? 'Account created and verified! Welcome to The Kerala Store.' : 'OTP verified! Signed in successfully.');
        setTimeout(() => closeAuthModal(), 1200);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Error verifying OTP code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-[#0A5C36] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            The Kerala Store
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Access your order tracking, wishlist, and exclusive drops
          </p>
        </div>

        {/* Tabs: Sign In / Sign Up */}
        <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{successMsg}</p>
          </div>
        )}

        {/* METHOD 1: One-Click Google Authentication */}
        {!otpSent && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl text-xs sm:text-sm font-bold text-gray-700 flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer"
            >
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
              <span>Continue with Google</span>
            </button>

            {/* Visual Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Or with Email OTP
              </span>
            </div>
          </div>
        )}

        {/* METHOD 2: Email + OTP Verification Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            {activeTab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Sreejith Menon"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={activeTab === 'signup'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number <span className="text-gray-400 font-normal">(Optional for delivery updates)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 98460 12345"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#0A5C36] hover:bg-[#08482A] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Sending OTP Code...</span>
              ) : (
                <>
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter 6-digit OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <span className="text-[11px] text-gray-500 block">OTP sent to:</span>
              <strong className="text-xs text-gray-800 font-mono">{email}</strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-gray-300 rounded-xl text-center text-lg font-black tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/30 focus:border-[#0A5C36]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full py-3 bg-[#0A5C36] hover:bg-[#08482A] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify &amp; {activeTab === 'signup' ? 'Complete Sign Up' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
              >
                Change email
              </button>

              <button
                type="button"
                disabled={countdown > 0 || isLoading}
                onClick={handleSendOtp}
                className="font-bold text-[#0A5C36] hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
