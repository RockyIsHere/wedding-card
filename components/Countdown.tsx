'use client';

import { useEffect, useState } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const weddingDate = new Date('Nov 25, 2026 19:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = weddingDate - now;

      if (diff < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
      <div className="count-item text-center p-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
        <span className="count-num text-5xl md:text-7xl font-bold text-[#d4af37] block leading-none">
          {formatNumber(timeLeft.days)}
        </span>
        <span className="count-label uppercase text-xs tracking-[2px] opacity-50 mt-2 block">
          Days to go
        </span>
      </div>
      <div className="count-item text-center p-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
        <span className="count-num text-5xl md:text-7xl font-bold text-[#d4af37] block leading-none">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="count-label uppercase text-xs tracking-[2px] opacity-50 mt-2 block">
          Hours
        </span>
      </div>
      <div className="count-item text-center p-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
        <span className="count-num text-5xl md:text-7xl font-bold text-[#d4af37] block leading-none">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="count-label uppercase text-xs tracking-[2px] opacity-50 mt-2 block">
          Minutes
        </span>
      </div>
      <div className="count-item text-center p-10 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
        <span className="count-num text-5xl md:text-7xl font-bold text-[#d4af37] block leading-none">
          {formatNumber(timeLeft.seconds)}
        </span>
        <span className="count-label uppercase text-xs tracking-[2px] opacity-50 mt-2 block">
          Seconds
        </span>
      </div>
    </div>
  );
}
