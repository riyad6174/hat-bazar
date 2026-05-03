import React from 'react';
import AnuaNiacinamideDarkSpotSerum from '@/components/products/AnuaNiacinamideDarkSpotSerum';
import products from '@/data/products.json';

export default function AnuaNiacinamideDarkSpotSerumPage() {
  const product = products.find(p => p.slug === 'anua-niacinamide-dark-spot-serum');
  return <AnuaNiacinamideDarkSpotSerum product={product} />;
}
