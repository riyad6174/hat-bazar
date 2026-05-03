import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleOrderNow = () => {
    addToCart(product);
    router.push('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className='group'
    >
      <div className='aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden mb-6 relative'>
        <Image
          fill
          alt={product.name}
          className='object-cover group-hover:scale-105 transition-transform duration-700'
          src={product.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop'}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-[1]" aria-label={product.name} />
        <motion.button
          onClick={() => addToCart(product)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className='absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-on-surface w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white z-10'
        >
          <span className='material-symbols-outlined text-xl'>add</span>
        </motion.button>
      </div>

      <div className='flex justify-between items-start mb-4'>
        <div>
          <p className='font-body text-[10px] text-outline uppercase tracking-[0.2em] mb-1'>
            {product.category || 'Skincare'}
          </p>
          <Link href={`/product/${product.slug}`}>
            <h3 className='font-display text-lg group-hover:text-primary transition-colors line-clamp-2'>
              {product.name}
            </h3>
          </Link>
        </div>
        <p className='font-body font-medium text-on-surface'>
          {product.price}৳
        </p>
      </div>

      <motion.button
        onClick={handleOrderNow}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className='w-full py-3 bg-primary/5 text-primary font-body text-xs font-bold uppercase tracking-widest border border-primary/20 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-300'
      >
        Order Now
      </motion.button>
    </motion.div>
  );
};

export default ProductCard;
