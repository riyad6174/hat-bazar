import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-white border-t border-surface-dim"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="font-display text-4xl text-on-surface tracking-tighter block">
              Hat Bazar
            </Link>
            <p className="font-body text-tertiary text-lg max-w-sm leading-relaxed">
              Crafting clinical botanical formulations for the mindful individual. We believe in transparency, efficacy, and the beauty of daily care.
            </p>
            <div className="flex gap-6 pt-4">
               {['instagram', 'facebook', 'youtube'].map(social => (
                 <a key={social} href={`#${social}`} className="w-10 h-10 rounded-full border border-surface-dim flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-lg">{social === 'instagram' ? 'photo_camera' : social === 'facebook' ? 'chat_bubble' : 'play_circle'}</span>
                 </a>
               ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h4 className="font-body font-bold text-[10px] text-on-surface uppercase tracking-[0.2em]">Collections</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/shop" className="font-body text-sm text-tertiary hover:text-primary transition-all">Shop All</Link>
                <Link href="/shop?category=serum" className="font-body text-sm text-tertiary hover:text-primary transition-all">Serums</Link>
                <Link href="/shop?category=supplements" className="font-body text-sm text-tertiary hover:text-primary transition-all">Supplements</Link>
                <Link href="/shop?category=haircare" className="font-body text-sm text-tertiary hover:text-primary transition-all">Hair Care</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="font-body font-bold text-[10px] text-on-surface uppercase tracking-[0.2em]">Journal</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/journal/hair-growth-guide-rosemary-mint" className="font-body text-sm text-tertiary hover:text-primary transition-all">Hair Growth Guide</Link>
                <Link href="/journal/internal-glow-skincare-supplements" className="font-body text-sm text-tertiary hover:text-primary transition-all">Internal Glow</Link>
                <Link href="/journal/centella-asiatica-soothing-secret" className="font-body text-sm text-tertiary hover:text-primary transition-all">Centella Secret</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="font-body font-bold text-[10px] text-on-surface uppercase tracking-[0.2em]">Support</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/checkout" className="font-body text-sm text-tertiary hover:text-primary transition-all">Track Order</Link>
                <Link href="/privacy" className="font-body text-sm text-tertiary hover:text-primary transition-all">Privacy Policy</Link>
                <Link href="/terms" className="font-body text-sm text-tertiary hover:text-primary transition-all">Terms of Service</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-surface-dim flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] font-medium text-outline text-center md:text-left">
            © {new Date().getFullYear()} Hat Bazar. Designed for the modern skin.
          </p>
          <div className="flex gap-8">
             <span className="font-body text-[10px] uppercase tracking-widest text-outline">Clinical</span>
             <span className="font-body text-[10px] uppercase tracking-widest text-outline">Botanical</span>
             <span className="font-body text-[10px] uppercase tracking-widest text-outline">Cruelty Free</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
