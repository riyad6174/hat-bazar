import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className="hero-gradient min-h-[70vh] md:min-h-[85vh] flex items-center overflow-visible relative z-10">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 w-full grid md:grid-cols-2 gap-12 md:gap-16 items-center py-12 md:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 md:space-y-8 order-2 md:order-1"
        >
          <motion.span variants={itemVariants} className="font-body text-xs font-semibold text-primary tracking-[0.2em] uppercase">
            New Collection
          </motion.span>
          <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-7xl text-on-surface leading-[1.1] font-light">
            Skincare That Feels Like <span className="italic">Self-Care</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="font-body text-lg text-tertiary max-w-md leading-relaxed">
            Our botanical formulations are designed to support your daily skincare routine with pure, clinical efficacy.
          </motion.p>
          <motion.div variants={itemVariants} className="pt-4">
            <Link 
              href="/shop" 
              className="inline-block bg-primary text-on-primary px-10 py-4 rounded-full font-body text-xs font-bold tracking-widest hover:opacity-90 transition-all shadow-md uppercase hover:scale-105 active:scale-95"
            >
              Shop the Collection
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative order-1 md:order-2"
        >
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-dim shadow-2xl relative">
            <Image
              fill
              alt="Luxury Skincare"
              className="object-cover"
              src="https://images.pexels.com/photos/16441669/pexels-photo-16441669.jpeg?auto=compress&cs=tinysrgb&w=800"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute -bottom-12 -left-6 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-surface-dim hidden lg:block max-w-[220px] shadow-xl z-20"
          >
            <p className="font-display text-xl italic text-on-surface leading-tight">"The glow is undeniable."</p>
            <p className="font-body text-[10px] mt-3 font-bold tracking-widest uppercase text-outline">— Vogue Editorial</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
