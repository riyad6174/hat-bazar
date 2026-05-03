import React from 'react';
import ManeeGlutaCollagenPink from '@/components/products/ManeeGlutaCollagenPink';
import products from '@/data/products.json';

export default function ManeeGlutaCollagenPinkPage() {
  const product = products.find(p => p.slug === 'manee-gluta-collagen-pink');
  return <ManeeGlutaCollagenPink product={product} />;
}
