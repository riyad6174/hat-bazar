import React from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCart = () => {
  const { getCartCount, setIsDrawerOpen } = useCart();
  const count = getCartCount();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 100 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDrawerOpen(true)}
          className='fixed right-6 bottom-24 md:bottom-12 z-[90] bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center group'
        >
          <div className='relative'>
            <span className='material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform'>
              shopping_bag
            </span>
            <motion.span
              key={count}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className='absolute -top-3 -right-3 bg-on-surface text-[#b48484] text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 border-white'
            >
              {count}
            </motion.span>
          </div>

          {/* Badge animation to catch eye */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className='absolute inset-0 rounded-full bg-primary -z-10'
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingCart;
