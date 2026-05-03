import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function OrdinaryMultiPeptideHairSerumPage() {
  const product = products.find(p => p.slug === 'ordinary-multi-peptide-hair-serum');
  return <ProductPageLayout product={product} />;
}
