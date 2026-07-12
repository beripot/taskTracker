import { useState, useCallback } from 'react';
import { cn } from './utils/cn';
import { GoogleSignInModal, AccessDenied } from './components/LoginComponents';
import { CheckCircleIcon, ShieldIcon, ShopeeLogo, GoogleIcon } from './components/Icons';
import TaskTracker from './components/TaskTracker';
import ContactSupport from './components/ContactSupport';

// ─── Allowed Emails ──────────────────────────────────────────────────────────

const ALLOWED_EMAILS = [
  'zbragt937@shopeemobile-external.com',
  'zbragt992@shopeemobile-external.com',
  'zbragt940@shopeemobile-external.com',
  'zbragt952@shopeemobile-external.com',
];

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthState = 'idle' | 'signing-in' | 'validating' | 'success' | 'denied';

interface UserInfo {
  email: string;
  name: string;
  avatar: string;
  photo: string;
}

type Page = 'login' | 'support';

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [showModal, setShowModal] = useState(false);
  const [deniedEmail, setDeniedEmail] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState<Page>('login');

  const userProfiles: Record<string, { avatar: string; photo: string }> = {
    'zbragt937@shopeemobile-external.com': {
      avatar: 'bg-gradient-to-br from-violet-500 to-indigo-600',
      photo: 'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150&w=150',
    },
    'zbragt992@shopeemobile-external.com': {
      avatar: 'bg-gradient-to-br from-sky-500 to-blue-600',
      photo: 'https://images.pexels.com/photos/6942776/pexels-photo-6942776.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150&w=150',
    },
    'zbragt940@shopeemobile-external.com': {
      avatar: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      photo: 'https://images.pexels.com/photos/5197205/pexels-photo-5197205.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=150&w=150',
    },
    'zbragt952@shopeemobile-external.com': {
      avatar: 'bg-gradient-to-br from-amber-500 to-orange-600',
      photo: 'https://images.pexels.com/photos/37273005/pexels-photo-37273005.png?auto=compress&cs=tinysrgb&dpr=2&h=150&w=150',
    },
  };

  const handleGoogleSignIn = useCallback(() => {
    setShowModal(true);
    setAuthState('signing-in');
  }, []);

  const handleSelectAccount = useCallback((email: string) => {
    setIsLoading(true);
    setAuthState('validating');

    setTimeout(() => {
      if (ALLOWED_EMAILS.includes(email)) {
        const name = email.split('@')[0];
        const profile = userProfiles[email];
        setUser({
          email,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          avatar: profile?.avatar || 'bg-gradient-to-br from-slate-500 to-slate-600',
          photo: profile?.photo || '',
        });
        setAuthState('success');
        setShowModal(false);
      } else {
        setDeniedEmail(email);
        setAuthState('denied');
        setShowModal(false);
      }
      setIsLoading(false);
    }, 1800);
  }, [userProfiles]);

  const handleTryAgain = useCallback(() => {
    setAuthState('idle');
    setDeniedEmail('');
    setUser(null);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setAuthState('idle');
    setPage('login');
  }, []);

  // ─── Contact Support Page ──────────────────────────────────────────────────
  if (page === 'support') {
    return <ContactSupport onBack={() => setPage('login')} />;
  }

  // ─── Authenticated: Show Task Tracker ──────────────────────────────────────
  if (authState === 'success' && user) {
    return <TaskTracker user={user} onLogout={handleLogout} />;
  }

  // ─── Login View ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Left: Hero / Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(238,77,45,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(249,115,22,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.06)_0%,_transparent_50%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-shopee/10 to-orange-500/5 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-indigo-600/10 to-violet-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-amber-500/5 to-transparent blur-2xl" />
        <div className="absolute inset-0 animate-shimmer" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shopee to-orange-400 flex items-center justify-center shadow-lg shadow-orange-900/30">
              <ShopeeLogo className="text-white" size={22} />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight">Shopee VKAM</div>
              <div className="text-white/50 text-xs">Back Office</div>
            </div>
          </div>

          <div className="max-w-lg">
            <h1
              className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '150ms' }}
            >
              CMI Bidding
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                Task Tracking Tool
              </span>
            </h1>
            <p
              className="mt-4 text-white/60 text-base leading-relaxed animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '300ms' }}
            >
              Daily tracking tool for bidding workstream. Sign in with your authorized Google account to record, monitor, and analyze your QC and bidding tasks in real time.
            </p>

            <div
              className="mt-8 flex flex-col gap-3 animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '450ms' }}
            >
              {[
                'Secure Google SSO authentication',
                'Track up to 100 bidding task items daily',
                'Real-time workstream summary & analytics',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/70">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="text-white/30 text-xs animate-fade-in"
            style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '600ms' }}
          >
            © 2025 Shopee VKAM Back Office. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden flex items-center gap-3 p-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shopee to-orange-400 flex items-center justify-center shadow-md shadow-orange-200/50">
            <ShopeeLogo className="text-white" size={20} />
          </div>
          <div>
            <span className="font-bold text-slate-800 tracking-tight block text-sm">Shopee VKAM Back Office</span>
            <span className="text-xs text-slate-400">CMI Bidding Task Tracker</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-shopee to-orange-400 shadow-lg shadow-orange-200/40 mb-5">
                <ShopeeLogo className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shopee VKAM Back Office</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to access the CMI Bidding Task Tracking Tool</p>
            </div>

            <div
              className="space-y-4 animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '150ms' }}
            >
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700',
                  'hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50'
                )}
              >
                <GoogleIcon size={18} />
                <span>Continue with Google</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">Authorized accounts only</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Restricted Access</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      This portal is restricted to authorized Shopee VKAM bidding workstream agents. Use your assigned <span className="font-medium text-slate-600">@shopeemobile-external.com</span> Google account to sign in.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-8 text-center space-y-3 animate-fade-in-up"
              style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '300ms' }}
            >
              <p className="text-xs text-slate-400">
                Having trouble?{' '}
                <span onClick={() => setPage('support')} className="text-shopee font-medium cursor-pointer hover:underline">Contact Support</span>
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span className="cursor-pointer hover:text-slate-600 transition-colors">Privacy Policy</span>
                <span>•</span>
                <span className="cursor-pointer hover:text-slate-600 transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden p-6 text-center">
          <p className="text-xs text-slate-400">© 2025 Shopee VKAM Back Office. All rights reserved.</p>
        </div>
      </div>

      {/* Google Sign-In Modal */}
      <GoogleSignInModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setAuthState('idle'); }}
        onSelectAccount={handleSelectAccount}
        isLoading={isLoading}
      />

      {/* Access Denied */}
      {authState === 'denied' && (
        <AccessDenied email={deniedEmail} onTryAgain={handleTryAgain} />
      )}
    </div>
  );
}
