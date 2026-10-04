import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { verifyAdmin } from '@/lib/auth';
import { getCategoriesWithCounts } from '@/lib/catalog';
import { slugifyCategory } from '@/lib/categoryUtils';

function pickFields(body) {
  const data = {};
  if (typeof body.name === 'string') {
    data.name = body.name.trim();
    data.slug = slugifyCategory(data.name);
  }
  if (typeof body.description === 'string') data.description = body.description;
  if (typeof body.image === 'string') data.image = body.image.trim();
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
  return data;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categories = await getCategoriesWithCounts({ inStockOnly: false });
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
      const data = pickFields(req.body || {});
      if (!data.name || !data.slug) return res.status(400).json({ message: 'Name required' });
      if (await Category.exists({ slug: data.slug })) {
        return res.status(409).json({ message: `Category "${data.name}" already exists` });
      }
      if (req.body.sortOrder === undefined) {
        const last = await Category.findOne({}).sort({ sortOrder: -1 }).lean();
        data.sortOrder = (last?.sortOrder || 0) + 1;
      }
      const category = await Category.create(data);
      return res.status(201).json({ category });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const data = pickFields(req.body || {});
      if ('name' in data && !data.slug) return res.status(400).json({ message: 'Name required' });
      if (data.slug && (await Category.exists({ slug: data.slug, _id: { $ne: id } }))) {
        return res.status(409).json({ message: `Category "${data.name}" already exists` });
      }
      const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!category) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json({ category });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await Product.updateMany({ categories: id }, { $pull: { categories: id } });
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
