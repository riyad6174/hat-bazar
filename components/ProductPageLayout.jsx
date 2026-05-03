import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/utils/tracking';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import Head from 'next/head';
import products from '@/data/products.json';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const ProductPageLayout = ({ product, customSections }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const orderBtnsRef = useRef(null);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  useEffect(() => {
    if (product) {
      trackEvent('view_item', {
        ecommerce: {
          currency: 'BDT',
          value: product.price,
          items: [{
            item_id: String(product.id),
            item_name: product.name,
            item_category: product.category || '',
            price: product.price,
            quantity: 1,
          }],
        },
      });
    }
  }, [product]);

  useEffect(() => {
    const el = orderBtnsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!product) return null;

  const relatedProductsData = products.filter(p => product.relatedProducts?.includes(p.slug));

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Head>
        <title>{product.name} | Hat Bazar</title>
        <meta name="description" content={product.description} />
      </Head>
      
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 py-8 md:py-16">
          
          {/* Left Side: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col md:flex-row gap-6 relative"
          >
            <div className="flex-grow aspect-square md:aspect-square overflow-hidden bg-white group relative border border-surface-dim">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop={true}
                onSwiper={setSwiper}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className="w-full h-full"
              >
                {product.gallery?.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img 
                      alt={`${product.name} ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      src={img}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {product.oldPrice && (
                <div className="absolute top-6 right-6 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest z-10 shadow-sm">
                   Save {Math.round((1 - product.price/product.oldPrice) * 100)}%
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 md:flex md:flex-col gap-3 md:gap-4 md:max-h-[500px]">
               {product.gallery?.map((img, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => swiper?.slideToLoop(idx)}
                   className={`aspect-square w-full md:w-20 md:h-24 overflow-hidden border transition-all flex-shrink-0 ${
                     activeIndex === idx ? 'border-primary' : 'border-surface-dim'
                   }`}
                 >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </motion.div>

          {/* Right Side: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="lg:col-span-5 flex flex-col justify-center space-y-6 lg:sticky lg:top-[120px] self-start"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <nav className="flex gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-outline">
                  <span className="text-primary">{product.category}</span>
                </nav>
                <div className="h-4 w-[1px] bg-surface-dim"></div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 material-symbols-outlined text-sm">star</span>
                  <span className="font-body text-[11px] font-bold text-on-surface">{product.rating || '4.9'}</span>
                  <span className="font-body text-[11px] text-outline">({product.reviewCount || '50'}+ reviews)</span>
                </div>
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-on-surface leading-tight font-medium tracking-tight">{product.name}</h1>
              
              <div className="flex items-baseline gap-4">
                <p className="font-sans text-2xl md:text-3xl text-primary font-bold tracking-tight">{product.price}৳</p>
                {product.oldPrice && (
                  <p className="font-sans text-lg text-outline line-through">{product.oldPrice}৳</p>
                )}
              </div>
            </div>

            <p className="font-body font-bengali font-light text-[13px] md:text-[14px] text-tertiary leading-relaxed max-w-lg tracking-wide">
              {product.description}
            </p>

            <div ref={orderBtnsRef} className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-surface-dim rounded-full px-4 py-2.5 gap-6 bg-white">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="material-symbols-outlined text-outline hover:text-on-surface transition-colors text-lg"
                  >
                    remove
                  </button>
                  <span className="font-body font-bold text-base w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="material-symbols-outlined text-outline hover:text-on-surface transition-colors text-lg"
                  >
                    add
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white font-body font-bold py-3.5 rounded-full uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
                >
                  Order Now <span className="material-symbols-outlined text-lg">shopping_bag</span>
                </button>
              </div>
              <button 
                onClick={handleBuyNow}
                className="w-full bg-on-surface text-surface font-body font-bold py-3.5 rounded-full uppercase tracking-widest text-xs hover:opacity-90 transition-all"
              >
                 Order Now
              </button>
            </div>
          </motion.div>
        </div>

        {/* Detailed Description Section */}
        {product.longDescription && (
          <section className="py-24 bg-surface">
            <div className="max-w-[1280px] mx-auto px-6 md:px-16">
              <div className="max-w-3xl space-y-8">
                <h2 className="font-display text-3xl md:text-4xl text-on-surface italic font-light">Product Details</h2>
                <p className="font-body font-bengali text-lg text-tertiary leading-relaxed">
                  {product.longDescription}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Ingredients Section */}
        {product.ingredients && (
          <section className="py-24 bg-surface-container-low/30">
             <div className="max-w-[1280px] mx-auto px-6 md:px-16">
                <div className="space-y-12">
                   <div className="space-y-4">
                      <span className="font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase">The Formulation</span>
                      <h2 className="font-display text-3xl md:text-4xl text-on-surface italic font-light">Key Ingredients</h2>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {product.ingredients.map((ing, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white border border-surface-dim hover:shadow-xl transition-all duration-500">
                           <h4 className="font-bengali font-bold text-xl text-on-surface mb-2">{ing.name}</h4>
                           <p className="font-bengali text-sm text-tertiary leading-relaxed">{ing.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* Benefits Section */}
        {product.benefits && (
          <section className="py-24 bg-surface">
             <div className="max-w-[1280px] mx-auto px-6 md:px-16">
                <div className="text-center space-y-4 mb-16">
                   <span className="font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase">Possible Results</span>
                   <h2 className="font-display text-3xl md:text-4xl text-on-surface italic font-light">Benefits</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {product.benefits.map((benefit, i) => (
                     <div key={i} className="bg-white p-8 rounded-2xl border border-surface-dim text-center space-y-4">
                        <span className="material-symbols-outlined text-primary text-2xl">flare</span>
                        <p className="font-bengali text-base text-on-surface leading-relaxed">{benefit}</p>
                     </div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {customSections}

        {/* Related Products */}
        {relatedProductsData.length > 0 && (
          <section className="py-24 bg-surface-container-low/50">
            <div className="max-w-[1280px] mx-auto px-6 md:px-16">
              <div className="mb-12">
                <h2 className="font-display text-3xl md:text-4xl text-on-surface italic font-light">Related Products</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProductsData.map(p => (
                   <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Mobile CTA */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-surface-dim lg:hidden z-50 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
              <div className="flex flex-col">
                <span className="font-sans text-xl font-bold text-primary">{product.price}৳</span>
              </div>
              <motion.button
                onClick={handleBuyNow}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="bg-primary text-white font-body font-bold py-3.5 px-8 rounded-full uppercase tracking-widest text-xs"
              >
                Order Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPageLayout;
