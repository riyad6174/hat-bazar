// Client-safe category helpers (no DB imports here).

export function slugifyCategory(name = '') {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Used when a category has no image of its own.
export const CATEGORY_FALLBACK_IMAGES = {
  moisturizer: 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=300',
  toner: 'https://images.pexels.com/photos/8128069/pexels-photo-8128069.jpeg?auto=compress&cs=tinysrgb&w=300',
  serum: 'https://images.pexels.com/photos/12024065/pexels-photo-12024065.jpeg?auto=compress&cs=tinysrgb&w=300',
  haircare: 'https://images.pexels.com/photos/8467957/pexels-photo-8467957.jpeg?auto=compress&cs=tinysrgb&w=300',
  sunscreen: 'https://images.pexels.com/photos/22821334/pexels-photo-22821334.jpeg?auto=compress&cs=tinysrgb&w=300',
  facewash: 'https://images.pexels.com/photos/19049367/pexels-photo-19049367.png?auto=compress&cs=tinysrgb&w=300',
  supplements: 'https://images.pexels.com/photos/31406911/pexels-photo-31406911.jpeg?auto=compress&cs=tinysrgb&w=300',
};

export function productInCategory(product, slug) {
  return getProductCategories(product).some((c) => c.slug === slug);
}

// DB products carry `categories: [{ name, slug }]`; static products from
// data/products.json only have a single `category` name.
export function getProductCategories(product) {
  if (Array.isArray(product.categories)) return product.categories;
  if (!product.category) return [];
  return [{ name: product.category, slug: slugifyCategory(product.category) }];
}
