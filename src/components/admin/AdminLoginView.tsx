import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Mail, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KeralaStoreLogo } from '../common/KeralaStoreLogo';

interface AdminLoginViewProps {
  onBackToStorefront: () => void;
  onSuccess?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToStorefront, onSuccess }) => {
  const { verifyMasterAdminPasscode, signInWithEmail } = useAuth();
  
  const [authMethod, setAuthMethod] = useState<'passcode' | 'email'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  
  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Passcode Submission
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const ok = verifyMasterAdminPasscode(passcode);
    setIsLoading(false);

    if (ok) {
      setSuccessMsg('Access Granted! Redirecting to Store Admin Dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMsg('Access Denied: Invalid Master Passcode. Please check and try again.');
    }
  };

  // Handle Email & Password Submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await signInWithEmail(email, password);
      setIsLoading(false);

      if (res?.error) {
        setErrorMsg(res.error.message || 'Invalid admin credentials.');
      } else {
        setSuccessMsg('Admin verified! Welcome back.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 500);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Authentication error.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stone-800/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 z-10">
        
        {/* Back to Storefront Link */}
        <button
          onClick={onBackToStorefront}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-emerald-400 font-semibold transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Public Storefront</span>
        </button>

        {/* Portal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Admin Portal</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Restricted
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-1.5 max-w-xs mx-auto">
            The Kerala Store management portal. Enter authorized credentials to manage dropshipping inventory, orders &amp; settings.
          </p>
        </div>

        {/* Method Toggle: Passcode vs Email */}
        <div className="flex bg-stone-900 p-1 rounded-2xl mb-6 border border-stone-800">
          <button
            type="button"
            onClick={() => { setAuthMethod('passcode'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMethod === 'passcode'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Master Passcode
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMethod === 'email'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Admin Email &amp; Password
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{successMsg}</p>
          </div>
        )}

        {/* METHOD 1: Master Store Passcode Form */}
        {authMethod === 'passcode' && (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Master Admin Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Enter store passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm font-mono text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Master admin key configured in project credentials
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passcode.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <span>Unlock Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* METHOD 2: Email & Password Form */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@thekeralastore.shop"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <span>Verify &amp; Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-500">
            TheKeralaStore™ • Dropshipping Operations • Kottayam, Kerala
          </p>
        </div>

      </div>
    </div>
  );
};

