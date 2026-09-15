import { storage, storageKeys } from './storage.js';

/**
 * API client.
 *
 * A thin fetch wrapper that:
 *   - injects the auth token,
 *   - attaches a request id + idempotency header where relevant,
 *   - unwraps the `{ success, data, meta }` envelope,
 *   - auto-refreshes the token once on 401,
 *   - throws typed errors the UI can catch.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

let refreshPromise = null;

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = storage.get(storageKeys.REFRESH_TOKEN);
      if (!refreshToken) return null;
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const body = await res.json();
      storage.set(storageKeys.AUTH_TOKEN, body.data.accessToken);
      storage.set(storageKeys.REFRESH_TOKEN, body.data.refreshToken);
      return body.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, headers = {}, retry = true } = {}) {
  const token = storage.get(storageKeys.AUTH_TOKEN);
  const finalHeaders = {
    'Content-Type': 'application/json',
    'x-request-id': crypto.randomUUID?.() ?? String(Date.now()),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh once on an expired token.
  if (res.status === 401 && retry && storage.get(storageKeys.REFRESH_TOKEN)) {
    const newToken = await refreshToken();
    if (newToken) return request(path, { method, body, headers, retry: false });
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.error?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, payload?.error?.code, payload?.error?.details);
  }

  return payload; // { success, data, meta }
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
