'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, ShoppingBasket, Receipt, UtensilsCrossed, Palette } from 'lucide-react';

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
    { href: '/admin/menu', label: 'Food Menu', icon: UtensilsCrossed },
    { href: '/admin/content', label: 'Content', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-theme="dark">
      {/* Admin top bar — brand + logout */}
      <nav className="fixed top-0 w-full z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/8">
        {/* Row 1: Brand + Logout */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-serif font-bold text-lg text-white hover:text-[#d4af37] transition-colors">
              R &amp; S
            </a>
            <span className="text-white/15">/</span>
            <div className="flex items-center gap-1.5 text-[#d4af37]">
              <LayoutDashboard size={13} />
              <span className="text-xs tracking-[0.15em] uppercase font-medium">Admin</span>
            </div>
          </div>

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

        {/* Row 2: Tab navigation — always visible */}
        <div className="border-t border-white/5 bg-[#080808]/80">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all relative ${
                    isActive
                      ? 'text-[#d4af37]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37] rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content — padded for both nav rows (~80px total) */}
      <div className="pt-[80px]">
        {children}
      </div>
    </div>
  );
}
