'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface GalleryPhoto {
  url: string;
  caption: string;
  label: string;
}

export interface WeddingEvent {
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  detailLabel: string;
  detailValue: string;
  photo: string;
  mapUrl: string;
}

export interface PlaylistTrack {
  title: string;
  artist: string;
  duration: string;
}

export interface WeddingContent {
  // Couple
  groomName: string;
  groomPhoto: string;
  groomTitle: string;
  brideTitle: string;
  brideName: string;
  bridePhoto: string;

  // Gallery
  gallery: GalleryPhoto[];

  // Events
  events: WeddingEvent[];

  // Travel
  airportCode: string;
  airportName: string;
  travelNote: string;
  hotelNames: string;
  hotelNote: string;
  conciergePhone: string;

  // Playlist
  playlist: PlaylistTrack[];

  // RSVP
  rsvpDeadline: string;
  rsvpEmail: string;

  // Meta
  weddingDate: string;
  coupleNames: string;
}

export default function useWeddingContent() {
  const [data, setData] = useState<WeddingContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'weddingContent', 'main');

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setData(snap.data() as WeddingContent);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { data, loading };
}
