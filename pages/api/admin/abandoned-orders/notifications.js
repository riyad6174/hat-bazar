import { verifyAdmin } from '@/lib/auth';
import {
  countNewAbandonedCheckouts,
  markAbandonedCheckoutsSeen,
} from '@/lib/checkoutSessions';

export default async function handler(req, res) {
  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ newCount: await countNewAbandonedCheckouts() });
    }
    if (req.method === 'POST') {
      await markAbandonedCheckoutsSeen();
      return res.status(200).json({ newCount: 0 });
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Abandoned notifications error:', error);
    return res.status(500).json({ message: 'Failed to process notifications' });
  }
}
