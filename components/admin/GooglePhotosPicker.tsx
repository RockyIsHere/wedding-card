'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (opts: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

interface PhotosPickerProps {
  onUploaded: (url: string) => void;
  storagePath: string;   // e.g. "couple/groom"
  label?: string;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const SCOPE = 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
const PICKER_API = 'https://photospicker.googleapis.com/v1';

// ─── Component ────────────────────────────────────────────────────────────────

export default function GooglePhotosPicker({ onUploaded, storagePath, label = 'Google Photos' }: PhotosPickerProps) {
  const [status, setStatus] = useState<'idle' | 'auth' | 'opening' | 'waiting' | 'downloading' | 'uploading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const tokenClientRef = useRef<TokenClient | null>(null);
  const accessTokenRef = useRef<string>('');
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<Window | null>(null);

  // ── Load GIS script once ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !GOOGLE_CLIENT_ID) return;
    if (document.getElementById('gis-script')) return;
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // ── Stop polling on unmount ─────────────────────────────────────────────────
  useEffect(() => () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  }, []);

  // ── Core flow ───────────────────────────────────────────────────────────────
  const openPicker = useCallback(async (token: string) => {
    setStatus('opening');
    accessTokenRef.current = token;

    // Use the pre-opened popup (opened synchronously in handleClick)
    const popup = popupRef.current;
    if (!popup || popup.closed) {
      setErrorMsg('Popup was closed or could not open. Please allow popups and try again.');
      setStatus('error');
      return;
    }

    try {
      // 1. Create a picker session
      const sessionRes = await fetch(`${PICKER_API}/sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!sessionRes.ok) throw new Error(`Session creation failed: ${sessionRes.status}`);
      const session = await sessionRes.json();

      const pickerUri: string = session.pickerUri;
      const sessionId: string = session.id;

      // 2. Navigate the already-open popup to the picker URL
      popup.location.href = pickerUri;
      setStatus('waiting');

      // 3. Poll for the session to have a selected media item
      pollIntervalRef.current = setInterval(async () => {
        try {
          if (popup.closed) {
            // User closed popup without selecting
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setStatus('idle');
            return;
          }

          const pollRes = await fetch(`${PICKER_API}/sessions/${sessionId}`, {
            headers: { Authorization: `Bearer ${accessTokenRef.current}` },
          });
          if (!pollRes.ok) return;
          const pollData = await pollRes.json();

          if (pollData.mediaItemsSet) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            popup.close();

            // 4. Get the selected media items
            const itemsRes = await fetch(`${PICKER_API}/mediaItems?sessionId=${sessionId}`, {
              headers: { Authorization: `Bearer ${accessTokenRef.current}` },
            });
            if (!itemsRes.ok) throw new Error(`Failed to fetch selected photos: ${itemsRes.status}`);
            const itemsData = await itemsRes.json();

            console.log('[GooglePhotosPicker] mediaItems response:', JSON.stringify(itemsData, null, 2));

            const mediaItem = itemsData.mediaItems?.[0];
            if (!mediaItem) throw new Error('No photo selected');

            // The Photos Picker API returns: mediaItem.mediaFile.baseUrl
            // Append =d for full-resolution download
            const baseUrl: string =
              mediaItem.mediaFile?.baseUrl ??
              mediaItem.baseUrl ??          // fallback field name
              mediaItem.productUrl;         // last resort: Google Photos web URL

            if (!baseUrl) throw new Error('Could not determine photo URL from API response');

            const photoUrl = baseUrl.includes('=') ? baseUrl : `${baseUrl}=d`;

            // 5. Download via server-side proxy (avoids CORS)
            setStatus('downloading');
            const proxyRes = await fetch('/api/google-photos-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessTokenRef.current}`,
              },
              body: JSON.stringify({ url: photoUrl }),
            });
            if (!proxyRes.ok) {
              const errData = await proxyRes.json().catch(() => ({}));
              throw new Error(`Download failed: ${errData.error ?? proxyRes.status}`);
            }
            const blob = await proxyRes.blob();

            // 6. Upload to Firebase Storage
            setStatus('uploading');
            const ext = blob.type.includes('png') ? 'png' : 'jpg';
            const fileName = `${Date.now()}_google_photo.${ext}`;
            const sRef = storageRef(storage, `wedding-cms/${storagePath}/${fileName}`);
            await uploadBytes(sRef, blob, { contentType: blob.type || 'image/jpeg' });
            const downloadUrl = await getDownloadURL(sRef);

            onUploaded(downloadUrl);
            setStatus('done');
            setTimeout(() => setStatus('idle'), 2000);
          }
        } catch (err: unknown) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
          setStatus('error');
        }
      }, 1500);

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, [onUploaded, storagePath]);

  const handleClick = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setErrorMsg('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in .env.local');
      setStatus('error');
      return;
    }

    if (!window.google) {
      setErrorMsg('Google Identity Services not loaded yet. Try again in a moment.');
      setStatus('error');
      return;
    }

    // Open the popup window IMMEDIATELY (synchronous, direct user gesture)
    // so the browser doesn't block it. We'll navigate it later.
    const loadingHtml = `<html><body style="background:#0a1a12;color:#d4af37;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:14px;letter-spacing:2px">LOADING GOOGLE PHOTOS…</body></html>`;
    const popup = window.open('', 'GooglePhotosPicker', 'width=960,height=720,scrollbars=yes');
    if (!popup) {
      setErrorMsg('Popup was blocked. Please allow popups for localhost in your browser settings, then try again.');
      setStatus('error');
      return;
    }
    popup.document.write(loadingHtml);
    popupRef.current = popup;

    setStatus('auth');

    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPE,
        callback: (resp) => {
          if (resp.error || !resp.access_token) {
            popupRef.current?.close();
            setErrorMsg(resp.error ?? 'Auth failed');
            setStatus('error');
            return;
          }
          openPicker(resp.access_token);
        },
      });
    }

    tokenClientRef.current.requestAccessToken({ prompt: '' });
  }, [openPicker]);

  // ── Labels ──────────────────────────────────────────────────────────────────
  const statusLabel: Record<typeof status, string> = {
    idle: label,
    auth: 'Signing in…',
    opening: 'Opening picker…',
    waiting: 'Select photo in popup…',
    downloading: 'Downloading…',
    uploading: 'Uploading…',
    done: '✓ Uploaded!',
    error: 'Retry',
  };

  const isLoading = ['auth', 'opening', 'waiting', 'downloading', 'uploading'].includes(status);

  if (!GOOGLE_CLIENT_ID) return null; // Hide button entirely if not configured

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all border ${
          status === 'done'
            ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
            : status === 'error'
            ? 'bg-red-400/10 text-red-400 border-red-400/30'
            : 'bg-white/5 text-white/60 border-white/10 hover:border-[#4285f4]/40 hover:text-[#4285f4] hover:bg-[#4285f4]/5'
        }`}
      >
        {isLoading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          /* Google Photos icon (coloured dots) */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="6" r="4" fill="#4285F4" />
            <circle cx="18" cy="6" r="4" fill="#EA4335" />
            <circle cx="18" cy="18" r="4" fill="#FBBC05" />
            <circle cx="6" cy="18" r="4" fill="#34A853" />
          </svg>
        )}
        {statusLabel[status]}
      </button>
      {status === 'error' && errorMsg && (
        <p className="text-[10px] text-red-400/80 leading-tight">{errorMsg}</p>
      )}
      {status === 'waiting' && (
        <p className="text-[10px] text-white/30 italic">Choose a photo in the Google Photos window that opened.</p>
      )}
    </div>
  );
}
