import { saveCheckoutProgress } from '@/lib/checkoutSessions';

export const config = {
  api: { bodyParser: { sizeLimit: '32kb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await saveCheckoutProgress(req.body);
    if (result.invalid) {
      return res.status(400).json({ message: 'Invalid checkout data' });
    }
    return res.status(200).json({ saved: result.saved });
  } catch (error) {
    console.error('Checkout progress save failed:', error.message);
    return res.status(500).json({ message: 'Failed to save checkout progress' });
  }
}
