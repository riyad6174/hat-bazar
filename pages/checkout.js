import React, { useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutForm from '@/components/CheckoutForm';
import { useCart } from '@/context/CartContext';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import Link from 'next/link';
import products from '@/data/products.json';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, removeFromCart, updateQuantity, addToCart } =
    useCart();
  const [orderData, setOrderSuccessData] = useState(null);

  return (
    <div className='min-h-screen flex flex-col bg-surface'>
      <Navbar />

      <main className='flex-grow max-w-[1280px] mx-auto px-6 md:px-16 py-12 md:py-24 w-full'>
        {cartItems.length === 0 && !orderData ? (
          <div className='text-center py-24 space-y-8'>
            <h2 className='font-display text-4xl text-on-surface'>
              Your Bag is Empty
            </h2>
            <p className='font-body text-tertiary'>
              Explore our collection and find your perfect skincare match.
            </p>
            <Link
              href='/shop'
              className='inline-block bg-primary text-on-primary px-10 py-4 rounded-full font-body text-xs font-bold tracking-widest uppercase'
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start'>
            {/* Left Column: Bag Items (Order 1 on mobile) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className='lg:col-span-7 space-y-10 order-1'
            >
              <section>
                <div className='flex items-baseline gap-4 mb-6 md:mb-8'>
                  <h2 className='font-display text-3xl md:text-4xl text-on-surface'>
                    Your Bag
                  </h2>
                  <span className='font-body text-xs text-outline'>
                    ({cartItems.length} items)
                  </span>
                </div>

                <div className='space-y-4 md:space-y-6'>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className='flex gap-4 md:gap-8 pb-6 md:pb-8 border-b border-surface-dim last:border-0'
                    >
                      <div className='w-20 h-28 md:w-32 md:h-40 flex-shrink-0 bg-surface-container rounded-2xl overflow-hidden shadow-sm'>
                        <img
                          className='w-full h-full object-cover'
                          alt={item.name}
                          src={item.image}
                        />
                      </div>
                      <div className='flex-grow flex flex-col justify-between py-1'>
                        <div className='flex justify-between items-start'>
                          <div className='max-w-[150px] md:max-w-none'>
                            <h3 className='font-display text-lg md:text-2xl text-on-surface leading-tight line-clamp-2'>
                              {item.name}
                            </h3>
                            <p className='font-body text-[9px] md:text-[10px] text-tertiary mt-1 uppercase tracking-widest'>
                              {item.category}
                            </p>
                          </div>
                          <p className='font-sans font-bold text-on-surface text-base md:text-lg'>
                            {item.price * item.quantity}৳
                          </p>
                        </div>

                        <div className='flex justify-between items-center mt-4'>
                          <div className='flex items-center border border-outline-variant rounded-full px-2 py-1 gap-3 md:gap-4 bg-white/50'>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className='material-symbols-outlined text-sm md:text-base text-outline hover:text-on-surface'
                            >
                              remove
                            </button>
                            <span className='font-body text-xs md:text-sm font-bold w-4 text-center'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className='material-symbols-outlined text-sm md:text-base text-outline hover:text-on-surface'
                            >
                              add
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className='text-[9px] md:text-[10px] font-bold text-outline hover:text-error transition-colors flex items-center gap-1 uppercase tracking-widest'
                          >
                            <span className='material-symbols-outlined text-sm md:text-base'>
                              delete
                            </span>{' '}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>

            {/* Middle: Checkout Form (Order 2 on mobile) */}
            <motion.aside
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className='lg:col-span-5 lg:sticky lg:top-32 order-2'
            >
              <div className='bg-surface-container rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-stone-900/5 border border-surface-dim/50'>
                <CheckoutForm
                  onOrderSuccess={(data) => setOrderSuccessData(data)}
                />
              </div>
            </motion.aside>

            {/* Bottom: Related Products (Order 3 on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className='lg:col-span-7 order-3 pt-8 md:pt-12'
            >
              <section className='border-t border-surface-dim pt-12'>
                <div className='flex flex-col gap-2 mb-8'>
                  <span className='font-body text-[10px] font-bold text-primary tracking-[0.2em] uppercase'>
                    Complete Your Set
                  </span>
                  <h2 className='font-display text-2xl md:text-3xl text-on-surface'>
                    You Might Also Like
                  </h2>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
                  {products
                    .filter((p) => !cartItems.some((item) => item.id === p.id))
                    .slice(0, 3)
                    .map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                        whileHover={{
                          y: -6,
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        }}
                        className='bg-white p-3 md:p-4 rounded-3xl border border-surface-dim group flex flex-col'
                      >
                        <Link href={`/product/${p.slug}`} className='flex-grow'>
                          <div className='aspect-square rounded-2xl overflow-hidden mb-4 bg-surface-container'>
                            <img
                              src={p.image}
                              alt={p.name}
                              className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                            />
                          </div>
                          <h4 className='font-display text-xs md:text-sm text-on-surface line-clamp-2 group-hover:text-primary leading-tight'>
                            {p.name}
                          </h4>
                          <p className='font-sans font-bold text-xs text-primary mt-1'>
                            {p.price}৳
                          </p>
                        </Link>
                        <motion.button
                          onClick={() => addToCart(p)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          className='w-full mt-4 border border-primary/20 bg-primary/5 rounded-full py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-primary'
                        >
                          Add to Bag
                        </motion.button>
                      </motion.div>
                    ))}
                </div>
              </section>
            </motion.div>
          </div>
        )}
      </main>

      {/* WhatsApp floating button */}
      <a
        href='https://wa.me/8801794855675'
        target='_blank'
        rel='noopener noreferrer'
        className='fixed right-6 bottom-24 md:bottom-12 z-[90] bg-[#553f26] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='white'
          className='w-7 h-7'
        >
          <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
        </svg>
      </a>

      <AnimatePresence>
        {orderData && (
          <OrderSuccessModal
            orderDetails={{
              orderId: orderData.orderId,
              grandTotal: orderData.grandTotal,
              items: orderData.items,
              billingDetails: {
                fullName: orderData.name,
                phoneNumber: orderData.phone,
                address: orderData.address,
              },
            }}
            onClose={() => setOrderSuccessData(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
