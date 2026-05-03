import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const ModalContent = ({ orderDetails, onClose }) => {
  const router = useRouter();

  const handleClose = () => {
    onClose();
    router.push('/');
  };

  return (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[500] flex flex-col bg-surface overflow-y-auto"
    >
      {/* Decorative top strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 flex-shrink-0" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">

          {/* Check icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 260, delay: 0.1 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </motion.div>

          {/* Title + Order ID */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-6"
          >
            <h2 className="font-display text-3xl md:text-4xl text-on-surface mb-2">
              অর্ডার সফল হয়েছে!
            </h2>
            <span className="inline-block bg-surface-container px-4 py-1.5 rounded-full font-body text-[10px] font-bold text-outline uppercase tracking-widest border border-surface-dim">
              {orderDetails.orderId}
            </span>
          </motion.div>

          {/* Details card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-surface-container-low rounded-2xl border border-surface-dim overflow-hidden mb-4"
          >
            {/* Customer */}
            <div className="px-5 py-4 border-b border-surface-dim space-y-2.5">
              <p className="font-body text-[9px] font-bold text-outline uppercase tracking-widest">Customer Details</p>
              <div className="flex justify-between font-body text-sm">
                <span className="text-tertiary">Name</span>
                <span className="text-on-surface font-semibold">{orderDetails.billingDetails.fullName}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-tertiary">Phone</span>
                <span className="text-on-surface font-semibold">{orderDetails.billingDetails.phoneNumber}</span>
              </div>
            </div>

            {/* Products */}
            <div className="px-5 py-4 border-b border-surface-dim space-y-2.5">
              <p className="font-body text-[9px] font-bold text-outline uppercase tracking-widest">Ordered Products</p>
              {orderDetails.items && JSON.parse(orderDetails.items).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.36 + idx * 0.07 }}
                  className="flex justify-between font-body text-sm"
                >
                  <span className="text-tertiary truncate max-w-[200px]">{item.title} × {item.quantity}</span>
                  <span className="text-on-surface font-semibold ml-3 flex-shrink-0">{item.price * item.quantity}৳</span>
                </motion.div>
              ))}
            </div>

            {/* Total */}
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="font-body text-sm font-bold text-tertiary">Total Payment</span>
              <span className="font-sans font-bold text-xl text-primary">{orderDetails.grandTotal}৳</span>
            </div>
          </motion.div>

          {/* Confirmation note */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.4 }}
            className="bg-primary/5 px-5 py-4 rounded-2xl border border-primary/10 mb-6 text-center"
          >
            <p className="font-bengali text-on-surface text-sm leading-relaxed">
              আপনার অর্ডারটি আমরা পেয়েছি। আমাদের প্রতিনিধি আপনাকে কল করবে পাঠানোর আগে। দয়া করে অপেক্ষা করবেন।
            </p>
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
            className="w-full bg-primary text-white py-4 rounded-full font-body font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            বন্ধ করুন
          </motion.button>

        </div>
      </div>
    </motion.div>
  </AnimatePresence>
  );
};

const OrderSuccessModal = ({ orderDetails, onClose }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!orderDetails || !mounted) return null;
  return createPortal(
    <ModalContent orderDetails={orderDetails} onClose={onClose} />,
    document.body
  );
};

export default OrderSuccessModal;
