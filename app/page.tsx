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
import ThemeToggle from '@/components/ThemeToggle';
import useWeddingContent from '@/lib/useWeddingContent';

// ─── Local fallback data (used when Firebase doc is missing or empty) ─────────

const FB_GROOM_PHOTO = '/images/0723150E-7ED6-4368-ADEA-08AA264E6FE5_1_105_c.jpeg';
const FB_BRIDE_PHOTO = '/images/0BB9FCA6-7404-4973-973C-4D2E71733C2E_1_105_c.jpeg';

const FALLBACK_GALLERY = [
  { url: '/images/1DAAEF87-CA53-4609-B0FC-207C09E1F005_1_105_c.jpeg', caption: 'The First Glimpse', label: 'Memory 01' },
  { url: '/images/334AE3C6-7F21-400D-96E5-AFB67ADBA50A_1_105_c.jpeg', caption: 'Quiet Echoes', label: 'Memory 02' },
  { url: '/images/3A1AFBD4-1BA3-49B9-B1A3-4C280EB99F33_1_105_c.jpeg', caption: 'Hand in Hand', label: 'Memory 03' },
  { url: '/images/3CAEFE12-A0A9-43BE-B44C-298BCD16DE50_1_105_c.jpeg', caption: 'Vows in Silence', label: 'Memory 04' },
  { url: '/images/4940F7E4-48B2-4DA6-8A1E-385EA52FB540_1_105_c.jpeg', caption: 'Forever Begins', label: 'Memory 05' },
];

const FALLBACK_EVENTS = [
  {
    title: 'The Holy Union',
    subtitle: 'Sacred Rituals',
    description: "A traditional ceremony filled with sacred rituals, love, and light at Swarupa\u2019s residence. Join us as we exchange vows under the auspicious canopy.",
    date: 'Nov 25, 2026',
    time: '7:00 PM IST',
    detailLabel: 'Auspicious',
    detailValue: 'Subho Vivaha',
    photo: '/images/4C4177A9-BCD2-4702-B662-F072FAC52E03_1_105_c.jpeg',
    mapUrl: 'https://maps.app.goo.gl/7a2rL8KxKAikxszn6',
  },
  {
    title: 'The Reception',
    subtitle: 'Gala Evening',
    description: 'An evening of joyous celebration, banquet dinner, and dancing to mark our new chapter. We look forward to raising a toast together with family and friends.',
    date: 'Nov 27, 2026',
    time: '6:30 PM IST',
    detailLabel: 'Attire',
    detailValue: 'Formal / Ethnic',
    photo: '/images/5F4CA362-2A3D-4155-9ABD-6C5B83B5ACD3_1_105_c.jpeg',
    mapUrl: 'https://maps.app.goo.gl/e6Pe3Rqv6buPnV8S6',
  },
];

const FALLBACK_PLAYLIST = [
  { title: 'Perfect', artist: 'Ed Sheeran', duration: '4:23' },
  { title: 'Tum Hi Ho', artist: 'Arijit Singh', duration: '5:10' },
  { title: "Can't Help Falling In Love", artist: 'Elvis Presley', duration: '3:01' },
];

export default function Home() {
  const [loaderComplete, setLoaderComplete] = useState(false);
  const { data } = useWeddingContent();

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

  // ── Derived data with fallbacks ────────────────────────────────────────────
  const groomName   = data?.groomName   || 'Rocky';
  const groomTitle  = data?.groomTitle  || 'The Groom';
  const brideName   = data?.brideName   || 'Swarupa';
  const brideTitle  = data?.brideTitle  || 'The Bride';
  const groomPhoto  = data?.groomPhoto  || FB_GROOM_PHOTO;
  const bridePhoto  = data?.bridePhoto  || FB_BRIDE_PHOTO;

  const gallery  = (data?.gallery  && data.gallery.length  > 0) ? data.gallery  : FALLBACK_GALLERY;
  const events   = (data?.events   && data.events.length   > 0) ? data.events   : FALLBACK_EVENTS;
  const playlist = (data?.playlist && data.playlist.length > 0) ? data.playlist : FALLBACK_PLAYLIST;

  const airportCode    = data?.airportCode    || 'CCU';
  const airportName    = data?.airportName    || 'Netaji Subhash Chandra Bose';
  const travelNote     = data?.travelNote     || 'Private luxury taxi pre-booking is available through our concierge (Approx 2-hour drive).';
  const hotelNames     = data?.hotelNames     || 'The Grand Regency & Heritage Inn';
  const hotelNote      = data?.hotelNote      || 'Please contact our guest relations desk for personalized suite assignments.';
  const conciergePhone = data?.conciergePhone || '+917029406424';
  const rsvpDeadline   = data?.rsvpDeadline   || 'September 25, 2026';
  const rsvpEmail      = data?.rsvpEmail      || 'rockyandswarupa@gmail.com';

  const event0 = events[0] ?? FALLBACK_EVENTS[0];
  const event1 = events[1] ?? FALLBACK_EVENTS[1];

  // true = Firebase Storage URL → use unoptimized; false = local path → Next image optimization
  const isRemote = (url: string) => url.startsWith('http');

  return (
    <>
      {!loaderComplete && <EnvelopeReveal onComplete={() => setLoaderComplete(true)} />}
      <CustomCursor />
      <MobileNav />
      <div className="noise" />

      <SmoothScroll>
        <ScrollAnimations />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex fixed top-6 left-1/2 -translate-x-1/2 px-8 py-3.5 rounded-full glass-panel z-40 border border-[var(--accent)]/20 shadow-2xl items-center gap-12 text-[var(--text-muted)]">
          <div className="logo font-serif font-bold text-xl tracking-widest text-gradient">R &amp; S</div>
          <div className="flex gap-8 text-[10px] tracking-[0.25em] uppercase font-semibold">
            <a href="#couple" className="hover:text-[var(--accent)] transition-colors">The Couple</a>
            <a href="#gallery" className="hover:text-[var(--accent)] transition-colors">Moments</a>
            <a href="#events"  className="hover:text-[var(--accent)] transition-colors">Events</a>
            <a href="#travel"  className="hover:text-[var(--accent)] transition-colors">Travel</a>
            <a href="#rsvp"   className="hover:text-[var(--accent)] transition-colors">RSVP</a>
          </div>
          <ThemeToggle />
        </nav>

        <main className="pb-20">
          <HeroAnimation active={loaderComplete} />

          {/* ── The Couple ─────────────────────────────────────────────────── */}
          <section id="couple" className="container mx-auto px-6 py-24 lg:py-40 relative">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70%] aspect-square rounded-full bg-[radial-gradient(circle,_var(--gradient-glow)_0%,_transparent_70%)] pointer-events-none -z-10" />

            <ScrollReveal width="100%">
              <div className="text-center mb-20 lg:mb-28">
                <div className="text-xs lg:text-sm text-[var(--accent)] tracking-[0.5em] uppercase mb-4 font-semibold">The Couple</div>
                <h2 className="font-serif text-4xl lg:text-7xl font-bold text-gradient leading-tight">
                  Meet the Bride <br className="lg:hidden" />&amp; Groom
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center max-w-5xl mx-auto">
              <ScrollReveal mode="fade-up" delay={0.1}>
                <div className="group relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-tl-[8rem] rounded-br-[8rem] rounded-tr-[2rem] rounded-bl-[2rem] border border-[var(--accent)]/20 relative shadow-2xl" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <div className="absolute inset-0 bg-[var(--overlay)] group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src={groomPhoto}
                      alt={groomName}
                      width={800}
                      height={1000}
                      unoptimized={isRemote(groomPhoto)}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="font-serif text-3xl mb-2 text-gradient">{groomName}</h3>
                    <p className="text-[10px] uppercase tracking-[3px] text-[var(--text-subtle)] font-semibold">{groomTitle}</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal mode="fade-up" delay={0.2}>
                <div className="group relative lg:translate-y-20">
                  <div className="aspect-[4/5] overflow-hidden rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-[2rem] rounded-br-[2rem] border border-[var(--accent)]/20 relative shadow-2xl" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <div className="absolute inset-0 bg-[var(--overlay)] group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <Image
                      src={bridePhoto}
                      alt={brideName}
                      width={800}
                      height={1000}
                      unoptimized={isRemote(bridePhoto)}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
                    />
                  </div>
                  <div className="mt-8 text-center">
                    <h3 className="font-serif text-3xl mb-2 text-gradient">{brideName}</h3>
                    <p className="text-[10px] uppercase tracking-[3px] text-[var(--text-subtle)] font-semibold">{brideTitle}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* ── Story Reveal ───────────────────────────────────────────────── */}
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

          {/* ── Gallery ────────────────────────────────────────────────────── */}
          <section id="gallery" className="container mx-auto px-6 py-28 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-[radial-gradient(circle,_var(--gradient-glow)_0%,_transparent_70%)] pointer-events-none -z-10" />

            <ScrollReveal width="100%" className="w-full mb-20 text-center">
              <div className="text-xs text-[var(--accent)] tracking-[0.5em] uppercase mb-4 font-semibold">Captured Frames</div>
              <h2 className="font-serif text-4xl lg:text-7xl font-bold text-gradient leading-tight">Our Moments</h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Photo 1 */}
              {gallery[0] && (
                <div className="md:col-span-7 flex flex-col justify-between">
                  <ScrollReveal mode="scale-up" width="100%" className="h-full">
                    <div className="group relative h-[450px] overflow-hidden rounded-t-full border border-[var(--accent)]/25 shadow-2xl bg-[var(--bg-tertiary)]">
                      <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-t-full z-20 pointer-events-none m-1.5" />
                      <div className="absolute inset-0 bg-[var(--overlay)] group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <Image src={gallery[0].url} alt={gallery[0].caption} fill unoptimized={isRemote(gallery[0].url)} className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                      <div className="absolute bottom-6 left-6 z-20 text-left">
                        <span className="font-playfair italic text-2xl text-gradient block drop-shadow-md">{gallery[0].caption}</span>
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--text-subtle)] block mt-1">{gallery[0].label}</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* Photo 2 */}
              {gallery[1] && (
                <div className="md:col-span-5 flex flex-col justify-end">
                  <ScrollReveal mode="scale-up" delay={0.15} width="100%">
                    <div className="group relative h-[380px] overflow-hidden rounded-[8rem] border border-[var(--accent)]/25 shadow-2xl bg-[var(--bg-tertiary)]">
                      <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-[8rem] z-20 pointer-events-none m-1.5" />
                      <div className="absolute inset-0 bg-[var(--overlay)] group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <Image src={gallery[1].url} alt={gallery[1].caption} fill unoptimized={isRemote(gallery[1].url)} className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center w-full px-4">
                        <span className="font-playfair italic text-xl text-gradient block drop-shadow-md">{gallery[1].caption}</span>
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--text-subtle)] block mt-1">{gallery[1].label}</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* Photo 3 */}
              {gallery[2] && (
                <div className="md:col-span-5">
                  <ScrollReveal mode="scale-up" delay={0.2} width="100%">
                    <div className="group relative h-[420px] overflow-hidden rounded-tl-[8rem] rounded-br-[8rem] rounded-tr-[2rem] rounded-bl-[2rem] border border-[var(--accent)]/25 shadow-2xl bg-[var(--bg-tertiary)]">
                      <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-tl-[8rem] rounded-br-[8rem] rounded-tr-[2rem] rounded-bl-[2rem] z-20 pointer-events-none m-1.5" />
                      <div className="absolute inset-0 bg-[var(--overlay)] group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <Image src={gallery[2].url} alt={gallery[2].caption} fill unoptimized={isRemote(gallery[2].url)} className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                      <div className="absolute bottom-6 left-6 z-20 text-left">
                        <span className="font-playfair italic text-xl text-gradient block drop-shadow-md">{gallery[2].caption}</span>
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--text-subtle)] block mt-1">{gallery[2].label}</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* Photo 4 */}
              {gallery[3] && (
                <div className="md:col-span-7 flex flex-col justify-start">
                  <ScrollReveal mode="scale-up" delay={0.25} width="100%">
                    <div className="group relative h-[360px] overflow-hidden rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-[2rem] rounded-br-[2rem] border border-[var(--accent)]/25 shadow-2xl bg-[var(--bg-tertiary)]">
                      <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-[2rem] rounded-br-[2rem] z-20 pointer-events-none m-1.5" />
                      <div className="absolute inset-0 bg-[var(--overlay)] group-hover:bg-transparent transition-colors duration-500 z-10" />
                      <Image src={gallery[3].url} alt={gallery[3].caption} fill unoptimized={isRemote(gallery[3].url)} className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                      <div className="absolute bottom-6 left-6 z-20 text-left">
                        <span className="font-playfair italic text-xl text-gradient block drop-shadow-md">{gallery[3].caption}</span>
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--text-subtle)] block mt-1">{gallery[3].label}</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* Photo 5: Full-Width */}
              {gallery[4] && (
                <div className="md:col-span-12 mt-4">
                  <ScrollReveal mode="scale-up" delay={0.3} width="100%">
                    <div className="group relative h-[450px] overflow-hidden rounded-[3rem] border border-[var(--accent)]/25 shadow-2xl bg-[var(--bg-tertiary)]">
                      <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-[3rem] z-20 pointer-events-none m-1.5" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--overlay-heavy)] via-[var(--overlay)] to-transparent z-10" />
                      <Image src={gallery[4].url} alt={gallery[4].caption} fill unoptimized={isRemote(gallery[4].url)} className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                      <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
                        <div className="text-left">
                          <span className="font-playfair text-3xl md:text-4xl text-gradient block font-semibold drop-shadow-md">{gallery[4].caption}</span>
                          <span className="text-[9px] uppercase tracking-[4px] text-[var(--text-subtle)] block mt-1.5 font-medium">Rocky &amp; Swarupa • Complete Gallery Collection</span>
                        </div>
                        <div className="hidden md:block">
                          <span className="text-[8px] uppercase tracking-[3px] text-[var(--accent)] border border-[var(--accent)]/30 px-4 py-2 rounded-full bg-[var(--accent)]/5 font-semibold">{gallery[4].label}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* Photo 6: Optional bonus */}
              {gallery[5] && (
                <div className="md:col-span-12 mt-4">
                  <ScrollReveal mode="scale-up" delay={0.35} width="100%">
                    <div className="group relative h-[380px] overflow-hidden rounded-[3rem] border border-[var(--accent)]/25 shadow-2xl bg-[var(--bg-tertiary)]">
                      <div className="absolute inset-0 border border-[var(--accent)]/15 rounded-[3rem] z-20 pointer-events-none m-1.5" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--overlay-heavy)] via-[var(--overlay)] to-transparent z-10" />
                      <Image src={gallery[5].url} alt={gallery[5].caption} fill unoptimized={isRemote(gallery[5].url)} className="object-cover scale-102 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                      <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
                        <div className="text-left">
                          <span className="font-playfair text-3xl md:text-4xl text-gradient block font-semibold drop-shadow-md">{gallery[5].caption}</span>
                        </div>
                        <div className="hidden md:block">
                          <span className="text-[8px] uppercase tracking-[3px] text-[var(--accent)] border border-[var(--accent)]/30 px-4 py-2 rounded-full bg-[var(--accent)]/5 font-semibold">{gallery[5].label}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}
            </div>
          </section>

          {/* ── Events ─────────────────────────────────────────────────────── */}
          <section id="events" className="container mx-auto px-6 py-28 relative">
             <div className="absolute top-[50%] left-[10%] w-[50%] aspect-square rounded-full bg-[radial-gradient(circle,_var(--gradient-glow)_0%,_transparent_75%)] pointer-events-none -z-10" />

             <ScrollReveal width="100%" className="w-full mb-24 text-center">
               <div className="text-xs text-[var(--accent)] tracking-[0.5em] uppercase mb-4 font-semibold">The Schedule</div>
               <h2 className="font-serif text-4xl lg:text-7xl font-bold text-gradient leading-tight">The Celebration</h2>
             </ScrollReveal>

             <div className="flex flex-col gap-24 max-w-5xl mx-auto">
                {/* Event 1 */}
                <ScrollReveal mode="fade-up">
                  <div className="glass-panel p-8 md:p-12 rounded-[3.5rem] border border-[var(--accent)]/20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center group relative overflow-hidden shadow-3xl">
                    <div className="absolute -right-24 -bottom-24 w-64 h-64 rounded-full bg-[var(--accent)]/4 blur-3xl pointer-events-none group-hover:bg-[var(--accent)]/8 transition-all duration-700" />

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="w-[280px] h-[360px] relative rounded-t-full overflow-hidden border-2 border-[var(--accent)]/35 shadow-2xl bg-[var(--bg-tertiary)]">
                        <div className="absolute inset-[3px] border border-[var(--accent)]/20 rounded-t-full z-20 pointer-events-none" />
                        <Image
                          src={event0.photo || FALLBACK_EVENTS[0].photo}
                          alt={event0.title}
                          fill
                          unoptimized={isRemote(event0.photo || FALLBACK_EVENTS[0].photo)}
                          className="object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-center text-left">
                      <div className="text-[var(--accent)] text-xs font-bold uppercase tracking-[4px] mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                        {event0.subtitle}
                      </div>
                      <h3 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-[var(--text)]">{event0.title}</h3>
                      <p className="opacity-70 mb-8 leading-relaxed text-sm md:text-base text-[var(--text-muted)]">{event0.description}</p>

                      <div className="grid grid-cols-3 border-t border-b border-[var(--accent)]/15 py-4 mb-8 text-center md:text-left gap-4">
                        <div>
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-[var(--text-muted)]">Date</span>
                          <span className="font-playfair text-sm md:text-base text-[var(--accent)] font-semibold mt-1 block">{event0.date}</span>
                        </div>
                        <div className="border-l border-[var(--accent)]/15 pl-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-[var(--text-muted)]">Time</span>
                          <span className="font-playfair text-sm md:text-base text-[var(--text)] font-semibold mt-1 block">{event0.time}</span>
                        </div>
                        <div className="border-l border-[var(--accent)]/15 pl-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-[var(--text-muted)]">{event0.detailLabel}</span>
                          <span className="font-playfair text-sm md:text-base text-[var(--text)] font-semibold mt-1 block">{event0.detailValue}</span>
                        </div>
                      </div>

                      <div>
                        <a href={event0.mapUrl} target="_blank"
                          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[var(--accent)]/35 text-[10px] uppercase tracking-[3px] text-[var(--accent)] bg-[var(--accent)]/5 hover:bg-[var(--accent)] hover:text-[var(--bg)] hover:scale-103 transition-all duration-300 font-semibold">
                          <MapPin size={12} /> View Location Map
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Event 2 */}
                <ScrollReveal mode="fade-up" delay={0.15}>
                  <div className="glass-panel p-8 md:p-12 rounded-[3.5rem] border border-[var(--accent)]/20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center group relative overflow-hidden shadow-3xl">
                    <div className="absolute -left-24 -bottom-24 w-64 h-64 rounded-full bg-[var(--accent)]/4 blur-3xl pointer-events-none group-hover:bg-[var(--accent)]/8 transition-all duration-700" />

                    <div className="lg:col-span-7 lg:order-1 flex flex-col justify-center text-left lg:text-right lg:items-end">
                      <div className="text-[var(--accent)] text-xs font-bold uppercase tracking-[4px] mb-3 flex items-center gap-2 lg:flex-row-reverse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                        {event1.subtitle}
                      </div>
                      <h3 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-[var(--text)]">{event1.title}</h3>
                      <p className="opacity-70 mb-8 leading-relaxed text-sm md:text-base text-[var(--text-muted)] lg:text-right">{event1.description}</p>

                      <div className="grid grid-cols-3 border-t border-b border-[var(--accent)]/15 py-4 mb-8 text-center lg:text-right gap-4 w-full">
                        <div className="lg:pr-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-[var(--text-muted)]">Date</span>
                          <span className="font-playfair text-sm md:text-base text-[var(--accent)] font-semibold mt-1 block">{event1.date}</span>
                        </div>
                        <div className="border-l lg:border-l-0 lg:border-r border-[var(--accent)]/15 pl-4 lg:pl-0 lg:pr-4">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-[var(--text-muted)]">Time</span>
                          <span className="font-playfair text-sm md:text-base text-[var(--text)] font-semibold mt-1 block">{event1.time}</span>
                        </div>
                        <div className="border-l lg:border-l-0 border-[var(--accent)]/15 pl-4 lg:pl-0">
                          <span className="text-[8px] uppercase tracking-[2px] opacity-50 block text-[var(--text-muted)]">{event1.detailLabel}</span>
                          <span className="font-playfair text-sm md:text-base text-[var(--text)] font-semibold mt-1 block">{event1.detailValue}</span>
                        </div>
                      </div>

                      <div>
                        <a href={event1.mapUrl} target="_blank"
                          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[var(--accent)]/35 text-[10px] uppercase tracking-[3px] text-[var(--accent)] bg-[var(--accent)]/5 hover:bg-[var(--accent)] hover:text-[var(--bg)] hover:scale-103 transition-all duration-300 font-semibold">
                          <MapPin size={12} /> View Location Map
                        </a>
                      </div>
                    </div>

                    <div className="lg:col-span-5 lg:order-2 flex justify-center">
                      <div className="w-[280px] h-[360px] relative rounded-t-full overflow-hidden border-2 border-[var(--accent)]/35 shadow-2xl bg-[var(--bg-tertiary)]">
                        <div className="absolute inset-[3px] border border-[var(--accent)]/20 rounded-t-full z-20 pointer-events-none" />
                        <Image
                          src={event1.photo || FALLBACK_EVENTS[1].photo}
                          alt={event1.title}
                          fill
                          unoptimized={isRemote(event1.photo || FALLBACK_EVENTS[1].photo)}
                          className="object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
             </div>
          </section>

          {/* ── Travel & Accommodation ─────────────────────────────────────── */}
          <section id="travel" className="container mx-auto px-6 py-28 max-w-5xl relative">
            <div className="absolute top-[10%] right-[10%] w-[180px] h-[180px] border border-[var(--accent)]/5 rounded-full pointer-events-none flex items-center justify-center animate-[spin_60s_linear_infinite]">
              <div className="w-[140px] h-[140px] border border-dashed border-[var(--accent)]/5 rounded-full" />
              <div className="absolute w-[1px] h-full bg-[var(--accent)]/3" />
              <div className="absolute h-[1px] w-full bg-[var(--accent)]/3" />
            </div>

            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              <div className="lg:col-span-5 text-left">
                <ScrollReveal>
                  <div className="text-xs text-[var(--accent)] tracking-[0.5em] uppercase mb-4 font-semibold">Practicalities</div>
                  <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gradient leading-tight mb-6">Travel &amp; Stay</h2>
                  <p className="opacity-70 leading-relaxed text-sm md:text-base text-[var(--text-muted)] mb-8">
                     To ensure your journey is seamless, we have arranged special rates and curated detailed concierge guides for your travel and accommodation.
                  </p>

                  <div className="border-l-2 border-[var(--accent)]/30 pl-4 py-1 italic text-[var(--text-muted)] text-xs tracking-wide">
                    &ldquo;Two journeys converging into one, and we&apos;d be honored to have you witness our first steps.&rdquo;
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:col-span-7 grid gap-8">
                {/* Transit Ticket */}
                <ScrollReveal mode="fade-up" delay={0.1}>
                  <div className="glass-panel rounded-[2.5rem] border border-[var(--accent)]/15 hover:border-[var(--accent)]/35 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-stretch group">
                    <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg)] border border-[var(--accent)]/15 z-20" />
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg)] border border-[var(--accent)]/15 z-20" />

                    <div className="md:w-1/4 bg-[var(--accent)]/5 border-b md:border-b-0 md:border-r border-dashed border-[var(--accent)]/20 flex flex-col justify-center items-center p-6 text-center shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 mb-3 shadow-inner">
                        <Plane size={24} className="group-hover:rotate-12 transition-transform duration-500" />
                      </div>
                      <span className="text-[8px] uppercase tracking-[3px] text-[var(--text-subtle)] block font-semibold">TICKET</span>
                      <span className="font-playfair text-xs font-bold text-[var(--accent)] mt-0.5 block">TRANSIT</span>
                    </div>

                    <div className="md:w-3/4 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-2xl mb-2 text-[var(--text)] font-semibold">Getting Here</h3>
                        <p className="opacity-70 text-xs leading-relaxed text-[var(--text-muted)]">
                          Nearest Airport: <strong>{airportCode}</strong> ({airportName}). {travelNote}
                        </p>
                      </div>
                      <div className="border-t border-[var(--accent)]/10 mt-6 pt-4 flex justify-between items-center text-[9px] uppercase tracking-[2px] text-[var(--text-subtle)]">
                        <span>Transit Desk</span>
                        <span className="text-[var(--accent)] font-semibold">{airportCode} Airport Transfer</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Lodging Ticket */}
                <ScrollReveal mode="fade-up" delay={0.2}>
                  <div className="glass-panel rounded-[2.5rem] border border-[var(--accent)]/15 hover:border-[var(--accent)]/35 transition-all duration-500 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-stretch group">
                    <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg)] border border-[var(--accent)]/15 z-20" />
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg)] border border-[var(--accent)]/15 z-20" />

                    <div className="md:w-1/4 bg-[var(--accent)]/5 border-b md:border-b-0 md:border-r border-dashed border-[var(--accent)]/20 flex flex-col justify-center items-center p-6 text-center shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 mb-3 shadow-inner">
                        <Hotel size={24} className="group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="text-[8px] uppercase tracking-[3px] text-[var(--text-subtle)] block font-semibold">LODGING</span>
                      <span className="font-playfair text-xs font-bold text-[var(--accent)] mt-0.5 block">SUITE</span>
                    </div>

                    <div className="md:w-3/4 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-2xl mb-2 text-[var(--text)] font-semibold">Guest Lodging</h3>
                        <p className="opacity-70 text-xs leading-relaxed text-[var(--text-muted)]">
                          We have reserved rooms at <strong>{hotelNames}</strong>. {hotelNote}
                        </p>
                      </div>
                      <div className="border-t border-[var(--accent)]/10 mt-6 pt-4 flex justify-between items-center">
                        <span className="text-[8px] uppercase tracking-[2px] text-[var(--text-subtle)] block my-auto">Concierge Hotline</span>
                        <a href={`tel:${conciergePhone}`}
                          className="px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-[var(--bg)] border border-[var(--accent)]/35 text-[9px] uppercase tracking-widest text-[var(--accent)] transition-all duration-300 font-bold">
                          Call Hospitality
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* ── Wedding Playlist ───────────────────────────────────────────── */}
          <section className="container mx-auto px-6 py-28 text-center relative">
            <ScrollReveal width="100%" className="w-full">
              <div className="text-xs text-[var(--accent)] tracking-[0.5em] uppercase mb-4 font-semibold">The Sound of Us</div>
              <h2 className="font-serif text-4xl md:text-5xl text-gradient mb-16">Wedding Playlist</h2>
            </ScrollReveal>

            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {playlist.map((track, i) => (
                <ScrollReveal key={i} mode="scale-up" delay={i * 0.08} width="100%">
                  <div className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:bg-[var(--accent)]/5 border border-[var(--accent)]/10 hover:border-[var(--accent)]/35 transition-all duration-500 cursor-pointer shadow-lg">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/25 group-hover:scale-105 group-hover:bg-[var(--accent)] group-hover:text-[var(--bg)] transition-all duration-500 shadow-md">
                        <PlayCircle size={22} fill="currentColor" className="opacity-90" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-base md:text-lg text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{track.title}</div>
                        <div className="text-[9px] opacity-60 uppercase tracking-[2px] mt-0.5 text-[var(--text-muted)]">{track.artist}</div>
                      </div>
                    </div>
                    <div className="text-xs opacity-50 font-mono text-[var(--text-subtle)]">{track.duration}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* ── Countdown & RSVP ───────────────────────────────────────────── */}
          <section className="container mx-auto px-6 py-32 text-center relative">
            <div className="absolute top-[30%] left-[50%] -translate-x-[50%] w-[80%] aspect-square rounded-full bg-[radial-gradient(circle,_var(--gradient-glow)_0%,_transparent_70%)] pointer-events-none -z-10" />

            <ScrollReveal width="100%" className="w-full">
              <div className="mb-20 max-w-3xl mx-auto">
                <h2 className="font-serif text-4xl md:text-6xl text-gradient mb-8">Counting Every Heartbeat</h2>
                <Countdown />
              </div>
            </ScrollReveal>

            <ScrollReveal width="100%" className="w-full" delay={0.15} mode="scale-up">
              <div
                id="rsvp"
                className="mt-20 max-w-3xl mx-auto glass-panel p-8 md:p-16 rounded-[4rem] border border-[var(--accent)]/35 relative overflow-hidden shadow-3xl bg-gradient-to-b from-[var(--bg-secondary)]/60 to-[var(--bg)]/90"
              >
                <div className="absolute inset-[5px] border border-[var(--accent)]/20 rounded-[3.7rem] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gradient-glow)_0%,_transparent_80%)] z-0" />

                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]/70 bg-[var(--accent)]/5 mb-6">
                     <Sparkles size={20} className="animate-spin-slow" />
                   </div>
                   <span className="text-[10px] tracking-[5px] uppercase text-[var(--accent)] font-bold mb-4">[ REQUIÊTE DE RÉPONSE ]</span>
                   <h3 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-[var(--text)] leading-tight">Ready to celebrate with us?</h3>
                   <p className="text-[var(--text-muted)] text-xs md:text-sm max-w-lg mb-10 leading-relaxed">
                     We kindly request you to secure your attendance by <strong>{rsvpDeadline}</strong> so we may curate a delightful experience for your presence.
                   </p>

                   <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg justify-center items-center">
                     <a
                       href={`mailto:${rsvpEmail}?subject=RSVP - Accepts with Joy&body=Dearest Rocky %26 Swarupa,%0D%0A%0D%0AI/We would be absolutely delighted to accept your gracious invitation to celebrate your union from Nov 25 — Nov 27, 2026.%0D%0A%0D%0AWith love and blessings,%0D%0A[Your Name]`}
                       className="w-full md:w-1/2 px-8 py-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--bg)] font-bold text-xs uppercase tracking-[3px] rounded-full shadow-lg hover:scale-[1.04] hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-300 border border-[var(--accent)]/20 cursor-pointer flex items-center justify-center gap-2"
                     >
                       Accepts with Joy
                     </a>

                     <a
                       href={`mailto:${rsvpEmail}?subject=RSVP - Declines with Regret&body=Dearest Rocky %26 Swarupa,%0D%0A%0D%0AI/We sincerely regret that due to prior commitments, we will be unable to accept your gracious invitation to celebrate your union.%0D%0A%0D%0ASending you our warmest congratulations and blessings for your beautiful journey ahead.%0D%0A%0D%0AWith warm regards,%0D%0A[Your Name]`}
                       className="w-full md:w-1/2 px-8 py-4 bg-transparent text-[var(--accent)] font-semibold text-xs uppercase tracking-[3px] rounded-full border border-[var(--accent)]/35 hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:scale-[1.04] transition-all duration-300 cursor-pointer flex items-center justify-center"
                     >
                       Declines with Regret
                     </a>
                   </div>

                   <p className="mt-10 opacity-50 text-[9px] tracking-[4px] uppercase text-[var(--text-muted)]">Kindly RSVP by {rsvpDeadline}</p>
                </div>
              </div>
            </ScrollReveal>
          </section>

        </main>

        <footer className="py-12 border-t border-[var(--border)] text-center opacity-40 text-xs tracking-[0.2em]">
          <div className="mb-4 text-xl font-serif">R &amp; S</div>
          <p>CURATED WITH LOVE © 2026</p>
        </footer>
      </SmoothScroll>
    </>
  );
}
