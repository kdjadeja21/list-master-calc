/**
 * Fully local "test account" session — no Firebase project, credentials,
 * emulator, or network access required. Everything lives in this browser's
 * `localStorage`, so it works completely offline and is entirely isolated
 * from the real Firebase Auth / Firestore backends used by signed-in users.
 */

export interface LocalUser {
  uid: string;
  isAnonymous: true;
  displayName: string;
  email: null;
  photoURL: null;
}

const STORAGE_KEY = "tally:local-test-uid";
export const LOCAL_UID_PREFIX = "local-test-";

function readStoredUid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredUid(uid: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (uid) {
      window.localStorage.setItem(STORAGE_KEY, uid);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore write failures (e.g. storage disabled/full) — the session
    // simply won't persist across reloads.
  }
}

/** True for uids minted by the local test session (never a real Firebase uid). */
export function isLocalUid(uid: string | null | undefined): boolean {
  return !!uid && uid.startsWith(LOCAL_UID_PREFIX);
}

export function getLocalTestUser(): LocalUser | null {
  const uid = readStoredUid();
  if (!uid) return null;
  return {
    uid,
    isAnonymous: true,
    displayName: "Test User",
    email: null,
    photoURL: null,
  };
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Notifies on sign-in/out in this tab, and on storage changes from other tabs. */
export function subscribeLocalTestUser(listener: () => void): () => void {
  listeners.add(listener);

  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return () => listeners.delete(listener);
}

/**
 * Starts a local-only test session. Deliberately does not touch Firebase in
 * any way — no Auth SDK call, no network request — so it works with zero
 * setup (no `.env.local`, no emulator, no real project).
 */
export function signInAsLocalTestUser(): LocalUser {
  const uid = `${LOCAL_UID_PREFIX}${crypto.randomUUID()}`;
  writeStoredUid(uid);
  notify();
  return getLocalTestUser()!;
}

export function signOutLocalTestUser(): void {
  writeStoredUid(null);
  notify();
}
