// Server-only helpers for products and categories.
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import staticProducts from '@/data/products.json';
import { slugifyCategory, CATEGORY_FALLBACK_IMAGES } from '@/lib/categoryUtils';

function toCategoryRef(c) {
  return { _id: String(c._id), name: c.name, slug: c.slug };
}

// Shape a populated DB product the way ProductCard / shop expect.
export function normalizeDbProduct(p) {
  const categories = (p.categories || []).filter((c) => c && c.slug).map(toCategoryRef);
  return {
    id: p._id.toString(),
    name: p.title,
    price: p.price,
    oldPrice: p.originalPrice,
    image: p.thumbnail || '',
    categories,
    category: categories.map((c) => c.name).join(', '),
    slug: p.slug,
    description: p.shortDescription || '',
    _isDB: true,
  };
}

export async function getCategoriesWithCounts({ inStockOnly = true } = {}) {
  await connectDB();
  const match = inStockOnly ? { inStock: true } : {};
  const [categories, counts] = await Promise.all([
    Category.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
    Product.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 }, sampleImage: { $first: '$thumbnail' } } },
    ]),
  ]);

  const countById = new Map(counts.map((c) => [String(c._id), c]));
  const staticCounts = {};
  for (const p of staticProducts) {
    const slug = slugifyCategory(p.category || '');
    if (slug) staticCounts[slug] = (staticCounts[slug] || 0) + 1;
  }

  return categories.map((c) => {
    const db = countById.get(String(c._id));
    return {
      _id: String(c._id),
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      sortOrder: c.sortOrder || 0,
      image: c.image || '',
      displayImage: c.image || CATEGORY_FALLBACK_IMAGES[c.slug] || db?.sampleImage || '',
      productCount: (db?.count || 0) + (staticCounts[c.slug] || 0),
    };
  });
}

// Filters the admin form selection down to existing Category ids.
export async function resolveCategoryIds(input) {
  if (!Array.isArray(input) || input.length === 0) return [];
  const ids = input.map(String).filter((v) => /^[a-f0-9]{24}$/i.test(v));
  const found = await Category.find({ _id: { $in: ids } }, { _id: 1 }).lean();
  const valid = new Set(found.map((c) => String(c._id)));
  return [...new Set(ids.filter((id) => valid.has(id)))];
}
