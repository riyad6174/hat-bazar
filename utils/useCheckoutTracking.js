import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'hatbazar_checkout';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ENDPOINT = '/api/public/checkout-progress';
const SAVE_DEBOUNCE_MS = 1500;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 4000;

// Fallback for browsers where storage is blocked (e.g. some private modes).
let memorySession = null;

function readSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.token && Date.now() - stored.startedAt < SESSION_MAX_AGE_MS) {
      return stored;
    }
  } catch {}
  return memorySession;
}

function writeSession(session) {
  memorySession = session;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

function getOrCreateSession() {
  const existing = readSession();
  if (existing) return existing;
  const startedAt = Date.now();
  const session = {
    token: `${startedAt}-${Math.random().toString(36).slice(2, 10)}`,
    startedAt,
    form: null,
  };
  writeSession(session);
  return session;
}

export function loadCheckoutDraft() {
  return readSession()?.form ?? null;
}

export function saveCheckoutDraft(form) {
  writeSession({ ...getOrCreateSession(), form });
}

function clearCheckoutSession() {
  memorySession = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Progressively saves the checkout while `snapshot` is non-null. Never throws
 * or blocks: if a save fails the customer can still place the order.
 *
 * Saves are debounced, skipped when nothing changed, and run one at a time so
 * they reach the server in order. The server discards any that arrive late.
 */
export function useCheckoutTracking(snapshot) {
  const snapshotKey = snapshot ? JSON.stringify(snapshot) : null;
  const latestKey = useRef(null);
  const lastSentKey = useRef(null);
  const trackedPhone = useRef(null);
  const token = useRef(null);
  const paused = useRef(false);
  const inFlight = useRef(false);
  const dirty = useRef(false);
  const retries = useRef(0);
  const timer = useRef(null);

  const getToken = useCallback(() => {
    token.current ??= getOrCreateSession().token;
    return token.current;
  }, []);

  const getPendingKey = useCallback(() => {
    const key = latestKey.current;
    return key && key !== lastSentKey.current && !paused.current ? key : null;
  }, []);

  const buildBody = useCallback(
    (key) => JSON.stringify({ ...JSON.parse(key), token: getToken(), seq: Date.now() }),
    [getToken]
  );

  const send = useCallback(async () => {
    clearTimeout(timer.current);
    if (inFlight.current) {
      dirty.current = true;
      return;
    }
    const key = getPendingKey();
    if (!key) return;

    inFlight.current = true;
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: buildBody(key),
        keepalive: true,
      });
      if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
      lastSentKey.current = key;
      retries.current = 0;
    } catch {
      if (retries.current < MAX_RETRIES) {
        retries.current += 1;
        timer.current = setTimeout(send, RETRY_DELAY_MS * retries.current);
      }
    } finally {
      inFlight.current = false;
      if (dirty.current) {
        dirty.current = false;
        send();
      }
    }
  }, [buildBody, getPendingKey]);

  useEffect(() => {
    latestKey.current = snapshotKey;
    clearTimeout(timer.current);
    if (snapshotKey && !paused.current) {
      // A new valid number is the one thing needed to call the customer back,
      // so save it at once in case they leave right after typing it.
      const { phone } = JSON.parse(snapshotKey);
      const isNewPhone = phone !== trackedPhone.current;
      trackedPhone.current = phone;
      timer.current = setTimeout(send, isNewPhone ? 0 : SAVE_DEBOUNCE_MS);
    }
  }, [snapshotKey, send]);

  // Don't lose the last edits when the tab closes, the app is backgrounded,
  // or the customer navigates elsewhere in the site.
  useEffect(() => {
    const flushWithBeacon = () => {
      const key = getPendingKey();
      if (!key) return;
      clearTimeout(timer.current);
      const body = new Blob([buildBody(key)], { type: 'application/json' });
      if (navigator.sendBeacon?.(ENDPOINT, body)) lastSentKey.current = key;
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushWithBeacon();
    };

    window.addEventListener('pagehide', flushWithBeacon);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushWithBeacon);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      send();
    };
  }, [buildBody, getPendingKey, send]);

  /** Stops saving while the order is being submitted. */
  const pauseTracking = useCallback(() => {
    paused.current = true;
    clearTimeout(timer.current);
  }, []);

  const resumeTracking = useCallback(() => {
    paused.current = false;
    timer.current = setTimeout(send, SAVE_DEBOUNCE_MS);
  }, [send]);

  /** Ends this attempt. Tracking stays paused until the form is remounted. */
  const finishTracking = useCallback(() => {
    paused.current = true;
    clearTimeout(timer.current);
    clearCheckoutSession();
  }, []);

  return { getToken, pauseTracking, resumeTracking, finishTracking };
}
