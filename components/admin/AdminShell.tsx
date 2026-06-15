'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, ShoppingBasket, Receipt } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/admin', label: 'Bazar', icon: ShoppingBasket },
    { href: '/admin/expenses', label: 'Expenses', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Admin top bar */}
      <nav className="fixed top-0 w-full z-40 border-b border-white/8 bg-[#050505]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Brand + breadcrumb + nav links */}
          <div className="flex items-center gap-4">
            <a href="/" className="font-serif font-bold text-xl text-white hover:text-[#d4af37] transition-colors">
              R &amp; S
            </a>
            <span className="text-white/15">/</span>
            <div className="flex items-center gap-1.5 text-[#d4af37]">
              <LayoutDashboard size={13} />
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Admin</span>
            </div>
            <span className="text-white/15 hidden sm:block">/</span>
            {/* Dashboard Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <a key={href} href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}>
                    <Icon size={12} />
                    {label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/30 tracking-widest uppercase hidden sm:block">
              Wedding Management
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:border-red-400/30 hover:text-red-400 transition-all"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content (padded for fixed nav) */}
      <div className="pt-14">
        {children}
      </div>
    </div>
  );
}
