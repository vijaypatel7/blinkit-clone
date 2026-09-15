import { createSlice } from '@reduxjs/toolkit';
import { storage, storageKeys } from '../services/storage.js';

/**
 * Location slice — the user's delivery location (lat/lng + display label).
 *
 * Blinkit is location-first: the whole catalogue (store, inventory, prices) is
 * resolved from here. Persisted so we don't re-prompt on every visit.
 */
const persisted = storage.get(storageKeys.DELIVERY_LOCATION);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    lat: persisted?.lat ?? null,
    lng: persisted?.lng ?? null,
    label: persisted?.label ?? 'Select location',
    isResolved: !!(persisted?.lat && persisted?.lng),
  },
  reducers: {
    setLocation(state, action) {
      const { lat, lng, label } = action.payload;
      state.lat = lat;
      state.lng = lng;
      state.label = label;
      state.isResolved = true;
      storage.set(storageKeys.DELIVERY_LOCATION, { lat, lng, label });
    },
    clearLocation(state) {
      state.lat = null;
      state.lng = null;
      state.label = 'Select location';
      state.isResolved = false;
      storage.remove(storageKeys.DELIVERY_LOCATION);
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
