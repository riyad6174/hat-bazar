import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import products from '@/data/products.json';
import { motion } from 'framer-motion';

export default function ShopPage() {
  const router = useRouter();
  const { category } = router.query;

  // Filter products based on category query param
  const filteredProducts = category 
    ? products.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : products;

  const pageTitle = category 
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Shop All';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24 max-w-[1280px] mx-auto px-6 md:px-16">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-16"
        >
          <h1 className="font-display text-5xl md:text-6xl text-on-surface mb-4">{pageTitle}</h1>
          <p className="font-body text-tertiary max-w-xl">
            {category 
              ? `Explore our curated selection of ${category.toLowerCase()} products, designed for your specific skincare needs.`
              : 'Explore our curated collection of botanical formulations, designed to deliver clinical results with a sensorial experience.'
            }
          </p>
        </motion.header>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="font-body text-tertiary text-lg">No products found in this category.</p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

