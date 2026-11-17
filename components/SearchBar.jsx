import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { trackSearch } from '@/utils/searchTracking';

const RECENT_KEY = 'hb_recent_searches';
const MAX_RECENT = 5;
const DEBOUNCE_MS = 200;
// Log once the shopper pauses, so analytics see words, not keystrokes.
const TRACK_IDLE_MS = 1000;

// Shared across mounts: query -> result, so retyping a query never refetches.
const resultCache = new Map();

function readRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(v) ? v.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(q) {
  try {
    const next = [q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text = '', query }) {
  const tokens = query.trim().split(/\s+/).filter((t) => t.length > 0);
  if (!tokens.length) return text;
  const re = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-primary/15 text-primary rounded-sm px-0.5">{part}</mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export function SearchToggle({ open, onToggle }) {
  return (
    <button
      data-search-toggle
      onClick={onToggle}
      className="text-on-surface flex items-center hover:text-primary transition-colors cursor-pointer p-2"
      aria-label={open ? 'Close search' : 'Search products'}
      aria-expanded={open}
    >
      <span className="material-symbols-outlined text-2xl">{open ? 'close' : 'search'}</span>
    </button>
  );
}

export default function SearchPanel({ open, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState([]);

  const trimmed = query.trim();

  useEffect(() => {
    if (open) {
      setRecent(readRecent());
      // Wait for the panel animation to mount the input.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on route change.
  useEffect(() => {
    const handle = () => onClose();
    router.events.on('routeChangeStart', handle);
    return () => router.events.off('routeChangeStart', handle);
  }, [router.events, onClose]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest?.('[data-search-toggle]')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  // Debounced, abortable fetch.
  useEffect(() => {
    setActive(-1);
    setError(false);
    if (trimmed.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    const key = trimmed.toLowerCase();
    if (resultCache.has(key)) {
      setResult(resultCache.get(key));
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/public/search?q=${encodeURIComponent(trimmed)}&limit=6`, { signal: controller.signal })
        .then((r) => {
          // Never cache a failed lookup as "no results" — that used to make
          // transient server errors stick for the rest of the session.
          if (!r.ok) throw new Error(`Search failed: ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (resultCache.size > 100) resultCache.clear();
          resultCache.set(key, data);
          setResult(data);
          setError(false);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setResult(null);
          setError(true);
          setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    if (trimmed.length < 2) return;
    const t = setTimeout(() => trackSearch(trimmed, 'navbar'), TRACK_IDLE_MS);
    return () => clearTimeout(t);
  }, [trimmed]);

  // Flat list of navigable items for keyboard selection.
  const items = useMemo(() => {
    if (trimmed.length < 2) {
      return recent.map((r) => ({ type: 'recent', key: `r-${r}`, label: r, href: `/shop?q=${encodeURIComponent(r)}` }));
    }
    if (!result) return [];
    return [
      ...result.categories.map((c) => ({ type: 'category', key: `c-${c.slug}`, data: c, href: `/shop?category=${c.slug}` })),
      ...result.products.map((p) => ({ type: 'product', key: `p-${p.id}`, data: p, href: `/product/${p.slug}` })),
      { type: 'all', key: 'all', href: `/shop?q=${encodeURIComponent(trimmed)}` },
    ];
  }, [trimmed, result, recent]);

  const go = useCallback(
    (href) => {
      if (trimmed.length >= 2) {
        setRecent(saveRecent(trimmed));
        trackSearch(trimmed, 'navbar');
      }
      onClose();
      setQuery('');
      router.push(href);
    },
    [trimmed, onClose, router]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && items[active]) go(items[active].href);
      else if (trimmed) go(`/shop?q=${encodeURIComponent(trimmed)}`);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const optionProps = (item, idx) => ({
    id: `search-opt-${idx}`,
    role: 'option',
    'aria-selected': active === idx,
    onMouseEnter: () => setActive(idx),
    onClick: (e) => {
      e.preventDefault();
      go(item.href);
    },
  });

  const categoryItems = items.filter((i) => i.type === 'category');
  const productItems = items.filter((i) => i.type === 'product');
  const idxOf = (item) => items.indexOf(item);
  const noResults = result && trimmed.length >= 2 && !loading && !result.products.length && !result.categories.length;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="bg-surface border-b border-surface-dim overflow-hidden shadow-lg"
        >
          <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-3 md:py-4">
            <div className="relative max-w-2xl mx-auto">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search products or categories..."
                role="combobox"
                aria-expanded={items.length > 0}
                aria-controls="search-listbox"
                aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
                aria-autocomplete="list"
                maxLength={100}
                className="w-full pl-10 pr-10 py-2.5 rounded-full border border-surface-dim bg-white font-body text-sm focus:outline-none focus:border-primary transition-colors"
              />
              {loading && (
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-lg animate-spin">progress_activity</span>
              )}
            </div>

            <div id="search-listbox" role="listbox" className="max-w-2xl mx-auto mt-3 max-h-[60vh] overflow-y-auto">
              {/* Recent searches */}
              {trimmed.length < 2 && recent.length > 0 && (
                <div className="pb-2">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <p className="font-body text-[10px] font-bold text-outline uppercase tracking-wider">Recent searches</p>
                    <button
                      onClick={() => { clearRecent(); setRecent([]); }}
                      className="font-body text-[11px] text-primary hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  {items.map((item, idx) => (
                    <a
                      key={item.key}
                      href={item.href}
                      {...optionProps(item, idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl font-body text-sm text-on-surface ${active === idx ? 'bg-surface-container' : ''}`}
                    >
                      <span className="material-symbols-outlined text-lg text-outline">history</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Category matches */}
              {categoryItems.length > 0 && (
                <div className="pb-2">
                  <p className="px-2 mb-1 font-body text-[10px] font-bold text-outline uppercase tracking-wider">Categories</p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {categoryItems.map((item) => {
                      const idx = idxOf(item);
                      return (
                        <a
                          key={item.key}
                          href={item.href}
                          {...optionProps(item, idx)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-body font-semibold transition-all ${
                            active === idx ? 'bg-primary border-primary text-white' : 'bg-white border-surface-dim text-on-surface'
                          }`}
                        >
                          <Highlight text={item.data.name} query={active === idx ? '' : trimmed} />
                          <span className="opacity-60 ml-1">({item.data.productCount})</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product matches */}
              {productItems.length > 0 && (
                <div className="pb-2">
                  <p className="px-2 mb-1 font-body text-[10px] font-bold text-outline uppercase tracking-wider">Products</p>
                  {productItems.map((item) => {
                    const idx = idxOf(item);
                    const p = item.data;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        {...optionProps(item, idx)}
                        className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-colors ${active === idx ? 'bg-surface-container' : ''}`}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-low">
                          {p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="font-body text-sm text-on-surface truncate">
                            <Highlight text={p.name} query={trimmed} />
                          </p>
                          {p.category && <p className="font-body text-[11px] text-outline truncate">{p.category}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-body text-sm font-bold text-primary">{p.price}৳</p>
                          {p.oldPrice > p.price && <p className="font-body text-[11px] text-outline line-through">{p.oldPrice}৳</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* See all */}
              {result && trimmed.length >= 2 && (result.products.length > 0 || result.categories.length > 0) && (() => {
                const item = items[items.length - 1];
                const idx = items.length - 1;
                return (
                  <a
                    href={item.href}
                    {...optionProps(item, idx)}
                    className={`flex items-center justify-center gap-1 px-3 py-2.5 mt-1 rounded-xl font-body text-sm font-semibold text-primary ${active === idx ? 'bg-primary/10' : ''}`}
                  >
                    See all results for &ldquo;{trimmed}&rdquo;
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </a>
                );
              })()}

              {noResults && !error && (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-outline/40">search_off</span>
                  <p className="font-body text-sm text-tertiary mt-1">No matches for &ldquo;{trimmed}&rdquo;</p>
                </div>
              )}

              {error && (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-4xl text-outline/40">cloud_off</span>
                  <p className="font-body text-sm text-tertiary mt-1">Search is temporarily unavailable. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
