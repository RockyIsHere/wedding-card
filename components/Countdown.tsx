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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mt-16 px-4 lg:px-0">
      <div className="glass-panel p-6 lg:p-10 rounded-2xl flex flex-col items-center justify-center min-h-[160px]">
        <span className="text-4xl lg:text-7xl font-bold text-[var(--accent)] block leading-none font-serif mb-2">
          {formatNumber(timeLeft.days)}
        </span>
        <span className="uppercase text-[10px] lg:text-xs tracking-[0.2em] opacity-50">
          Days
        </span>
      </div>
      <div className="glass-panel p-6 lg:p-10 rounded-2xl flex flex-col items-center justify-center min-h-[160px]">
        <span className="text-4xl lg:text-7xl font-bold text-[var(--accent)] block leading-none font-serif mb-2">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="uppercase text-[10px] lg:text-xs tracking-[0.2em] opacity-50">
          Hours
        </span>
      </div>
      <div className="glass-panel p-6 lg:p-10 rounded-2xl flex flex-col items-center justify-center min-h-[160px]">
        <span className="text-4xl lg:text-7xl font-bold text-[var(--accent)] block leading-none font-serif mb-2">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="uppercase text-[10px] lg:text-xs tracking-[0.2em] opacity-50">
          Minutes
        </span>
      </div>
      <div className="glass-panel p-6 lg:p-10 rounded-2xl flex flex-col items-center justify-center min-h-[160px]">
        <span className="text-4xl lg:text-7xl font-bold text-[var(--accent)] block leading-none font-serif mb-2">
          {formatNumber(timeLeft.seconds)}
        </span>
        <span className="uppercase text-[10px] lg:text-xs tracking-[0.2em] opacity-50">
          Seconds
        </span>
      </div>
    </div>
  );
}
