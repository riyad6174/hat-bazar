import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { 
  RiDropLine, 
  RiWaterFlashLine, 
  RiFlaskLine, 
  RiScissorsCutLine, 
  RiSunLine, 
  RiBubbleChartLine, 
  RiCapsuleLine 
} from 'react-icons/ri';

const categories = [
  { name: 'Moisturizer', icon: RiDropLine, slug: 'moisturizer' },
  { name: 'Toner', icon: RiWaterFlashLine, slug: 'toner' },
  { name: 'Serum', icon: RiFlaskLine, slug: 'serum' },
  { name: 'Haircare', icon: RiScissorsCutLine, slug: 'haircare' },
  { name: 'Sunscreen', icon: RiSunLine, slug: 'sunscreen' },
  { name: 'Facewash', icon: RiBubbleChartLine, slug: 'facewash' },
  { name: 'Supplements', icon: RiCapsuleLine, slug: 'supplements' },
];

const Navbar = () => {
  const { getCartCount, setIsDrawerOpen } = useCart();
  const cartCount = getCartCount();

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50"
    >
      {/* Main Navbar */}
      <header className="bg-surface/95 backdrop-blur-xl border-b border-surface-dim">
        <div className="flex justify-between items-center w-full max-w-[1280px] mx-auto px-6 md:px-16 py-4">
          <Link href="/" className="flex items-center">
            <img 
              src="/assets/logo.png" 
              alt="Hat Bazar" 
              className="h-10 md:h-14 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="text-on-surface flex items-center relative hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navbar (Categories) */}
      <nav className="bg-surface-container/80 backdrop-blur-md border-b border-surface-dim py-3 overflow-x-auto scrollbar-hide">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-start md:justify-center gap-3 min-w-max">
          {categories.map((cat) => (
            <Link 
              key={cat.slug} 
              href={`/shop?category=${cat.slug}`}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-surface-dim hover:border-primary hover:text-primary transition-all group whitespace-nowrap"
            >
              <cat.icon className="text-lg text-tertiary group-hover:text-primary transition-colors" />
              <span className="font-body text-xs font-bold uppercase tracking-wider">{cat.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
