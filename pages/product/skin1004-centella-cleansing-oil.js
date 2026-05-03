import React from 'react';
import ProductPageLayout from '@/components/ProductPageLayout';
import products from '@/data/products.json';

export default function Skin1004CentellaCleansingOilPage() {
  const product = products.find(p => p.slug === 'skin1004-centella-cleansing-oil');
  return <ProductPageLayout product={product} />;
}
