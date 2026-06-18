'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { WeddingContent, GalleryPhoto, WeddingEvent, PlaylistTrack } from '@/lib/useWeddingContent';
import {
  Users, Image as ImageIcon, CalendarDays, Plane, Music, Mail,
  Loader2, Check, Upload, Plus, Trash2, Palette, ChevronRight,
} from 'lucide-react';

// ─── Default data ────────────────────────────────────────────────────────────

const DEFAULT_CONTENT: WeddingContent = {
  groomName: 'Rocky',
  groomPhoto: '',
  groomTitle: 'The Groom',
  brideTitle: 'The Bride',
  brideName: 'Swarupa',
  bridePhoto: '',
  gallery: [],
  events: [
    {
      title: 'The Holy Union',
      subtitle: 'Sacred Rituals',
      description: "A traditional ceremony filled with sacred rituals, love, and light at Swarupa's residence. Join us as we exchange vows under the auspicious canopy.",
      date: 'Nov 25, 2026',
      time: '7:00 PM IST',
      detailLabel: 'Auspicious',
      detailValue: 'Subho Vivaha',
      photo: '',
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
      photo: '',
      mapUrl: 'https://maps.app.goo.gl/e6Pe3Rqv6buPnV8S6',
    },
  ],
  airportCode: 'CCU',
  airportName: 'Netaji Subhash Chandra Bose',
  travelNote: 'Private luxury taxi pre-booking is available through our concierge (Approx 2-hour drive).',
  hotelNames: 'The Grand Regency & Heritage Inn',
  hotelNote: 'Please contact our guest relations desk for personalized suite assignments.',
  conciergePhone: '+917029406424',
  playlist: [
    { title: 'Perfect', artist: 'Ed Sheeran', duration: '4:23' },
    { title: 'Tum Hi Ho', artist: 'Arijit Singh', duration: '5:10' },
    { title: "Can't Help Falling In Love", artist: 'Elvis Presley', duration: '3:01' },
  ],
  rsvpDeadline: 'September 25, 2026',
  rsvpEmail: 'rockyandswarupa@gmail.com',
  weddingDate: '2026-11-25',
  coupleNames: 'Rocky & Swarupa',
};

// ─── Shared UI components ─────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase tracking-[2px] text-white/40 mb-1.5 font-semibold">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/8 transition-all ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/8 transition-all resize-none"
    />
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
      <h3 className="font-serif text-base text-[#d4af37] mb-5 flex items-center gap-2">
        <ChevronRight size={14} className="opacity-60" />
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Photo uploader ───────────────────────────────────────────────────────────

function PhotoUploader({
  currentUrl,
  onUploaded,
  path,
  label = 'Photo',
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
  path: string;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const sRef = storageRef(storage, `wedding-cms/${path}/${Date.now()}_${file.name}`);
        await uploadBytes(sRef, file);
        const url = await getDownloadURL(sRef);
        onUploaded(url);
      } catch (err) {
        console.error('Upload error', err);
      } finally {
        setUploading(false);
      }
    },
    [path, onUploaded]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="relative flex flex-col items-center justify-center border border-dashed border-white/15 rounded-xl overflow-hidden cursor-pointer hover:border-[#d4af37]/40 transition-all group"
        style={{ minHeight: 120 }}
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-white/30 group-hover:text-[#d4af37]/60 transition-colors">
            <ImageIcon size={28} />
            <span className="text-[10px] uppercase tracking-widest">Click to upload</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={22} className="text-[#d4af37] animate-spin" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#d4af37] text-black rounded-lg p-1.5">
            <Upload size={12} />
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />
      {currentUrl && (
        <Input
          value={currentUrl}
          onChange={onUploaded}
          placeholder="Or paste URL directly"
        />
      )}
    </div>
  );
}

// ─── Tab: Couple ──────────────────────────────────────────────────────────────

function CoupleTab({
  data,
  onChange,
}: {
  data: WeddingContent;
  onChange: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Groom">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={data.groomName} onChange={(v) => onChange({ groomName: v })} placeholder="Rocky" />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={data.groomTitle} onChange={(v) => onChange({ groomTitle: v })} placeholder="The Groom" />
          </div>
          <PhotoUploader
            currentUrl={data.groomPhoto}
            onUploaded={(url) => onChange({ groomPhoto: url })}
            path="couple/groom"
            label="Groom Photo"
          />
        </div>
      </SectionCard>

      <SectionCard title="Bride">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={data.brideName} onChange={(v) => onChange({ brideName: v })} placeholder="Swarupa" />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={data.brideTitle} onChange={(v) => onChange({ brideTitle: v })} placeholder="The Bride" />
          </div>
          <PhotoUploader
            currentUrl={data.bridePhoto}
            onUploaded={(url) => onChange({ bridePhoto: url })}
            path="couple/bride"
            label="Bride Photo"
          />
        </div>
      </SectionCard>

      <SectionCard title="Meta">
        <div className="space-y-4">
          <div>
            <Label>Couple Names (display)</Label>
            <Input value={data.coupleNames} onChange={(v) => onChange({ coupleNames: v })} placeholder="Rocky & Swarupa" />
          </div>
          <div>
            <Label>Wedding Date (ISO — for countdown)</Label>
            <Input value={data.weddingDate} onChange={(v) => onChange({ weddingDate: v })} placeholder="2026-11-25" type="date" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Gallery ─────────────────────────────────────────────────────────────

function GalleryTab({
  data,
  onChange,
}: {
  data: WeddingContent;
  onChange: (patch: Partial<WeddingContent>) => void;
}) {
  const gallery = data.gallery ?? [];

  const updateSlot = (i: number, patch: Partial<GalleryPhoto>) => {
    const updated = [...gallery];
    updated[i] = { ...updated[i], ...patch };
    onChange({ gallery: updated });
  };

  const addSlot = () => {
    if (gallery.length >= 6) return;
    onChange({ gallery: [...gallery, { url: '', caption: '', label: `Memory 0${gallery.length + 1}` }] });
  };

  const removeSlot = (i: number) => {
    const updated = gallery.filter((_, idx) => idx !== i);
    onChange({ gallery: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-xs tracking-wide">Up to 6 gallery photos. These replace the hardcoded local images.</p>
        <button
          onClick={addSlot}
          disabled={gallery.length >= 6}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-medium hover:bg-[#d4af37]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={13} /> Add Photo Slot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {gallery.map((photo, i) => (
          <SectionCard key={i} title={`Photo ${i + 1}`}>
            <div className="space-y-3">
              <PhotoUploader
                currentUrl={photo.url}
                onUploaded={(url) => updateSlot(i, { url })}
                path={`gallery/slot-${i}`}
                label="Image"
              />
              <div>
                <Label>Caption</Label>
                <Input
                  value={photo.caption}
                  onChange={(v) => updateSlot(i, { caption: v })}
                  placeholder="The First Glimpse"
                />
              </div>
              <div>
                <Label>Label</Label>
                <Input
                  value={photo.label}
                  onChange={(v) => updateSlot(i, { label: v })}
                  placeholder="Memory 01"
                />
              </div>
              <button
                onClick={() => removeSlot(i)}
                className="flex items-center gap-1.5 text-red-400/60 hover:text-red-400 text-xs transition-colors mt-1"
              >
                <Trash2 size={12} /> Remove slot
              </button>
            </div>
          </SectionCard>
        ))}

        {gallery.length === 0 && (
          <div className="md:col-span-2 text-center py-12 text-white/20 border border-dashed border-white/10 rounded-2xl">
            <ImageIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No gallery photos yet. Click "Add Photo Slot" to start.</p>
            <p className="text-xs mt-1 opacity-60">Local fallback images will be used until you add photos here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Events ──────────────────────────────────────────────────────────────

function EventsTab({
  data,
  onChange,
}: {
  data: WeddingContent;
  onChange: (patch: Partial<WeddingContent>) => void;
}) {
  const events: WeddingEvent[] = data.events ?? DEFAULT_CONTENT.events;

  const updateEvent = (i: number, patch: Partial<WeddingEvent>) => {
    const updated = [...events];
    updated[i] = { ...updated[i], ...patch };
    onChange({ events: updated });
  };

  const eventNames = ['Event 1 — The Holy Union', 'Event 2 — The Reception'];

  return (
    <div className="flex flex-col gap-8">
      {events.map((ev, i) => (
        <SectionCard key={i} title={eventNames[i] ?? `Event ${i + 1}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={ev.title} onChange={(v) => updateEvent(i, { title: v })} placeholder="The Holy Union" />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={ev.subtitle} onChange={(v) => updateEvent(i, { subtitle: v })} placeholder="Sacred Rituals" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={ev.description} onChange={(v) => updateEvent(i, { description: v })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input value={ev.date} onChange={(v) => updateEvent(i, { date: v })} placeholder="Nov 25, 2026" />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input value={ev.time} onChange={(v) => updateEvent(i, { time: v })} placeholder="7:00 PM IST" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Detail Label</Label>
                  <Input value={ev.detailLabel} onChange={(v) => updateEvent(i, { detailLabel: v })} placeholder="Auspicious" />
                </div>
                <div>
                  <Label>Detail Value</Label>
                  <Input value={ev.detailValue} onChange={(v) => updateEvent(i, { detailValue: v })} placeholder="Subho Vivaha" />
                </div>
              </div>
              <div>
                <Label>Google Maps URL</Label>
                <Input value={ev.mapUrl} onChange={(v) => updateEvent(i, { mapUrl: v })} placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>

            <div>
              <PhotoUploader
                currentUrl={ev.photo}
                onUploaded={(url) => updateEvent(i, { photo: url })}
                path={`events/event-${i}`}
                label="Event Photo"
              />
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

// ─── Tab: Travel ──────────────────────────────────────────────────────────────

function TravelTab({
  data,
  onChange,
}: {
  data: WeddingContent;
  onChange: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Airport / Transit">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Airport Code</Label>
              <Input value={data.airportCode} onChange={(v) => onChange({ airportCode: v })} placeholder="CCU" />
            </div>
            <div>
              <Label>Airport Name</Label>
              <Input value={data.airportName} onChange={(v) => onChange({ airportName: v })} placeholder="Netaji Subhash Chandra Bose" />
            </div>
          </div>
          <div>
            <Label>Travel Note</Label>
            <Textarea value={data.travelNote} onChange={(v) => onChange({ travelNote: v })} rows={3} placeholder="Private luxury taxi pre-booking..." />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Hotels / Lodging">
        <div className="space-y-4">
          <div>
            <Label>Hotel Names</Label>
            <Input value={data.hotelNames} onChange={(v) => onChange({ hotelNames: v })} placeholder="The Grand Regency & Heritage Inn" />
          </div>
          <div>
            <Label>Hotel Note</Label>
            <Textarea value={data.hotelNote} onChange={(v) => onChange({ hotelNote: v })} rows={3} placeholder="Please contact our guest relations desk..." />
          </div>
          <div>
            <Label>Concierge Phone</Label>
            <Input value={data.conciergePhone} onChange={(v) => onChange({ conciergePhone: v })} placeholder="+917029406424" type="tel" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Playlist ────────────────────────────────────────────────────────────

function PlaylistTab({
  data,
  onChange,
}: {
  data: WeddingContent;
  onChange: (patch: Partial<WeddingContent>) => void;
}) {
  const tracks: PlaylistTrack[] = data.playlist ?? [];

  const updateTrack = (i: number, patch: Partial<PlaylistTrack>) => {
    const updated = [...tracks];
    updated[i] = { ...updated[i], ...patch };
    onChange({ playlist: updated });
  };

  const addTrack = () => {
    onChange({ playlist: [...tracks, { title: '', artist: '', duration: '' }] });
  };

  const removeTrack = (i: number) => {
    onChange({ playlist: tracks.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={addTrack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-medium hover:bg-[#d4af37]/20 transition-all"
        >
          <Plus size={13} /> Add Track
        </button>
      </div>

      <div className="space-y-3">
        {tracks.map((track, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3"
          >
            <div className="w-6 h-6 shrink-0 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
              <span className="text-[10px] text-[#d4af37] font-bold">{i + 1}</span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              <Input
                value={track.title}
                onChange={(v) => updateTrack(i, { title: v })}
                placeholder="Song title"
              />
              <Input
                value={track.artist}
                onChange={(v) => updateTrack(i, { artist: v })}
                placeholder="Artist"
              />
              <Input
                value={track.duration}
                onChange={(v) => updateTrack(i, { duration: v })}
                placeholder="4:23"
              />
            </div>
            <button
              onClick={() => removeTrack(i)}
              className="text-red-400/40 hover:text-red-400 transition-colors shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {tracks.length === 0 && (
          <div className="text-center py-10 text-white/20 border border-dashed border-white/10 rounded-2xl">
            <Music size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tracks yet. Add your first song.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: RSVP ────────────────────────────────────────────────────────────────

function RsvpTab({
  data,
  onChange,
}: {
  data: WeddingContent;
  onChange: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <SectionCard title="RSVP Settings">
      <div className="space-y-4 max-w-xl">
        <div>
          <Label>RSVP Deadline</Label>
          <Input
            value={data.rsvpDeadline}
            onChange={(v) => onChange({ rsvpDeadline: v })}
            placeholder="September 25, 2026"
          />
        </div>
        <div>
          <Label>RSVP Email</Label>
          <Input
            value={data.rsvpEmail}
            onChange={(v) => onChange({ rsvpEmail: v })}
            placeholder="rockyandswarupa@gmail.com"
            type="email"
          />
        </div>
        <div className="mt-4 p-4 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-xl">
          <p className="text-[11px] text-white/40 leading-relaxed">
            The RSVP email is used as the <code className="text-[#d4af37]/70">mailto:</code> target for the
            &ldquo;Accepts with Joy&rdquo; / &ldquo;Declines with Regret&rdquo; buttons on the public wedding page.
            The deadline text is displayed in the RSVP section description.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = 'couple' | 'gallery' | 'events' | 'travel' | 'playlist' | 'rsvp';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'couple', label: 'Couple', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'playlist', label: 'Playlist', icon: Music },
  { id: 'rsvp', label: 'RSVP', icon: Mail },
];

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function ContentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('couple');
  const [formData, setFormData] = useState<WeddingContent>(DEFAULT_CONTENT);
  const [loadingData, setLoadingData] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Fetch on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, 'weddingContent', 'main'));
        if (snap.exists()) {
          setFormData({ ...DEFAULT_CONTENT, ...(snap.data() as WeddingContent) });
        }
      } catch (err) {
        console.error('Failed to load wedding content', err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleChange = useCallback((patch: Partial<WeddingContent>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateDoc(doc(db, 'weddingContent', 'main'), { ...formData });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      // Doc might not exist yet — try setDoc equivalent via updateDoc's error
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'weddingContent', 'main'), { ...formData });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch {
        console.error('Save error', err);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#d4af37] mb-1">
            <Palette size={16} />
            <span className="text-xs tracking-[0.2em] uppercase font-semibold">Content CMS</span>
          </div>
          <h1 className="font-serif text-2xl text-white">Wedding Page Editor</h1>
          <p className="text-white/30 text-xs mt-1">Changes save to Firestore and reflect on the live wedding page in real-time.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saveStatus === 'saved'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : saveStatus === 'error'
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-[#d4af37] text-black hover:bg-[#e8c84a] active:scale-95'
          }`}
        >
          {saveStatus === 'saving' && <Loader2 size={15} className="animate-spin" />}
          {saveStatus === 'saved' && <Check size={15} />}
          {saveStatus === 'idle' && <Check size={15} className="opacity-0 w-0 overflow-hidden" />}
          {saveStatus === 'saving'
            ? 'Saving…'
            : saveStatus === 'saved'
            ? 'Saved!'
            : saveStatus === 'error'
            ? 'Error — Retry'
            : 'Save Changes'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 bg-white/3 border border-white/8 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-[#d4af37] text-black shadow-lg'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'couple' && <CoupleTab data={formData} onChange={handleChange} />}
        {activeTab === 'gallery' && <GalleryTab data={formData} onChange={handleChange} />}
        {activeTab === 'events' && <EventsTab data={formData} onChange={handleChange} />}
        {activeTab === 'travel' && <TravelTab data={formData} onChange={handleChange} />}
        {activeTab === 'playlist' && <PlaylistTab data={formData} onChange={handleChange} />}
        {activeTab === 'rsvp' && <RsvpTab data={formData} onChange={handleChange} />}
      </div>

      {/* Floating save at bottom on mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#d4af37] text-black text-sm font-bold shadow-2xl hover:bg-[#e8c84a] active:scale-95 transition-all"
        >
          {saveStatus === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}
