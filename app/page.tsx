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

        <nav>
          <div className="logo">R & S</div>
          <div className="nav-links">
            <a href="#couple" style={{ color: 'inherit', textDecoration: 'none' }}>The Couple</a>
            <a href="#gallery" style={{ color: 'inherit', textDecoration: 'none' }}>Moments</a>
            <a href="#events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</a>
            <a href="#travel" style={{ color: 'inherit', textDecoration: 'none' }}>Travel</a>
            <a href="#rsvp" style={{ color: 'inherit', textDecoration: 'none' }}>RSVP</a>
          </div>
        </nav>

        <main>
          <HeroAnimation />

          {/* The Couple Section */}
          <section id="couple" className="container">
            <div className="text-center mb-[5vh]">
              <div className="text-sm opacity-60 tracking-[0.5em] uppercase text-[#d4af37]">The Happy Couple</div>
              <h2 className="font-playfair text-[clamp(2rem,5vw,4rem)]">Meet the Bride & Groom</h2>
            </div>
            <div className="couple-grid">
              <div className="couple-member groom-card">
                <div className="couple-img-wrap">
                  <Image
                    src="/images/0723150E-7ED6-4368-ADEA-08AA264E6FE5_1_105_c.jpeg"
                    alt="Rocky"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="couple-name">Rocky</div>
                <div className="couple-role">The Groom</div>
              </div>
              <div className="couple-member bride-card">
                <div className="couple-img-wrap">
                  <Image
                    src="/images/0BB9FCA6-7404-4973-973C-4D2E71733C2E_1_105_c.jpeg"
                    alt="Swarupa"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="couple-name">Swarupa</div>
                <div className="couple-role">The Bride</div>
              </div>
            </div>
          </section>

          {/* Story Reveal */}
          <section id="story" className="container">
            <div className="story-text">
              <span className="reveal-text">From shared laughter </span>
              <span className="reveal-text">to quiet understandings, </span>
              <span className="reveal-text">our journey has been </span>
              <span className="reveal-text">written in the stars.</span>
              <br /><br />
              <span className="reveal-text">Now, as we prepare </span>
              <span className="reveal-text">to walk hand in hand, </span>
              <span className="reveal-text">we invite you to be </span>
              <span className="reveal-text">part of our forever.</span>
            </div>
          </section>

          {/* Gallery Section */}
          <section id="gallery" className="container gallery-section">
            <div className="mb-16 text-left">
              <div className="text-sm opacity-60 tracking-[0.5em] uppercase text-[#d4af37]">Captured Frames</div>
              <h2 className="font-playfair text-[clamp(2rem,5vw,4rem)]">Our Moments</h2>
            </div>
            <div className="gallery-grid">
              <div className="gallery-item item-1">
                <Image
                  src="/images/1DAAEF87-CA53-4609-B0FC-207C09E1F005_1_105_c.jpeg"
                  alt="Moment 1"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="gallery-item item-2">
                <Image
                  src="/images/334AE3C6-7F21-400D-96E5-AFB67ADBA50A_1_105_c.jpeg"
                  alt="Moment 2"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="gallery-item item-3">
                <Image
                  src="/images/3A1AFBD4-1BA3-49B9-B1A3-4C280EB99F33_1_105_c.jpeg"
                  alt="Moment 3"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="gallery-item item-4">
                <Image
                  src="/images/3CAEFE12-A0A9-43BE-B44C-298BCD16DE50_1_105_c.jpeg"
                  alt="Moment 4"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="gallery-item item-5">
                <Image
                  src="/images/4940F7E4-48B2-4DA6-8A1E-385EA52FB540_1_105_c.jpeg"
                  alt="Moment 5"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>

          {/* Events Horizontal */}
          <div id="events" className="horizontal-wrap">
            <div className="horizontal-content">
              {/* Wedding */}
              <div className="event-card">
                <div className="card-inner">
                  <div className="card-img relative">
                    <Image
                      src="/images/4C4177A9-BCD2-4702-B662-F072FAC52E03_1_105_c.jpeg"
                      alt="Wedding Ceremony"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="card-info">
                    <div className="text-xs tracking-[2px] uppercase text-[#d4af37] mb-2">The Holy Union</div>
                    <h2>Nov 25</h2>
                    <p className="mb-6 opacity-80">
                      The wedding ceremony will take place at Swarupa&apos;s residence. A traditional ceremony filled with rituals, love, and light.
                    </p>
                    <div className="text-sm tracking-wider mb-6">
                      <p><strong>TIME:</strong> 7:00 PM Onwards</p>
                      <p><strong>DRESS:</strong> Traditional Festive</p>
                    </div>
                    <a
                      href="https://maps.app.goo.gl/7a2rL8KxKAikxszn6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d4af37] text-sm flex items-center gap-2"
                    >
                      <MapPin size={16} /> SWARUPA&apos;S LOCATION
                    </a>
                  </div>
                </div>
              </div>

              {/* Reception */}
              <div className="event-card">
                <div className="card-inner">
                  <div className="card-img relative">
                    <Image
                      src="/images/5F4CA362-2A3D-4155-9ABD-6C5B83B5ACD3_1_105_c.jpeg"
                      alt="Reception"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="card-info">
                    <div className="text-xs tracking-[2px] uppercase text-[#d4af37] mb-2">The Celebration</div>
                    <h2>Nov 27</h2>
                    <p className="mb-6 opacity-80">
                      Rocky Karmakar invites you to an evening of celebration, banquet dinner, and dancing to mark the beginning of their new chapter.
                    </p>
                    <div className="text-sm tracking-wider mb-6">
                      <p><strong>TIME:</strong> 6:30 PM Onwards</p>
                      <p><strong>DRESS:</strong> Formal / Black Tie Optional</p>
                    </div>
                    <a
                      href="https://maps.app.goo.gl/e6Pe3Rqv6buPnV8S6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d4af37] text-sm flex items-center gap-2"
                    >
                      <MapPin size={16} /> RECEPTION LOCATION
                    </a>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="event-card">
                <div className="card-inner" style={{ background: 'none', border: 'none', overflowY: 'auto' }}>
                  <div className="w-full text-left">
                    <div className="text-xs tracking-[2px] uppercase text-[#d4af37] mb-2">The Journey</div>
                    <h2 className="text-5xl mb-8">Event Schedule</h2>
                    <div className="timeline-container">
                      <div className="timeline-item">
                        <div className="timeline-date">Nov 25 • 09:00 AM</div>
                        <div className="timeline-title">Gaye Holud</div>
                        <p className="opacity-60 text-sm">The vibrant turmeric ceremony at both homes.</p>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">Nov 25 • 07:00 PM</div>
                        <div className="timeline-title">The Wedding Vows</div>
                        <p className="opacity-60 text-sm">Exchange of rings and the holy fire rituals.</p>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">Nov 27 • 06:30 PM</div>
                        <div className="timeline-title">Grand Entrance</div>
                        <p className="opacity-60 text-sm">The couple makes their first appearance as Mr. & Mrs.</p>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">Nov 27 • 09:00 PM</div>
                        <div className="timeline-title">Banquet & Dance</div>
                        <p className="opacity-60 text-sm">A night to remember under the chandeliers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel & Accommodation */}
          <section id="travel" className="container">
            <div className="text-center">
              <div className="text-sm opacity-60 tracking-[0.5em] uppercase text-[#d4af37]">Practicalities</div>
              <h2 className="font-playfair text-[3.5rem]">Travel & Stay</h2>
              <p className="max-w-[600px] mx-auto my-4 opacity-60">
                We have arranged special rates for our guests traveling from afar. Please book your stay by October 2026.
              </p>
            </div>
            <div className="travel-grid">
              <div className="travel-card">
                <h3>
                  <Plane /> Getting Here
                </h3>
                <p className="opacity-70">
                  The nearest airport is Netaji Subhash Chandra Bose International (CCU). From there, private taxis are available to the venues (Approx 2 hours travel).
                </p>
                <br />
                <p className="opacity-70">For those coming by train, the nearest major station is Bardhaman Junction.</p>
              </div>
              <div className="travel-card">
                <h3>
                  <Hotel /> Guest Stay
                </h3>
                <p className="opacity-70">
                  We recommend staying at <strong>The Grand Regency</strong> or <strong>Heritage Inn</strong>. Mention the &quot;Rocky & Swarupa Wedding&quot; for a discounted rate.
                </p>
                <br />
                <p className="font-semibold text-[#d4af37]">Concierge: +91 98765 43210</p>
              </div>
            </div>
          </section>

          {/* Wedding Playlist */}
          <section className="container text-center py-20">
            <div className="text-sm opacity-60 tracking-[0.5em] uppercase text-[#d4af37]">The Sound of Us</div>
            <h2 className="font-playfair text-5xl">Wedding Playlist</h2>
            <div className="track-list">
              <div className="track">
                <div className="flex items-center gap-4">
                  <PlayCircle className="text-[#d4af37]" />
                  <div className="text-left">
                    <div className="font-semibold">Perfect</div>
                    <div className="text-xs opacity-50">Ed Sheeran</div>
                  </div>
                </div>
                <div className="text-xs opacity-50">4:23</div>
              </div>
              <div className="track">
                <div className="flex items-center gap-4">
                  <PlayCircle className="text-[#d4af37]" />
                  <div className="text-left">
                    <div className="font-semibold">Tum Hi Ho</div>
                    <div className="text-xs opacity-50">Arijit Singh</div>
                  </div>
                </div>
                <div className="text-xs opacity-50">5:10</div>
              </div>
              <div className="track">
                <div className="flex items-center gap-4">
                  <PlayCircle className="text-[#d4af37]" />
                  <div className="text-left">
                    <div className="font-semibold">Can&apos;t Help Falling In Love</div>
                    <div className="text-xs opacity-50">Elvis Presley</div>
                  </div>
                </div>
                <div className="text-xs opacity-50">3:01</div>
              </div>
            </div>
          </section>

          {/* Countdown */}
          <section className="container">
            <div className="text-center mb-16">
              <div className="text-xs tracking-[2px] uppercase opacity-50">Countdown to the Day</div>
              <h2 className="font-playfair text-[3.5rem]">Counting Every Heartbeat</h2>
            </div>
            <Countdown />
          </section>

          {/* CTA */}
          <section id="rsvp" className="cta-section">
            <div className="container">
              <h2 className="font-playfair text-[clamp(2rem,5vw,4rem)] leading-none mb-8">
                Ready to celebrate with us?
              </h2>
              <a href="mailto:rockyandswarupa@gmail.com?subject=RSVP - Wedding Celebration" className="btn">
                SECURE YOUR SPOT
              </a>
              <p className="mt-8 opacity-40 text-sm">Please RSVP by September 25, 2026</p>
            </div>
          </section>
        </main>

        <footer>
          <div>CURATED WITH LOVE © 2026</div>
          <div className="font-playfair text-xl opacity-100">R & S</div>
          <div>ROCKY KARMAKAR & SWARUPA SARKAR</div>
        </footer>
      </SmoothScroll>
    </>
  );
}
