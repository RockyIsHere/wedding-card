'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Plane, Hotel, PlayCircle, Sparkles } from 'lucide-react';
import EnvelopeReveal from '@/components/EnvelopeReveal';
import CustomCursor from '@/components/CustomCursor';
import SmoothScroll from '@/components/SmoothScroll';
import HeroAnimation from '@/components/HeroAnimation';
import Countdown from '@/components/Countdown';
import MobileNav from '@/components/MobileNav';
import ScrollAnimations from '@/components/ScrollAnimations';
import ScrollReveal from '@/components/ScrollReveal';
import { cn } from '@/lib/utils';

export default function Home() {
  const [loaderComplete, setLoaderComplete] = useState(false);

  useEffect(() => {
    if (!loaderComplete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loaderComplete]);

  return (
    <>
      {!loaderComplete && <EnvelopeReveal onComplete={() => setLoaderComplete(true)} />}
      <CustomCursor />
      <MobileNav />
      <div className="noise" />

      <SmoothScroll>
        <ScrollAnimations />

        {/* Desktop Nav - Modern Floating Capsule */}
        <nav className="hidden lg:flex fixed top-6 left-1/2 -translate-x-1/2 px-8 py-3.5 rounded-full glass-panel z-40 border border-[#d4af37]/20 shadow-2xl items-center gap-12 text-white/90">
          <div className="logo font-serif font-bold text-xl tracking-widest text-gradient">R & S</div>
          <div className="flex gap-8 text-[10px] tracking-[0.25em] uppercase font-semibold">
            <a href="#couple" className="hover:text-[#d4af37] transition-colors">The Couple</a>
            <a href="#gallery" className="hover:text-[#d4af37] transition-colors">Moments</a>
            <a href="#events" className="hover:text-[#d4af37] transition-colors">Events</a>
            <a href="#travel" className="hover:text-[#d4af37] transition-colors">Travel</a>
            <a href="#rsvp" className="hover:text-[#d4af37] transition-colors">RSVP</a>
          </div>
        </nav>

        <main className="pb-20">
          <HeroAnimation active={loaderComplete} />

          {/* The Couple Section - Architectural Editorial */}
          <section id="couple" className="container mx-auto px-6 py-24 lg:py-40 relative">
            {/* Background luxury gradient glow */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70%] aspect-square rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.025)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none -z-10" />

            <ScrollReveal width="100%">
              <div className="text-center mb-20 lg:mb-28">
                <div className="text-xs lg:text-sm text-[#d4af37] tracking-[0.5em] uppercase mb-4 font-semibold">The Couple</div>
                <h2 className="font-serif text-4xl lg:text-7xl font-bold text-gradient leading-tight">
                  Meet the Bride <br className="lg:hidden" />& Groom
                </h2>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center max-w-5xl mx-auto">
              <ScrollReveal mode="fade-up" delay={0.1}>
                <div className="group relative">
                  {/* Rocky: Unique Arch Top-Left Card */}
                  <div 
                    className="aspect-[4/5] overflow-hidden rounded-tl-[8rem] rounded-br-[8rem] rounded-tr-[2rem] rounded-bl-[2rem] border border-[#d4af37]/20 relative shadow-2xl"
                    style={{ boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.4)' }}
                  >
                    <div className="absolute inset-0 bg-[#030d0a]/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/0723150E-7ED6-4368-ADEA-08AA264E6FE5_1_105_c.jpeg"
                      alt="Rocky"
                      width={800}
                      height={1000}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="font-serif text-3xl mb-2 text-gradient">Rocky</h3>
                    <p className="text-[10px] uppercase tracking-[3px] text-white/50 font-semibold">The Groom</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal mode="fade-up" delay={0.2}>
                <div className="group relative lg:translate-y-20">
                  {/* Swarupa: Unique Arch Top-Right Card */}
                  <div 
                    className="aspect-[4/5] overflow-hidden rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-[2rem] rounded-br-[2rem] border border-[#d4af37]/20 relative shadow-2xl"
                    style={{ boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.4)' }}
                  >
                    <div className="absolute inset-0 bg-[#030d0a]/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/0BB9FCA6-7404-4973-973C-4D2E71733C2E_1_105_c.jpeg"
                      alt="Swarupa"
                      width={800}
                      height={1000}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="font-serif text-3xl mb-2 text-gradient">Swarupa</h3>
                    <p className="text-[10px] uppercase tracking-[3px] text-white/50 font-semibold">The Bride</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Story Reveal */}
          <section id="story" className="container mx-auto px-6 py-24 flex justify-center">
            <div className="max-w-4xl text-center">
              {[
                "From shared laughter",
                "to quiet understandings,",
                "our journey has been",
                "written in the stars."
              ].map((text, i) => (
                <ScrollReveal key={i} mode="blur-in" delay={i * 0.1}>
                  <p className="font-serif text-3xl lg:text-5xl leading-tight opacity-90 mb-2">{text}</p>
                </ScrollReveal>
              ))}
              <div className="h-12" />
              {[
                "Now, as we prepare",
                "to walk hand in hand,",
                "we invite you to be",
                "part of our forever."
              ].map((text, i) => (
                <ScrollReveal key={`part2-${i}`} mode="blur-in" delay={0.4 + i * 0.1}>
                  <p className="font-serif text-3xl lg:text-5xl leading-tight opacity-90 mb-2">{text}</p>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Gallery Section - Asymmetrical High-End Editorial Collage */}
          <section id="gallery" className="container mx-auto px-6 py-28 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.015)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none -z-10" />

            <ScrollReveal width="100%" className="w-full mb-20 text-center">
              <div className="text-xs text-[#d4af37] tracking-[0.5em] uppercase mb-4 font-semibold">Captured Frames</div>
              <h2 className="font-serif text-4xl lg:text-7xl font-bold text-gradient leading-tight">Our Moments</h2>
            </ScrollReveal>
            
            {/* High-End Editorial Collage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Photo 1: Classical Arch - Top Left */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <ScrollReveal mode="scale-up" width="100%" className="h-full">
                  <div className="group relative h-[450px] overflow-hidden rounded-t-full border border-[#d4af37]/25 shadow-2xl bg-[#041a15]">
                    <div className="absolute inset-0 border border-[#d4af37]/15 rounded-t-full z-20 pointer-events-none m-1.5" />
                    <div className="absolute inset-0 bg-[#030d0a]/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/1DAAEF87-CA53-4609-B0FC-207C09E1F005_1_105_c.jpeg"
                      alt="Moment 1"
                      fill
                      className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute bottom-6 left-6 z-20 text-left">
                      <span className="font-playfair italic text-2xl text-gradient block drop-shadow-md">The First Glimpse</span>
                      <span className="text-[8px] uppercase tracking-[3px] text-white/50 block mt-1">Memory 01</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Photo 2: High Circular Oval - Top Right */}
              <div className="md:col-span-5 flex flex-col justify-end">
                <ScrollReveal mode="scale-up" delay={0.15} width="100%">
                  <div className="group relative h-[380px] overflow-hidden rounded-[8rem] border border-[#d4af37]/25 shadow-2xl bg-[#041a15]">
                    <div className="absolute inset-0 border border-[#d4af37]/15 rounded-[8rem] z-20 pointer-events-none m-1.5" />
                    <div className="absolute inset-0 bg-[#030d0a]/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/334AE3C6-7F21-400D-96E5-AFB67ADBA50A_1_105_c.jpeg"
                      alt="Moment 2"
                      fill
                      className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center w-full px-4">
                      <span className="font-playfair italic text-xl text-gradient block drop-shadow-md">Quiet Echoes</span>
                      <span className="text-[8px] uppercase tracking-[3px] text-white/50 block mt-1">Memory 02</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Photo 3: Asymmetrical Oval Bottom Left */}
              <div className="md:col-span-5">
                <ScrollReveal mode="scale-up" delay={0.2} width="100%">
                  <div className="group relative h-[420px] overflow-hidden rounded-tl-[8rem] rounded-br-[8rem] rounded-tr-[2rem] rounded-bl-[2rem] border border-[#d4af37]/25 shadow-2xl bg-[#041a15]">
                    <div className="absolute inset-0 border border-[#d4af37]/15 rounded-tl-[8rem] rounded-br-[8rem] rounded-tr-[2rem] rounded-bl-[2rem] z-20 pointer-events-none m-1.5" />
                    <div className="absolute inset-0 bg-[#030d0a]/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/3A1AFBD4-1BA3-49B9-B1A3-4C280EB99F33_1_105_c.jpeg"
                      alt="Moment 3"
                      fill
                      className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute bottom-6 left-6 z-20 text-left">
                      <span className="font-playfair italic text-xl text-gradient block drop-shadow-md">Hand in Hand</span>
                      <span className="text-[8px] uppercase tracking-[3px] text-white/50 block mt-1">Memory 03</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Photo 4: Circular Frame - Center Right */}
              <div className="md:col-span-7 flex flex-col justify-start">
                <ScrollReveal mode="scale-up" delay={0.25} width="100%">
                  <div className="group relative h-[360px] overflow-hidden rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-[2rem] rounded-br-[2rem] border border-[#d4af37]/25 shadow-2xl bg-[#041a15]">
                    <div className="absolute inset-0 border border-[#d4af37]/15 rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-[2rem] rounded-br-[2rem] z-20 pointer-events-none m-1.5" />
                    <div className="absolute inset-0 bg-[#030d0a]/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/3CAEFE12-A0A9-43BE-B44C-298BCD16DE50_1_105_c.jpeg"
                      alt="Moment 4"
                      fill
                      className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute bottom-6 left-6 z-20 text-left">
                      <span className="font-playfair italic text-xl text-gradient block drop-shadow-md">Vows in Silence</span>
                      <span className="text-[8px] uppercase tracking-[3px] text-white/50 block mt-1">Memory 04</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Photo 5: Full-Width Squircle Editorial Cover Frame */}
              <div className="md:col-span-12 mt-4">
                <ScrollReveal mode="scale-up" delay={0.3} width="100%">
                  <div className="group relative h-[450px] overflow-hidden rounded-[3rem] border border-[#d4af37]/25 shadow-2xl bg-[#041a15]">
                    <div className="absolute inset-0 border border-[#d4af37]/15 rounded-[3rem] z-20 pointer-events-none m-1.5" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030d0a]/90 via-[#030d0a]/20 to-transparent z-10" />
                    <Image
                      src="/images/4940F7E4-48B2-4DA6-8A1E-385EA52FB540_1_105_c.jpeg"
                      alt="Moment 5"
                      fill
                      className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                    <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
                      <div className="text-left">
                        <span className="font-playfair text-3xl md:text-4xl text-gradient block font-semibold drop-shadow-md">Forever Begins</span>
                        <span className="text-[9px] uppercase tracking-[4px] text-white/50 block mt-1.5 font-medium"> Rocky & Swarupa • Complete Gallery Collection</span>
                      </div>
                      <div className="hidden md:block">
                        <span className="text-[8px] uppercase tracking-[3px] text-[#d4af37] border border-[#d4af37]/30 px-4 py-2 rounded-full bg-[#d4af37]/5 font-semibold">Memory 05</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Events Section - Premium Editorial Glass Cards */}
          <section id="events" className="container mx-auto px-6 py-28 relative">
             {/* Background glow */}
             <div className="absolute top-[50%] left-[10%] w-[50%] aspect-square rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.025)_0%,_rgba(0,0,0,0)_75%)] pointer-events-none -z-10" />

             <ScrollReveal width="100%" className="w-full mb-24 text-center">
               <div className="text-xs text-[#d4af37] tracking-[0.5em] uppercase mb-4 font-semibold">The Schedule</div>
               <h2 className="font-serif text-4xl lg:text-7xl font-bold text-gradient leading-tight">The Celebration</h2>
             </ScrollReveal>
 
             <div className="flex flex-col gap-24 max-w-5xl mx-auto">
                {/* Event 1: The Holy Union */}
                <ScrollReveal mode="fade-up">
                  <div 
                    className="glass-panel p-8 md:p-12 rounded-[3.5rem] border border-[#d4af37]/20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center group relative overflow-hidden shadow-3xl"
                  >
                    {/* Glowing gold halo */}
                    <div className="absolute -right-24 -bottom-24 w-64 h-64 rounded-full bg-[#d4af37]/4 blur-3xl pointer-events-none group-hover:bg-[#d4af37]/8 transition-all duration-700" />
                    
                    {/* Left Column: Arched Image Frame */}
                    <div className="lg:col-span-5 flex justify-center">
                      <div className="w-[280px] h-[360px] relative rounded-t-full overflow-hidden border-2 border-[#d4af37]/35 shadow-2xl bg-[#041a15]">
                        <div className="absolute inset-[3px] border border-[#d4af37]/20 rounded-t-full z-20 pointer-events-none" />
                        <Image
                          src="/images/4C4177A9-BCD2-4702-B662-F072FAC52E03_1_105_c.jpeg"
                          alt="The Holy Union"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                      </div>
                    </div>

                    {/* Right Column: Editorial Invitation Content */}
                    <div className="lg:col-span-7 flex flex-col justify-center text-left">
                      <div className="text-[#d4af37] text-xs font-bold uppercase tracking-[4px] mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                        Sacred Rituals
                      </div>
                      <h3 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-white">The Holy Union</h3>
                      <p className="opacity-70 mb-8 leading-relaxed text-sm md:text-base text-white/80">
                        A traditional ceremony filled with sacred rituals, love, and light at Swarupa&apos;s residence. Join us as we exchange vows under the auspicious canopy.
                      </p>
                      
                      {/* Stylized Metadata Panel */}
                      <div className="grid grid-cols-3 border-t border-b border-[#d4af37]/15 py-4 mb-8 text-center md:text-left gap-4">
                        <div>
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-white/60">Date</span>
                          <span className="font-playfair text-sm md:text-base text-[#d4af37] font-semibold mt-1 block">Nov 25, 2026</span>
                        </div>
                        <div className="border-l border-[#d4af37]/15 pl-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-white/60">Time</span>
                          <span className="font-playfair text-sm md:text-base text-white font-semibold mt-1 block">7:00 PM IST</span>
                        </div>
                        <div className="border-l border-[#d4af37]/15 pl-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-white/60">Auspicious</span>
                          <span className="font-playfair text-sm md:text-base text-white font-semibold mt-1 block">Subho Vivaha</span>
                        </div>
                      </div>

                      <div>
                        <a 
                          href="https://maps.app.goo.gl/7a2rL8KxKAikxszn6" 
                          target="_blank" 
                          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#d4af37]/35 text-[10px] uppercase tracking-[3px] text-[#d4af37] bg-[#d4af37]/5 hover:bg-[#d4af37] hover:text-black hover:scale-103 transition-all duration-300 font-semibold"
                        >
                          <MapPin size={12} /> View Location Map
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
  
                {/* Event 2: The Reception */}
                <ScrollReveal mode="fade-up" delay={0.15}>
                  <div 
                    className="glass-panel p-8 md:p-12 rounded-[3.5rem] border border-[#d4af37]/20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center group relative overflow-hidden shadow-3xl"
                  >
                    {/* Glowing gold halo */}
                    <div className="absolute -left-24 -bottom-24 w-64 h-64 rounded-full bg-[#d4af37]/4 blur-3xl pointer-events-none group-hover:bg-[#d4af37]/8 transition-all duration-700" />
                    
                    {/* Left Column: Editorial Invitation Content (Swapped in desktop row order) */}
                    <div className="lg:col-span-7 lg:order-1 flex flex-col justify-center text-left lg:text-right lg:items-end">
                      <div className="text-[#d4af37] text-xs font-bold uppercase tracking-[4px] mb-3 flex items-center gap-2 lg:flex-row-reverse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                        Gala Evening
                      </div>
                      <h3 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-white">The Reception</h3>
                      <p className="opacity-70 mb-8 leading-relaxed text-sm md:text-base text-white/80 lg:text-right">
                        An evening of joyous celebration, banquet dinner, and dancing to mark our new chapter. We look forward to raising a toast together with family and friends.
                      </p>
                      
                      {/* Stylized Metadata Panel */}
                      <div className="grid grid-cols-3 border-t border-b border-[#d4af37]/15 py-4 mb-8 text-center lg:text-right gap-4 w-full">
                        <div className="lg:pr-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-white/60">Date</span>
                          <span className="font-playfair text-sm md:text-base text-[#d4af37] font-semibold mt-1 block">Nov 27, 2026</span>
                        </div>
                        <div className="border-l lg:border-l-0 lg:border-r border-[#d4af37]/15 pl-4 lg:pl-0 lg:pr-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-white/60">Time</span>
                          <span className="font-playfair text-sm md:text-base text-white font-semibold mt-1 block">6:30 PM IST</span>
                        </div>
                        <div className="border-l lg:border-l-0 border-[#d4af37]/15 pl-4 lg:pl-0">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-white/60">Attire</span>
                          <span className="font-playfair text-sm md:text-base text-white font-semibold mt-1 block">Formal / Ethnic</span>
                        </div>
                      </div>

                      <div>
                        <a 
                          href="https://maps.app.goo.gl/e6Pe3Rqv6buPnV8S6" 
                          target="_blank" 
                          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#d4af37]/35 text-[10px] uppercase tracking-[3px] text-[#d4af37] bg-[#d4af37]/5 hover:bg-[#d4af37] hover:text-black hover:scale-103 transition-all duration-300 font-semibold"
                        >
                          <MapPin size={12} /> View Location Map
                        </a>
                      </div>
                    </div>

                    {/* Right Column: Arched Image Frame */}
                    <div className="lg:col-span-5 lg:order-2 flex justify-center">
                      <div className="w-[280px] h-[360px] relative rounded-t-full overflow-hidden border-2 border-[#d4af37]/35 shadow-2xl bg-[#041a15]">
                        <div className="absolute inset-[3px] border border-[#d4af37]/20 rounded-t-full z-20 pointer-events-none" />
                        <Image
                          src="/images/5F4CA362-2A3D-4155-9ABD-6C5B83B5ACD3_1_105_c.jpeg"
                          alt="The Reception"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
             </div>
          </section>

          {/* Travel & Accommodation - Premium Luxury Ticket Dossier */}
          <section id="travel" className="container mx-auto px-6 py-28 max-w-5xl relative">
            {/* Ambient coordinate geometry background */}
            <div className="absolute top-[10%] right-[10%] w-[180px] h-[180px] border border-[#d4af37]/5 rounded-full pointer-events-none flex items-center justify-center animate-[spin_60s_linear_infinite]">
              <div className="w-[140px] h-[140px] border border-dashed border-[#d4af37]/5 rounded-full" />
              <div className="absolute w-[1px] h-full bg-[#d4af37]/3" />
              <div className="absolute h-[1px] w-full bg-[#d4af37]/3" />
            </div>

            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              {/* Left Column: Dossier Brief */}
              <div className="lg:col-span-5 text-left">
                <ScrollReveal>
                  <div className="text-xs text-[#d4af37] tracking-[0.5em] uppercase mb-4 font-semibold">Practicalities</div>
                  <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gradient leading-tight mb-6">Travel & Stay</h2>
                  <p className="opacity-70 leading-relaxed text-sm md:text-base text-white/80 mb-8">
                     To ensure your journey is seamless, we have arranged special rates and curated detailed concierge guides for your travel and accommodation.
                  </p>
                  
                  {/* Subtle luxurious accent quote */}
                  <div className="border-l-2 border-[#d4af37]/30 pl-4 py-1 italic text-white/60 text-xs tracking-wide">
                    "Two journeys converging into one, and we'd be honored to have you witness our first steps."
                  </div>
                </ScrollReveal>
              </div>
  
              {/* Right Column: Luxury Premium Ticket Stubs */}
              <div className="lg:col-span-7 grid gap-8">
                {/* Ticket Stub 1: Transit Guide */}
                <ScrollReveal mode="fade-up" delay={0.1}>
                  <div className="glass-panel rounded-[2.5rem] border border-[#d4af37]/15 hover:border-[#d4af37]/35 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-stretch group">
                    {/* Dotted ticket stub divider circle cutout */}
                    <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030d0a] border border-[#d4af37]/15 z-20" />
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030d0a] border border-[#d4af37]/15 z-20" />
                    
                    {/* Ticket Stub Left Header Badge */}
                    <div className="md:w-1/4 bg-[#d4af37]/5 border-b md:border-b-0 md:border-r border-dashed border-[#d4af37]/20 flex flex-col justify-center items-center p-6 text-center shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/20 mb-3 shadow-inner">
                        <Plane size={24} className="group-hover:rotate-12 transition-transform duration-500" />
                      </div>
                      <span className="text-[8px] uppercase tracking-[3px] text-white/50 block font-semibold">TICKET</span>
                      <span className="font-playfair text-xs font-bold text-[#d4af37] mt-0.5 block">TRANSIT</span>
                    </div>

                    {/* Ticket Details */}
                    <div className="md:w-3/4 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-2xl mb-2 text-white font-semibold">Getting Here</h3>
                        <p className="opacity-70 text-xs leading-relaxed text-white/70">
                          Nearest Airport: **CCU** (Netaji Subhash Chandra Bose). Private luxury taxi pre-booking is available through our concierge (Approx 2-hour drive).
                        </p>
                      </div>
                      
                      <div className="border-t border-[#d4af37]/10 mt-6 pt-4 flex justify-between items-center text-[9px] uppercase tracking-[2px] text-white/40">
                        <span>Transit Desk</span>
                        <span className="text-[#d4af37] font-semibold">CCU Airport Transfer</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
  
                {/* Ticket Stub 2: Guest Stay */}
                <ScrollReveal mode="fade-up" delay={0.2}>
                  <div className="glass-panel rounded-[2.5rem] border border-[#d4af37]/15 hover:border-[#d4af37]/35 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-stretch group">
                    {/* Dotted ticket stub divider circle cutout */}
                    <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030d0a] border border-[#d4af37]/15 z-20" />
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#030d0a] border border-[#d4af37]/15 z-20" />
                    
                    {/* Ticket Stub Left Header Badge */}
                    <div className="md:w-1/4 bg-[#d4af37]/5 border-b md:border-b-0 md:border-r border-dashed border-[#d4af37]/20 flex flex-col justify-center items-center p-6 text-center shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/20 mb-3 shadow-inner">
                        <Hotel size={24} className="group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="text-[8px] uppercase tracking-[3px] text-white/50 block font-semibold">LODGING</span>
                      <span className="font-playfair text-xs font-bold text-[#d4af37] mt-0.5 block">SUITE</span>
                    </div>

                    {/* Ticket Details */}
                    <div className="md:w-3/4 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-2xl mb-2 text-white font-semibold">Guest Lodging</h3>
                        <p className="opacity-70 text-xs leading-relaxed text-white/70">
                          We have reserved rooms at **The Grand Regency** & **Heritage Inn**. Please contact our guest relations desk for personalized suite assignments.
                        </p>
                      </div>
                      
                      <div className="border-t border-[#d4af37]/10 mt-6 pt-4 flex justify-between items-center">
                        <span className="text-[8px] uppercase tracking-[2px] text-white/40 block my-auto">Concierge Hotline</span>
                        <a 
                          href="tel:+917029406424" 
                          className="px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black border border-[#d4af37]/35 text-[9px] uppercase tracking-widest text-[#d4af37] transition-all duration-300 font-bold"
                        >
                          Call Hospitality
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Wedding Playlist - Album Art Aesthetic */}
          <section className="container mx-auto px-6 py-28 text-center relative">
            <ScrollReveal width="100%" className="w-full">
              <div className="text-xs text-[#d4af37] tracking-[0.5em] uppercase mb-4 font-semibold">The Sound of Us</div>
              <h2 className="font-serif text-4xl md:text-5xl text-gradient mb-16">Wedding Playlist</h2>
            </ScrollReveal>
            
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {[
                { title: "Perfect", artist: "Ed Sheeran", time: "4:23" },
                { title: "Tum Hi Ho", artist: "Arijit Singh", time: "5:10" },
                { title: "Can't Help Falling In Love", artist: "Elvis Presley", time: "3:01" }
              ].map((track, i) => (
                <ScrollReveal key={i} mode="scale-up" delay={i * 0.08} width="100%">
                  <div 
                    className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:bg-[#d4af37]/5 border border-[#d4af37]/10 hover:border-[#d4af37]/35 transition-all duration-500 cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-5">
                      {/* Premium Custom Player Button */}
                      <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/25 group-hover:scale-105 group-hover:bg-[#d4af37] group-hover:text-[#030d0a] transition-all duration-500 shadow-md">
                        <PlayCircle size={22} fill="currentColor" className="opacity-90" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-base md:text-lg text-white group-hover:text-[#d4af37] transition-colors">{track.title}</div>
                        <div className="text-[9px] opacity-60 uppercase tracking-[2px] mt-0.5 text-white/70">{track.artist}</div>
                      </div>
                    </div>
                    <div className="text-xs opacity-50 font-mono text-white/50">{track.time}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
 
          {/* Countdown & RSVP Final Card - High Contrast Luxury */}
          <section className="container mx-auto px-6 py-32 text-center relative">
            <div className="absolute top-[30%] left-[50%] -translate-x-[50%] w-[80%] aspect-square rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.015)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none -z-10" />

            <ScrollReveal width="100%" className="w-full">
              <div className="mb-20 max-w-3xl mx-auto">
                <h2 className="font-serif text-4xl md:text-6xl text-gradient mb-8">Counting Every Heartbeat</h2>
                <Countdown />
              </div>
            </ScrollReveal>
 
            <ScrollReveal width="100%" className="w-full" delay={0.15} mode="scale-up">
              <div 
                id="rsvp" 
                className="mt-20 max-w-3xl mx-auto glass-panel p-8 md:p-16 rounded-[4rem] border border-[#d4af37]/35 relative overflow-hidden shadow-3xl bg-gradient-to-b from-[#051c15]/60 to-[#030d0a]/90"
              >
                {/* Thin internal border */}
                <div className="absolute inset-[5px] border border-[#d4af37]/20 rounded-[3.7rem] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.04)_0%,_rgba(0,0,0,0)_80%)] z-0" />
                
                {/* RSVP Card Inner Stationary Folder Frame */}
                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]/70 bg-[#d4af37]/5 mb-6">
                     <Sparkles size={20} className="animate-spin-slow" />
                   </div>
                   <span className="text-[10px] tracking-[5px] uppercase text-[#d4af37] font-bold mb-4">[ REQUIÊTE DE RÉPONSE ]</span>
                   <h3 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Ready to celebrate with us?</h3>
                   <p className="text-white/70 text-xs md:text-sm max-w-lg mb-10 leading-relaxed">
                     We kindly request you to secure your attendance by **September 25, 2026** so we may curate a delightful experience for your presence.
                   </p>

                   {/* Custom RSVP Stationary Interactive Selector */}
                   <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center items-center">
                     {/* Accepts with Joy Option */}
                     <a 
                       href="mailto:rockyandswarupa@gmail.com?subject=RSVP - Accepts with Joy&body=Dearest Rocky %26 Swarupa,%0D%0A%0D%0AI/We would be absolutely delighted to accept your gracious invitation to celebrate your union from Nov 25 — Nov 27, 2026.%0D%0A%0D%0AWith love and blessings,%0D%0A[Your Name]" 
                       className="w-full md:w-1/2 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#aa8010] text-[#030d0a] font-bold text-xs uppercase tracking-[3px] rounded-full shadow-lg shadow-black/40 hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 border border-[#fff2b3]/20 cursor-pointer flex items-center justify-center gap-2"
                     >
                       Accepts with Joy
                     </a>

                     {/* Declines with Regret Option */}
                     <a 
                       href="mailto:rockyandswarupa@gmail.com?subject=RSVP - Declines with Regret&body=Dearest Rocky %26 Swarupa,%0D%0A%0D%0AI/We sincerely regret that due to prior commitments, we will be unable to accept your gracious invitation to celebrate your union.%0D%0A%0D%0ASending you our warmest congratulations and blessings for your beautiful journey ahead.%0D%0A%0D%0AWith warm regards,%0D%0A[Your Name]" 
                       className="w-full md:w-1/2 px-8 py-4 bg-transparent text-[#d4af37] font-semibold text-xs uppercase tracking-[3px] rounded-full border border-[#d4af37]/35 hover:bg-[#d4af37]/5 hover:border-[#d4af37] hover:scale-[1.04] transition-all duration-300 cursor-pointer flex items-center justify-center"
                     >
                       Declines with Regret
                     </a>
                   </div>

                   <p className="mt-10 opacity-50 text-[9px] tracking-[4px] uppercase text-white/80">Kindly RSVP by September 25, 2026</p>
                </div>
              </div>
            </ScrollReveal>
          </section>

        </main>

        <footer className="py-12 border-t border-white/10 text-center opacity-40 text-xs tracking-[0.2em]">
          <div className="mb-4 text-xl font-serif">R & S</div>
          <p>CURATED WITH LOVE © 2026</p>
        </footer>
      </SmoothScroll>
    </>
  );
}
