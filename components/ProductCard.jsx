import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to bag!`, {
      icon: '🛍️',
      style: {
        borderRadius: '9999px',
        background: 'var(--surface-container-low)',
        color: 'var(--on-surface)',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
      },
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    router.push('/checkout');
  };

  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPct = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className='group flex flex-col'
    >
      <div className='aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden mb-3 relative'>
        <Image
          fill
          alt={product.name}
          className='object-cover group-hover:scale-105 transition-transform duration-500'
          src={product.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop'}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-[1]" aria-label={`View ${product.name}`} />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-[2]">
            -{discountPct}%
          </span>
        )}
        <button
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          className='absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-on-surface w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 z-10'
        >
          <span className='material-symbols-outlined text-lg'>add_shopping_cart</span>
        </button>
      </div>

      <div className='flex flex-col flex-grow'>
        <p className='font-body text-[9px] text-outline uppercase tracking-[0.15em] mb-0.5 line-clamp-1'>
          {product.category || 'Skincare'}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className='font-display text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1.5'>
            {product.name}
          </h3>
        </Link>
        <div className='flex items-baseline gap-2 mb-2'>
          <p className='font-body font-bold text-sm text-on-surface'>
            {product.price}৳
          </p>
          {hasDiscount && (
            <p className='font-body text-xs text-tertiary line-through'>
              {product.oldPrice}৳
            </p>
          )}
        </div>

        <button
          onClick={handleBuyNow}
          className='mt-auto w-full py-2 bg-primary/5 text-primary font-body text-[10px] font-bold uppercase tracking-widest border border-primary/20 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-200'
        >
          Buy Now
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
