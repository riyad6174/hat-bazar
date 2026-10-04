// One-off migration: products.category (free text) -> products.categories (Category refs).
// Seeds the Category collection from the existing category names, links every
// product to the matching Category documents. The old `category` field is kept
// (the new code ignores it) unless --drop-legacy is passed. Safe to re-run.
//
// Usage: node --env-file=.env scripts/migrate-categories.mjs [--dry-run] [--drop-legacy]
// If SRV lookups fail on your network, also set DNS_SERVERS=8.8.8.8,1.1.1.1
import dns from 'node:dns';
import mongoose from 'mongoose';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(','));

const DRY_RUN = process.argv.includes('--dry-run');
const DROP_LEGACY = process.argv.includes('--drop-legacy');

// Display name + storefront order. Toner/Sunscreen/Facewash were in the old
// hard-coded navbar, so keep them available in the admin even without products.
const SEED = [
  { name: 'Moisturizer', slug: 'moisturizer' },
  { name: 'Toner', slug: 'toner' },
  { name: 'Serum', slug: 'serum' },
  { name: 'Haircare', slug: 'haircare' },
  { name: 'Sunscreen', slug: 'sunscreen' },
  { name: 'Facewash', slug: 'facewash' },
  { name: 'Supplements', slug: 'supplements' },
  { name: 'Night Cream', slug: 'night-cream' },
  { name: 'Soap', slug: 'soap' },
];

// Products whose old category was blank, assigned by slug.
const MANUAL = {
  'cleanix-anti-acne-spot-reduce-night-cream': ['night-cream'],
};

function slugify(name = '') {
  return name.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const db = mongoose.connection.db;
const categoriesCol = db.collection('categories');
const productsCol = db.collection('products');

const products = await productsCol.find({}).toArray();

// Any legacy category name not in SEED gets its own Category too.
const seed = [...SEED];
for (const p of products) {
  const slug = slugify(p.category || '');
  if (slug && !seed.some((s) => s.slug === slug)) seed.push({ name: p.category.trim(), slug });
}

const idBySlug = {};
for (const [i, c] of seed.entries()) {
  const existing = await categoriesCol.findOne({ slug: c.slug });
  if (existing) {
    idBySlug[c.slug] = existing._id;
    continue;
  }
  const now = new Date();
  const doc = { name: c.name, slug: c.slug, description: '', image: '', sortOrder: i + 1, createdAt: now, updatedAt: now, __v: 0 };
  console.log(`+ category ${c.name} (${c.slug})`);
  if (!DRY_RUN) idBySlug[c.slug] = (await categoriesCol.insertOne(doc)).insertedId;
}

let missing = 0;
for (const p of products) {
  const slugs = MANUAL[p.slug] || [slugify(p.category || '')].filter(Boolean);
  const ids = [...(p.categories || [])];
  for (const s of slugs) {
    const id = idBySlug[s];
    if (id && !ids.some((x) => String(x) === String(id))) ids.push(id);
  }
  if (ids.length === 0) missing++;
  console.log(`${p.slug}: "${p.category ?? ''}" -> [${slugs.join(', ')}]`);
  if (!DRY_RUN) {
    const update = { $set: { categories: ids } };
    if (DROP_LEGACY) update.$unset = { category: '' };
    await productsCol.updateOne({ _id: p._id }, update);
  }
}

console.log(`\n${products.length} products processed${DRY_RUN ? ' (dry run)' : `, ${missing} without a category`}.`);
await mongoose.disconnect();
