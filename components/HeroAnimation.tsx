'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

export default function HeroAnimation({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!active) return;

    const tl = gsap.timeline({ delay: 0.2 });

    // 1. Initial State resets
    gsap.set(elementsRef.current, { y: 40, opacity: 0 });
    gsap.set(archRef.current, { scale: 0.9, opacity: 0, y: 30 });
    gsap.set('.hero-glow-circle', { scale: 0.8, opacity: 0 });

    // 2. Play the entrance staggers
    tl.to(archRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.6,
      ease: 'power4.out',
    });

    tl.to(
      '.hero-glow-circle',
      {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: 'power3.out',
      },
      '-=1.2'
    );

    tl.to(
      elementsRef.current,
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 1.4,
        ease: 'power3.out',
      },
      '-=1.2'
    );

    // Subtle floating parallax on the image inside the arch
    gsap.to('.hero-arched-img', {
      yPercent: 8,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Subtle slow float on the main arch container itself
    gsap.to(archRef.current, {
      y: -6,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

  }, [active]);

  return (
    <section 
      ref={containerRef}
      className="hero text-center h-screen flex flex-col justify-between items-center py-10 md:py-16 px-[5vw] relative overflow-hidden select-none z-10"
    >
      {/* Decorative Slowly Rotating Golden Monogram Ring (Behind Arch) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[420px] md:h-[420px] -z-10 pointer-events-none flex items-center justify-center hero-glow-circle opacity-0">
        <div className="absolute inset-0 rounded-full border border-dashed border-[#d4af37]/15 animate-[spin_80s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-[#d4af37]/5 animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute inset-16 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.06)_0%,_rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Group A: Top Header + Arched Couple Frame - pushed down slightly on mobile for balance */}
      <div className="flex flex-col items-center gap-3 md:gap-5 w-full mt-6 md:mt-0 pt-4 md:pt-0 z-20">
        {/* Top family credit header - max width added to prevent menu overlaps */}
        <div
          ref={(el) => { if (el) elementsRef.current[0] = el; }}
          className="text-[9px] md:text-xs tracking-[5px] md:tracking-[12px] uppercase opacity-70 text-[#d4af37] font-semibold shrink-0 max-w-[240px] md:max-w-none mx-auto"
        >
          Together with their families
        </div>

        {/* Center Classical Arched Couple Frame - larger taller mobile sweet spot */}
        <div
          ref={archRef}
          className="w-[245px] h-[340px] md:w-[310px] md:h-[410px] rounded-t-full overflow-hidden border-2 border-[#d4af37]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative bg-[#041a15] shrink-0 opacity-0"
          style={{
            boxShadow: '0 25px 60px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.6)'
          }}
        >
          {/* Arch inner border */}
          <div className="absolute inset-[3px] border border-[#d4af37]/20 rounded-t-full z-20 pointer-events-none" />
          
          <img
            src="/images/025B758E-7146-4AAA-9C3D-994E7E638C26_1_105_c.jpeg"
            alt="Rocky & Swarupa"
            className="w-full h-full object-cover hero-arched-img scale-110 -translate-y-[4%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-10 pointer-events-none" />
        </div>
      </div>

      {/* Group B: Bottom stacked title, details & scroll down indicator - elevated on mobile */}
      <div className="flex flex-col items-center z-20 max-w-4xl w-full pb-10 md:pb-0">
        {/* Luxury Gold Monogram Crest Divider - wider and taller presence */}
        <div className="flex items-center gap-5 mb-6 md:mb-8 text-[#d4af37] opacity-80 shrink-0">
          <div className="w-16 md:w-20 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/30" />
          <div className="w-10 h-10 rounded-full border border-[#d4af37]/30 flex items-center justify-center bg-[#d4af37]/5 font-serif text-[10px] tracking-normal font-semibold shadow-[0_0_15px_rgba(212,175,55,0.1)] select-none italic">
            R & S
          </div>
          <div className="w-16 md:w-20 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/30" />
        </div>

        {/* Core Gold-gradient Title */}
        <h1
          ref={(el) => { if (el) elementsRef.current[1] = el; }}
          className="font-playfair text-3xl md:text-7xl font-bold tracking-wider text-gradient leading-tight mb-2 md:mb-4"
          style={{ textShadow: '0 4px 10px rgba(0, 0, 0, 0.4)' }}
        >
          ROCKY & SWARUPA
        </h1>

        <div
          ref={(el) => { if (el) elementsRef.current[2] = el; }}
          className="text-[8px] md:text-xs tracking-[4px] md:tracking-[10px] uppercase opacity-60 mt-0.5 text-white/90"
        >
          INVITE YOU TO CELEBRATE THEIR WEDDING
        </div>

        <div
          ref={(el) => { if (el) elementsRef.current[3] = el; }}
          className="text-[9px] md:text-xs tracking-[2px] md:tracking-[3px] text-[#d4af37] font-medium uppercase mt-4 md:mt-6"
        >
          NOV 25 — NOV 27, 2026 • WEST BENGAL, INDIA
        </div>

        {/* Pulsing golden Scroll Down Indicator */}
        <div
          ref={(el) => { if (el) elementsRef.current[4] = el; }}
          className="flex flex-col items-center justify-center gap-1 mt-6 md:mt-10 opacity-60 hover:opacity-90 transition-opacity duration-300 cursor-pointer"
          onClick={() => {
            const coupleSection = document.getElementById('couple');
            if (coupleSection) {
              coupleSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="text-[7px] md:text-[8px] tracking-[3px] uppercase text-white/50">[ Scroll to Explore ]</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-[#d4af37] to-transparent animate-bounce mt-1" />
        </div>
      </div>
    </section>
  );
}
