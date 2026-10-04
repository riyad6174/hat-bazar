import { getCategoriesWithCounts } from '@/lib/catalog';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const categories = await getCategoriesWithCounts();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ categories });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
