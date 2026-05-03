import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function FrozenCollagen2in1Page() {
  const product = products.find(p => p.slug === 'frozen-collagen-2in1');
  return <ProductPageLayout product={product} />;
}
