import { ShopeeLogo } from './Icons';

interface ContactSupportProps {
  onBack: () => void;
}

// ─── Construction SVG decorations ────────────────────────────────────────────

const CraneIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none">
    <rect x="52" y="38" width="10" height="72" rx="2" fill="currentColor" opacity="0.13" />
    <rect x="55" y="8" width="5" height="32" fill="currentColor" opacity="0.16" />
    <line x1="57" y1="8" x2="105" y2="8" stroke="currentColor" strokeWidth="4" opacity="0.18" />
    <line x1="105" y1="8" x2="105" y2="36" stroke="currentColor" strokeWidth="2" opacity="0.13" strokeDasharray="4 3" />
    <line x1="57" y1="18" x2="90" y2="8" stroke="currentColor" strokeWidth="2" opacity="0.1" />
    <line x1="57" y1="28" x2="98" y2="8" stroke="currentColor" strokeWidth="2" opacity="0.1" />
    <rect x="99" y="34" width="12" height="9" rx="2" fill="currentColor" opacity="0.14" />
    <rect x="40" y="106" width="34" height="6" rx="3" fill="currentColor" opacity="0.1" />
  </svg>
);

const ConeIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="52" height="60" viewBox="0 0 52 60" fill="none">
    <path d="M26 6L38 50H14L26 6Z" fill="currentColor" opacity="0.12" />
    <rect x="20" y="18" width="12" height="4" rx="1" fill="currentColor" opacity="0.08" />
    <rect x="17" y="30" width="18" height="4" rx="1" fill="currentColor" opacity="0.08" />
    <rect x="10" y="50" width="32" height="5" rx="2.5" fill="currentColor" opacity="0.1" />
  </svg>
);

const GearIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="60" height="60" viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="30" r="10" stroke="currentColor" strokeWidth="3" opacity="0.08" />
    <circle cx="30" cy="30" r="4" fill="currentColor" opacity="0.06" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <rect
        key={angle}
        x="27" y="4" width="6" height="12" rx="2"
        fill="currentColor" opacity="0.08"
        transform={`rotate(${angle} 30 30)`}
      />
    ))}
  </svg>
);

const BarrierIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="80" height="50" viewBox="0 0 80 50" fill="none">
    <rect x="6" y="10" width="68" height="16" rx="3" fill="currentColor" opacity="0.06" />
    {[6, 26, 46].map((x) => (
      <rect key={x} x={x} y="10" width="16" height="16" rx="1" fill="currentColor" opacity="0.08" />
    ))}
    <rect x="12" y="26" width="5" height="20" rx="1.5" fill="currentColor" opacity="0.07" />
    <rect x="63" y="26" width="5" height="20" rx="1.5" fill="currentColor" opacity="0.07" />
  </svg>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactSupport({ onBack }: ContactSupportProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/30 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-30 glass border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shopee to-orange-500 flex items-center justify-center shadow-md shadow-orange-200/50">
              <ShopeeLogo className="text-white" size={18} />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">Shopee VKAM</span>
            <span className="text-xs text-slate-400 ml-0.5">Back Office</span>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 active:scale-[0.98] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Back
          </button>
        </div>
      </nav>

      {/* Hazard tape */}
      <div className="h-3 w-full" style={{ background: 'repeating-linear-gradient(115deg, #F59E0B 0px, #F59E0B 18px, #1E293B 18px, #1E293B 36px)' }} />

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">

        {/* Background construction elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute -top-4 right-4 sm:right-16 animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '200ms' }}>
            <CraneIcon className="text-amber-800" />
          </div>
          <div className="absolute bottom-12 left-6 sm:left-16 animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '400ms' }}>
            <ConeIcon className="text-orange-600" />
          </div>
          <div className="absolute bottom-20 right-10 sm:right-24 animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '500ms' }}>
            <ConeIcon className="text-amber-600" />
          </div>
          <div className="absolute bottom-4 left-1/4 hidden sm:block animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '600ms' }}>
            <BarrierIcon className="text-amber-800" />
          </div>
          <div className="absolute top-1/3 left-6 sm:left-12 gear-spin animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '350ms' }}>
            <GearIcon className="text-slate-500" />
          </div>
          <div className="absolute bottom-1/3 right-6 sm:right-16 gear-spin-reverse animate-fade-in" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '500ms' }}>
            <GearIcon className="text-amber-700" />
          </div>
          {/* Faint corner hazard stripes */}
          <div className="absolute top-0 left-0 w-36 h-36 opacity-[0.025]" style={{ background: 'repeating-linear-gradient(45deg, #000, #000 8px, transparent 8px, transparent 22px)' }} />
          <div className="absolute bottom-0 right-0 w-44 h-44 opacity-[0.025]" style={{ background: 'repeating-linear-gradient(-45deg, #000, #000 8px, transparent 8px, transparent 22px)' }} />
        </div>

        {/* Card */}
        <div className="relative w-full max-w-md animate-fade-in-up">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-200/50">
                <span className="text-4xl leading-none select-none">🏗️</span>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-ping" style={{ animationDuration: '2.5s' }} />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/70 bg-white/90 backdrop-blur-sm shadow-xl shadow-amber-100/20 overflow-hidden">
            {/* Top hazard bar */}
            <div className="h-2 w-full" style={{ background: 'repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 14px, #1E293B 14px, #1E293B 28px)' }} />

            <div className="px-8 py-10 text-center space-y-5">
              <div className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '100ms' }}>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Page Under Construction
                </h1>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                  We're building something great here. This page isn't ready yet — check back soon!
                </p>
              </div>

              {/* Progress illustration */}
              <div className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '250ms' }}>
                <div className="max-w-xs mx-auto">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Building Progress</span>
                    <span className="text-[11px] font-bold text-amber-600">42%</span>
                  </div>
                  <div className="h-3 rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                      style={{ width: '42%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50/80 border border-amber-200/60 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '400ms' }}>
                <div className="flex items-start gap-3 text-left">
                  <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800">What's happening?</p>
                    <p className="text-xs text-amber-700/70 mt-1 leading-relaxed">
                      Our team is actively working on this support page. Soon you'll be able to submit tickets, view FAQs, and get help right here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Construction emoji row */}
              <div className="flex items-center justify-center gap-2.5 text-xl animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '550ms' }}>
                {['🚧', '👷', '🔨', '⚙️', '🧱', '🦺'].map((e, i) => (
                  <span
                    key={i}
                    className="hover:scale-125 hover:-translate-y-1 transition-all duration-200 cursor-default select-none"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom hazard bar */}
            <div className="h-2 w-full" style={{ background: 'repeating-linear-gradient(90deg, #1E293B 0px, #1E293B 14px, #F59E0B 14px, #F59E0B 28px)' }} />
          </div>

          {/* Back button */}
          <div className="mt-6 text-center animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '650ms' }}>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-300/30 hover:bg-slate-800 active:scale-[0.97] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tape */}
      <div className="h-3 w-full" style={{ background: 'repeating-linear-gradient(115deg, #1E293B 0px, #1E293B 18px, #F59E0B 18px, #F59E0B 36px)' }} />

      {/* Footer */}
      <footer className="bg-amber-50/40 border-t border-amber-100/50">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
          Shopee VKAM Back Office · Page Under Construction
        </div>
      </footer>
    </div>
  );
}
