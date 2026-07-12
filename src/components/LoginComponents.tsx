import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { GoogleIcon, XCircleIcon, ShieldIcon, SpinnerIcon } from './Icons';

// ─── Per-user passwords ──────────────────────────────────────────────────────

const USER_PASSWORDS: Record<string, string> = {
  'zbragt937@shopeemobile-external.com': 'Shopee937!',
  'zbragt992@shopeemobile-external.com': 'Shopee992!',
  'zbragt940@shopeemobile-external.com': 'Shopee940!',
  'zbragt952@shopeemobile-external.com': 'Shopee952!',
};

// ─── Google Sign-In Modal ────────────────────────────────────────────────────

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string) => void;
  isLoading: boolean;
}

export const GoogleSignInModal = ({ isOpen, onClose, onSelectAccount, isLoading }: GoogleSignInModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = () => {
    if (!email.trim() || !email.includes('@')) {
      setShowError(true);
      setErrorMsg('Enter a valid email address');
      return;
    }
    setShowError(false);
    setErrorMsg('');
    setPassword('');
    setStep('password');
  };

  const handleSignIn = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const correctPassword = USER_PASSWORDS[normalizedEmail];

    // Email not in system — skip password check, let App handle denial
    if (!correctPassword) {
      onSelectAccount(normalizedEmail);
      return;
    }

    if (!password) {
      setShowError(true);
      setErrorMsg('Enter your password');
      return;
    }

    if (password !== correctPassword) {
      setShowError(true);
      setErrorMsg('Wrong password. Try again or click Forgot password to reset it.');
      return;
    }

    // Correct password
    setShowError(false);
    onSelectAccount(normalizedEmail);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'email') handleNext();
      else handleSignIn();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setStep('email');
      setShowError(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <GoogleIcon size={28} />
          <h2 className="mt-4 text-[22px] font-normal text-slate-800">
            {step === 'email' ? 'Sign in' : 'Welcome'}
          </h2>
          {step === 'email' ? (
            <p className="mt-1 text-sm text-slate-600">Use your Google Account</p>
          ) : (
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 text-sm text-slate-600">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{email[0]?.toUpperCase()}</span>
              </div>
              <span className="truncate max-w-[240px]">{email}</span>
            </div>
          )}
        </div>

        <div className="px-8 pb-3" onKeyDown={handleKeyDown}>
          {step === 'email' ? (
            <div className="space-y-1">
              <div className={cn(
                'relative rounded-md border transition-colors duration-200',
                showError ? 'border-red-400' : 'border-slate-300 focus-within:border-blue-500'
              )}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setShowError(false); }}
                  placeholder="Email or phone"
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {showError && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-slide-down">
                  <XCircleIcon className="w-3 h-3" />
                  {errorMsg}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-3 pt-2">
                Not your computer? Use Guest mode to sign in privately.{' '}
                <span className="text-blue-600 font-medium cursor-pointer hover:underline">Learn more about using Guest mode</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                To continue, Google will share your name, email address, and profile picture with Shopee VKAM Back Office.
              </p>
              <div className={cn(
                'relative rounded-md border transition-colors duration-200',
                showError ? 'border-red-400' : 'border-slate-300 focus-within:border-blue-500'
              )}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setShowError(false); }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 text-sm text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {showError && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-slide-down">
                  <XCircleIcon className="w-3 h-3" />
                  {errorMsg}
                </p>
              )}
              {!showError && (
                <p className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                  Forgot password?
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-8 pb-8 pt-4 flex items-center justify-between">
          {step === 'email' ? (
            <>
              <button className="text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md px-3 py-2 transition-colors">
                Create account
              </button>
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('email'); setShowError(false); }}
                className="text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md px-3 py-2 transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <SpinnerIcon className="w-4 h-4" />}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <select className="text-xs text-slate-500 bg-transparent outline-none cursor-pointer">
            <option>English (United States)</option>
          </select>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="cursor-pointer hover:text-slate-700">Help</span>
            <span className="cursor-pointer hover:text-slate-700">Privacy</span>
            <span className="cursor-pointer hover:text-slate-700">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Access Denied Screen ────────────────────────────────────────────────────

interface AccessDeniedProps {
  email: string;
  onTryAgain: () => void;
}

export const AccessDenied = ({ email, onTryAgain }: AccessDeniedProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 animate-fade-in" />
    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
      <div className="p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 animate-shake">
          <XCircleIcon className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Access Denied</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          The account <span className="font-medium text-slate-700">{email}</span> is not authorized to access this application.
        </p>
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-start gap-2">
            <ShieldIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 text-left">
              Only authorized Shopee VKAM bidding workstream accounts can access this platform. Please contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onTryAgain}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            Try Another Account
          </button>
          <button
            onClick={onTryAgain}
            className="w-full py-2.5 text-slate-500 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
);
