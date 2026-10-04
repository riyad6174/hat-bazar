import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const filter = { inStock: true };
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category }, { _id: 1 }).lean();
      if (!category) return res.status(200).json({ products: [] });
      filter.categories = category._id;
    }
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate('categories', 'name slug')
      .lean();
    return res.status(200).json({ products });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
