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

const ManeeGlutaCollagenPink = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const videoRef = useRef(null);
  const orderBtnsRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, [product]);

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
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        currency: 'BDT',
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

  const relatedProductsData = products.filter((p) =>
    product.relatedProducts?.includes(p.slug),
  );

  return (
    <div className='min-h-screen flex flex-col bg-surface'>
      <Head>
        <title>{product.name} | Hat Bazar</title>
        <meta name='description' content={product.description} />
      </Head>

      <Navbar />

      <main className='flex-grow'>
        {/* Hero Section - Refined Luxury Aesthetic */}
        <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 py-8 md:py-16'>
          {/* Left Side: Image Gallery */}
          <div className='lg:col-span-7 flex flex-col md:flex-row gap-6 relative'>
            {/* Main Image */}
            <div className='flex-grow aspect-square md:aspect-square overflow-hidden bg-white group relative border border-surface-dim'>
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect='fade'
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop={true}
                onSwiper={setSwiper}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className='w-full h-full'
              >
                {product.gallery?.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      alt={`${product.name} ${idx + 1}`}
                      className='w-full h-full object-cover'
                      src={img}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {product.oldPrice && (
                <div className='absolute top-6 right-6 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest z-10 shadow-sm'>
                  Save{' '}
                  {Math.round((1 - product.price / product.oldPrice) * 100)}%
                </div>
              )}
            </div>

            {/* Thumbnails: Desktop Vertical, Mobile 4-col Grid below */}
            <div className='grid grid-cols-4 md:flex md:flex-col gap-3 md:gap-4 md:max-h-[500px]'>
              {product.gallery?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => swiper?.slideToLoop(idx)}
                  className={`aspect-square w-full md:w-20 md:h-24 overflow-hidden border transition-all flex-shrink-0 ${
                    activeIndex === idx
                      ? 'border-primary'
                      : 'border-surface-dim'
                  }`}
                >
                  <img
                    src={img}
                    alt=''
                    className='w-full h-full object-cover'
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Product Info */}
          <div className='lg:col-span-5 flex flex-col justify-center space-y-6 lg:sticky lg:top-[120px] self-start'>
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <nav className='flex gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-outline'>
                  <span className='text-primary'>{product.category}</span>
                </nav>
                <div className='h-4 w-[1px] bg-surface-dim'></div>
                <div className='flex items-center gap-1'>
                  <span className='text-amber-400 material-symbols-outlined text-sm'>
                    star
                  </span>
                  <span className='font-body text-[11px] font-bold text-on-surface'>
                    {product.rating || '4.9'}
                  </span>
                  <span className='font-body text-[11px] text-outline'>
                    ({product.reviewCount || '500'}+ reviews)
                  </span>
                </div>
              </div>

              <h1 className='font-display text-3xl md:text-4xl text-on-surface leading-tight font-medium tracking-tight'>
                {product.name}
              </h1>

              <div className='flex items-baseline gap-4'>
                <p className='font-sans text-2xl md:text-3xl text-primary font-bold tracking-tight'>
                  {product.price}৳
                </p>
                {product.oldPrice && (
                  <p className='font-sans text-lg text-outline line-through'>
                    {product.oldPrice}৳
                  </p>
                )}
              </div>
            </div>

            <p className='font-body font-bengali font-light text-[13px] md:text-[14px] text-tertiary leading-relaxed max-w-lg tracking-wide'>
              {product.description}
            </p>

            {/* <div className="flex flex-wrap gap-2">
               {['✨ গ্লো বুস্টিং', '✨ কোলাজেন সাপোর্ট', '✨ স্কিন হাইড্রেশন', '✨ বিউটি নিউট্রিশন'].map(badge => (
                 <span key={badge} className="bg-surface-container/50 px-4 py-2 rounded-full font-bengali text-[12px] font-bold text-primary border border-surface-dim">
                   {badge}
                 </span>
               ))}
            </div> */}

            <div ref={orderBtnsRef} className='flex flex-col gap-3 pt-2'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center border border-surface-dim rounded-full px-4 py-2.5 gap-6 bg-white'>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className='material-symbols-outlined text-outline hover:text-on-surface transition-colors text-lg'
                  >
                    remove
                  </button>
                  <span className='font-body font-bold text-base w-4 text-center'>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className='material-symbols-outlined text-outline hover:text-on-surface transition-colors text-lg'
                  >
                    add
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className='flex-1 bg-primary text-white font-body font-bold py-3.5 rounded-full uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3'
                >
                  Order Now{' '}
                  <span className='material-symbols-outlined text-lg'>
                    shopping_bag
                  </span>
                </button>
              </div>
              <button
                onClick={handleBuyNow}
                className='w-full bg-on-surface text-surface font-body font-bold py-3.5 rounded-full uppercase tracking-widest text-xs hover:opacity-90 transition-all'
              >
                Order Now
              </button>

              <div className='pt-8 space-y-4'>
                <div className='bg-primary/5 border border-primary/20 rounded-[2rem] p-6 space-y-4 relative overflow-hidden'>
                  <div className='absolute top-0 right-0 p-4 opacity-10'>
                    <span className='material-symbols-outlined text-6xl text-primary'>
                      verified
                    </span>
                  </div>
                  <div className='flex items-center gap-3 relative z-10'>
                    <span className='material-symbols-outlined text-primary text-xl'>
                      security
                    </span>
                    <p className='font-bengali text-[15px] font-bold text-on-surface'>
                      প্রোডাক্টটির আসল নকল চিনতে ভিডিও টি দেখুন
                    </p>
                  </div>
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className='w-full flex items-center justify-center gap-3 bg-white border border-primary/30 text-primary py-4 rounded-full hover:bg-primary hover:text-white transition-all group relative z-10'
                  >
                    <span className='material-symbols-outlined group-hover:scale-110 transition-transform'>
                      play_circle
                    </span>
                    <span className='font-body font-bold text-xs uppercase tracking-widest'>
                      ভিডিও দেখুন (Watch Video)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Science & Experience */}
        <section className='py-24 md:py-32 bg-surface'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            <div className='space-y-8 order-2 lg:order-1'>
              <p className='font-body font-bengali text-lg md:text-xl text-tertiary leading-relaxed'>
                {product.longDescription}
              </p>
            </div>
            <div className='order-1 lg:order-2 aspect-[4/5] md:h-[600px] rounded overflow-hidden bg-surface-dim border border-surface-dim group relative'>
              {product.video ? (
                <video
                  ref={videoRef}
                  src={product.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-surface-container-high'>
                  <div className='text-center space-y-4'>
                    <span className='material-symbols-outlined text-7xl text-outline group-hover:text-primary transition-colors'>
                      play_circle
                    </span>
                    <p className='font-body text-xs font-bold uppercase tracking-widest text-outline'>
                      Experience the Glow
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why You'll Love It Section */}
        <section className='bg-surface-container-low py-24 md:py-32'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='text-center space-y-6 mb-20'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Why You'll Love It
              </span>
              <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                কেন Manee Gluta Collagen Pink ব্যবহার করবেন?
              </h2>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[
                'ত্বকের উজ্জ্বলতা বৃদ্ধি করতে সহায়ক',
                'স্কিনকে হাইড্রেটেড ও ফ্রেশ রাখতে সাহায্য করে',
                'দৈনিক বিউটি কেয়ার রুটিনের জন্য পারফেক্ট',
                'ত্বকের ন্যাচারাল গ্লো ধরে রাখতে সহায়তা করে',
              ].map((feature, i) => (
                <div
                  key={i}
                  className='bg-white p-8 rounded-[2rem] border border-surface-dim hover:border-primary transition-all duration-500 group text-center space-y-6'
                >
                  <div className='w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors'>
                    <span className='material-symbols-outlined text-primary text-3xl'>
                      auto_awesome
                    </span>
                  </div>
                  <p className='font-bengali text-lg text-tertiary leading-relaxed'>
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section 1 */}
        <section className='py-12 bg-white border-y border-surface-dim'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className='space-y-2'>
              <h3 className='font-display text-2xl md:text-3xl text-on-surface italic'>
                Ready for your glow transformation?
              </h3>
              <p className='font-bengali text-tertiary'>
                আপনার ত্বকের যত্নে আজই অর্ডার করুন।
              </p>
            </div>
            <button
              onClick={handleBuyNow}
              className='bg-primary text-white px-12 py-4 rounded-full font-body font-bold uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-transform'
            >
              এখনই অর্ডার করুন
            </button>
          </div>
        </section>

        {/* Ingredients Section */}
        {product.ingredients && (
          <section className='py-24 md:py-32 overflow-hidden'>
            <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
              <div className='space-y-12'>
                <div className='space-y-6'>
                  <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                    The Formulation
                  </span>
                  <h2 className='font-display text-3xl md:text-5xl text-on-surface italic font-light'>
                    মূল উপাদানসমূহ
                  </h2>
                </div>
                <div className='grid grid-cols-1 gap-6'>
                  {product.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className='p-8 rounded-3xl bg-surface-container/40 border border-surface-dim flex flex-col md:flex-row gap-6 hover:bg-white hover:shadow-xl transition-all duration-500'
                    >
                      <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-primary font-body font-bold'>
                          {i + 1}
                        </span>
                      </div>
                      <div className='space-y-2'>
                        <h4 className='font-bengali font-bold text-xl text-on-surface'>
                          {ing.name}
                        </h4>
                        <p className='font-bengali text-sm text-tertiary leading-relaxed'>
                          {ing.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='relative'>
                <div className='aspect-[3/4] rounded-[2rem] overflow-hidden border border-surface-dim'>
                  <img
                    src='/products/fruits.png'
                    className='w-full h-full object-cover'
                    alt='Ingredients'
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className='bg-surface py-24 md:py-32'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='text-center space-y-6 mb-20'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Possible Results
              </span>
              <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                নিয়মিত ব্যবহারে সম্ভাব্য উপকারিতা
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {product.benefits?.map((benefit, i) => (
                <div
                  key={i}
                  className='flex flex-col items-center text-center gap-4 p-8 rounded-[2rem] bg-white border border-surface-dim hover:border-primary transition-all group'
                >
                  <div className='w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors'>
                    <span className='material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform'>
                      flare
                    </span>
                  </div>
                  <p className='font-bengali text-base text-on-surface leading-relaxed'>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section 2 */}
        <section className='py-16 bg-surface-container-high/20'>
          <div className='max-w-4xl mx-auto px-6 text-center space-y-8'>
            <h2 className='font-display text-3xl md:text-4xl text-on-surface italic'>
              Experience the Manee Difference
            </h2>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <button
                onClick={handleBuyNow}
                className='w-full sm:w-auto bg-primary text-white px-16 py-5 rounded-full font-body font-bold uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-transform'
              >
                অর্ডার করতে ক্লিক করুন
              </button>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className='py-24 md:py-32 bg-surface-container-low/30'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center'>
            <div className='aspect-square rounded-[2rem] overflow-hidden border border-surface-dim'>
              <img
                src='https://images.pexels.com/photos/3762759/pexels-photo-3762759.jpeg'
                className='w-full h-full object-cover'
                alt='Usage'
              />
            </div>
            <div className='space-y-12'>
              <div className='space-y-6'>
                <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                  Daily Routine
                </span>
                <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                  ব্যবহারের নিয়ম
                </h2>
                <p className='font-bengali text-tertiary'>
                  প্রতিদিন নির্ধারিত পরিমাণ অনুযায়ী গ্রহণ করুন অথবা বিশেষজ্ঞের
                  পরামর্শ অনুসরণ করুন।
                </p>
              </div>
              <div className='space-y-10 relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-[1px] before:bg-primary/20'>
                {[
                  'প্রতিদিন নির্দিষ্ট সময়ে গ্রহণ করুন',
                  'পর্যাপ্ত পানি পান করুন',
                  'নিয়মিত ব্যবহার বজায় রাখুন',
                ].map((step, i) => (
                  <div
                    key={i}
                    className='flex gap-10 items-start relative z-10'
                  >
                    <div className='w-14 h-14 rounded-full bg-white border-2 border-primary/10 flex items-center justify-center flex-shrink-0 font-body font-bold text-primary shadow-lg group-hover:border-primary transition-colors'>
                      {i + 1}
                    </div>
                    <div className='pt-3'>
                      <h4 className='font-bengali text-xl text-on-surface font-medium'>
                        {step}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className='py-24 md:py-32 bg-surface'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='text-center space-y-4 mb-20'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Love Letters
              </span>
              <h2 className='font-display text-4xl md:text-5xl text-on-surface italic font-light'>
                কাস্টমার রিভিউ
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {[
                {
                  name: 'Nusrat J.',
                  text: 'ব্যবহারের পর স্কিন অনেক বেশি ফ্রেশ ও গ্লোয়িং মনে হয়েছে!',
                  rating: 5,
                },
                {
                  name: 'Sadia T.',
                  text: 'প্যাকেজিং আর প্রোডাক্ট দুটোই খুব প্রিমিয়াম লেগেছে।',
                  rating: 5,
                },
                {
                  name: 'Mim A.',
                  text: 'প্রতিদিনের স্কিন কেয়ার রুটিনে সহজে ব্যবহার করা যায়।',
                  rating: 5,
                },
              ].map((rev, i) => (
                <div
                  key={i}
                  className='p-10 rounded-[2rem] bg-white border border-surface-dim space-y-8 hover:border-primary transition-all duration-500'
                >
                  <div className='flex gap-1.5 text-amber-400'>
                    {[...Array(rev.rating)].map((_, j) => (
                      <span
                        key={j}
                        className='material-symbols-outlined text-[16px]'
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className='font-bengali text-xl text-on-surface leading-relaxed font-light italic'>
                    “{rev.text}”
                  </p>
                  <div className='flex items-center gap-5 pt-8 border-t border-surface-dim/50'>
                    <div className='w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-body font-bold text-primary text-sm shadow-inner'>
                      {rev.name[0]}
                    </div>
                    <span className='font-body text-sm font-bold text-outline tracking-wider uppercase'>
                      {rev.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className='py-24 md:py-32 bg-white'>
          <div className='max-w-4xl mx-auto px-6'>
            <div className='text-center space-y-4 mb-20'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Common Questions
              </span>
              <h2 className='font-display text-4xl md:text-5xl text-on-surface italic font-light'>
                প্রায় জিজ্ঞাসিত প্রশ্ন
              </h2>
            </div>
            <div className='space-y-6'>
              {[
                {
                  q: 'এটি কিভাবে ব্যবহার করতে হয়?',
                  a: 'প্রতিদিন নির্ধারিত পরিমাণ অনুযায়ী গ্রহণ করতে হবে।',
                },
                {
                  q: 'কতদিন ব্যবহার করলে ফলাফল বোঝা যেতে পারে?',
                  a: 'নিয়মিত ব্যবহারের মাধ্যমে ধীরে ধীরে পরিবর্তন লক্ষ্য করা যেতে পারে।',
                },
                {
                  q: 'এটি কি দৈনিক রুটিনে ব্যবহার করা যায়?',
                  a: 'হ্যাঁ, এটি দৈনিক বিউটি রুটিনে যুক্ত করা যেতে পারে।',
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className='group p-8 rounded-[2rem] bg-surface-container/20 border border-surface-dim open:bg-white transition-all duration-500'
                >
                  <summary className='font-bengali text-xl font-medium text-on-surface cursor-pointer list-none flex justify-between items-center group-hover:text-primary transition-colors'>
                    {faq.q}
                    <div className='w-10 h-10 rounded-full bg-white border border-surface-dim flex items-center justify-center group-open:rotate-180 transition-transform'>
                      <span className='material-symbols-outlined text-outline'>
                        expand_more
                      </span>
                    </div>
                  </summary>
                  <p className='font-bengali text-lg text-tertiary mt-8 leading-relaxed border-t border-surface-dim/50 pt-8'>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className='py-20 border-y border-surface-dim bg-surface/30 backdrop-blur-sm'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-12'>
              {[
                { icon: 'verified', text: 'অরিজিনাল প্রোডাক্ট' },
                { icon: 'inventory_2', text: 'নিরাপদ প্যাকেজিং' },
                { icon: 'local_shipping', text: 'দ্রুত ডেলিভারি' },
                { icon: 'support_agent', text: 'কাস্টমার সাপোর্ট' },
              ].map((item, i) => (
                <div
                  key={i}
                  className='flex flex-col items-center text-center gap-5 group'
                >
                  <div className='w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm border border-surface-dim group-hover:scale-110 group-hover:border-primary transition-all duration-500'>
                    <span className='material-symbols-outlined text-primary text-3xl'>
                      {item.icon}
                    </span>
                  </div>
                  <span className='font-bengali text-[11px] font-bold text-outline uppercase tracking-[0.2em]'>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProductsData.length > 0 && (
          <section className='py-24 md:py-32 bg-surface-container-low/50'>
            <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
              <div className='flex justify-between items-end mb-16'>
                <div className='space-y-2'>
                  <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                    Complete the Set
                  </span>
                  <h2 className='font-display text-4xl md:text-5xl text-on-surface italic font-light'>
                    আপনার জন্য আরও পছন্দ হতে পারে
                  </h2>
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                {relatedProductsData.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Sticky Mobile Bottom CTA */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-surface-dim lg:hidden z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]'
          >
            <div className='flex items-center justify-between gap-4 max-w-md mx-auto'>
              <div className='flex flex-col'>
                {product.oldPrice && (
                  <span className='font-sans text-xs text-outline line-through'>
                    {product.oldPrice}৳
                  </span>
                )}
                <span className='font-sans text-xl font-bold text-primary'>
                  {product.price}৳
                </span>
              </div>
              <motion.button
                onClick={handleBuyNow}
                whileTap={{ scale: 0.95 }}
                className='bg-primary text-white font-body font-bold py-3.5 px-8 rounded-full uppercase tracking-widest text-xs shadow-lg'
              >
                Order Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc='/assets/fake.mov'
      />
    </div>
  );
};

const VideoModal = ({ isOpen, onClose, videoSrc }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8'>
      <div
        className='absolute inset-0 bg-black/90 backdrop-blur-md'
        onClick={onClose}
      ></div>
      <div className='relative w-full max-w-[450px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/10'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-xl transition-all border border-white/20'
        >
          <span className='material-symbols-outlined text-3xl'>close</span>
        </button>
        <video
          src={videoSrc}
          autoPlay
          controls
          className='w-full h-full object-cover'
        />
      </div>
    </div>
  );
};

export default ManeeGlutaCollagenPink;
