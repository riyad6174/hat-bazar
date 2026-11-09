import { connectDB } from '@/lib/mongodb';
import CheckoutSession from '@/models/CheckoutSession';
import { verifyAdmin } from '@/lib/auth';
import {
  ABANDONED_AFTER_MINUTES,
  abandonedCheckoutFilter,
  getAbandonedAt,
} from '@/lib/checkoutSessions';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { page = 1, limit = 30, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 30));

    const filter = abandonedCheckoutFilter();
    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { address: regex }];
    }

    const [sessions, total] = await Promise.all([
      CheckoutSession.find(filter)
        .select('-token -seq')
        .sort({ lastActivityAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      CheckoutSession.countDocuments(filter),
    ]);

    return res.status(200).json({
      orders: sessions.map((session) => ({
        ...session,
        abandonedAt: getAbandonedAt(session),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      thresholdMinutes: ABANDONED_AFTER_MINUTES,
    });
  } catch (error) {
    console.error('Abandoned orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch abandoned orders' });
  }
}
