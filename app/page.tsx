'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Plane, Hotel, PlayCircle } from 'lucide-react';
import Loader from '@/components/Loader';
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

  return (
    <>
      {!loaderComplete && <Loader onComplete={() => setLoaderComplete(true)} />}
      <CustomCursor />
      <MobileNav />
      <div className="noise" />

      <SmoothScroll>
        <ScrollAnimations />

        {/* Desktop Nav - Hidden on touch, minimalist on desktop */}
        <nav className="hidden lg:flex fixed top-0 w-full p-8 justify-between items-center z-40 mix-blend-difference text-white">
          <div className="logo font-serif font-bold text-2xl">R & S</div>
          <div className="flex gap-8 text-xs tracking-[0.2em] uppercase">
            <a href="#couple" className="hover:text-[var(--accent)] transition-colors">The Couple</a>
            <a href="#gallery" className="hover:text-[var(--accent)] transition-colors">Moments</a>
            <a href="#events" className="hover:text-[var(--accent)] transition-colors">Events</a>
            <a href="#travel" className="hover:text-[var(--accent)] transition-colors">Travel</a>
            <a href="#rsvp" className="hover:text-[var(--accent)] transition-colors">RSVP</a>
          </div>
        </nav>

        <main className="pb-20">
          <HeroAnimation />

          {/* The Couple Section */}
          <section id="couple" className="container mx-auto px-6 py-24 lg:py-40">
            <ScrollReveal width="100%">
              <div className="text-center mb-16 lg:mb-24">
                <div className="text-xs lg:text-sm text-[var(--accent)] tracking-[0.4em] uppercase mb-4">The Happy Couple</div>
                <h2 className="font-serif text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                  Meet the Bride <br className="lg:hidden" />& Groom
                </h2>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <ScrollReveal mode="fade-up" delay={0.1}>
                <div className="group relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/0723150E-7ED6-4368-ADEA-08AA264E6FE5_1_105_c.jpeg"
                      alt="Rocky"
                      width={800}
                      height={1000}
                      className="w-full h-full object-cover grayscale-0 lg:grayscale lg:group-hover:grayscale-0 scale-100 lg:group-hover:scale-110 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="font-serif text-4xl mb-2 text-gradient">Rocky</h3>
                    <p className="text-xs uppercase tracking-[0.2em] opacity-60">The Groom</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal mode="fade-up" delay={0.2}>
                <div className="group relative lg:translate-y-20">
                  <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src="/images/0BB9FCA6-7404-4973-973C-4D2E71733C2E_1_105_c.jpeg"
                      alt="Swarupa"
                      width={800}
                      height={1000}
                      className="w-full h-full object-cover grayscale-0 lg:grayscale lg:group-hover:grayscale-0 scale-100 lg:group-hover:scale-110 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="font-serif text-4xl mb-2 text-gradient">Swarupa</h3>
                    <p className="text-xs uppercase tracking-[0.2em] opacity-60">The Bride</p>
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

          {/* Gallery Section */}
          <section id="gallery" className="container mx-auto px-6 py-24">
            <ScrollReveal className="mb-16">
              <div className="text-xs text-[var(--accent)] tracking-[0.4em] uppercase mb-4">Captured Frames</div>
              <h2 className="font-serif text-4xl lg:text-6xl text-white">Our Moments</h2>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
              {[
                "/images/1DAAEF87-CA53-4609-B0FC-207C09E1F005_1_105_c.jpeg",
                "/images/334AE3C6-7F21-400D-96E5-AFB67ADBA50A_1_105_c.jpeg",
                "/images/3A1AFBD4-1BA3-49B9-B1A3-4C280EB99F33_1_105_c.jpeg",
                "/images/3CAEFE12-A0A9-43BE-B44C-298BCD16DE50_1_105_c.jpeg",
                "/images/4940F7E4-48B2-4DA6-8A1E-385EA52FB540_1_105_c.jpeg"
              ].map((src, idx) => (
                <ScrollReveal 
                  key={idx} 
                  mode="scale-up" 
                  delay={idx * 0.1}
                  className={cn(
                    "relative overflow-hidden rounded-2xl group border border-white/5 bg-white/5",
                    idx % 3 === 0 ? "lg:row-span-2" : ""
                  )}
                  width="100%"
                >
                  <Image
                    src={src}
                    alt={`Moment ${idx + 1}`}
                    fill
                    className="object-cover grayscale-0 lg:grayscale lg:group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-xs uppercase tracking-widest text-[#d4af37]">Memory {idx + 1}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Events Section */}
          <section id="events" className="container mx-auto px-0 py-24">
             <ScrollReveal className="px-6 mb-12">
               <h2 className="font-serif text-5xl text-center">The Celebration</h2>
             </ScrollReveal>

             <div className="flex flex-col gap-8 px-4 lg:px-0 max-w-5xl mx-auto">
                <ScrollReveal mode="fade-up">
                  <div className="glass-panel p-8 rounded-3xl md:flex gap-12 items-center group">
                    <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] relative rounded-2xl overflow-hidden mb-6 md:mb-0">
                      <Image
                        src="/images/4C4177A9-BCD2-4702-B662-F072FAC52E03_1_105_c.jpeg"
                        alt="Wedding"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="text-[#d4af37] text-xs uppercase tracking-[0.2em] mb-4">Nov 25 • 7:00 PM</div>
                      <h3 className="font-serif text-4xl mb-4">The Holy Union</h3>
                      <p className="opacity-70 mb-8 leading-relaxed">
                        A traditional ceremony filled with rituals, love, and light at Swarupa&apos;s residence.
                      </p>
                      <a href="https://maps.app.goo.gl/7a2rL8KxKAikxszn6" target="_blank" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors">
                        <MapPin size={16} /> View Location
                      </a>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal mode="fade-up" delay={0.2}>
                  <div className="glass-panel p-8 rounded-3xl md:flex flex-row-reverse gap-12 items-center group">
                    <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] relative rounded-2xl overflow-hidden mb-6 md:mb-0">
                      <Image
                        src="/images/5F4CA362-2A3D-4155-9ABD-6C5B83B5ACD3_1_105_c.jpeg"
                        alt="Reception"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="w-full md:w-1/2 text-left md:text-right">
                      <div className="text-[#d4af37] text-xs uppercase tracking-[0.2em] mb-4">Nov 27 • 6:30 PM</div>
                      <h3 className="font-serif text-4xl mb-4">The Reception</h3>
                      <p className="opacity-70 mb-8 leading-relaxed">
                        An evening of celebration, banquet dinner, and dancing to mark our new chapter.
                      </p>
                      <a href="https://maps.app.goo.gl/e6Pe3Rqv6buPnV8S6" target="_blank" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest hover:text-[#d4af37] transition-colors justify-start md:justify-end">
                        <MapPin size={16} /> View Location
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
             </div>
          </section>

          {/* Travel & Accommodation */}
          <section id="travel" className="container mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
              <ScrollReveal>
                <div className="text-xs text-[var(--accent)] tracking-[0.4em] uppercase mb-4">Practicalities</div>
                <h2 className="font-serif text-5xl mb-6">Travel & Stay</h2>
                <p className="opacity-60 leading-relaxed max-w-md">
                   We have arranged special rates for our guests traveling from afar. Please book your stay by October 2026.
                </p>
              </ScrollReveal>

              <div className="grid gap-6">
                <ScrollReveal mode="fade-up" delay={0.1}>
                  <div className="glass-panel p-8 rounded-2xl">
                    <Plane className="text-[#d4af37] mb-4" size={32} />
                    <h3 className="font-serif text-2xl mb-2">Getting Here</h3>
                    <p className="opacity-70 text-sm">
                      Nearest Airport: CCU (Netaji Subhash Chandra Bose). Private taxis available (Approx 2 hrs).
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal mode="fade-up" delay={0.2}>
                  <div className="glass-panel p-8 rounded-2xl">
                    <Hotel className="text-[#d4af37] mb-4" size={32} />
                    <h3 className="font-serif text-2xl mb-2">Guest Stay</h3>
                    <p className="opacity-70 text-sm">
                       <strong>The Grand Regency</strong> or <strong>Heritage Inn</strong>. <br/>
                       Concierge: +91 98765 43210
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Wedding Playlist */}
          <section className="container mx-auto px-6 py-24 text-center">
            <ScrollReveal>
              <div className="text-xs text-[var(--accent)] tracking-[0.4em] uppercase mb-4">The Sound of Us</div>
              <h2 className="font-serif text-5xl mb-12">Wedding Playlist</h2>
            </ScrollReveal>
            
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {[
                { title: "Perfect", artist: "Ed Sheeran", time: "4:23" },
                { title: "Tum Hi Ho", artist: "Arijit Singh", time: "5:10" },
                { title: "Can't Help Falling In Love", artist: "Elvis Presley", time: "3:01" }
              ].map((track, i) => (
                <ScrollReveal key={i} mode="scale-up" delay={i * 0.1} width="100%">
                  <div className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                        <PlayCircle size={24} fill="currentColor" className="opacity-80" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg">{track.title}</div>
                        <div className="text-xs opacity-50 uppercase tracking-widest">{track.artist}</div>
                      </div>
                    </div>
                    <div className="text-xs opacity-50 font-mono">{track.time}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Countdown & CTA */}
          <section className="container mx-auto px-6 py-40 text-center">
            <ScrollReveal>
              <div className="mb-12">
                <h2 className="font-serif text-5xl lg:text-7xl mb-8">Counting Every Heartbeat</h2>
                <Countdown />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} mode="scale-up">
              <div id="rsvp" className="mt-24 max-w-2xl mx-auto glass-panel p-12 rounded-[3rem] border border-[var(--accent)]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--accent)]/5 z-0" />
                <div className="relative z-10">
                   <h3 className="font-serif text-4xl mb-8">Ready to celebrate with us?</h3>
                   <a 
                     href="mailto:rockyandswarupa@gmail.com?subject=RSVP - Wedding Celebration" 
                     className="inline-block px-12 py-4 bg-[var(--accent)] text-black font-bold rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300"
                   >
                     SECURE YOUR SPOT
                   </a>
                   <p className="mt-6 opacity-40 text-xs tracking-widest uppercase">RSVP by September 25, 2026</p>
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
