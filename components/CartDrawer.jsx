import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, isDrawerOpen, setIsDrawerOpen } = useCart();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCheckout = async () => {
    setIsTransitioning(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsDrawerOpen(false);
    router.push('/checkout');
    setIsTransitioning(false);
  };

  return (
    <Transition.Root show={isDrawerOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={setIsDrawerOpen}>

        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-400"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">

            {/* Desktop: left panel | Mobile: bottom sheet */}
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full max-sm:inset-y-auto max-sm:inset-x-0 max-sm:bottom-0">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="-translate-x-full max-sm:translate-x-0 max-sm:translate-y-full"
                enterTo="translate-x-0 max-sm:translate-y-0"
                leave="transform transition ease-in-out duration-400"
                leaveFrom="translate-x-0 max-sm:translate-y-0"
                leaveTo="-translate-x-full max-sm:translate-x-0 max-sm:translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md max-sm:max-w-full">
                  <div className="h-full flex flex-col bg-surface shadow-2xl overflow-hidden max-sm:h-[82vh] max-sm:rounded-t-[2.5rem]">

                    {/* Header */}
                    <div className="px-6 py-8 border-b border-surface-dim flex items-center justify-between bg-white/50 backdrop-blur-md">
                      <div>
                        <Dialog.Title className="font-display text-2xl text-on-surface">Your Bag</Dialog.Title>
                        <p className="font-body text-[10px] uppercase tracking-widest text-outline mt-1">
                          {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-10 h-10 rounded-full border border-surface-dim flex items-center justify-center text-outline hover:text-on-surface hover:border-primary transition-all"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                      {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
                          </div>
                          <div>
                            <p className="font-display text-xl text-on-surface">Your bag is empty</p>
                            <p className="font-body text-sm text-tertiary mt-2">Discover something special to fill it.</p>
                          </div>
                          <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="bg-primary text-white px-8 py-3 rounded-full font-body font-bold uppercase tracking-widest text-xs"
                          >
                            Keep Shopping
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence initial={false}>
                            {cartItems.map((item) => (
                              <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="bg-white p-4 rounded-3xl border border-surface-dim flex gap-4 items-center group relative overflow-hidden"
                              >
                                <div className="w-20 h-24 bg-surface-container rounded-2xl overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-display text-base text-on-surface line-clamp-1">{item.name}</h4>
                                  <p className="font-body text-[10px] text-outline uppercase tracking-widest mb-2">{item.category}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 bg-surface-container/50 rounded-full px-3 py-1">
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="material-symbols-outlined text-sm text-outline hover:text-primary transition-colors"
                                      >
                                        remove
                                      </button>
                                      <span className="font-body font-bold text-xs w-4 text-center">{item.quantity}</span>
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="material-symbols-outlined text-sm text-outline hover:text-primary transition-colors"
                                      >
                                        add
                                      </button>
                                    </div>
                                    <p className="font-sans font-bold text-primary">{item.price * item.quantity}৳</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="absolute top-4 right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-outline hover:text-error"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                      <div className="p-8 bg-white border-t border-surface-dim space-y-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-sm font-bold text-outline uppercase tracking-widest">Subtotal</span>
                          <span className="font-sans text-2xl font-bold text-on-surface">{getCartTotal()}৳</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <motion.button
                            onClick={handleCheckout}
                            disabled={isTransitioning}
                            whileHover={isTransitioning ? {} : { scale: 1.03 }}
                            whileTap={isTransitioning ? {} : { scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            className="w-full bg-primary text-white py-4 rounded-full font-body font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 relative overflow-hidden disabled:opacity-90"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {isTransitioning ? (
                                <motion.span
                                  key="going"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.18 }}
                                  className="flex items-center justify-center gap-2"
                                >
                                  <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                                    className="material-symbols-outlined text-base"
                                  >
                                    autorenew
                                  </motion.span>
                                  Heading to Checkout...
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="idle"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.18 }}
                                  className="flex items-center justify-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                                  Process Order
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {/* Ripple */}
                            <motion.span
                              className="absolute inset-0 bg-white/10 rounded-full"
                              initial={{ scale: 0, opacity: 0.6 }}
                              whileTap={{ scale: 3, opacity: 0 }}
                              transition={{ duration: 0.5 }}
                            />
                          </motion.button>

                          <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="w-full py-4 rounded-full font-body font-bold uppercase tracking-widest text-[10px] text-outline hover:text-on-surface transition-colors"
                          >
                            Keep Shopping
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>

          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CartDrawer;
