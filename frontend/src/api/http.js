// Thin fetch wrapper: attaches the token, normalises errors, and lets the app
// register global handlers for 401 (session gone) and 403 (permissions changed).
const TOKEN_KEY = 'rbac_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

const handlers = { unauthorized: null, forbidden: null };
export function onUnauthorized(fn) { handlers.unauthorized = fn; }
export function onForbidden(fn) { handlers.forbidden = fn; }

export async function api(path, { method = 'GET', body, skipAuthHandler = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new ApiError(res.status, data);
    if (!skipAuthHandler) {
      if (res.status === 401 && handlers.unauthorized) handlers.unauthorized(error);
      if (res.status === 403 && handlers.forbidden) handlers.forbidden(error);
    }
    throw error;
  }
  return data;
}
