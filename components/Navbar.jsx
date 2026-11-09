import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDropLine,
  RiWaterFlashLine,
  RiFlaskLine,
  RiScissorsCutLine,
  RiSunLine,
  RiBubbleChartLine,
  RiCapsuleLine,
  RiMoonClearLine,
  RiHandSanitizerLine,
  RiPriceTag3Line,
} from 'react-icons/ri';

const CATEGORY_ICONS = {
  moisturizer: RiDropLine,
  toner: RiWaterFlashLine,
  serum: RiFlaskLine,
  haircare: RiScissorsCutLine,
  sunscreen: RiSunLine,
  facewash: RiBubbleChartLine,
  supplements: RiCapsuleLine,
  'night-cream': RiMoonClearLine,
  soap: RiHandSanitizerLine,
};

// Shared across Navbar mounts so client-side navigation doesn't refetch.
let categoriesCache = null;
let categoriesRequest = null;

function loadCategories() {
  if (!categoriesRequest) {
    categoriesRequest = fetch('/api/public/categories')
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => {
        categoriesCache = d.categories || [];
        return categoriesCache;
      })
      .catch(() => {
        categoriesRequest = null;
        return [];
      });
  }
  return categoriesRequest;
}

const Navbar = ({ categories: initialCategories, belowHeader }) => {
  const { getCartCount, setIsDrawerOpen } = useCart();
  const cartCount = getCartCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allCategories, setAllCategories] = useState(initialCategories || categoriesCache || []);

  useEffect(() => {
    if (initialCategories) {
      categoriesCache = initialCategories;
      return;
    }
    let active = true;
    loadCategories().then((cats) => { if (active) setAllCategories(cats); });
    return () => { active = false; };
  }, [initialCategories]);

  const router = useRouter();
  const activeSlug = router.pathname === '/shop' ? router.query.category : null;

  const categories = (initialCategories || allCategories)
    .filter((c) => c.productCount > 0)
    .map((c) => ({ ...c, icon: CATEGORY_ICONS[c.slug] || RiPriceTag3Line }));

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50"
    >
      <header className="bg-surface/95 backdrop-blur-xl border-b border-surface-dim">
        <div className="flex justify-between items-center w-full max-w-[1280px] mx-auto px-4 md:px-16 py-3 md:py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo.png"
              alt="Hat Bazar"
              width={140}
              height={56}
              priority
              className="h-8 md:h-14 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 text-on-surface hover:text-primary transition-colors font-body text-sm font-medium"
            >
              <span className="material-symbols-outlined text-xl">storefront</span>
              Shop
            </Link>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-on-surface flex items-center relative hover:text-primary transition-colors cursor-pointer p-2"
              aria-label={`Open cart, ${cartCount} items`}
            >
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface p-2"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Category Nav */}
      <nav className="hidden md:block bg-surface-container/80 backdrop-blur-md border-b border-surface-dim py-3 overflow-x-auto scrollbar-hide">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-center gap-3 min-w-max">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all group whitespace-nowrap ${
                activeSlug === cat.slug
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/50 border-surface-dim hover:border-primary hover:text-primary'
              }`}
            >
              <cat.icon className={`text-lg transition-colors ${activeSlug === cat.slug ? 'text-white' : 'text-tertiary group-hover:text-primary'}`} />
              <span className="font-body text-xs font-bold uppercase tracking-wider">{cat.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {belowHeader}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-surface border-b border-surface-dim overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-xl text-primary">storefront</span>
                <span className="font-body font-medium text-on-surface">Shop All</span>
              </Link>
              <div className="border-t border-surface-dim my-2"></div>
              <p className="px-4 py-2 font-body text-[10px] font-bold text-outline uppercase tracking-wider">Categories</p>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-surface-container transition-colors"
                  >
                    <cat.icon className="text-lg text-tertiary" />
                    <span className="font-body text-sm text-on-surface">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
