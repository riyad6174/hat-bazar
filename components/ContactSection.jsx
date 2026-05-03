import React from 'react';
import { motion } from 'framer-motion';

const ContactSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="py-24 bg-surface-container"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl mb-6 text-on-surface"
          >
            We're Here to Help
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-lg text-tertiary mb-10 leading-relaxed"
          >
            Have questions about your skincare routine? Our team of experts is available to guide you toward the perfect formulations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12"
          >
            <motion.a 
              href="https://m.me/hatbazarlive" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, x: 4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 text-on-surface hover:text-primary transition-colors font-body font-bold text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-xl">chat</span> Messenger Support
            </motion.a>
            <motion.a 
              href="https://wa.me/8801794855675" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, x: 4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 text-on-surface hover:text-primary transition-colors font-body font-bold text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-xl">phone_iphone</span> WhatsApp Us
            </motion.a>
          </motion.div>
          
          <p className="font-body text-[10px] text-outline mt-8 uppercase tracking-[0.2em]">Quality care for the modern skin.</p>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;

