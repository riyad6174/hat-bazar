import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import staticProducts from '@/data/products.json';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeDbProduct, getCategoriesWithCounts } from '@/lib/catalog';
import { getProductCategories } from '@/lib/categoryUtils';
import { trackSearch } from '@/utils/searchTracking';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best match', queryOnly: true },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export async function getServerSideProps() {
  try {
    await connectDB();
    const [dbProducts, categories] = await Promise.all([
      Product.find({ inStock: true }).sort({ createdAt: -1 }).populate('categories', 'name slug').lean(),
      getCategoriesWithCounts(),
    ]);

    return { props: { dbProducts: dbProducts.map(normalizeDbProduct), categories } };
  } catch {
    return { props: { dbProducts: [], categories: [] } };
  }
}

function parseCategories(value) {
  const raw = Array.isArray(value) ? value.join(',') : value || '';
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
}

export default function ShopPage({ dbProducts = [], categories = [] }) {
  const router = useRouter();
  // URL is the source of truth for search + categories (shareable, back-button friendly).
  const searchQuery = typeof router.query.q === 'string' ? router.query.q : '';
  const selectedCategories = useMemo(() => parseCategories(router.query.category), [router.query.category]);
  const categoryKey = selectedCategories.join(',');

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [searchResult, setSearchResult] = useState(null); // { products, relaxed }
  const [searching, setSearching] = useState(false);

  const updateUrl = useCallback(
    (next) => {
      const query = { ...router.query, ...next };
      Object.keys(query).forEach((k) => {
        if (query[k] === '' || query[k] == null) delete query[k];
      });
      router.replace({ pathname: '/shop', query }, undefined, { shallow: true, scroll: false });
    },
    [router]
  );

  // Keep the input in sync when the URL changes from elsewhere (navbar search, back button).
  useEffect(() => {
    setSearchInput((prev) => (prev.trim() === searchQuery.trim() ? prev : searchQuery));
  }, [searchQuery]);

  // Debounce typing into the URL.
  useEffect(() => {
    if (searchInput.trim() === searchQuery.trim()) return;
    const t = setTimeout(() => updateUrl({ q: searchInput.trim() }), 300);
    return () => clearTimeout(t);
  }, [searchInput, searchQuery, updateUrl]);

  useEffect(() => {
    if (searchQuery.trim()) trackSearch(searchQuery, 'shop');
  }, [searchQuery]);

  // Ranked server-side search whenever there is a query.
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResult(null);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const params = new URLSearchParams({ q, limit: '50' });
    if (categoryKey) params.set('categories', categoryKey);
    fetch(`/api/public/search?${params}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { products: [], relaxed: false }))
      .then((data) => {
        setSearchResult({ products: data.products || [], relaxed: !!data.relaxed });
        setSearching(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setSearchResult({ products: [], relaxed: false });
          setSearching(false);
        }
      });
    return () => controller.abort();
  }, [searchQuery, categoryKey]);

  const allProducts = useMemo(() => [...dbProducts, ...staticProducts], [dbProducts]);

  const availableCategories = useMemo(
    () => categories.filter(c => c.productCount > 0),
    [categories]
  );

  const categoryName = (slug) => categories.find(c => c.slug === slug)?.name || slug;

  const hasQuery = searchQuery.trim().length > 0;
  const effectiveSort = !hasQuery && sortBy === 'relevance' ? 'newest' : sortBy;

  const filteredProducts = useMemo(() => {
    let result;
    if (hasQuery) {
      // Server already applied the query + category filter and ranked by relevance.
      result = [...(searchResult?.products || [])];
    } else {
      result = [...allProducts];
      if (selectedCategories.length > 0) {
        result = result.filter(p =>
          getProductCategories(p).some(c => selectedCategories.includes(c.slug))
        );
      }
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (effectiveSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return result;
  }, [hasQuery, searchResult, allProducts, selectedCategories, effectiveSort, priceRange]);

  const setCategories = (list) => updateUrl({ category: list.join(',') });

  const toggleCategory = (cat) => {
    setCategories(
      selectedCategories.includes(cat)
        ? selectedCategories.filter(c => c !== cat)
        : [...selectedCategories, cat]
    );
  };

  const clearSearch = () => {
    setSearchInput('');
    updateUrl({ q: '' });
  };

  const resetFilters = () => {
    setSearchInput('');
    setPriceRange([0, 5000]);
    setSortBy('relevance');
    updateUrl({ q: '', category: '' });
  };

  const activeFilterCount = selectedCategories.length + (searchQuery ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  const heading = hasQuery
    ? `Results for “${searchQuery}”`
    : selectedCategories.length === 1
      ? categoryName(selectedCategories[0])
      : selectedCategories.length > 1
        ? `${selectedCategories.length} Categories`
        : 'Shop All';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categories={categories} />

      <main className="flex-grow pt-8 md:pt-16 max-w-[1280px] mx-auto px-4 md:px-16 w-full">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-5xl text-on-surface mb-2">
            {heading}
          </h1>
          <p className="font-body text-sm text-tertiary">
            {searching ? 'Searching…' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </motion.header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              type="search"
              placeholder="Search products or categories..."
              value={searchInput}
              maxLength={100}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') updateUrl({ q: searchInput.trim() }); }}
              className="w-full pl-10 pr-10 py-2.5 rounded-full border border-surface-dim bg-white font-body text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border font-body text-sm transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-surface-dim text-on-surface hover:border-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">tune</span>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={effectiveSort}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-surface-dim bg-white font-body text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.filter(opt => hasQuery || !opt.queryOnly).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        {availableCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap pb-1 mb-6">
            <button
              onClick={() => setCategories([])}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${
                selectedCategories.length === 0
                  ? 'bg-primary text-white'
                  : 'bg-white border border-surface-dim text-on-surface hover:border-primary'
              }`}
            >
              All
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => toggleCategory(cat.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all whitespace-nowrap ${
                  selectedCategories.includes(cat.slug)
                    ? 'bg-primary text-white'
                    : 'bg-white border border-surface-dim text-on-surface hover:border-primary'
                }`}
              >
                {cat.name} <span className="opacity-60">({cat.productCount})</span>
              </button>
            ))}
          </div>
        )}

        {/* Active filters */}
        {(hasQuery || selectedCategories.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {hasQuery && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold"
              >
                &ldquo;{searchQuery}&rdquo;
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
            {selectedCategories.map(slug => (
              <button
                key={slug}
                onClick={() => toggleCategory(slug)}
                className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold"
              >
                {categoryName(slug)}
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            ))}
            <button onClick={resetFilters} className="font-body text-xs text-tertiary hover:text-primary hover:underline ml-1">
              Clear all
            </button>
          </div>
        )}

        {hasQuery && !searching && searchResult?.relaxed && filteredProducts.length > 0 && (
          <p className="font-body text-sm text-tertiary mb-4">
            No exact match for all words &mdash; showing related products.
          </p>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 md:p-6 bg-surface-container-low rounded-2xl border border-surface-dim"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64">
                <h3 className="font-body text-xs font-bold text-outline uppercase tracking-wider mb-3">Max Price</h3>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-[var(--primary)]"
                />
                <p className="font-body text-xs text-tertiary mt-1">Up to {priceRange[1]}৳</p>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 font-body text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* Product Grid */}
        {searching && !searchResult ? (
          <div className="text-center py-16 font-body text-tertiary">Searching…</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 md:py-24">
            <span className="material-symbols-outlined text-6xl text-outline/30 mb-4">search_off</span>
            <p className="font-body text-tertiary text-lg mb-2">No products found</p>
            <p className="font-body text-sm text-outline mb-6">Try adjusting your search or filters</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-primary text-white rounded-full font-body text-sm font-bold hover:opacity-90 transition-all"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
