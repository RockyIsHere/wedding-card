'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    let perc = 0;
    const interval = setInterval(() => {
      perc += Math.floor(Math.random() * 8) + 1;
      if (perc >= 100) {
        perc = 100;
        clearInterval(interval);
        setPercentage(perc);

        setTimeout(() => {
          gsap.to('#loader', {
            yPercent: -100,
            duration: 1.5,
            ease: 'expo.inOut',
            onComplete: onComplete,
          });
        }, 300);
      } else {
        setPercentage(perc);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      id="loader"
      className="fixed inset-0 bg-[#080808] z-[10001] flex justify-center items-center flex-col"
    >
      <div className="loader-num text-[10vw] font-playfair font-bold text-[#d4af37]">
        {percentage}
      </div>
      <div className="text-[0.6rem] tracking-[5px] uppercase opacity-50 mt-4">
        The Union of Two Hearts
      </div>
    </div>
  );
}
