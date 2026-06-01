import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import staticProducts from '@/data/products.json';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { motion } from 'framer-motion';

export async function getServerSideProps() {
  try {
    await connectDB();
    const dbProducts = await Product.find({ inStock: true }).sort({ createdAt: -1 }).lean();

    const normalized = dbProducts.map((p) => ({
      id: p._id.toString(),
      name: p.title,
      price: p.price,
      oldPrice: p.originalPrice,
      image: p.thumbnail || '',
      category: p.category || '',
      slug: p.slug,
      description: p.shortDescription || '',
      _isDB: true,
    }));

    return { props: { dbProducts: normalized } };
  } catch {
    return { props: { dbProducts: [] } };
  }
}

export default function ShopPage({ dbProducts = [] }) {
  const router = useRouter();
  const { category } = router.query;

  const allProducts = [...dbProducts, ...staticProducts];

  const filteredProducts = category
    ? allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : allProducts;

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
              ? `Explore our curated selection of ${category.toLowerCase()} products.`
              : 'Explore our curated collection of botanical formulations, designed to deliver clinical results with a sensorial experience.'
            }
          </p>
        </motion.header>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="font-body text-tertiary text-lg">No products found in this category.</p>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
