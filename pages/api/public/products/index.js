import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const products = await Product.find({ inStock: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ products });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
