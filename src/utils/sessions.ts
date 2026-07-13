// ─── Session Persistence with localStorage ──────────────────────────────────
//
// Stores data in localStorage with an expiry timestamp.
// Session expires after 20 hours.
//

const SESSION_HOURS = 20;

interface StoredData<T> {
  data: T;
  expiresAt: number;
}

export function saveSession<T>(key: string, data: T): void {
  const stored: StoredData<T> = {
    data,
    expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadSession<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const stored: StoredData<T> = JSON.parse(raw);

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return stored.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function clearSession(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently fail
  }
}

// ─── Keys ────────────────────────────────────────────────────────────────────

export const SESSION_KEYS = {
  USER: 'shopee_vkam_user',
  TASKS: 'shopee_vkam_tasks',
  TAB: 'shopee_vkam_tab',
} as const;