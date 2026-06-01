import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProductForm from '@/components/admin/ProductForm';
import AdminProductLayout from '@/components/admin/AdminProductLayout';

export default function CreateProduct() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData) {
    setSaving(true);
    setError('');
    try {
      const r = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Failed');
      router.push('/admin/products');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head><title>Create Product | Hat Bazar Admin</title></Head>
      <AdminProductLayout title="Create New Product">
        <ProductForm
          title="Create New Product"
          onSubmit={handleSubmit}
          saving={saving}
          error={error}
          backHref="/admin/products"
        />
      </AdminProductLayout>
    </>
  );
}
