'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '#couple', label: 'The Couple' },
  { href: '#gallery', label: 'Moments' },
  { href: '#events', label: 'Events' },
  { href: '#travel', label: 'Travel' },
  { href: '#rsvp', label: 'RSVP' },
];

const menuVariants = {
  initial: {
    scaleY: 0,
    transformOrigin: "top",
    opacity: 0,
  },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    scaleY: 0,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: 0.2,
    },
  },
};

const containerVars = {
  initial: {
    transition: {
      staggerChildren: 0.09,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.09,
      staggerDirection: 1,
    },
  },
};

const linkVars = {
  initial: {
    y: "30vh",
    transition: {
      duration: 0.5,
      ease: [0.37, 0, 0.63, 1] as [number, number, number, number],
    },
  },
  open: {
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0, 0.55, 0.45, 1] as [number, number, number, number],
    },
  },
};

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

  return (
    <>
      <button 
        onClick={toggleMenu} 
        className="fixed top-6 right-6 z-[200] w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-white lg:hidden active:scale-90 transition-transform duration-300"
        aria-label="Toggle Menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[150] bg-[#050505] origin-top flex flex-col justify-center items-center lg:hidden px-4"
          >
            <motion.div 
              variants={containerVars}
              initial="initial"
              animate="open"
              exit="initial"
              className="flex flex-col gap-6 text-center w-full"
            >
              {navLinks.map((link) => (
                <div key={link.href} className="overflow-hidden">
                  <motion.div variants={linkVars}>
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-5xl font-playfair font-medium text-white/90 hover:text-[#d4af37] transition-colors block py-2"
                    >
                      {link.label}
                    </a>
                  </motion.div>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5, transition: { delay: 0.8, duration: 0.5 } }}
              exit={{ opacity: 0 }}
              className="absolute bottom-10 left-0 w-full text-center text-[10px] tracking-[0.3em] font-light uppercase"
            >
              Rocky & Swarupa
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
