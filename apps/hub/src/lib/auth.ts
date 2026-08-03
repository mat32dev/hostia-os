import type { SessionUser, Token } from '@/types';

const TOKEN_KEY = 'hostia_hub_token';
const POS_PROXY = '/api/pos';

// ─── Token storage ───────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  return getSessionUser() !== null;
}

// ─── Session ─────────────────────────────────────────────────────────────────
export function getSessionUser(): SessionUser | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return { email: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}

// ─── Login / logout (POS owns identity) ──────────────────────────────────────
export async function login(email: string, password: string): Promise<void> {
  // The POS auth endpoint takes email/password as query parameters.
  const res = await fetch(
    `${POS_PROXY}/v1/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { method: 'POST' },
  );
  if (!res.ok) {
    let detail = 'Invalid email or password';
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : detail;
    } catch {
      // keep default message
    }
    throw new Error(detail);
  }
  const token: Token = await res.json();
  setToken(token.access_token);
}

export function logout(): void {
  clearToken();
}
