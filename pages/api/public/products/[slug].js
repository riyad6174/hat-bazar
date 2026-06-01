import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;

  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json({ product });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
