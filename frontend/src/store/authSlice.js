import { createSlice } from '@reduxjs/toolkit';
import { storage, storageKeys } from '../services/storage.js';

/**
 * Auth slice — client session state.
 *
 * The actual JWT lives in storage (via apiClient); this slice tracks the
 * decoded user + a lightweight "isAuthenticated" flag for UI gating. It also
 * records when the access token expires so the app can proactively log a user
 * out (instead of surfacing a raw "Token expired" error on the next request).
 */

/**
 * Decode a JWT's `exp` claim into a millisecond timestamp.
 * (We only base64-decode the payload — no signature verification is needed
 * client-side; the server is the authority.)
 */
function decodeJwtExpiry(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

const initialUser = storage.get(storageKeys.USER);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    isAuthenticated: !!storage.get(storageKeys.AUTH_TOKEN),
  },
  reducers: {
    setSession(state, action) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      storage.set(storageKeys.USER, user);
      storage.set(storageKeys.AUTH_TOKEN, accessToken);
      storage.set(storageKeys.REFRESH_TOKEN, refreshToken);
      // Record when the access token expires so we can auto-logout later.
      storage.set(storageKeys.AUTH_EXPIRES_AT, decodeJwtExpiry(accessToken));
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      storage.set(storageKeys.USER, state.user);
    },
    clearSession(state) {
      state.user = null;
      state.isAuthenticated = false;
      storage.remove(storageKeys.USER);
      storage.remove(storageKeys.AUTH_TOKEN);
      storage.remove(storageKeys.REFRESH_TOKEN);
      storage.remove(storageKeys.AUTH_EXPIRES_AT);
    },
  },
});

export const { setSession, updateUser, clearSession } = authSlice.actions;

/**
 * True when the stored access token has already expired (or is missing).
 * Used at app startup (and on 401s) to log the user out proactively.
 */
export function isSessionExpired() {
  const expiresAt = storage.get(storageKeys.AUTH_EXPIRES_AT);
  // No expiry info (e.g. a legacy session) — treat as valid; the server will
  // still reject it with a 401 and the baseQuery will clear the session then.
  if (typeof expiresAt !== 'number') return false;
  return Date.now() >= expiresAt;
}

export default authSlice.reducer;
