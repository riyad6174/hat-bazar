import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiTag, FiUpload } from 'react-icons/fi';
import AdminProductLayout from '@/components/admin/AdminProductLayout';

const EMPTY = { name: '', image: '', sortOrder: '' };

function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const r = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: e.target.result }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message);
        resolve(data.url);
      } catch (err) { reject(err); }
    };
    reader.readAsDataURL(file);
  });
}

function CategoryFields({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    try { onChange({ ...value, image: await uploadImage(file) }); }
    catch { alert('Upload failed'); }
    finally { setUploading(false); }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_90px] gap-3 items-start">
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Name *</label>
        <input type="text" required value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g. Beauty Care" className="form-input" />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Image <span className="normal-case font-normal text-slate-400">— optional, shown on homepage</span></label>
        <div className="flex items-center gap-2">
          {value.image && <img src={value.image} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />}
          <input type="text" value={value.image} onChange={(e) => onChange({ ...value, image: e.target.value })} placeholder="Image URL" className="form-input flex-1 min-w-0" />
          <button type="button" onClick={() => inputRef.current.click()} disabled={uploading} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-50 flex-shrink-0" title="Upload image">
            <FiUpload className="w-4 h-4" />
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Order</label>
        <input type="number" value={value.sortOrder} onChange={(e) => onChange({ ...value, sortOrder: e.target.value })} placeholder="auto" className="form-input" />
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/categories');
      const data = await r.json();
      setCategories(data.categories || []);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }

  function payload(v) {
    const body = { name: v.name, image: v.image };
    if (v.sortOrder !== '' && v.sortOrder !== null) body.sortOrder = Number(v.sortOrder);
    return body;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(newCat)),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Failed');
      setNewCat(EMPTY);
      showToast('Category added');
      load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id) {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(editValue)),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Failed');
      setEditingId(null);
      showToast('Category updated');
      load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(c) {
    const msg = c.productCount > 0
      ? `Delete "${c.name}"? It will be removed from ${c.productCount} product(s).`
      : `Delete "${c.name}"?`;
    if (!confirm(msg)) return;
    try {
      const r = await fetch(`/api/admin/categories?id=${c._id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      showToast('Category deleted');
      setCategories((prev) => prev.filter((x) => x._id !== c._id));
    } catch { showToast('Failed to delete', 'error'); }
  }

  return (
    <>
      <Head><title>Categories | Hat Bazar Admin</title></Head>
      <AdminProductLayout title="Categories">
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {toast.msg}
          </div>
        )}

        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 max-w-4xl">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Add Category</h2>
          <CategoryFields value={newCat} onChange={setNewCat} />
          <button type="submit" disabled={saving || !newCat.name.trim()} className="mt-4 flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            <FiPlus className="w-4 h-4" /> Add Category
          </button>
        </form>

        <p className="text-xs text-slate-400 mb-3 max-w-4xl">
          Categories with at least one in-stock product appear in the storefront navbar, homepage and shop filters, sorted by Order.
        </p>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-4xl">
            <FiTag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No categories yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 text-left text-slate-300">Category</th>
                  <th className="px-4 py-3 text-center text-slate-300">Order</th>
                  <th className="px-4 py-3 text-center text-slate-300">Products</th>
                  <th className="px-4 py-3 text-center text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map((c) => editingId === c._id ? (
                  <tr key={c._id} className="bg-slate-50">
                    <td colSpan={4} className="px-4 py-4">
                      <CategoryFields value={editValue} onChange={setEditValue} />
                      <div className="flex items-center gap-2 mt-3">
                        <button type="button" onClick={() => handleUpdate(c._id)} disabled={saving || !editValue.name.trim()} className="flex items-center gap-1.5 text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">
                          <FiSave className="w-3.5 h-3.5" /> Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <FiX className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <span className="text-[11px] text-slate-400 ml-2">Renaming also changes the URL slug.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.displayImage ? (
                          <img src={c.displayImage} alt={c.name} className="w-9 h-9 object-cover rounded-full flex-shrink-0 border border-slate-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0"><FiTag className="w-4 h-4 text-slate-400" /></div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{c.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">{c.sortOrder}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${c.productCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.productCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setEditingId(c._id); setEditValue({ name: c.name, image: c.image || '', sortOrder: c.sortOrder ?? '' }); }} className="p-1.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(c)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
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

        <style jsx global>{`
          .form-input {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem;
            outline: none;
            background: white;
            color: #1e293b;
          }
          .form-input:focus {
            border-color: #475569;
            box-shadow: 0 0 0 2px rgba(71,85,105,0.15);
          }
        `}</style>
      </AdminProductLayout>
    </>
  );
}
