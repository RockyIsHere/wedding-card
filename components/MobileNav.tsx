'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { href: '#couple', label: 'The Couple' },
    { href: '#gallery', label: 'Moments' },
    { href: '#events', label: 'Events' },
    { href: '#travel', label: 'Travel' },
    { href: '#rsvp', label: 'RSVP' },
  ];

  return (
    <>
      <button 
        onClick={toggleMenu} 
        className="fixed top-8 right-8 z-[200] p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 lg:hidden"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div 
        className={`fixed inset-0 z-[150] bg-[#080808] transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:hidden flex flex-col justify-center items-center`}
      >
        <div className="flex flex-col gap-8 text-center">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-3xl font-playfair hover:text-[#d4af37] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="absolute bottom-10 text-xs tracking-widest opacity-50">
          ROCKY & SWARUPA
        </div>
      </div>
    </>
  );
}
