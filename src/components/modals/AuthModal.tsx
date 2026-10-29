import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeralaStoreLogo } from '../common/KeralaStoreLogo';
import { 
  X, 
  AlertCircle, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithGoogle 
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check URL parameters for OAuth errors on mount or redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    const errorDesc = searchParams.get('error_description') || '';
    const errCode = searchParams.get('error_code') || searchParams.get('error') || '';

    if (errorDesc || errCode) {
      if (errorDesc.includes('provider is not enabled') || errCode.includes('unsupported_provider')) {
        setErrorMessage('Google Sign-In is not enabled in your Supabase dashboard yet. Please enable the Google provider under Authentication -> Providers.');
      } else if (errCode === 'access_denied') {
        setErrorMessage('Google Sign-In was cancelled. Please try again when ready.');
      } else {
        setErrorMessage(decodeURIComponent(errorDesc || errCode));
      }
    } else if (hash.includes('error=')) {
      const match = hash.match(/error_description=([^&]+)/);
      if (match && match[1]) {
        setErrorMessage(decodeURIComponent(match[1].replace(/\+/g, ' ')));
      }
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        const rawMsg = res.error.message || JSON.stringify(res.error);
        if (
          rawMsg.includes('provider is not enabled') || 
          rawMsg.includes('validation_failed') || 
          rawMsg.includes('Unsupported provider')
        ) {
          setErrorMessage(
            'Google Sign-In provider is not enabled in your Supabase project yet. In Supabase Dashboard -> Authentication -> Providers, turn ON Google and add your Google Cloud OAuth Client ID & Secret.'
          );
        } else {
          setErrorMessage(res.error.message || 'Unable to connect with Google. Please try again.');
        }
        setIsLoading(false);
      }
      // Note: On success, Supabase initiates a window redirect to Google's OAuth consent screen.
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in encountered an error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) closeAuthModal();
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          disabled={isLoading}
          aria-label="Close modal"
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-7 sm:p-9 text-center space-y-6">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <KeralaStoreLogo size="lg" className="mx-auto" />
            <div className="space-y-1">
              <h2 id="auth-modal-title" className="text-2xl font-black text-gray-900 tracking-tight">
                Welcome to The Kerala Store
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
                Sign in with your Google account to track orders, save wishlists, and enjoy seamless shopping.
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-left text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Google Sign-In Action */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-2xl border-2 border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-[#0A5C36] rounded-full animate-spin" />
              ) : (
                /* Official Google Multicolored Icon */
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span className="group-hover:text-gray-900 transition-colors">
                {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>

            {/* Trust and Security Highlights */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0A5C36]" />
                100% Secure Sign In
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0A5C36]" />
                No password required
              </span>
            </div>
          </div>

          {/* Admin link footnote */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Store Administrator?</span>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                closeAuthModal();
                window.location.href = '/admin';
              }}
              className="text-[#0A5C36] font-bold hover:underline flex items-center gap-1"
            >
              Admin Portal
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
