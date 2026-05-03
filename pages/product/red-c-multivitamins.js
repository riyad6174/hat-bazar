import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function RedCMultivitaminsPage() {
  const product = products.find(p => p.slug === 'red-c-multivitamins');
  return <ProductPageLayout product={product} />;
}
