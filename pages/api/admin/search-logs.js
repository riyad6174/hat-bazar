import { connectDB } from '@/lib/mongodb';
import SearchLog from '@/models/SearchLog';
import { verifyAdmin } from '@/lib/auth';

const TIMEZONE = 'Asia/Dhaka';
const ALLOWED_DAYS = new Set([1, 7, 30, 90, 365]);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Start of "today minus (days - 1)" in Dhaka time (UTC+6, no DST).
function sinceDate(days) {
  const offsetMs = 6 * 60 * 60 * 1000;
  const nowDhaka = new Date(Date.now() + offsetMs);
  const startOfTodayDhaka = Date.UTC(nowDhaka.getUTCFullYear(), nowDhaka.getUTCMonth(), nowDhaka.getUTCDate());
  return new Date(startOfTodayDhaka - offsetMs - (days - 1) * 24 * 60 * 60 * 1000);
}

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const days = ALLOWED_DAYS.has(Number(req.query.days)) ? Number(req.query.days) : 7;
  const status = ['success', 'failed'].includes(req.query.status) ? req.query.status : 'all';
  const keyword = String(req.query.q || '').trim().toLowerCase().slice(0, 100);

  const match = { createdAt: { $gte: sinceDate(days) } };
  if (keyword) match.query = { $regex: escapeRegExp(keyword) };

  // Status of a keyword = its most recent outcome (products may have been
  // added since an earlier failed search).
  const statusMatch = status === 'all' ? [] : [{ $match: { success: status === 'success' } }];

  try {
    await connectDB();

    const [byDay, summary, topFailed] = await Promise.all([
      SearchLog.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TIMEZONE } },
              query: '$query',
            },
            count: { $sum: 1 },
            success: { $first: '$success' },
            resultCount: { $first: '$resultCount' },
            lastAt: { $first: '$createdAt' },
          },
        },
        ...statusMatch,
        { $sort: { count: -1, lastAt: -1 } },
        {
          $group: {
            _id: '$_id.day',
            total: { $sum: '$count' },
            failed: { $sum: { $cond: ['$success', 0, '$count'] } },
            keywords: {
              $push: {
                query: '$_id.query',
                count: '$count',
                success: '$success',
                resultCount: '$resultCount',
                lastAt: '$lastAt',
              },
            },
          },
        },
        { $sort: { _id: -1 } },
      ]),
      SearchLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: { $sum: { $cond: ['$success', 1, 0] } },
            keywords: { $addToSet: '$query' },
          },
        },
        { $project: { _id: 0, total: 1, successful: 1, uniqueKeywords: { $size: '$keywords' } } },
      ]),
      SearchLog.aggregate([
        { $match: { ...match, success: false } },
        { $group: { _id: '$query', count: { $sum: 1 }, lastAt: { $max: '$createdAt' } } },
        { $sort: { count: -1, lastAt: -1 } },
        { $limit: 15 },
      ]),
    ]);

    const s = summary[0] || { total: 0, successful: 0, uniqueKeywords: 0 };
    return res.status(200).json({
      days,
      summary: { ...s, failed: s.total - s.successful },
      topFailed: topFailed.map((k) => ({ query: k._id, count: k.count, lastAt: k.lastAt })),
      byDay: byDay.map((d) => ({ date: d._id, total: d.total, failed: d.failed, keywords: d.keywords })),
    });
  } catch (err) {
    console.error('Search logs fetch error:', err);
    return res.status(500).json({ message: 'Failed to load search analytics' });
  }
}
