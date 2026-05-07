import React from 'react';
import MulanGluta60 from '@/components/products/MulanGluta60';
import products from '@/data/products.json';

export default function MulanGluta60Page() {
  const product = products.find(p => p.slug === 'mulan-gluta-60');
  return <MulanGluta60 product={product} />;
}
