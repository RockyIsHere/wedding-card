'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';

export default function HeroAnimation() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.from(subsRef.current, {
      y: 30,
      opacity: 0,
      stagger: 0.3,
      duration: 1.2,
      ease: 'power4.out',
    }).to('.char', {
      y: 0,
      stagger: 0.04,
      duration: 1.2,
      ease: 'expo.out',
    }, '-=1.2');
  }, []);

  const title = 'ROCKY & SWARUPA';

  return (
    <section className="hero text-center h-screen flex flex-col justify-center items-center px-[5vw] relative">
      <div className="hero-bg-image absolute inset-0 opacity-20 grayscale -z-10">
        <Image
          src="/images/025B758E-7146-4AAA-9C3D-994E7E638C26_1_105_c.jpeg"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div
        ref={(el) => { if (el) subsRef.current[0] = el; }}
        className="hero-sub text-sm opacity-60 tracking-[0.5em] uppercase mb-8"
      >
        Together with their families
      </div>

      <h1
        ref={titleRef}
        className="text-[clamp(2rem,8vw,12rem)] leading-[1.1] font-bold my-4 overflow-hidden w-full text-center tracking-tight font-playfair whitespace-normal lg:whitespace-nowrap"
      >
        {title.split('').map((char, i) => (
          <span key={i} className="char inline-block translate-y-[110%]">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>

      <div
        ref={(el) => { if (el) subsRef.current[1] = el; }}
        className="hero-sub text-sm opacity-60 tracking-[0.5em] uppercase mt-4"
      >
        INVITE YOU TO CELEBRATE THEIR WEDDING
      </div>

      <div
        ref={(el) => { if (el) subsRef.current[2] = el; }}
        className="mt-12 opacity-50 text-sm tracking-[2px]"
      >
        NOV 25 — NOV 27, 2026 • WEST BENGAL
      </div>
    </section>
  );
}
