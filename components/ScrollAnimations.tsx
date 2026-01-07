'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  useEffect(() => {
    // Story Reveal Animation
    gsap.utils.toArray('.reveal-text').forEach((text) => {
      gsap.to(text as HTMLElement, {
        scrollTrigger: {
          trigger: text as HTMLElement,
          start: 'top 85%',
          end: 'top 45%',
          scrub: true,
        },
        opacity: 1,
        color: '#d4af37',
        duration: 1,
      });
    });

    // Couple Photos Reveal
    gsap.from('.groom-card', {
      x: -100,
      opacity: 0,
      scrollTrigger: {
        trigger: '.couple-grid',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      },
    });

    gsap.from('.bride-card', {
      x: 100,
      opacity: 0,
      scrollTrigger: {
        trigger: '.couple-grid',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      },
    });

    // Gallery Parallax
    gsap.utils.toArray('.gallery-item img').forEach((img) => {
      gsap.fromTo(
        img as HTMLElement,
        { scale: 1.3, yPercent: -10 },
        {
          scale: 1,
          yPercent: 10,
          scrollTrigger: {
            trigger: (img as HTMLElement).parentElement,
            scrub: true,
          },
        }
      );
    });


    // Horizontal Scroll
    const horizontalContent = document.querySelector('.horizontal-content');
    const mm = gsap.matchMedia();

    if (horizontalContent) {
      mm.add("(min-width: 1024px)", () => {
        gsap.to(horizontalContent, {
          x: () => -(horizontalContent.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: '.horizontal-wrap',
            start: 'top top',
            end: () => '+=' + horizontalContent.scrollWidth,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      mm.revert();
    };
  }, []);

  return null;
}
