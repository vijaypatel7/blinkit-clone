import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../store/locationSlice.js';
import { PRESET_LOCATIONS } from '../../constants/index.js';
import { useToast } from '../../app/providers/ToastProvider.jsx';

/**
 * Reverse-geocode coordinates to a human-readable area name using the free
 * OpenStreetMap Nominatim service (no API key required).
 *
 * `zoom=14` returns suburb/neighbourhood + city, which is exactly the level of
 * detail a delivery label needs ("Naroda, Ahmedabad"). Higher zooms return
 * street-level detail that, for Indian addresses, often drops the `city` field
 * entirely and leaves only `state` ("Gujarat") — the bug we avoid here.
 */
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Geocode failed');
  const data = await res.json();
  const a = data?.address || {};

  // Most specific area first (locality), city-like name second (region).
  // Indian data often tags the city as `city_district` / `state_district`
  // rather than `city`, so we check every candidate and never let the label
  // collapse to a bare state when a more specific name is available.
  const locality =
    a.neighbourhood || a.suburb || a.quarter || a.village || a.road ||
    a.town || a.city || a.city_district || a.municipality || null;
  const region =
    a.city || a.town || a.city_district || a.state_district || a.county ||
    a.state || a.country || null;

  if (locality && region && locality.toLowerCase() !== region.toLowerCase()) {
    return `${locality}, ${region}`;
  }
  return locality || region || 'Current location';
}

/**
 * Get a high-accuracy position.
 *
 * `getCurrentPosition` returns the FIRST fix the browser has, which on phones
 * is often a coarse Wi-Fi/IP/cell estimate (hundreds of metres off). To get
 * the *exact* location we instead `watchPosition` and keep collecting fixes
 * until one reports an accuracy within ACCURACY_TARGET (a real GPS lock). If
 * no precise fix arrives within TIMEOUT_MS we fall back to the most accurate
 * fix we did see, so the user still gets a location rather than nothing.
 */
const ACCURACY_TARGET_M = 100; // a genuine GPS-grade fix
const TIMEOUT_MS = 20000;

function getAccuratePosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error('Geolocation not supported'), { code: -1 }));
      return;
    }

    let best = null;
    let settled = false;
    let watchId = null;
    let timer = null;

    const finish = (pos) => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (timer) clearTimeout(timer);
      resolve(pos);
    };

    const fail = (err) => {
      if (settled) return;
      settled = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (timer) clearTimeout(timer);
      reject(err);
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = pos.coords.accuracy; // metres; smaller = better
        // Keep the most accurate fix seen so far (guard against null).
        if (!best || acc < best.coords.accuracy) best = pos;
        // Good enough — stop immediately so we don't keep burning the GPS.
        if (acc <= ACCURACY_TARGET_M) finish(pos);
      },
      fail,
      {
        enableHighAccuracy: true,
        maximumAge: 0, // never accept a cached fix
        timeout: TIMEOUT_MS,
      }
    );

    // Safety net: after the timeout, return the best fix we collected, or fail.
    timer = setTimeout(() => {
      if (best) finish(best);
      else fail(Object.assign(new Error('Could not get a location fix'), { code: 3 }));
    }, TIMEOUT_MS);
  });
}

/**
 * LocationPickerModal — sets the delivery location WITHOUT requiring login.
 *
 * Two ways to pick a location:
 *   1. "Use my current location" → high-accuracy browser geolocation, then a
 *      reverse-geocode so we can show a real area name (not a bare coordinate).
 *   2. Search / tap a preset city area → stored in Redux (localStorage).
 *
 * Purely client-side, so there is no auth/bearer requirement.
 */
export function LocationPickerModal({ open, onClose }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRESET_LOCATIONS;
    return PRESET_LOCATIONS.filter((l) => l.label.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  const choose = (loc) => {
    dispatch(setLocation(loc));
    toast(`Delivering to ${loc.label}`, { type: 'success' });
    onClose();
  };

  const detect = async () => {
    if (!navigator.geolocation) {
      toast('Geolocation is not supported by this browser', { type: 'error' });
      return;
    }
    setDetecting(true);

    // Wait for a genuinely accurate GPS fix (falls back to the best fix).
    let position;
    try {
      position = await getAccuratePosition();
    } catch (err) {
      setDetecting(false);
      const msg =
        err.code === 1
          ? 'Location permission denied — pick manually below'
          : 'Could not get a location fix — pick manually below';
      toast(msg, { type: 'error' });
      return;
    }

    const { latitude: lat, longitude: lng } = position.coords;

    // Turn the coordinate into a friendly area name.
    let label = 'Current location';
    try {
      label = await reverseGeocode(lat, lng);
    } catch {
      label = 'Current location';
    }

    dispatch(setLocation({ lat, lng, label }));
    setDetecting(false);
    toast(`Location set: ${label}`, { type: 'success' });
    onClose();
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.head}>
          <h3 style={{ margin: 0 }}>Choose your location</h3>
          <button style={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <button style={styles.detect} onClick={detect} disabled={detecting}>
          <span style={{ fontSize: 18 }}>📡</span>
          {detecting ? 'Detecting your location…' : 'Use my current location'}
        </button>

        <div style={styles.divider}>or select from list</div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city or area…"
          style={styles.search}
          autoFocus
        />

        <div style={styles.list}>
          {filtered.map((loc) => (
            <button key={loc.label} style={styles.item} onClick={() => choose(loc)}>
              <span style={{ fontSize: 16 }}>📍</span>
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>{loc.label}</span>
              <span style={{ color: 'var(--text-faint)' }}>›</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: 16 }}>
              No matching location.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeUp 0.25s ease both',
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  close: { border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' },
  detect: {
    margin: 16,
    padding: '12px',
    borderRadius: 10,
    border: '1.5px solid var(--green)',
    background: '#f4fbf5',
    color: 'var(--green)',
    fontWeight: 700,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  divider: {
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-faint)',
    margin: '0 16px 12px',
  },
  search: {
    margin: '0 16px 12px',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid var(--border-strong)',
    fontSize: 14,
    outline: 'none',
  },
  list: { overflowY: 'auto', padding: '0 12px 12px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '12px 10px',
    border: 'none',
    background: 'none',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: 14,
    color: '#1c1c1c',
  },
};
