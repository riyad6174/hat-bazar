import React from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ContactSection from '@/components/ContactSection';
import Link from 'next/link';
import products from '@/data/products.json';
import journalData from '@/data/journal.json';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
};

// Get first 4 products as best sellers
const bestSellers = products.slice(0, 4);

export default function HomePage() {
  const featuredPost = journalData[0];
  const otherPosts = journalData.slice(1, 3);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />

        {/* Featured Categories */}
        <motion.section 
          {...fadeInUp}
          className="py-24 max-w-[1280px] mx-auto px-6 md:px-16"
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-on-surface">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8 text-center">
            {[
              { name: 'Moisturizer', img: 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=300' },
              { name: 'Toner', img: 'https://images.pexels.com/photos/8128069/pexels-photo-8128069.jpeg?auto=compress&cs=tinysrgb&w=300' },
              { name: 'Serum', img: 'https://images.pexels.com/photos/12024065/pexels-photo-12024065.jpeg?auto=compress&cs=tinysrgb&w=300' },
              { name: 'Haircare', img: 'https://images.pexels.com/photos/8467957/pexels-photo-8467957.jpeg?auto=compress&cs=tinysrgb&w=300' },
              { name: 'Sunscreen', img: 'https://images.pexels.com/photos/22821334/pexels-photo-22821334.jpeg?auto=compress&cs=tinysrgb&w=300' },
              { name: 'Facewash', img: 'https://images.pexels.com/photos/19049367/pexels-photo-19049367.png?auto=compress&cs=tinysrgb&w=300' },
              { name: 'Supplements', img: 'https://images.pexels.com/photos/31406911/pexels-photo-31406911.jpeg?auto=compress&cs=tinysrgb&w=300' }
            ].map((cat) => (
              <Link href={`/shop?category=${cat.name.toLowerCase()}`} key={cat.name} className="group cursor-pointer">
                <div className="aspect-square rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary-container transition-all p-1 bg-surface-container">
                  <img alt={cat.name} className="w-full h-full object-cover rounded-full" src={cat.img} />
                </div>
                <h3 className="font-display text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Offer Banner */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mx-6 md:mx-16 mb-24"
        >
          <div className="rounded-[2rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[400px] md:min-h-[500px]">
            {/* Background Video */}
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src="/assets/care.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 z-10"></div>

            <div className="relative z-20 space-y-6">
              <h2 className="font-display text-4xl md:text-7xl text-white mb-6 leading-tight">Glow Week Sale</h2>
              <p className="font-body text-lg md:text-xl text-white/90 mb-10 max-w-xl mx-auto leading-relaxed">
                Enjoy 25% off our award-winning Botanical Skincare set. Limited time offer for our community members.
              </p>
              <Link href="/shop" className="inline-block bg-white text-on-surface px-12 py-4 rounded-full font-body text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-all uppercase shadow-xl">
                Shop the Sale
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Best Sellers */}
        <motion.section 
          {...fadeInUp}
          className="py-24 bg-surface-container-low"
        >
          <div className="max-w-[1280px] mx-auto px-6 md:px-16">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">Top Rated</span>
                <h2 className="font-display text-4xl md:text-5xl text-on-surface">Best Sellers</h2>
              </div>
              <Link href="/shop" className="font-body text-xs font-bold text-on-surface border-b border-on-surface pb-1 hover:text-primary hover:border-primary transition-all uppercase tracking-widest">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Journal Teaser */}
        <motion.section 
          {...fadeInUp}
          className="py-24 max-w-[1280px] mx-auto px-6 md:px-16"
        >
          <div className="text-center mb-16">
            <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">The Journal</span>
            <h2 className="font-display text-4xl md:text-5xl text-on-surface">Living in the Glow</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-7 group cursor-pointer">
              <Link href={`/journal/${featuredPost.slug}`}>
                <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 bg-surface-dim">
                  <img alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src={featuredPost.image} />
                </div>
                <div>
                  <p className="font-body text-[10px] font-bold text-outline tracking-[0.2em] uppercase mb-3">Featured • {featuredPost.author}</p>
                  <h3 className="font-display text-3xl md:text-4xl group-hover:text-primary transition-colors mb-4">{featuredPost.title}</h3>
                  <p className="font-body text-tertiary leading-relaxed text-lg">{featuredPost.excerpt}</p>
                </div>
              </Link>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-10">
              {otherPosts.map(post => (
                <div key={post.slug} className="group cursor-pointer">
                  <Link href={`/journal/${post.slug}`} className="flex flex-col sm:flex-row lg:flex-col gap-6">
                    <div className="aspect-[16/9] sm:w-1/2 lg:w-full rounded-2xl overflow-hidden bg-surface-dim shrink-0">
                      <img alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src={post.image} />
                    </div>
                    <div>
                      <p className="font-body text-[10px] font-bold text-outline tracking-[0.2em] uppercase mb-2">{post.author}</p>
                      <h4 className="font-display text-2xl group-hover:text-primary transition-colors leading-snug">{post.title}</h4>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
