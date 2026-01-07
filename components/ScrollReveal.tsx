'use client';

import { motion, useInView, Variant } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  width?: "fit-content" | "100%";
  mode?: "fade-up" | "fade-in" | "scale-up" | "blur-in";
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  width = "fit-content",
  mode = "fade-up",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-20%" });

  const variants = {
    hidden: { 
      opacity: 0, 
      y: mode === 'fade-up' ? 40 : 0, 
      scale: mode === 'scale-up' ? 0.9 : 1,
      filter: mode === 'blur-in' ? "blur(10px)" : "blur(0px)" 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    },
  };

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
