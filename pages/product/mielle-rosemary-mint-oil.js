import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function MielleRosemaryMintOilPage() {
  const product = products.find(p => p.slug === 'mielle-rosemary-mint-oil');
  
  return (
    <ProductPageLayout 
      product={product} 
      customSections={
        <section className="bg-primary/5 rounded-[3rem] p-8 md:p-16">
          <h2 className="font-display text-3xl mb-8 text-center text-on-surface">Why Rosemary & Mint?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">eco</span>
              <h4 className="font-display text-xl">Natural Ingredients</h4>
              <p className="font-body text-sm text-tertiary">Uses natural, organic ingredients and essential oils.</p>
            </div>
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">biotech</span>
              <h4 className="font-display text-xl">Infused with Biotin</h4>
              <p className="font-body text-sm text-tertiary">Nutrient-rich formula to address hair concerns.</p>
            </div>
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">health_and_safety</span>
              <h4 className="font-display text-xl">Length Retention</h4>
              <p className="font-body text-sm text-tertiary">Helps improve length retention and smooths split ends.</p>
            </div>
          </div>
        </section>
      }
    />
  );
}
