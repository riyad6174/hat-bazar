import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/utils/tracking';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

// Hardcoded variant products for the main Gluta Collagen pages
const VARIANT_PRODUCTS = [
  { id: '1-pink', name: 'Gluta Collagen Pink', price: 1390, image: '/assets/single.avif', category: 'Supplements', description: 'Experience the ultimate glow with our premium Gluta Collagen Pink. Formulated with high-quality botanical extracts and collagen peptides.' },
  { id: '2-pink', name: '2 Pcs Gluta Collagen', price: 2700, image: '/assets/double.avif', category: 'Supplements', description: 'Double the glow, double the value. Our twin pack of Gluta Collagen Pink ensures your skincare routine continues uninterrupted.' },
  { id: '3-pink', name: '3 Pcs Gluta Collagen', price: 3900, image: '/assets/triple.avif', category: 'Supplements', description: 'The complete transformation set. Three packs of Gluta Collagen Pink for those dedicated to their skin health journey.' },
];

function DBProductPage({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbSwiper, setThumbSwiper] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const galleryImages = [...new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))];
  const useThumbSlider = galleryImages.length > 4;

  const effectivePrice = product.price + (selectedVariant?.priceModifier || 0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    trackEvent('view_item', {
      ecommerce: {
        currency: 'BDT',
        value: effectivePrice,
        items: [{
          item_id: product._id || product.slug,
          item_name: product.title,
          item_category: product.category || '',
          price: effectivePrice,
          quantity: 1,
        }],
      },
    });
  }, []);

  const cartProduct = {
    id: product.slug,
    name: product.title,
    price: effectivePrice,
    image: product.thumbnail || product.images?.[0] || '',
    category: product.category,
    slug: product.slug,
    selectedColor: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 md:py-24 max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-start">
          <div className="flex flex-col gap-4">
            {/* Main image swiper */}
            <div className="aspect-square overflow-hidden bg-white relative border border-surface-dim rounded-2xl">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop={galleryImages.length > 1}
                onSwiper={setSwiper}
                onSlideChange={(s) => setActiveIndex(s.realIndex)}
                className="w-full h-full"
              >
                {galleryImages.map((img, idx) => (
                  <SwiperSlide key={idx} className="relative">
                    <Image
                      fill
                      alt={`${product.title} ${idx + 1}`}
                      className="object-cover"
                      src={img}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={idx === 0}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Thumbnail strip */}
            {galleryImages.length > 1 && (
              useThumbSlider ? (
                /* Slider with prev/next for >4 images */
                <div className="relative group">
                  <button
                    onClick={() => thumbSwiper?.slidePrev()}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white border border-surface-dim rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 16 }}>chevron_left</span>
                  </button>

                  <Swiper
                    modules={[Autoplay]}
                    slidesPerView={4}
                    spaceBetween={8}
                    loop={true}
                    onSwiper={setThumbSwiper}
                    autoplay={isMobile ? { delay: 2000, disableOnInteraction: false } : false}
                    className="w-full"
                  >
                    {galleryImages.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <button
                          onClick={() => swiper?.slideToLoop(idx)}
                          className={`w-full aspect-square overflow-hidden border-2 transition-all relative rounded-xl ${
                            activeIndex === idx ? 'border-primary' : 'border-surface-dim'
                          }`}
                        >
                          <Image fill src={img} alt="" className="object-cover" sizes="120px" />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <button
                    onClick={() => thumbSwiper?.slideNext()}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white border border-surface-dim rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-on-surface" style={{ fontSize: 16 }}>chevron_right</span>
                  </button>
                </div>
              ) : (
                /* Simple equal-width grid for ≤4 images */
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${galleryImages.length}, 1fr)` }}>
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => swiper?.slideToLoop(idx)}
                      className={`aspect-square overflow-hidden border-2 transition-all relative rounded-xl ${
                        activeIndex === idx ? 'border-primary' : 'border-surface-dim'
                      }`}
                    >
                      <Image fill src={img} alt="" className="object-cover" sizes="120px" />
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="space-y-8 py-4">
            <div>
              <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">{product.category}</span>
              <h1 className="font-display text-2xl md:text-4xl lg:text-5xl text-on-surface leading-tight">{product.title}</h1>
              <div className="flex items-center gap-4 mt-4">
                <p className="font-display text-2xl md:text-3xl text-on-surface">{effectivePrice}৳</p>
                {product.originalPrice > product.price && (
                  <p className="font-body text-lg text-tertiary line-through">{product.originalPrice}৳</p>
                )}
              </div>
            </div>

            {product.shortDescription && (
              <div className="border-y border-surface-dim py-8">
                <p className="font-body text-tertiary leading-relaxed text-lg">{product.shortDescription}</p>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-body text-[10px] font-bold text-outline tracking-[0.2em] uppercase mb-3">Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(selectedVariant?.value === v.value ? null : v)}
                      className={`px-4 py-2 rounded-full border text-sm font-body font-medium transition-all ${selectedVariant?.value === v.value ? 'border-primary bg-primary text-white' : 'border-outline text-on-surface hover:border-primary'}`}
                    >
                      {v.value}
                      {v.priceModifier !== 0 && <span className="ml-1 text-xs">({v.priceModifier > 0 ? '+' : ''}{v.priceModifier}৳)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-outline rounded-full px-6 py-3 gap-8 bg-white">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">remove</button>
                  <span className="font-body font-bold text-lg w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">add</button>
                </div>
              </div>

              <button
                onClick={() => addToCart(cartProduct, quantity)}
                className="w-full bg-primary text-on-primary font-body font-bold py-5 rounded-full uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                Add to Bag <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </button>
            </div>

          </div>
        </div>

        {/* Full Description — full-width section on large screens */}
        {product.descriptionHTML && (
          <div className="mt-16 lg:mt-24">
            <div className="border-t border-surface-dim pt-12">
              <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-4 block">Product Description</span>
              <div className="dp-html-content font-body text-tertiary max-w-4xl" dangerouslySetInnerHTML={{ __html: product.descriptionHTML }} />
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl text-on-surface mb-6">Specifications</h2>
            <div className="bg-surface-container-low rounded-2xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b border-surface-dim last:border-0">
                      <td className="px-6 py-4 font-body font-semibold text-sm text-outline uppercase tracking-wide w-1/3">{spec.label}</td>
                      <td className="px-6 py-4 font-body text-on-surface">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl text-on-surface mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {product.faqs.map((faq, i) => (
                <details key={i} className="bg-surface-container-low rounded-2xl p-6 group">
                  <summary className="font-body font-semibold text-on-surface cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="font-body text-tertiary leading-relaxed mt-4">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl text-on-surface mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-surface-container-low rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body font-semibold text-on-surface">{review.reviewerName}</p>
                    <div className="flex">
                      {[...Array(review.rating || 5)].map((_, j) => <span key={j} className="text-primary text-sm">★</span>)}
                    </div>
                  </div>
                  <p className="font-body text-tertiary text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  // Check if it's a hardcoded variant product
  const variantProduct = VARIANT_PRODUCTS.find(p => p.id === id);
  if (variantProduct) {
    return { props: { variantProduct, dbProduct: null } };
  }

  // Try to find in MongoDB by slug
  try {
    const { connectDB } = await import('@/lib/mongodb');
    const Product = (await import('@/models/Product')).default;
    await connectDB();
    const product = await Product.findOne({ slug: id }).lean();
    if (product) {
      return {
        props: {
          variantProduct: null,
          dbProduct: JSON.parse(JSON.stringify(product)),
        },
      };
    }
  } catch (err) {
    console.error('DB product lookup failed:', err.message);
  }

  return { notFound: true };
}

export default function ProductDetailPage({ variantProduct, dbProduct }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (variantProduct) {
      trackEvent('view_item', {
        ecommerce: {
          currency: 'BDT',
          value: variantProduct.price,
          items: [{
            item_id: String(variantProduct.id),
            item_name: variantProduct.name,
            item_category: variantProduct.category || '',
            price: variantProduct.price,
            quantity: 1,
          }],
        },
      });
    }
  }, [variantProduct]);

  if (dbProduct) {
    return <DBProductPage product={dbProduct} />;
  }

  if (!variantProduct) return null;

  const product = variantProduct;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-12 md:py-24 max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-start">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-dim shadow-2xl relative">
            <Image fill alt={product.name} className="object-cover" src={product.image} sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>

          <div className="space-y-8 py-4">
            <div>
              <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">{product.category}</span>
              <h1 className="font-display text-2xl md:text-4xl lg:text-5xl text-on-surface leading-tight">{product.name}</h1>
              <p className="font-display text-2xl md:text-3xl text-on-surface mt-4">{product.price}৳</p>
            </div>

            <div className="border-y border-surface-dim py-8">
              <h3 className="font-body text-[10px] font-bold text-outline tracking-[0.2em] uppercase mb-4">Description</h3>
              <p className="font-body text-tertiary leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-outline rounded-full px-6 py-3 gap-8 bg-white">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">remove</button>
                  <span className="font-body font-bold text-lg w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">add</button>
                </div>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full bg-primary text-on-primary font-body font-bold py-5 rounded-full uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                Add to Bag <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </button>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <span className="text-xs font-body uppercase tracking-wider">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span className="text-xs font-body uppercase tracking-wider">Authentic</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
