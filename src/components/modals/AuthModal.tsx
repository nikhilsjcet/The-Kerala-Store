import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeralaStoreLogo } from '../common/KeralaStoreLogo';
import { 
  X, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

const maskEmail = (rawEmail: string): string => {
  const parts = rawEmail.trim().split('@');
  if (parts.length !== 2) return rawEmail;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const visibleCount = Math.min(3, Math.max(1, Math.floor(name.length / 2)));
  return `${name.slice(0, visibleCount)}***@${domain}`;
};

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendEmailOtp,
    verifyEmailOtp,
    resendSignupOtp
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');
  const [isOtpLoginMode, setIsOtpLoginMode] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  
  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpFlowType, setOtpFlowType] = useState<'signup' | 'email'>('signup');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
    setIsOtpLoginMode(false);
    setUnconfirmedEmail(null);
  };

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    resetFormState();
    setActiveTab(tab);
  };

  // 1. Google OAuth
  const handleGoogleSignIn = async () => {
    resetFormState();
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        const msg = res.error.message || JSON.stringify(res.error);
        if (msg.includes('provider is not enabled') || msg.includes('validation_failed') || msg.includes('Unsupported provider')) {
          setErrorMsg('Google Sign-In is not enabled in your Supabase dashboard yet (Authentication -> Providers -> Google). Please use email sign up below.');
        } else {
          setErrorMsg(res.error.message || 'Could not connect to Google. Please use email sign up below.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign in failed. Please use email sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. New Signup Flow: supabase.auth.signUp()
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUpWithEmail(cleanEmail, password, cleanName);
      setIsLoading(false);

      if (res.error) {
        const rawMsg = (res.error.message || '').toLowerCase();
        if (rawMsg.includes('already registered') || rawMsg.includes('already exists') || rawMsg.includes('user already exists')) {
          setErrorMsg('An account with this email is already registered. Please switch to Sign In.');
        } else if (rawMsg.includes('rate limit') || rawMsg.includes('frequency') || rawMsg.includes('seconds')) {
          setErrorMsg('Too many requests. For security, please wait 60 seconds before trying again.');
        } else {
          setErrorMsg(res.error.message || 'Could not register account. Please check your details.');
        }
        return;
      }

      // Check whether user already existed in Supabase (identities array is empty)
      if (res.isAlreadyRegistered) {
        setErrorMsg('An account with this email is already registered and confirmed. Please sign in with your password.');
        return;
      }

      // Successful new signup -> Supabase dispatches confirmation OTP
      setOtpSent(true);
      setOtpFlowType('signup');
      setCountdown(60);
      setSuccessMsg('Verification code requested. Please check your inbox and spam folder (delivery typically takes 1–3 minutes).');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Network error during signup.');
    }
  };

  // 3. Password Login: strictly supabase.auth.signInWithPassword()
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnconfirmedEmail(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithEmail(cleanEmail, password);
      setIsLoading(false);

      if (res.error) {
        const raw = (res.error.message || '').toLowerCase();
        
        // If email has not been confirmed yet
        if (raw.includes('not confirmed') || raw.includes('confirm your email') || res.error.code === 'email_not_confirmed') {
          setUnconfirmedEmail(cleanEmail);
          setErrorMsg('Your email address has not been confirmed yet. Please verify your account before signing in.');
          return;
        }

        if (raw.includes('invalid login credentials') || raw.includes('invalid credentials')) {
          setErrorMsg('Incorrect email or password. Please try again.');
        } else {
          setErrorMsg(res.error.message || 'Sign in failed. Please check your credentials.');
        }
        return;
      }

      setSuccessMsg('Signed in successfully! Welcome back.');
      setTimeout(() => closeAuthModal(), 600);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Authentication error.');
    }
  };

  // 3b. Explicit handler to resend unconfirmed signup code (when user explicitly requests it)
  const handleResendUnconfirmedSignupOtp = async () => {
    if (!unconfirmedEmail || isResending || countdown > 0) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await resendSignupOtp(unconfirmedEmail);
      setIsResending(false);

      if (res.error) {
        setErrorMsg(res.error.message || 'Could not resend confirmation code. Please wait a moment.');
        return;
      }

      setOtpSent(true);
      setOtpFlowType('signup');
      setCountdown(60);
      setSuccessMsg('Confirmation code requested. If unconfirmed, please check your inbox and spam folder.');
    } catch (err: any) {
      setIsResending(false);
      setErrorMsg(err?.message || 'Network error resending code.');
    }
  };

  // 4. Passwordless Login: strictly supabase.auth.signInWithOtp({ shouldCreateUser: false })
  const handlePasswordlessOtpSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnconfirmedEmail(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await sendEmailOtp(cleanEmail, fullName.trim());
      setIsLoading(false);

      if (error) {
        const raw = (error.message || '').toLowerCase();
        if (raw.includes('not allowed') || raw.includes('not found') || raw.includes('signups not allowed')) {
          setErrorMsg('No registered account found with this email. Please switch to Sign Up to create an account first.');
        } else if (raw.includes('rate limit') || raw.includes('frequency') || raw.includes('seconds')) {
          setErrorMsg('Too many login attempts. Please wait 60 seconds before requesting another code.');
        } else {
          setErrorMsg(error.message || 'Could not send login code.');
        }
        return;
      }

      setOtpSent(true);
      setOtpFlowType('email');
      setCountdown(60);
      setSuccessMsg('One-time login code requested. If this email is registered, please check your inbox and spam folder.');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Network error sending OTP.');
    }
  };

  // 5. Verify the 6-Digit OTP (Distinct type: 'signup' vs 'email')
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyEmailOtp(
        email.trim().toLowerCase(), 
        cleanCode, 
        fullName.trim(), 
        '',
        otpFlowType
      );
      setIsLoading(false);

      if (error) {
        const raw = (error.message || '').toLowerCase();
        if (raw.includes('expired')) {
          setErrorMsg('The verification code has expired. Please click Resend Code to receive a fresh code.');
        } else if (raw.includes('already') || raw.includes('used')) {
          setErrorMsg('This code has already been used. Please request a new code or sign in.');
        } else if (raw.includes('invalid') || raw.includes('not match')) {
          setErrorMsg('Incorrect 6-digit code. Please check the code in your email and try again.');
        } else {
          setErrorMsg(error.message || 'Verification failed. Please check the code or click Resend.');
        }
        return;
      }

      setSuccessMsg(
        otpFlowType === 'signup'
          ? 'Email verified and account activated! Welcome to The Kerala Store.'
          : 'Signed in successfully! Welcome back.'
      );
      setTimeout(() => closeAuthModal(), 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Error verifying OTP code.');
    }
  };

  // 6. Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsResending(true);

    const cleanEmail = email.trim().toLowerCase();
    try {
      let res;
      if (otpFlowType === 'signup') {
        res = await resendSignupOtp(cleanEmail);
      } else {
        res = await sendEmailOtp(cleanEmail, fullName.trim());
      }
      setIsResending(false);

      if (res.error) {
        const raw = (res.error.message || '').toLowerCase();
        if (raw.includes('rate limit') || raw.includes('frequency') || raw.includes('seconds')) {
          setErrorMsg('For security purposes, please wait 60 seconds before requesting another code.');
        } else {
          setErrorMsg(res.error.message || 'Could not resend code. Please try again.');
        }
        return;
      }

      setCountdown(60);
      setSuccessMsg('A new verification code was requested. Please check your inbox and spam folder.');
    } catch (err: any) {
      setIsResending(false);
      setErrorMsg(err?.message || 'Network error resending code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-5 top-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Official KeralaStore Logo (Cart with Kerala map) */}
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="mb-2 select-none">
            <KeralaStoreLogo size="lg" />
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-xs text-center">
            Access your order tracking, wishlist, and dropshipping delivery updates
          </p>
        </div>

        {/* Top Tabs: Sign Up vs Sign In */}
        {!otpSent && (
          <div className="flex bg-stone-100 p-1 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900 shadow-2xs font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign Up (New Customer)
            </button>
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
          </div>
        )}

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-snug space-y-1.5 flex-1">
              <p>{errorMsg}</p>
              {unconfirmedEmail && !otpSent && (
                <button
                  type="button"
                  onClick={handleResendUnconfirmedSignupOtp}
                  disabled={isResending || countdown > 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100/90 text-red-800 hover:bg-red-200 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Sending Code...' : countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Confirmation Code'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{successMsg}</p>
          </div>
        )}

        {/* STEP 1: Form View (When OTP has not yet been sent) */}
        {!otpSent && (
          <div>
            {/* Google One-Click OAuth */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl text-xs sm:text-sm font-bold text-gray-700 flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
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

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {activeTab === 'signup' ? 'Or Sign Up with Email' : 'Or Sign In with Email'}
                </span>
              </div>
            </div>

            {/* A. SIGN UP FORM: Name + Email + Password -> Triggers 6-Digit Signup Confirmation */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Sreejith Menon"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                    />
                  </div>
                </div>

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

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Set Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">A 6-digit confirmation code will be requested for your email</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#0A5C36] hover:bg-[#08482A] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Sign Up &amp; Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* B. SIGN IN FORM */}
            {activeTab === 'signin' && (
              <div>
                {!isOtpLoginMode ? (
                  /* B1. Password Login */
                  <form onSubmit={handleSignIn} className="space-y-3">
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
                          autoFocus
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your account password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 bg-[#0A5C36] hover:bg-[#08482A] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <span>Sign In with Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsOtpLoginMode(true); resetFormState(); }}
                        className="text-xs text-[#0A5C36] hover:underline font-semibold cursor-pointer"
                      >
                        Sign in with a one-time email code instead
                      </button>
                    </div>
                  </form>
                ) : (
                  /* B2. Passwordless Login */
                  <form onSubmit={handlePasswordlessOtpSignIn} className="space-y-3">
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
                          autoFocus
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1">We will send a 6-digit login code to your registered email</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 bg-[#0A5C36] hover:bg-[#08482A] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? <span>Requesting Code...</span> : <span>Send One-Time Login Code</span>}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsOtpLoginMode(false); resetFormState(); }}
                        className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                      >
                        Back to Password Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: 6-Digit Verification Code Screen */}
        {otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
            {/* Masked Email Banner */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center">
              <span className="text-[11px] text-gray-500 block mb-0.5">
                {otpFlowType === 'signup' ? 'Signup confirmation requested for:' : 'One-time login code requested for:'}
              </span>
              <strong className="text-xs text-gray-900 font-mono tracking-wide">{maskEmail(email)}</strong>
              <span className="text-[10px] text-gray-500 block mt-1">
                Official sender: <strong className="text-gray-700">support@thekeralastore.shop</strong>
              </span>
            </div>

            {/* Delivery Truthfulness Banner (Task 6) */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-tight">
                Delivery depends on your email provider and Brevo relay (typically 1–3 minutes). Please be sure to check your <strong>Spam / Junk</strong> folder.
              </p>
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
                  placeholder="••••••"
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
                <span>Verifying Code...</span>
              ) : (
                <>
                  <span>Verify &amp; Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend and Edit Email Actions */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setOtpSent(false); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
              >
                Change Email / Back
              </button>

              <button
                type="button"
                disabled={countdown > 0 || isResending}
                onClick={handleResendOtp}
                className="font-bold text-[#0A5C36] hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {isResending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
