// Server-only: records what shoppers search for.
import { connectDB } from '@/lib/mongodb';
import SearchLog from '@/models/SearchLog';
import { search } from '@/lib/search';

// Keystrokes from the same tab within this window are one search.
const MERGE_WINDOW_MS = 2 * 60 * 1000;

export function cleanQuery(q = '') {
  return String(q).toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
}

export async function logSearch({ query, sessionId, source }) {
  const q = cleanQuery(query);
  if (q.length < 2) return null;

  // Results come from the in-memory index, so this costs no DB query.
  const result = await search(q, { limit: 1 });
  const fields = {
    query: q,
    source,
    resultCount: result.total,
    success: result.total > 0 && !result.relaxed,
  };

  await connectDB();
  const recent = await SearchLog.findOne({
    sessionId,
    updatedAt: { $gte: new Date(Date.now() - MERGE_WINDOW_MS) },
  })
    .sort({ updatedAt: -1 })
    .lean();

  // "glu" -> "gluta" (still typing) or "gluta" -> "glut" (correcting) is the
  // same search; a different word starts a new one.
  if (recent && (q.startsWith(recent.query) || recent.query.startsWith(q))) {
    await SearchLog.updateOne({ _id: recent._id }, { $set: fields });
    return recent._id;
  }

  const doc = await SearchLog.create({ ...fields, sessionId });
  return doc._id;
}
