import { logSearch } from '@/lib/searchLog';

const SESSION_ID = /^[a-zA-Z0-9-]{8,64}$/;
const SOURCES = new Set(['navbar', 'shop']);

// Simple per-IP limiter (per server instance) to keep junk out of analytics.
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 40;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q, sid, source } = req.body || {};
  if (typeof q !== 'string' || typeof sid !== 'string' || !SESSION_ID.test(sid)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ message: 'Too many requests' });

  try {
    await logSearch({ query: q, sessionId: sid, source: SOURCES.has(source) ? source : 'navbar' });
    return res.status(204).end();
  } catch (err) {
    console.error('Search log failed:', err);
    return res.status(500).json({ message: 'Failed to log search' });
  }
}
