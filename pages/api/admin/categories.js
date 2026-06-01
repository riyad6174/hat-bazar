import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import { verifyAdmin } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await connectDB();
      const categories = await Category.find({}).sort({ name: 1 }).lean();
      return res.status(200).json({ categories });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  const admin = verifyAdmin(req);
  if (!admin) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await connectDB();

    if (req.method === 'POST') {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Name required' });
      const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const category = await Category.create({ name, slug });
      return res.status(201).json({ category });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
