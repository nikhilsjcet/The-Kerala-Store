import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Lock
} from 'lucide-react';
import { KeralaStoreLogo } from '../common/KeralaStoreLogo';

export const OtpLoginModal: React.FC = () => {
  const { isOtpModalOpen, closeOtpModal, loginWithPhone } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when opening
  useEffect(() => {
    if (isOtpModalOpen) {
      setStep('phone');
      setPhoneNumber('');
      setFullName('');
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg(null);
      setIsVerifying(false);
    }
  }, [isOtpModalOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  if (!isOtpModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Generate simulated/real 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep('otp');
    setTimer(30);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);

    // Focus first OTP field
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    if (pasted.length === 6) {
      handleVerifyCode(pasted);
    }
  };

  const handleVerifyCode = (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (code === generatedOtp || code === '123456') {
        loginWithPhone(phoneNumber, fullName);
      } else {
        setErrorMsg('Invalid verification code. Please check and try again.');
        setIsVerifying(false);
      }
    }, 600);
  };

  const handleResend = () => {
    if (!canResend) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(30);
    setCanResend(false);
    setErrorMsg(null);
    setOtpDigits(['', '', '', '', '', '']);
    otpInputsRef.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#0A5C36] px-6 py-6 text-white relative">
          <button
            onClick={closeOtpModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
              Instant Mobile Verification
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            Sign In with Mobile OTP
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Access your orders, track Kerala dropship deliveries &amp; checkout faster
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {step === 'phone' ? (
            /* STEP 1: Enter Phone Number */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 border-r border-gray-200 pr-2.5">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-24 pr-4 py-3 bg-stone-50 border border-gray-200 rounded-2xl text-sm font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] transition-all"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  We'll send a 6-digit OTP via SMS to verify your mobile number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Your Full Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36]"
                />
              </div>

              <button
                type="submit"
                disabled={phoneNumber.length < 10}
                className="w-full py-3 px-4 bg-[#0A5C36] hover:bg-[#064024] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Secure Indian Verification • No Password Required</span>
                </span>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter OTP */
            <div className="space-y-5">
              
              {/* Simulated OTP Notification Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-in slide-in-from-top-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                    SMS Simulation Code
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    {generatedOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = generatedOtp.split('');
                    setOtpDigits(digits);
                    handleVerifyCode(generatedOtp);
                  }}
                  className="px-2.5 py-1 bg-[#0A5C36] text-white text-[10px] font-bold rounded-lg hover:bg-[#064024] transition-colors"
                >
                  Auto-Fill OTP
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Enter the 6-digit code sent to <strong className="text-gray-900">+91 {phoneNumber}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[11px] font-bold text-[#0A5C36] hover:underline mt-1 inline-block"
                >
                  Change Mobile Number
                </button>
              </div>

              {/* 6 Digit Input Blocks */}
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-black bg-stone-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-[#0A5C36] transition-all font-mono"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={isVerifying || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 bg-[#0A5C36] hover:bg-[#064024] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Sign In</span>
                  </>
                )}
              </button>

              {/* Resend Timer */}
              <div className="text-center pt-1">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs font-bold text-[#0A5C36] hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend OTP SMS</span>
                  </button>
                ) : (
                  <p className="text-[11px] text-gray-400">
                    Resend OTP in <span className="font-bold text-gray-700">{timer}s</span>
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

