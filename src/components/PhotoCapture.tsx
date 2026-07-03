'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, X, MapPin, Loader2 } from 'lucide-react';

export interface PhotoCaptureResult {
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function PhotoCapture({
  onChange,
}: {
  onChange: (result: PhotoCaptureResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'uploading' | 'done' | 'error'>('idle');
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function getDeviceLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null), // permission denied or unavailable — proceed without it
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file));
    setStatus('locating');

    const position = await getDeviceLocation();
    const latitude = position?.coords.latitude ?? null;
    const longitude = position?.coords.longitude ?? null;
    if (latitude !== null && longitude !== null) {
      setLocationLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } else {
      setLocationLabel(null);
    }

    setStatus('uploading');
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('site-photos').upload(path, file);
    if (uploadError) {
      setStatus('error');
      setError(uploadError.message);
      onChange({ photo_url: null, latitude, longitude });
      return;
    }

    const { data: publicUrl } = supabase.storage.from('site-photos').getPublicUrl(path);
    setStatus('done');
    onChange({ photo_url: publicUrl.publicUrl, latitude, longitude });
  }

  function handleClear() {
    setPreview(null);
    setLocationLabel(null);
    setStatus('idle');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onChange({ photo_url: null, latitude: null, longitude: null });
  }

  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-wide text-[var(--color-paper-dim)] mb-1">
        Photo
      </label>

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded border border-dashed border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-paper-dim)] hover:border-[var(--color-amber)] hover:text-[var(--color-paper)] transition w-full justify-center"
        >
          <Camera size={15} />
          Add photo
        </button>
      ) : (
        <div className="relative rounded border border-[var(--color-border)] overflow-hidden">
          <img src={preview} alt="Attached photo" className="w-full h-32 object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X size={13} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 flex items-center gap-1.5 text-[11px] text-white">
            {status === 'locating' && (
              <>
                <Loader2 size={11} className="animate-spin" /> Getting location…
              </>
            )}
            {status === 'uploading' && (
              <>
                <Loader2 size={11} className="animate-spin" /> Uploading…
              </>
            )}
            {status === 'done' && locationLabel && (
              <>
                <MapPin size={11} /> {locationLabel}
              </>
            )}
            {status === 'done' && !locationLabel && <>No location available</>}
            {status === 'error' && <>Upload failed</>}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-[var(--color-incident-bright)]">{error}</p>}
    </div>
  );
}
