import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FiPlus, FiEdit3, FiTrash2, FiPackage } from 'react-icons/fi';
import AdminProductLayout from '@/components/admin/AdminProductLayout';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/products');
      const data = await r.json();
      setProducts(data.products || []);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const r = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      showToast('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch { showToast('Failed to delete', 'error'); }
  }

  return (
    <>
      <Head><title>Products | Hat Bazar Admin</title></Head>
      <AdminProductLayout title="All Products">
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">{products.length} product{products.length !== 1 ? 's' : ''} (MongoDB)</p>
          <Link href="/admin/products/create" className="flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <FiPlus className="w-4 h-4" /> New Product
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading…</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
            <FiPackage className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-3">No dynamic products yet</p>
            <p className="text-slate-400 text-xs mb-4">Static products from products.json are still shown on the site.</p>
            <Link href="/admin/products/create" className="inline-flex items-center gap-2 text-white bg-slate-900 px-4 py-2 rounded-lg text-sm font-semibold">
              <FiPlus /> Create First Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 text-left text-slate-300">Product</th>
                  <th className="px-4 py-3 text-left text-slate-300">Category</th>
                  <th className="px-4 py-3 text-right text-slate-300">Price</th>
                  <th className="px-4 py-3 text-center text-slate-300">Stock</th>
                  <th className="px-4 py-3 text-center text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.thumbnail && (
                          <img src={p.thumbnail} alt={p.title} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 border border-slate-100" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{p.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.category || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-800">৳{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-xs text-slate-400 line-through ml-1">৳{p.originalPrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {p.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/edit/${p._id}`} className="p-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                          <FiEdit3 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.title)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminProductLayout>
    </>
  );
}
