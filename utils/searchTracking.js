// Client-side: report a search to the admin analytics. Fire-and-forget; never
// blocks or breaks the search UI.
const SID_KEY = 'hb_search_sid';
let memorySid = null;

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getSessionId() {
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = newId();
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    if (!memorySid) memorySid = newId();
    return memorySid;
  }
}

// Skip immediate repeats (e.g. navbar Enter followed by the shop page loading
// the same query); a genuine repeat later on still counts.
const REPEAT_WINDOW_MS = 30 * 1000;
let lastSent = { key: '', at: 0 };

export function trackSearch(query, source) {
  const q = (query || '').trim();
  if (q.length < 2) return;
  const key = `${source}:${q.toLowerCase()}`;
  const now = Date.now();
  if (key === lastSent.key && now - lastSent.at < REPEAT_WINDOW_MS) return;
  lastSent = { key, at: now };
  try {
    fetch('/api/public/search-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, sid: getSessionId(), source }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
