'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX - 5,
          y: e.clientY - 5,
          duration: 0.1,
        });
      }
    };

    const animateFollower = () => {
      followerPos.current.x += (mousePos.current.x - followerPos.current.x - 20) * 0.12;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y - 20) * 0.12;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${followerPos.current.x}px, ${followerPos.current.y}px)`;
      }

      requestAnimationFrame(animateFollower);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animateFollower();

    const handleHoverIn = () => {
      gsap.to(followerRef.current, {
        scale: 2,
        background: 'rgba(212, 175, 55, 0.1)',
        duration: 0.3,
      });
    };

    const handleHoverOut = () => {
      gsap.to(followerRef.current, {
        scale: 1,
        background: 'none',
        duration: 0.3,
      });
    };

    const hoverElements = document.querySelectorAll('a, button, .track, .gallery-item');
    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverIn);
      el.addEventListener('mouseleave', handleHoverOut);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      hoverElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverIn);
        el.removeEventListener('mouseleave', handleHoverOut);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-[10px] h-[10px] bg-[#d4af37] rounded-full pointer-events-none z-[10000] mix-blend-difference"
      />
      <div
        ref={followerRef}
        className="fixed w-[40px] h-[40px] border border-[#d4af37] rounded-full pointer-events-none z-[9999] transition-transform duration-150"
      />
    </>
  );
}
