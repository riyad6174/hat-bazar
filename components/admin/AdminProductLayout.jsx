import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiPackage, FiPlus, FiList, FiLogOut, FiGrid, FiChevronDown, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';

function NavItem({ href, label, icon: Icon, active, sub }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${sub ? 'pl-8 text-xs' : ''} ${active ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-slate-700' : ''}`} />}
      {label}
    </Link>
  );
}

function SidebarSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="flex-1 text-left">{title}</span>
        {open ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

export default function AdminProductLayout({ children, title }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(async (r) => {
        if (!r.ok) { router.replace('/admin/login'); return; }
        setAdmin(await r.json());
      })
      .catch(() => router.replace('/admin/login'));
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  const path = router.pathname;

  const sidebar = (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-slate-100 border-r border-slate-200 min-h-full">
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-sm">H</div>
          <div>
            <p className="font-black text-xs text-slate-900 leading-none">HAT BAZAR</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Product Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <SidebarSection title="Products" icon={FiPackage} defaultOpen>
          <NavItem href="/admin/products" label="All Products" icon={FiList} active={path === '/admin/products'} sub />
          <NavItem href="/admin/products/create" label="Add New" icon={FiPlus} active={path === '/admin/products/create'} sub />
        </SidebarSection>

        <div className="pt-2 border-t border-slate-200">
          <NavItem href="/admin/orders" label="Orders" icon={FiGrid} active={false} />
        </div>
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="px-3 py-2 mb-1">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Signed in as</p>
          <p className="text-xs font-semibold text-slate-700 truncate">{admin?.email || '…'}</p>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <FiLogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
          <FiMenu className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-900 text-sm">{title}</span>
        <div className="w-9" />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-3 right-3 text-slate-500 p-1">
              <FiX className="w-5 h-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <div className="hidden lg:flex">{sidebar}</div>
        <main className="flex-1 min-w-0 bg-slate-50">
          <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
            <h1 className="text-base font-bold text-slate-900">{title}</h1>
            <div className="text-xs text-slate-400 font-mono">{admin?.email}</div>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
