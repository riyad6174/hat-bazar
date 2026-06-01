import { verifyAdmin } from '@/lib/auth';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = verifyAdmin(req);

  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({ email: payload.email });
}
