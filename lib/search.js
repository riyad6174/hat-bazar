// Server-only in-memory search over products + categories.
// The catalog is small, so we build an inverted index once, cache it, and
// answer every query from memory (no DB round-trip per keystroke).
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import staticProducts from '@/data/products.json';
import { normalizeDbProduct, getCategoriesWithCounts } from '@/lib/catalog';
import { getProductCategories } from '@/lib/categoryUtils';

const TTL_MS = 5 * 60 * 1000;
const FIELD_WEIGHTS = { title: 10, category: 6, slug: 4, short: 2, body: 1 };
const MATCH_SCORE = { exact: 1, prefix: 0.8, fuzzy: 0.5 };
const TITLE_PHRASE_BONUS = 15;
// Typo matching only on short, precise fields (title/category/slug); long
// descriptions produce false hits like "here" -> "herb".
const FUZZY_MIN_WEIGHT = FIELD_WEIGHTS.slug;

let cache = global._searchIndexCache;
if (!cache) cache = global._searchIndexCache = { index: null, builtAt: 0, promise: null };

// Lowercase, drop Latin accents, keep letters/digits/marks (Bangla vowel signs
// are combining marks, so \p{M} must survive), collapse everything else.
export function normalize(str = '') {
  return String(str)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, ' ')
    .trim();
}

function tokenize(str) {
  const n = normalize(str);
  return n ? n.split(' ') : [];
}

// Bangla / alternate spellings shoppers type -> catalog vocabulary.
// Keys are normalized at load so they match tokenize() output exactly.
const SYNONYM_SOURCE = {
  'সিরাম': ['serum'],
  'ক্রিম': ['cream'],
  'লোশন': ['lotion'],
  'তেল': ['oil'],
  'অয়েল': ['oil'],
  'চুল': ['hair'],
  'হেয়ার': ['hair'],
  'শ্যাম্পু': ['shampoo'],
  'ফেসওয়াশ': ['facewash', 'face'],
  'সানস্ক্রিন': ['sunscreen'],
  'সানব্লক': ['sunscreen'],
  'sunblock': ['sunscreen'],
  'ময়েশ্চারাইজার': ['moisturizer', 'moisturizing'],
  'moisturiser': ['moisturizer'],
  'moisturising': ['moisturizing'],
  'টোনার': ['toner'],
  'সাবান': ['soap'],
  'গ্লুটা': ['gluta'],
  'গ্লুটাথিওন': ['glutathione'],
  'কোলাজেন': ['collagen'],
  'ভিটামিন': ['vitamin', 'multivitamins'],
  'ক্লিনজার': ['cleanser'],
  'ক্লিনজিং': ['cleansing'],
  'স্কিন': ['skin'],
  'ত্বক': ['skin'],
  'ব্রণ': ['acne'],
  'pimple': ['acne'],
  'ফর্সা': ['whitening', 'brightening'],
  'whitening': ['brightening'],
  'স্নেইল': ['snail'],
  'সেন্টেলা': ['centella'],
  'নিয়াসিনামাইড': ['niacinamide'],
  'সাপ্লিমেন্ট': ['supplements'],
};
const SYNONYMS = new Map(
  Object.entries(SYNONYM_SOURCE).map(([k, v]) => [normalize(k), v.map(normalize)])
);

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
}

// Restricted Damerau-Levenshtein with early exit once distance exceeds max.
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2 = new Array(b.length + 1).fill(0);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j];
    prev = cur;
  }
  return prev[b.length];
}

function maxEdits(len) {
  if (len >= 8) return 2;
  if (len >= 4) return 1;
  return 0;
}

// First index in sorted array whose value is >= target.
function lowerBound(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function buildPostings(docs, fieldsOf) {
  // token -> Map(docIdx -> best field weight for that token)
  const postings = new Map();
  docs.forEach((doc, idx) => {
    for (const [field, text] of Object.entries(fieldsOf(doc))) {
      const w = FIELD_WEIGHTS[field];
      const toks = tokenize(text);
      if (field === 'title') {
        const n = toks.length;
        for (let i = 0; i < n - 1; i++) toks.push(toks[i] + toks[i + 1]);
      }
      for (const tok of toks) {
        let m = postings.get(tok);
        if (!m) postings.set(tok, (m = new Map()));
        if ((m.get(idx) || 0) < w) m.set(idx, w);
      }
    }
  });
  return { postings, tokens: [...postings.keys()].sort() };
}

async function buildIndex() {
  await connectDB();
  const [dbProducts, categories] = await Promise.all([
    Product.find({ inStock: true })
      .select('title slug shortDescription descriptionHTML categories thumbnail price originalPrice createdAt')
      .sort({ createdAt: -1 })
      .populate('categories', 'name slug')
      .lean(),
    getCategoriesWithCounts(),
  ]);

  const products = [
    ...dbProducts.map((p) => ({ ...normalizeDbProduct(p), _body: stripHtml(p.descriptionHTML) })),
    ...staticProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      category: p.category,
      slug: p.slug,
      description: p.description || '',
      _body: p.longDescription || '',
    })),
  ].map((p) => ({ ...p, _categories: getProductCategories(p), _title: normalize(p.name) }));

  const productIndex = buildPostings(products, (p) => ({
    title: p.name,
    category: p._categories.map((c) => c.name).join(' '),
    slug: (p.slug || '').replace(/-/g, ' '),
    short: p.description,
    body: p._body,
  }));

  const visibleCategories = categories.filter((c) => c.productCount > 0);
  const categoryIndex = buildPostings(visibleCategories, (c) => ({
    title: c.name,
    slug: c.slug.replace(/-/g, ' '),
    short: c.description,
  }));

  return { products, productIndex, categories: visibleCategories, categoryIndex };
}

async function getIndex() {
  if (cache.index && Date.now() - cache.builtAt < TTL_MS) return cache.index;
  if (!cache.promise) {
    cache.promise = buildIndex()
      .then((index) => {
        cache.index = index;
        cache.builtAt = Date.now();
        return index;
      })
      .finally(() => {
        cache.promise = null;
      });
  }
  // Serve the stale index while a rebuild runs, if we have one.
  return cache.index || cache.promise;
}

export function invalidateSearchIndex() {
  cache.index = null;
  cache.builtAt = 0;
}

// Returns Map(docIdx -> score) for one query token.
function matchToken(qt, { postings, tokens }) {
  const scores = new Map();
  const add = (tok, kind, minWeight = 0) => {
    for (const [idx, w] of postings.get(tok)) {
      if (w < minWeight) continue;
      const s = MATCH_SCORE[kind] * w;
      if ((scores.get(idx) || 0) < s) scores.set(idx, s);
    }
  };

  if (postings.has(qt)) add(qt, 'exact');

  for (let i = lowerBound(tokens, qt); i < tokens.length && tokens[i].startsWith(qt); i++) {
    if (tokens[i] !== qt) add(tokens[i], 'prefix');
  }

  const max = maxEdits(qt.length);
  if (max > 0) {
    for (const tok of tokens) {
      if (tok[0] !== qt[0] || Math.abs(tok.length - qt.length) > max) continue;
      if (tok === qt || tok.startsWith(qt)) continue;
      // Also allow a typo inside a prefix: "glutt" vs "gluta..." compares same-length head.
      const head = tok.length > qt.length ? tok.slice(0, qt.length) : tok;
      if (editDistance(qt, tok, max) <= max || editDistance(qt, head, max) <= max) add(tok, 'fuzzy', FUZZY_MIN_WEIGHT);
    }
  }
  return scores;
}

// Best score per doc across a token and its synonyms.
function matchWithSynonyms(qt, index) {
  const scores = matchToken(qt, index);
  for (const alt of SYNONYMS.get(qt) || []) {
    for (const [idx, s] of matchToken(alt, index)) {
      if ((scores.get(idx) || 0) < s) scores.set(idx, s);
    }
  }
  return scores;
}

// requireAll: every word must match. Otherwise (relaxed) at least half must,
// so one stray word can't pull in unrelated products.
function rank(queryTokens, index, requireAll) {
  const perToken = queryTokens.map((qt) => matchWithSynonyms(qt, index));
  const total = new Map();
  const hits = new Map();
  for (const scores of perToken) {
    for (const [idx, s] of scores) {
      total.set(idx, (total.get(idx) || 0) + s);
      hits.set(idx, (hits.get(idx) || 0) + 1);
    }
  }
  const need = requireAll ? queryTokens.length : Math.ceil(queryTokens.length / 2);
  return [...total].filter(([idx]) => hits.get(idx) >= need);
}

export async function search(query, { categories = [], limit = 8 } = {}) {
  const index = await getIndex();
  const queryTokens = [...new Set(tokenize(query))].slice(0, 8);
  const phrase = normalize(query);
  const catFilter = new Set(categories);
  const inCategory = (p) => catFilter.size === 0 || p._categories.some((c) => catFilter.has(c.slug));

  if (queryTokens.length === 0) {
    return { products: [], categories: [], relaxed: false, total: 0 };
  }

  let relaxed = false;
  let productHits = rank(queryTokens, index.productIndex, true).filter(([i]) => inCategory(index.products[i]));
  if (productHits.length === 0 && queryTokens.length > 1) {
    // "face wash" vs "facewash": try the words joined before relaxing.
    productHits = rank([queryTokens.join('')], index.productIndex, true).filter(([i]) => inCategory(index.products[i]));
  }
  if (productHits.length === 0 && queryTokens.length > 1) {
    relaxed = true;
    productHits = rank(queryTokens, index.productIndex, false).filter(([i]) => inCategory(index.products[i]));
  }

  const total = productHits.length;
  const products = productHits
    .map(([i, score]) => {
      const p = index.products[i];
      return [p, p._title.includes(phrase) ? score + TITLE_PHRASE_BONUS : score];
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([p, score]) => {
      const { _body, _categories, _title, ...rest } = p;
      return { ...rest, score: Math.round(score * 10) / 10 };
    });

  const matchedCategories = rank(queryTokens, index.categoryIndex, false)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([i]) => {
      const c = index.categories[i];
      return { name: c.name, slug: c.slug, productCount: c.productCount, image: c.displayImage };
    });

  return { products, categories: matchedCategories, relaxed, total };
}
