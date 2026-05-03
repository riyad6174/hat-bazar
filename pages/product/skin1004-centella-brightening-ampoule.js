import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function Skin1004CentellaBrighteningAmpoulePage() {
  const product = products.find(p => p.slug === 'skin1004-centella-brightening-ampoule');
  return <ProductPageLayout product={product} />;
}
