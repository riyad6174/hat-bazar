import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function CosrxSnailRadianceDualEssencePage() {
  const product = products.find(p => p.slug === 'cosrx-snail-radiance-dual-essence');
  return <ProductPageLayout product={product} />;
}
