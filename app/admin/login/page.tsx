import type { Metadata } from 'next';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Admin Login | R & S',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Noise overlay */}
      <div className="noise" />

      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#d4af37]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#d4af37]/3 blur-[100px]" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Glass panel */}
        <div className="glass-panel rounded-[2rem] p-10 border border-white/8">

          {/* Header */}
          <div className="text-center mb-10">
            {/* Monogram */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 mb-6">
              <span className="font-serif text-2xl font-bold text-[#d4af37]">R&S</span>
            </div>

            <div className="text-[10px] text-[#d4af37] tracking-[0.5em] uppercase mb-3">
              Admin Portal
            </div>
            <h1 className="font-serif text-3xl text-white mb-2">
              Restricted Access
            </h1>
            <p className="text-white/30 text-xs tracking-wider">
              Wedding management dashboard
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-white/8" />
            <div className="w-1 h-1 rounded-full bg-[#d4af37]/40" />
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>

        {/* Footer hint */}
        <p className="text-center text-white/15 text-[10px] tracking-widest uppercase mt-6">
          Rocky &amp; Swarupa © 2026
        </p>
      </div>
    </div>
  );
}
