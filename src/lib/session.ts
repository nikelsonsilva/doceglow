// Customer session management with 7-day expiration

const STORAGE_KEY = 'vitrinia_session';
const SESSION_DAYS = 7;

interface CustomerSession {
  phone: string;
  name?: string;
  verifiedAt: number; // timestamp
  expiresAt: number;  // timestamp
}

export function saveSession(phone: string, name?: string): void {
  const now = Date.now();
  const session: CustomerSession = {
    phone,
    name,
    verifiedAt: now,
    expiresAt: now + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  // Keep legacy key for compatibility
  localStorage.setItem('vitrinia_phone', phone);
}

export function getSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Fallback: check legacy key
      const legacyPhone = localStorage.getItem('vitrinia_phone') || localStorage.getItem('doceglow_phone');
      if (legacyPhone) {
        // Migrate to new format
        saveSession(legacyPhone);
        return getSession();
      }
      return null;
    }

    const session: CustomerSession = JSON.parse(raw);

    // Check expiration
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getSessionPhone(): string | null {
  return getSession()?.phone || null;
}

export function isSessionValid(): boolean {
  return getSession() !== null;
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('vitrinia_phone');
  localStorage.removeItem('doceglow_phone'); // legacy cleanup
}

export function refreshSession(): void {
  const session = getSession();
  if (session) {
    // Extend session for another 7 days on activity
    saveSession(session.phone, session.name);
  }
}
