import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/utils/tracking';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import Head from 'next/head';
import products from '@/data/products.json';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const MulanGluta60 = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
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
          items: [
            {
              item_id: String(product.id),
              item_name: product.name,
              item_category: product.category || '',
              price: product.price,
              quantity: 1,
            },
          ],
        },
      });
    }
  }, [product]);

  useEffect(() => {
    const el = orderBtnsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
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
        {/* Hero Section */}
        <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 py-8 md:py-16'>
          {/* Left: Image Gallery */}
          <div className='lg:col-span-7 flex flex-col md:flex-row gap-6 relative'>
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
                  <SwiperSlide key={idx} className='relative'>
                    <Image
                      fill
                      alt={`${product.name} ${idx + 1}`}
                      className='object-cover'
                      src={img}
                      sizes='(max-width: 768px) 100vw, 55vw'
                      priority={idx === 0}
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

            <div className='grid grid-cols-4 md:flex md:flex-col gap-3 md:gap-4 md:max-h-[500px]'>
              {product.gallery?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => swiper?.slideToLoop(idx)}
                  className={`aspect-square w-full md:w-20 md:h-24 overflow-hidden border transition-all flex-shrink-0 relative ${
                    activeIndex === idx
                      ? 'border-primary'
                      : 'border-surface-dim'
                  }`}
                >
                  <Image
                    fill
                    src={img}
                    alt=''
                    className='object-cover'
                    sizes='96px'
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
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

              {/* Below pricing text */}
              <p className='font-bengali text-[13px] text-tertiary leading-relaxed border-l-2 border-primary/40 pl-3'>
                প্রোডাক্ট টি ১০০% অরিজিনাল। খুব ভালো রেজাল্ট পেতে নিয়মিত গ্রহন
                করুন। খাবার নিয়ম জানতে আমাদের সরাসরি ফোন করতে পারেন।
              </p>
            </div>

            <p className='font-body font-bengali font-light text-[13px] md:text-[14px] text-tertiary leading-relaxed max-w-lg tracking-wide'>
              {product.description}
            </p>

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

              {/* Auth Video CTA */}
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

        {/* Authenticity Guide */}
        <section className='py-16 md:py-24 bg-surface-container-low'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='text-center space-y-4 mb-12'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Verification Guide
              </span>
              <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                অরজিনাল মুলান চেনার উপায়
              </h2>
            </div>
            <div className='max-w-3xl mx-auto space-y-6'>
              {[
                {
                  step: '১',
                  title: 'ওয়েবসাইটে প্রবেশ করুন',
                  desc: 'মুলানের হলোগ্রামে দেওয়া www.ilovekb.com/verify এই ওয়েবসাইটে প্রবেশ করুন।',
                },
                {
                  step: '২',
                  title: 'কোড নম্বর লিখুন',
                  desc: 'ওয়েবসাইটের ভিতরে "please enter the product code" লেখা বক্সে প্রোডাক্টের হলোগ্রামের ১৬ ডিজিটের কোড নম্বরটা লিখুন। তারপর Start verification এ ক্লিক করুন।',
                },
                {
                  step: '৩',
                  title: 'ফলাফল দেখুন',
                  desc: 'প্রোডাক্ট অরজিনাল হলে THANK YOU লেখা আসবে এবং নিচে লেখা থাকবে "The product code you have entered is verified & valid"। আর প্রোডাক্ট নকল হলে Sorry লেখা আসবে।',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className='flex gap-6 items-start p-8 rounded-[2rem] bg-white border border-surface-dim hover:border-primary transition-all duration-500'
                >
                  <div className='w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-body font-bold text-primary text-xl'>
                    {item.step}
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-bengali font-bold text-lg text-on-surface'>
                      {item.title}
                    </h4>
                    <p className='font-bengali text-sm text-tertiary leading-relaxed'>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Product */}
        <section className='py-24 md:py-32 bg-surface'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start'>
            <div className='space-y-8'>
              <div className='space-y-4'>
                <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                  About the Product
                </span>
                <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                  Mulan Gluta 60piece capsule
                </h2>
              </div>
              <p className='font-body text-base text-tertiary leading-relaxed'>
                Naturally formulated, Mulan Gluta 60-capsule pieces encourage
                glowing skin, detoxification, and youthful radiance. Packed with
                glutathione, this powerful skin whitening supplement helps fight
                signs of aging and attain brighter, clearer skin from within—a
                perfect option for beauty enthusiasts seeking a gentle yet
                effective glow enhancer.
              </p>
              <p className='font-bengali text-[15px] text-tertiary leading-relaxed'>
                Mulan Gluta 60pcs capsule হলো একটি beauty/food supplement যেখানে
                সাধারণত L-Glutathione, Collagen, Pearl Powder এবং NAC (N-Acetyl
                Cysteine) থাকে। এটি মূলত skin brightening, antioxidant support
                এবং skin glow-এর জন্য ব্যবহার করা হয়।
              </p>
            </div>

            {/* Product Specs Table */}
            <div className='rounded-[2rem] border border-surface-dim overflow-hidden bg-white'>
              <div className='bg-primary/5 px-8 py-5 border-b border-surface-dim'>
                <h3 className='font-bengali font-bold text-lg text-on-surface'>
                  পণ্যের তথ্য
                </h3>
              </div>
              <div className='divide-y divide-surface-dim'>
                {[
                  { label: 'Title', value: 'Mulan Gluta 60piece capsule' },
                  { label: 'Brand', value: 'Mulan' },
                  { label: 'Country of Origin', value: 'Japan' },
                  { label: 'Type', value: 'Glutathione Skin Supplement' },
                  { label: 'Form', value: 'Capsules' },
                  {
                    label: 'Primary Function',
                    value: 'Skin Whitening, Anti-Aging, Detox',
                  },
                  { label: 'Target Audience', value: 'Men & Women' },
                  { label: 'Quantity', value: '60 Capsules' },
                ].map((row, i) => (
                  <div key={i} className='flex px-8 py-4 gap-4'>
                    <span className='font-body text-[12px] font-bold text-outline uppercase tracking-wider w-40 flex-shrink-0'>
                      {row.label}
                    </span>
                    <span className='font-body text-[13px] text-on-surface'>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className='bg-surface-container-low py-24 md:py-32'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='text-center space-y-4 mb-16'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Mechanism
              </span>
              <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                এটা কীভাবে কাজ করে?
              </h2>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[
                {
                  icon: 'bubble_chart',
                  title: 'Glutathione',
                  desc: 'oxidative stress কমায় এবং melanin production কিছুটা কমাতে পারে, তাই skin tone উজ্জ্বল দেখায়।',
                },
                {
                  icon: 'science',
                  title: 'NAC',
                  desc: 'শরীরে glutathione level বাড়াতে সাহায্য করে।',
                },
                {
                  icon: 'water_drop',
                  title: 'Collagen',
                  desc: 'Skin elasticity ও hydration support করে।',
                },
                {
                  icon: 'auto_awesome',
                  title: 'Pearl Powder',
                  desc: 'Minerals ও antioxidants দিয়ে skin health support করে।',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className='bg-white p-8 rounded-[2rem] border border-surface-dim hover:border-primary transition-all duration-500 group text-center space-y-5'
                >
                  <div className='w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors'>
                    <span className='material-symbols-outlined text-primary text-3xl'>
                      {item.icon}
                    </span>
                  </div>
                  <h4 className='font-body font-bold text-sm text-on-surface uppercase tracking-wider'>
                    {item.title}
                  </h4>
                  <p className='font-bengali text-sm text-tertiary leading-relaxed'>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA 1 */}
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

        {/* Ingredients */}
        {product.ingredients && (
          <section className='py-24 md:py-32 overflow-hidden'>
            <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
              <div className='text-center space-y-4 mb-16'>
                <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                  The Formulation
                </span>
                <h2 className='font-display text-3xl md:text-5xl text-on-surface italic font-light'>
                  মূল উপাদানসমূহ
                </h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
                {product.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className='p-8 rounded-3xl bg-surface-container/40 border border-surface-dim flex gap-6 hover:bg-white hover:shadow-xl transition-all duration-500'
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
          </section>
        )}

        {/* Benefits */}
        <section className='bg-surface py-24 md:py-32'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16'>
            <div className='text-center space-y-6 mb-20'>
              <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                Possible Results
              </span>
              <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                সম্ভাব্য উপকারিতা
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

        {/* How to Use + When to See Results */}
        <section className='py-24 md:py-32 bg-surface-container-low/30'>
          <div className='max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16'>
            {/* How to Use */}
            <div className='space-y-10'>
              <div className='space-y-4'>
                <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                  Daily Routine
                </span>
                <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                  কীভাবে খেতে হয়?
                </h2>
              </div>
              <div className='space-y-8 relative before:absolute before:left-7 before:top-4 before:bottom-4 before:w-[1px] before:bg-primary/20'>
                {[
                  'সাধারণত ১–২ capsule প্রতিদিন গ্রহণ করুন',
                  'খাবারের পরে অথবা রাতে ঘুমানোর আগে খান',
                  'Glutathione-এর সাথে Vitamin C নেওয়া যেতে পারে — absorption support করে',
                  'অতিরিক্ত dose এড়িয়ে চলুন',
                ].map((step, i) => (
                  <div key={i} className='flex gap-8 items-start relative z-10'>
                    <div className='w-14 h-14 rounded-full bg-white border-2 border-primary/10 flex items-center justify-center flex-shrink-0 font-body font-bold text-primary shadow-lg'>
                      {i + 1}
                    </div>
                    <div className='pt-3'>
                      <p className='font-bengali text-lg text-on-surface leading-relaxed'>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* When to See Results */}
            <div className='space-y-10'>
              <div className='space-y-4'>
                <span className='font-body text-[10px] font-bold text-primary tracking-[0.3em] uppercase'>
                  Timeline
                </span>
                <h2 className='font-display text-3xl md:text-4xl text-on-surface italic font-light'>
                  কতদিনে result দেখা যাবে?
                </h2>
              </div>
              <div className='space-y-6'>
                <div className='p-8 rounded-[2rem] bg-white border border-surface-dim space-y-4'>
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-primary'>
                      schedule
                    </span>
                    <h4 className='font-bengali font-bold text-lg text-on-surface'>
                      ৪–৮ সপ্তাহ
                    </h4>
                  </div>
                  <p className='font-bengali text-sm text-tertiary leading-relaxed'>
                    সাধারণত ৪–৮ সপ্তাহের আগে noticeable change নাও দেখা যেতে
                    পারে। ব্যক্তিভেদে ফলাফল আলাদা হয়।
                  </p>
                </div>
                <div className='p-8 rounded-[2rem] bg-white border border-surface-dim space-y-4'>
                  <div className='flex items-center gap-3'>
                    <span className='material-symbols-outlined text-primary'>
                      info
                    </span>
                    <h4 className='font-bengali font-bold text-lg text-on-surface'>
                      ফলাফল নির্ভর করে
                    </h4>
                  </div>
                  <ul className='space-y-2'>
                    {[
                      'Lifestyle',
                      'Sun exposure',
                      'Skincare routine',
                      'Genetics',
                    ].map((f, i) => (
                      <li
                        key={i}
                        className='flex items-center gap-3 font-bengali text-sm text-tertiary'
                      >
                        <span className='w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0'></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Warnings */}
        <section className='py-16 bg-amber-50 border-y border-amber-100'>
          <div className='max-w-4xl mx-auto px-6 md:px-16'>
            <div className='flex items-center gap-4 mb-10'>
              <span className='material-symbols-outlined text-amber-500 text-3xl'>
                warning
              </span>
              <h2 className='font-bengali font-bold text-2xl text-on-surface'>
                Important সতর্কতা
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {[
                'Pregnant বা breastfeeding হলে ডাক্তারের পরামর্শ ছাড়া খাবেন না',
                'Kidney/Liver সমস্যা থাকলে আগে doctor-এর সাথে কথা বলুন',
                'Excessive বা unknown-dose glutathione supplement নিয়মিত খাওয়া নিরাপদ নাও হতে পারে',
                'অনেক online beauty supplement-এ exact ingredient amount clear থাকে না — তাই trusted seller থেকে কেনা গুরুত্বপূর্ণ',
              ].map((warn, i) => (
                <div
                  key={i}
                  className='flex gap-4 items-start p-5 rounded-2xl bg-white border border-amber-100'
                >
                  <span className='material-symbols-outlined text-amber-500 text-lg flex-shrink-0 mt-0.5'>
                    error_outline
                  </span>
                  <p className='font-bengali text-sm text-on-surface leading-relaxed'>
                    {warn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA 2 */}
        <section className='py-16 bg-surface-container-high/20'>
          <div className='max-w-4xl mx-auto px-6 text-center space-y-8'>
            <h2 className='font-display text-3xl md:text-4xl text-on-surface italic'>
              Experience the Mulan Difference
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

        {/* Reviews */}
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
                  name: 'Fatema B.',
                  text: 'নিয়মিত খাওয়ার পর স্কিন অনেক গ্লোয়িং লাগছে। অরিজিনাল প্রোডাক্ট পেয়ে খুব খুশি।',
                  rating: 5,
                },
                {
                  name: 'Riya H.',
                  text: 'প্যাকেজিং খুব সুন্দর এবং প্রোডাক্ট ভেরিফাই করতে পেরেছি। বিশ্বাসযোগ্য।',
                  rating: 5,
                },
                {
                  name: 'Mou K.',
                  text: 'দুই মাস ব্যবহারে skin brightness বেড়েছে। ইনশাআল্লাহ আরও নেব।',
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
                    "{rev.text}"
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

        {/* FAQ */}
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
                  q: 'Mulan Gluta কীভাবে খেতে হয়?',
                  a: 'সাধারণত ১–২ capsule প্রতিদিন খাবারের পরে অথবা রাতে ঘুমানোর আগে খেতে বলা হয়। বিস্তারিত জানতে সরাসরি ফোন করুন।',
                },
                {
                  q: 'কতদিনে ফলাফল দেখা যাবে?',
                  a: 'সাধারণত ৪–৮ সপ্তাহ নিয়মিত সেবনের পর পরিবর্তন লক্ষ্য করা যেতে পারে। ব্যক্তিভেদে ফলাফল আলাদা হয়।',
                },
                {
                  q: 'প্রোডাক্টটি কি অরিজিনাল?',
                  a: 'হ্যাঁ, আমাদের সকল প্রোডাক্ট ১০০% অরিজিনাল। হলোগ্রামের ১৬ ডিজিটের কোড দিয়ে www.ilovekb.com/verify ওয়েবসাইটে যাচাই করতে পারবেন।',
                },
                {
                  q: 'Pregnant অবস্থায় খাওয়া যাবে?',
                  a: 'Pregnant বা breastfeeding মায়েদের ডাক্তারের পরামর্শ ছাড়া সেবন করা উচিত নয়।',
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

        {/* Related Products */}
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

      {/* Sticky Mobile CTA */}
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
        videoSrc='/products/mullan-check.mov'
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

export default MulanGluta60;
