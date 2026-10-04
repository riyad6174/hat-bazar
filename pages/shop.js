import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import staticProducts from '@/data/products.json';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { normalizeDbProduct, getCategoriesWithCounts } from '@/lib/catalog';
import { getProductCategories } from '@/lib/categoryUtils';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SORT_OPTIONS = [
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

export default function ShopPage({ dbProducts = [], categories = [] }) {
  const router = useRouter();
  const { category } = router.query;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState(category ? [category] : []);

  // Keep the filter in sync when navbar/category links change ?category= on this page.
  useEffect(() => {
    setSelectedCategories(category ? [category] : []);
  }, [category]);

  const allProducts = useMemo(() => [...dbProducts, ...staticProducts], [dbProducts]);

  const availableCategories = useMemo(
    () => categories.filter(c => c.productCount > 0),
    [categories]
  );

  const categoryName = (slug) => categories.find(c => c.slug === slug)?.name || slug;

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategories.length > 0) {
      result = result.filter(p =>
        getProductCategories(p).some(c => selectedCategories.includes(c.slug))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        getProductCategories(p).some(c => c.name.toLowerCase().includes(q)) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
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
  }, [allProducts, selectedCategories, searchQuery, sortBy, priceRange]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setPriceRange([0, 5000]);
    setSortBy('newest');
  };

  const activeFilterCount = selectedCategories.length + (searchQuery ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

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
            {selectedCategories.length === 1 ? categoryName(selectedCategories[0]) : 'Shop All'}
          </h1>
          <p className="font-body text-sm text-tertiary">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </motion.header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-surface-dim bg-white font-body text-sm focus:outline-none focus:border-primary transition-colors"
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-surface-dim bg-white font-body text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        {availableCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap pb-1 mb-6">
            <button
              onClick={() => setSelectedCategories([])}
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
        {filteredProducts.length > 0 ? (
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
