'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Mail, Sparkles } from 'lucide-react';

export default function EnvelopeReveal({ onComplete }: { onComplete: () => void }) {
  const [percentage, setPercentage] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'sealed' | 'opening' | 'opened' | 'completed'>('loading');
  const [hasClickedSeal, setHasClickedSeal] = useState(false);
  const [particles, setParticles] = useState<{ top: string; left: string; width: string; height: string }[]>([]);

  const envelopeRef = useRef<HTMLDivElement>(null);
  const topFlapRef = useRef<HTMLDivElement>(null);
  const waxSealRef = useRef<HTMLDivElement>(null);
  const invitationCardRef = useRef<HTMLDivElement>(null);
  const actionBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate particles on the client side only to prevent SSR hydration mismatch
    const generatedParticles = [...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
    }));
    setParticles(generatedParticles);

    // 1. Loading Phase animation
    const countObj = { val: 0 };
    const loadingTimeline = gsap.timeline({
      onComplete: () => {
        // Fade out loader text and transition to sealed envelope
        gsap.to('.loader-content', {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power3.inOut',
          onComplete: () => {
            setPhase('sealed');
          },
        });
      }
    });

    loadingTimeline.to(countObj, {
      val: 100,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate: () => {
        setPercentage(Math.floor(countObj.val));
      },
    });

    // Subtitle typewriter or slow fade-in
    gsap.fromTo(
      '.loader-sub',
      { opacity: 0, letterSpacing: '2px' },
      { opacity: 0.6, letterSpacing: '5px', duration: 1.8, ease: 'power1.out' }
    );
  }, []);

  // 2. Animate sealed envelope entrance once phase becomes 'sealed'
  useEffect(() => {
    if (phase === 'sealed') {
      const tl = gsap.timeline();

      // Show envelope container
      tl.fromTo(
        envelopeRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power4.out' }
      );

      // Pulse the instruction text
      tl.fromTo(
        '.tap-instruction',
        { opacity: 0, y: 15 },
        { opacity: 0.8, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      );

      // Float sparkles
      if (sparklesRef.current) {
        gsap.to(sparklesRef.current.children, {
          y: 'random(-40, 40)',
          x: 'random(-40, 40)',
          opacity: 'random(0.2, 0.8)',
          duration: 'random(3, 5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.1,
        });
      }
    }
  }, [phase]);

  // 3. Handle Wax Seal Clicking (Trigger the reveal sequence)
  const handleOpenEnvelope = () => {
    if (hasClickedSeal || phase !== 'sealed') return;
    setHasClickedSeal(true);
    setPhase('opening');

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('opened');
      }
    });

    // 1. Wax Seal Explode/Dissolve
    tl.to(waxSealRef.current, {
      scale: 1.4,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.6,
      ease: 'power3.in',
    });

    // 2. Open top flap in 3D (rotateX: 0 to -180 deg)
    tl.to(
      topFlapRef.current,
      {
        rotateX: -180,
        duration: 1.2,
        ease: 'power2.inOut',
      },
      '-=0.2'
    );

    // Slide card upwards, zoom, and elevate zIndex to 45 so it is fully on top of pocket flaps
    tl.to(
      invitationCardRef.current,
      {
        yPercent: -80,
        scale: 1.06,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        zIndex: 45, // Elevate card in front of pocket flaps and open top flap
        duration: 1.6,
        ease: 'power3.inOut',
      },
      '-=0.4'
    );

    // 3. Reveal Action Button and extra text elements inside the card
    tl.fromTo(
      '.card-content-fade',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2 },
      '-=0.4'
    );

    tl.fromTo(
      actionBtnRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
      '-=0.2'
    );
  };

  // 4. Zoom and enter the website
  const handleEnterCelebration = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('completed');
        onComplete();
      }
    });

    // Zoom the invitation card and dissolve the overall envelope component overlay
    tl.to(invitationCardRef.current, {
      scale: 1.5,
      yPercent: -150,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
    });

    tl.to(
      envelopeRef.current,
      {
        opacity: 0,
        scale: 0.9,
        y: 50,
        duration: 0.8,
        ease: 'power2.in',
      },
      '-=0.8'
    );

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 1.0,
        ease: 'power3.inOut',
      },
      '-=0.4'
    );
  };

  // Styles for the 3D flaps to ensure seamless Next.js compilation
  const preserve3D = { transformStyle: 'preserve-3d' as const };
  const backfaceHidden = { backfaceVisibility: 'hidden' as const };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10001] bg-[#030d0a] flex justify-center items-center overflow-hidden flex-col px-4 select-none"
      style={{
        backgroundImage: 'radial-gradient(circle at center, #072920 0%, #030c09 70%, #010403 100%)'
      }}
    >
      {/* Decorative Sparkle Particles */}
      <div ref={sparklesRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#d4af37] opacity-30 blur-[1px]"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.width,
              height: particle.height,
            }}
          />
        ))}
      </div>

      {/* Styled Inline Styles for Keyframe Animations */}
      <style jsx global>{`
        @keyframes subtle-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.8; }
        }
        .pulse-ring {
          animation: subtle-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* PHASE 1: Loading Preloader */}
      {phase === 'loading' && (
        <div className="loader-content flex flex-col justify-center items-center z-10">
          <div className="text-[12vw] md:text-[8vw] font-playfair font-bold text-gradient leading-none tracking-tighter">
            {percentage}%
          </div>
          <div className="loader-sub text-[0.6rem] md:text-xs tracking-[5px] uppercase opacity-60 mt-4 text-[#d4af37]">
            The Union of Two Hearts
          </div>
        </div>
      )}

      {/* PHASE 2-4: Sealed / Opening Envelope Reveal */}
      {phase !== 'loading' && (
        <div className="w-full max-w-[460px] flex flex-col items-center z-10 relative">
          
          {/* Main Envelope Body Container */}
          <div
            ref={envelopeRef}
            className="relative w-full aspect-[1.42/1] select-none rounded-xl"
            style={{
              perspective: '1200px',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.9)'
            }}
          >
            {/* 1. Envelope Back Flap & Gold Inner Lining */}
            <div
              className="absolute inset-0 bg-[#041a15] rounded-xl overflow-hidden border border-white/5"
              style={{ zIndex: 10 }}
            >
              {/* Reflective Inner Gold Silk Lining */}
              <div
                className="absolute inset-[4px] rounded-lg bg-gradient-to-br from-[#d4af37] via-[#f7e6b0] to-[#b89522] opacity-80"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                }}
              />
              {/* Inner depth shadow */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            </div>

            {/* 2. Pocket Front Flaps (Sides and Bottom overlaying the card) */}
            {/* Left Pocket Flap */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#031512] to-[#06261f] border-l border-white/5"
              style={{
                zIndex: 30,
                clipPath: 'polygon(0 0, 50% 50%, 0 100%)',
              }}
            />
            {/* Right Pocket Flap */}
            <div
              className="absolute inset-0 bg-gradient-to-l from-[#031512] to-[#06261f] border-r border-white/5"
              style={{
                zIndex: 30,
                clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)',
              }}
            />
            {/* Bottom Pocket Flap */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#020e0c] to-[#072f26] border-b border-white/5 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]"
              style={{
                zIndex: 31,
                clipPath: 'polygon(0 100%, 50% 49.5%, 100% 100%)',
              }}
            />

            {/* 3. Top Flap (Rotating element, needs 3D setup) */}
            <div
              ref={topFlapRef}
              className="absolute top-0 left-0 w-full h-[50.5%] origin-top"
              style={{
                zIndex: 40,
                ...preserve3D,
                transition: 'transform 0.1s ease', // clean timeline hook
              }}
            >
              {/* Outer Emerald Triangular Flap (Facing front when closed) */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#072f26] to-[#041a15] border-t border-white/5"
                style={{
                  ...backfaceHidden,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))'
                }}
              />

              {/* Inner Gold Triangular Flap (Facing inside when closed, visible when opened) */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#aa8010] to-[#d4af37]"
                style={{
                  ...backfaceHidden,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  transform: 'rotateY(180deg)', // Horizontal mirroring so it points upwards above the envelope when open!
                }}
              />
            </div>

            {/* 4. Invitation Card - Rendered last in DOM for absolute stacking fallback */}
            <div
              ref={invitationCardRef}
              className="absolute w-[92%] h-[90%] left-[4%] top-[5%] bg-gradient-to-b from-[#062c23] to-[#031511] rounded-lg p-4 md:p-6 text-center border-2 border-[#d4af37] flex flex-col justify-between"
              style={{
                zIndex: 20,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                transformOrigin: 'bottom center',
              }}
            >
              {/* Elegant Gold Borders */}
              <div className="absolute inset-[3px] border border-[#d4af37]/30 rounded-md pointer-events-none" />

              {/* Invitation Card Content */}
              <div className="my-auto flex flex-col items-center">
                <div className="card-content-fade text-[0.6rem] md:text-xs tracking-[4px] text-[#d4af37] uppercase mb-2 font-semibold">
                  Save The Date
                </div>
                
                {/* Custom Elegant Monogram SVG or text */}
                <div className="card-content-fade text-2xl md:text-3xl font-serif text-gradient italic my-1 font-bold">
                  R & S
                </div>

                <div className="card-content-fade w-8 h-[1px] bg-[#d4af37]/40 my-2" />

                <h3 className="card-content-fade font-serif text-lg md:text-2xl font-bold tracking-wide text-white leading-tight">
                  ROCKY & SWARUPA
                </h3>

                <p className="card-content-fade text-[0.6rem] md:text-[0.7rem] uppercase tracking-[3px] opacity-70 mt-2 text-white/90">
                  ARE GETTING MARRIED
                </p>

                <p className="card-content-fade text-[0.55rem] md:text-[0.65rem] italic opacity-50 max-w-[280px] mx-auto mt-3 leading-relaxed text-white/70">
                  Join us to celebrate the union of two hearts, full of ritual, joy, and forever love.
                </p>

                <div className="card-content-fade w-24 h-[1px] bg-[#d4af37]/20 my-3" />

                <div className="card-content-fade text-[0.6rem] md:text-xs tracking-[2px] font-semibold text-[#d4af37] uppercase">
                  NOV 25 — NOV 27, 2026
                </div>
                <div className="card-content-fade text-[0.55rem] md:text-[0.65rem] tracking-[1px] opacity-50 uppercase text-white/60 mt-1">
                  West Bengal, India
                </div>
              </div>

              {/* Gold Action Button inside invitation card - Flex centered, capsule shape, explicit height, and shrink-0 to prevent compression */}
              <button
                ref={actionBtnRef}
                onClick={handleEnterCelebration}
                className="opacity-0 scale-90 w-full h-11 md:h-12 shrink-0 bg-gradient-to-r from-[#d4af37] to-[#aa8010] text-[#030d0a] font-bold text-xs uppercase tracking-[3px] rounded-full shadow-lg shadow-black/40 hover:scale-[1.03] transition-all duration-300 active:scale-95 border border-[#fff2b3]/20 cursor-pointer flex items-center justify-center leading-none z-30"
              >
                Enter Celebration
              </button>
            </div>

            {/* 5. Gold Monogram Wax Seal (Click trigger) */}
            {phase === 'sealed' && (
              <div
                ref={waxSealRef}
                onClick={handleOpenEnvelope}
                className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-16 h-16 rounded-full cursor-pointer hover:scale-108 active:scale-95 transition-all duration-300"
                style={{ zIndex: 50 }}
              >
                {/* Pulsing Outer Glowing Ring */}
                <div className="pulse-ring absolute top-[50%] left-[50%] w-24 h-24 rounded-full bg-[#d4af37]/20 pointer-events-none" />

                {/* Highly Realistic Wax Stamp Outer Rim */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#d4af37] via-[#f7e6b0] to-[#b89522] shadow-[0_8px_16px_rgba(0,0,0,0.6)] border border-[#fffae6]/30 flex items-center justify-center"
                  style={{
                    boxShadow: 'inset 0 4px 6px rgba(255, 255, 255, 0.4), inset 0 -4px 6px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  {/* Monogram Content */}
                  <div className="flex flex-col items-center justify-center font-serif text-[#4a3600] font-bold text-xs select-none">
                    <Sparkles size={10} className="mb-0.5 opacity-80" />
                    <span className="tracking-tight text-[0.7rem] leading-none">R & S</span>
                  </div>
                </div>

                {/* Tiny accent wax drip */}
                <div className="absolute top-[85%] left-[30%] w-4 h-5 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b89522] -rotate-12 pointer-events-none shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-l border-[#fffae6]/10" />
              </div>
            )}
          </div>

          {/* Sealed Phase Bottom Instruction Text */}
          {phase === 'sealed' && (
            <div className="tap-instruction text-center mt-10 z-20 pointer-events-none opacity-0">
              <p className="text-[0.65rem] md:text-xs font-semibold tracking-[4px] uppercase text-[#d4af37]/80 flex items-center justify-center gap-2">
                <Mail size={12} className="animate-bounce" /> Tap Wax Seal to Open
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
