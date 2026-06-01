import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const {
      page = 1,
      limit = 30,
      search = '',
      status = '',
      responseStatus = '',
      from = '',
      to = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { phone: regex }, { orderId: regex }];
    }

    if (status && ['pending', 'confirmed', 'cancel'].includes(status)) {
      filter.orderStatus = status;
    }

    if (responseStatus === 'none') {
      filter.responseStatus = null;
    } else if (responseStatus && ['called', 'number_off', 'did_not_pick', 'call_later', 'fake_order'].includes(responseStatus)) {
      filter.responseStatus = responseStatus;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
    const nowBD = new Date(Date.now() + BD_OFFSET_MS);
    const todayStartUTC = new Date(
      Date.UTC(nowBD.getUTCFullYear(), nowBD.getUTCMonth(), nowBD.getUTCDate()) - BD_OFFSET_MS
    );

    const [orders, total, stats] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(filter),
      Promise.all([
        Order.countDocuments({ createdAt: { $gte: todayStartUTC } }),
        Order.countDocuments({ orderStatus: 'confirmed', createdAt: { $gte: todayStartUTC } }),
        Order.countDocuments({ orderStatus: 'cancel', createdAt: { $gte: todayStartUTC } }),
        Order.countDocuments({}),
        Order.countDocuments({ orderStatus: 'pending', createdAt: { $gte: todayStartUTC } }),
        Order.countDocuments({ orderStatus: 'pending' }),
        Order.countDocuments({ orderStatus: 'confirmed' }),
        Order.countDocuments({ orderStatus: 'cancel' }),
      ]),
    ]);

    return res.status(200).json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats: {
        today: stats[0],
        confirmedToday: stats[1],
        cancelledToday: stats[2],
        globalTotal: stats[3],
        pendingToday: stats[4],
        totalPending: stats[5],
        totalConfirmed: stats[6],
        totalCancelled: stats[7],
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
}
