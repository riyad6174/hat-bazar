import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/utils/tracking';
import { useEffect } from 'react';

const products = [
  { id: '1-pink', name: 'Gluta Collagen Pink', price: 1390, image: '/assets/single.avif', category: 'Supplements', description: 'Experience the ultimate glow with our premium Gluta Collagen Pink. Formulated with high-quality botanical extracts and collagen peptides.' },
  { id: '2-pink', name: '2 Pcs Gluta Collagen', price: 2700, image: '/assets/double.avif', category: 'Supplements', description: 'Double the glow, double the value. Our twin pack of Gluta Collagen Pink ensures your skincare routine continues uninterrupted.' },
  { id: '3-pink', name: '3 Pcs Gluta Collagen', price: 3900, image: '/assets/triple.avif', category: 'Supplements', description: 'The complete transformation set. Three packs of Gluta Collagen Pink for those dedicated to their skin health journey.' },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id) || products[0];

  useEffect(() => {
    if (id && product) {
      trackEvent('view_item', {
        ecommerce: {
          currency: 'BDT',
          value: product.price,
          items: [{
            item_id: String(product.id),
            item_name: product.name,
            item_category: product.category || '',
            price: product.price,
            quantity: 1,
          }],
        },
      });
    }
  }, [id, product]);

  if (!id && !router.isReady) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 md:py-24 max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-start">
          {/* Product Image */}
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-dim shadow-2xl">
            <img 
              alt={product.name} 
              className="w-full h-full object-cover" 
              src={product.image}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-8 py-4">
            <div>
              <span className="font-body text-xs font-bold text-primary tracking-[0.2em] uppercase mb-2 block">{product.category}</span>
              <h1 className="font-display text-4xl md:text-6xl text-on-surface leading-tight">{product.name}</h1>
              <p className="font-display text-2xl md:text-3xl text-on-surface mt-4">{product.price}৳</p>
            </div>

            <div className="border-y border-surface-dim py-8">
              <h3 className="font-body text-[10px] font-bold text-outline tracking-[0.2em] uppercase mb-4">Description</h3>
              <p className="font-body text-tertiary leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-outline rounded-full px-6 py-3 gap-8 bg-white">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="material-symbols-outlined text-outline hover:text-on-surface transition-colors"
                  >
                    remove
                  </button>
                  <span className="font-body font-bold text-lg w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="material-symbols-outlined text-outline hover:text-on-surface transition-colors"
                  >
                    add
                  </button>
                </div>
              </div>

              <button 
                onClick={() => addToCart(product, quantity)}
                className="w-full bg-primary text-on-primary font-body font-bold py-5 rounded-full uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                Add to Bag <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </button>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <span className="text-xs font-body uppercase tracking-wider">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span className="text-xs font-body uppercase tracking-wider">Authentic</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
