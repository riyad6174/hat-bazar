import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function CeraveMoisturizingCreamPage() {
  const product = products.find(p => p.slug === 'cerave-moisturizing-cream');
  return <ProductPageLayout product={product} />;
}
