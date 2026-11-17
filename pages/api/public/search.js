import { search } from '@/lib/search';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const q = String(req.query.q || '').slice(0, 100);
  const categories = String(req.query.categories || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);

  try {
    const result = await search(q, { categories, limit });
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return res.status(200).json(result);
  } catch (err) {
    console.error('Search failed:', err);
    return res.status(500).json({ message: 'Search failed', products: [], categories: [] });
  }
}
