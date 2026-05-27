'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || status === 'loading') return;

    setStatus('loading');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setStatus('error');
        setShake(true);
        setPassword('');
        setTimeout(() => setShake(false), 600);
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div
      className={`w-full transition-all duration-150 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Password field */}
        <div className="relative group">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 ${
              status === 'error'
                ? 'border-red-500/60 bg-red-500/5'
                : 'border-white/10 bg-white/5 focus-within:border-[#d4af37]/60 focus-within:bg-[#d4af37]/5'
            }`}
          >
            <Lock
              size={16}
              className={`flex-shrink-0 transition-colors duration-300 ${
                status === 'error'
                  ? 'text-red-400'
                  : 'text-white/30 group-focus-within:text-[#d4af37]'
              }`}
            />
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="flex-1 bg-transparent text-white placeholder-white/20 text-sm outline-none tracking-widest"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Error message */}
        <div
          className={`text-center text-xs tracking-widest uppercase transition-all duration-300 ${
            status === 'error' ? 'text-red-400 opacity-100' : 'opacity-0'
          }`}
        >
          Incorrect password. Try again.
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!password.trim() || status === 'loading'}
          className={`relative overflow-hidden py-4 px-8 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
            !password.trim() || status === 'loading'
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              : 'bg-[#d4af37] text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Verifying...
            </span>
          ) : (
            'Enter Portal'
          )}
        </button>
      </form>
    </div>
  );
}
