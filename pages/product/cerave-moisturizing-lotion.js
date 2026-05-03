import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function CeraveMoisturizingLotionPage() {
  const product = products.find(p => p.slug === 'cerave-moisturizing-lotion');
  return <ProductPageLayout product={product} />;
}
