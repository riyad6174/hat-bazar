import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function Skin1004CentellaSoothingAmpoulePage() {
  const product = products.find(p => p.slug === 'skin1004-centella-soothing-ampoule');
  return <ProductPageLayout product={product} />;
}
