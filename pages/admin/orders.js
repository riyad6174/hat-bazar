import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
  FiSearch, FiRefreshCw, FiFilter, FiTrash2, FiEdit3,
  FiCheckCircle, FiXCircle, FiClock, FiPhone, FiPhoneMissed,
  FiCopy, FiCalendar, FiArrowLeft, FiArrowRight,
  FiAlertTriangle, FiMessageSquare, FiSave
} from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FiClock, btn: 'bg-yellow-600' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100', badge: 'bg-green-100 text-green-800 border-green-200', icon: FiCheckCircle, btn: 'bg-green-600' },
  cancel: { label: 'Cancelled', color: 'bg-red-100', badge: 'bg-red-100 text-red-800 border-red-200', icon: FiXCircle, btn: 'bg-red-600' },
};

const RESPONSE_STATUS_CONFIG = {
  called: { label: 'Called', badge: 'bg-green-100 text-green-700', icon: FiPhone },
  did_not_pick: { label: 'Did Not Pick', badge: 'bg-red-100 text-red-700', icon: FiPhoneMissed },
  number_off: { label: 'Number Off', badge: 'bg-slate-100 text-slate-700', icon: FiPhoneMissed },
  call_later: { label: 'Call Later', badge: 'bg-orange-100 text-orange-700', icon: FiClock },
  fake_order: { label: 'Fake Order', badge: 'bg-purple-100 text-purple-700', icon: FiAlertTriangle },
  null: { label: 'Not Called', badge: 'bg-yellow-100 text-yellow-700', icon: FiPhone },
};

function formatPhone(phone) {
  if (!phone) return '';
  if (phone.startsWith('+88')) return phone.slice(3);
  if (phone.startsWith('88') && phone.length > 11) return phone.slice(2);
  return phone;
}

function formatOrderTime(order) {
  if (order.submissionTime) {
    const lastComma = order.submissionTime.lastIndexOf(',');
    if (lastComma !== -1) {
      return { date: order.submissionTime.slice(0, lastComma).trim(), time: order.submissionTime.slice(lastComma + 1).trim() };
    }
    return { date: order.submissionTime, time: '—' };
  }
  if (order.createdAt) {
    const d = new Date(order.createdAt);
    return {
      date: d.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' }),
      time: d.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }),
    };
  }
  return { date: '—', time: '—' };
}

function OrderTime({ order }) {
  const t = formatOrderTime(order);
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold text-slate-700 whitespace-nowrap mb-0.5">{t.date}</span>
      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{t.time}</span>
    </div>
  );
}

function parseItems(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    return arr.map((it) => (
      <div key={Math.random()} className="mb-1 last:mb-0">
        <span className="font-medium">{it.title || it.name || 'Item'}</span>
        <span className="text-gray-400 mx-1">×</span>
        <span className="text-blue-600 font-semibold">{it.quantity || 1}</span>
        {it.selectedColor && <span className="block text-[10px] text-gray-500">{it.selectedColor}</span>}
      </div>
    ));
  } catch {
    return <span className="text-gray-400 italic">No items</span>;
  }
}

function parseItemQty(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    return arr.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
  } catch {
    return 0;
  }
}

export default function AdminOrders() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [responseFilter, setResponseFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState({});
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ total: 0, today: 0, pendingToday: 0, confirmedToday: 0, cancelledToday: 0, totalPending: 0, totalConfirmed: 0, totalCancelled: 0 });
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const debounceRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/admin/me')
      .then(async (r) => {
        if (!r.ok) { router.replace('/admin/login'); }
        else { const data = await r.json(); setAdmin(data); setAuthChecked(true); }
      })
      .catch(() => router.replace('/admin/login'));
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30, search, status: statusFilter, responseStatus: responseFilter, from: fromDate, to: toDate });
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.stats) {
        setStats({
          today: data.stats.today, pendingToday: data.stats.pendingToday,
          confirmedToday: data.stats.confirmedToday, cancelledToday: data.stats.cancelledToday,
          total: data.stats.globalTotal, totalPending: data.stats.totalPending,
          totalConfirmed: data.stats.totalConfirmed, totalCancelled: data.stats.totalCancelled,
        });
      }
    } catch { } finally { setLoading(false); }
  }, [page, search, statusFilter, responseFilter, fromDate, toDate]);

  useEffect(() => { if (authChecked) fetchOrders(); }, [authChecked, fetchOrders]);
  useEffect(() => { setPage(1); }, [search, statusFilter, responseFilter, fromDate, toDate]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 400);
  };

  const handleResetFilters = () => {
    setSearch(''); setStatusFilter(''); setResponseFilter('');
    setFromDate(''); setToDate(''); setPage(1);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const openUpdateModal = (order) => {
    setSelectedOrder({ ...order });
    setNoteText(order.note || '');
    setIsUpdateModalOpen(true);
  };

  const handleStatusUpdate = async (field, newVal) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newVal }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, [field]: newVal } : o)));
        setSelectedOrder((prev) => ({ ...prev, [field]: newVal }));
        showToast(`Status updated to ${newVal || 'None'}`);
        fetchOrders();
      }
    } catch (err) { console.error(err); }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopyFeedback((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const copyFullOrder = () => {
    if (!selectedOrder) return;
    const text = `${selectedOrder.name}\n${formatPhone(selectedOrder.phone)}\n${selectedOrder.address}\n৳${selectedOrder.grandTotal}`;
    copyToClipboard(text, 'fullOrder');
  };

  const handleNoteSave = async () => {
    if (!selectedOrder) return;
    setNoteSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText }),
      });
      const data = await res.json();
      if (res.ok) {
        const savedNote = data.order?.note ?? noteText;
        setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, note: savedNote } : o)));
        setSelectedOrder((prev) => ({ ...prev, note: savedNote }));
        showToast('Note saved');
      } else {
        showToast(data.message || 'Failed to save note', 'error');
      }
    } catch { showToast('Failed to save note', 'error'); }
    finally { setNoteSaving(false); }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-slate-500 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Order Management | Hat Bazar Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
              <span className="font-bold text-slate-900 tracking-tight hidden sm:block">Hat Bazar Admin</span>
            </div>
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg flex-wrap">
              <Link href="/admin/orders" className="text-sm px-4 py-1.5 rounded-md bg-white shadow-sm font-semibold text-blue-700">
                Orders
              </Link>
              <Link href="/admin/products" className="text-sm px-4 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors font-medium">
                Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchOrders}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              Reload
            </button>
            <div className="flex flex-col items-end leading-none">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">Administrator</span>
              <span className="text-[10px] text-slate-500 font-mono">{admin?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all border border-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-[1800px] mx-auto w-full flex-grow">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Order Management</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Real-time control center for Hat Bazar orders.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { todayLabel: "Today's Orders", todayValue: stats.today, totalLabel: 'Total Orders', totalValue: stats.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: FiCalendar },
              { todayLabel: "Today's Pending", todayValue: stats.pendingToday, totalLabel: 'Total Pending', totalValue: stats.totalPending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: FiClock },
              { todayLabel: "Today's Confirmed", todayValue: stats.confirmedToday, totalLabel: 'Total Confirmed', totalValue: stats.totalConfirmed, color: 'text-green-600', bg: 'bg-green-50', icon: FiCheckCircle },
              { todayLabel: "Today's Cancelled", todayValue: stats.cancelledToday, totalLabel: 'Total Cancelled', totalValue: stats.totalCancelled, color: 'text-red-600', bg: 'bg-red-50', icon: FiXCircle },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{stat.todayLabel}</p>
                  <p className={`text-3xl font-black ${stat.color} leading-none mb-1`}>{stat.todayValue}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{stat.totalLabel}: <span className="text-slate-600 font-black">{stat.totalValue}</span></p>
                </div>
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <FiFilter className="w-4 h-4 text-blue-600" />
              Advanced Filters
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-2 relative">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Quick Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    defaultValue={search}
                    onChange={handleSearchChange}
                    placeholder="Customer name, phone, or order number..."
                    className="w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:col-span-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Order Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 focus:outline-none transition-all cursor-pointer font-medium text-slate-700">
                    <option value="">All Orders</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="cancel">❌ Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Response</label>
                  <select value={responseFilter} onChange={(e) => setResponseFilter(e.target.value)} className="w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 focus:outline-none transition-all cursor-pointer font-medium text-slate-700">
                    <option value="">All Attempts</option>
                    <option value="none">⚪ No Response</option>
                    <option value="called">📞 Called</option>
                    <option value="number_off">📵 Number Off</option>
                    <option value="did_not_pick">📵 Did Not Pick</option>
                    <option value="call_later">🕐 Call Later</option>
                    <option value="fake_order">⚠️ Fake Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date Range</label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full text-[10px] border border-slate-200 bg-slate-50/50 rounded-lg pl-7 pr-2 py-2 focus:outline-none transition-all" />
                  </div>
                  <div className="text-slate-300">—</div>
                  <div className="relative flex-1">
                    <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full text-[10px] border border-slate-200 bg-slate-50/50 rounded-lg pl-7 pr-2 py-2 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={handleResetFilters} className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <FiTrash2 className="w-3 h-3" /> Reset Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Response</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Shipping</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg" />
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Loading orders...</p>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-32 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FiSearch className="w-10 h-10 text-slate-200" />
                          <p className="text-slate-500 font-bold text-lg">No orders found</p>
                          <button onClick={handleResetFilters} className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">View All Orders</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const status = ORDER_STATUS_CONFIG[order.orderStatus || 'pending'] || ORDER_STATUS_CONFIG.pending;
                      const response = RESPONSE_STATUS_CONFIG[order.responseStatus || 'null'] || RESPONSE_STATUS_CONFIG.null;
                      const RespIcon = response.icon;

                      return (
                        <tr key={order._id} className={`group transition-all hover:shadow-md border-l-4 ${status.color} border-transparent hover:border-blue-500`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openUpdateModal(order)}
                                className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                              >
                                <FiEdit3 className="w-5 h-5" />
                              </button>
                              {order.note && (
                                <div className="relative group/note">
                                  <div className="flex items-center justify-center w-10 h-10 text-amber-500 bg-amber-50 border border-amber-100 rounded-xl cursor-default">
                                    <FiMessageSquare className="w-4 h-4" />
                                  </div>
                                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl z-50 invisible group-hover/note:visible opacity-0 group-hover/note:opacity-100 transition-all duration-200 pointer-events-none leading-relaxed">
                                    <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Note</div>
                                    <div className="whitespace-pre-wrap break-words">{order.note}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${response.badge} border-white shadow-sm`}>
                              <RespIcon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{response.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm mb-0.5">{order.name}</span>
                              <span className="text-xs text-slate-500 font-medium">{formatPhone(order.phone)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-[220px]">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">{order.district || 'N/A'}</span>
                              <p className="text-xs text-slate-600 font-medium" title={order.address}>{order.address}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px] leading-tight text-slate-700">{parseItems(order.items)}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-black text-slate-900 text-sm">৳{Number(order.grandTotal || 0).toLocaleString('en-BD')}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{parseItemQty(order.items)} Items</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><OrderTime order={order} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                  Page <span className="text-blue-600">{page}</span> of {totalPages}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm">
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pNum = i + 1;
                      return (
                        <button key={pNum} onClick={() => setPage(pNum)} className={`h-10 w-10 text-xs font-bold rounded-xl transition-all ${page === pNum ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500'}`}>{pNum}</button>
                      );
                    })}
                  </div>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm">
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Update Order Modal */}
        <Transition show={isUpdateModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsUpdateModalOpen(false)}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl border border-slate-100">
                    <div className="relative p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <Dialog.Title as="h3" className="text-xl font-black text-slate-900">Order Details & Management</Dialog.Title>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {selectedOrder?.orderId}</p>
                          {selectedOrder?.items && (() => {
                            try {
                              const items = JSON.parse(selectedOrder.items);
                              return (
                                <p className="text-xs text-slate-600 font-medium mt-1.5">
                                  {items.map((it, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 flex-wrap">
                                      {i > 0 && <span className="text-slate-300 mx-1">·</span>}
                                      {it.title || it.name || 'Item'}
                                      <span className="text-blue-500 font-bold">×{it.quantity || 1}</span>
                                    </span>
                                  ))}
                                </p>
                              );
                            } catch { return null; }
                          })()}
                        </div>
                        <button onClick={() => setIsUpdateModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                          <FiXCircle className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Summary */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-8">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-100">
                            {[
                              { label: 'Customer Name', value: selectedOrder?.name, key: 'name' },
                              { label: 'Phone', value: formatPhone(selectedOrder?.phone), key: 'phone' },
                              { label: 'District', value: selectedOrder?.district, key: 'district' },
                              { label: 'Address', value: selectedOrder?.address, key: 'address' },
                              { label: 'Total Payable', value: `৳${selectedOrder?.grandTotal}`, key: 'price' },
                            ].map((field) => (
                              <tr key={field.key} className="hover:bg-white transition-colors">
                                <td className="px-5 py-4 font-bold text-[11px] text-slate-400 uppercase tracking-wider w-1/3 border-r border-slate-100">{field.label}</td>
                                <td className="px-5 py-4 font-semibold text-slate-700 flex items-center justify-between">
                                  <span className="truncate pr-4">{field.value}</span>
                                  <button onClick={() => copyToClipboard(field.value, field.key)} className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-black uppercase ${copyFeedback[field.key] ? 'bg-green-600 text-white' : 'bg-white text-slate-500 hover:text-blue-600 border border-slate-200'}`}>
                                    {copyFeedback[field.key] ? <FiCheckCircle /> : <FiCopy />}
                                    {copyFeedback[field.key] ? 'Copied' : 'Copy'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Items */}
                      <div className="mb-6">
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="px-5 py-3 border-b border-slate-100">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Items Ordered</h4>
                          </div>
                          {(() => {
                            try {
                              const items = JSON.parse(selectedOrder?.items || '[]');
                              return items.map((it, i) => (
                                <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                  <div>
                                    <div className="font-semibold text-sm text-slate-800">{it.title || it.name || 'Item'}</div>
                                    {it.selectedColor && <div className="text-[11px] text-slate-500">{it.selectedColor}</div>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[11px] text-slate-400">×</span>
                                    <span className="font-black text-blue-600 text-sm">{it.quantity || 1}</span>
                                  </div>
                                </div>
                              ));
                            } catch { return <div className="px-5 py-3 text-sm text-slate-400">No items</div>; }
                          })()}
                        </div>
                      </div>

                      {/* Status Updates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-blue-600 rounded-full" /> Order Status
                          </h4>
                          <div className="flex flex-col gap-2">
                            {['pending', 'confirmed', 'cancel'].map((st) => {
                              const config = ORDER_STATUS_CONFIG[st];
                              const isActive = selectedOrder?.orderStatus === st;
                              return (
                                <button key={st} onClick={() => handleStatusUpdate('orderStatus', st)} className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${isActive ? `${config.btn} border-transparent text-white shadow-lg` : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                                  {config.label}
                                  {isActive && <FiCheckCircle />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-green-600 rounded-full" /> Call Management
                          </h4>
                          <div className="flex flex-col gap-2">
                            {[
                              { val: 'null', label: 'Not Called Yet', icon: FiClock, color: 'bg-slate-600' },
                              { val: 'called', label: 'Call Successful', icon: FiPhone, color: 'bg-green-600' },
                              { val: 'did_not_pick', label: 'Did Not Pick', icon: FiPhoneMissed, color: 'bg-red-600' },
                              { val: 'call_later', label: 'Call Later', icon: FiClock, color: 'bg-orange-500' },
                              { val: 'fake_order', label: 'Fake Order', icon: FiAlertTriangle, color: 'bg-purple-600' },
                            ].map((resp) => {
                              const isActive = (selectedOrder?.responseStatus === null && resp.val === 'null') || (selectedOrder?.responseStatus === resp.val);
                              return (
                                <button key={resp.val} onClick={() => handleStatusUpdate('responseStatus', resp.val === 'null' ? null : resp.val)} className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${isActive ? `${resp.color} border-transparent text-white shadow-lg` : 'bg-white border-slate-100 text-slate-500 hover:border-green-200'}`}>
                                  <div className="flex items-center gap-2"><resp.icon className="w-4 h-4" />{resp.label}</div>
                                  {isActive && <FiCheckCircle />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="mb-8">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-amber-500 rounded-full" /> Order Note
                        </h4>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note about this order..."
                          rows={3}
                          className="w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-none font-medium text-slate-700 placeholder:text-slate-300"
                        />
                        <button onClick={handleNoteSave} disabled={noteSaving} className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-600 transition-all disabled:opacity-60">
                          <FiSave className="w-3.5 h-3.5" />
                          {noteSaving ? 'Saving...' : 'Save Note'}
                        </button>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col gap-3">
                        <button onClick={copyFullOrder} className={`w-full py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${copyFeedback.fullOrder ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900'}`}>
                          {copyFeedback.fullOrder ? <FiCheckCircle className="text-green-400 w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
                          {copyFeedback.fullOrder ? 'Copied!' : 'Copy Full Order Data'}
                        </button>
                        <div className="flex justify-center mt-2">
                          <button onClick={() => setIsUpdateModalOpen(false)} className="px-8 py-3 bg-blue-50 rounded-xl text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100">
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Toast */}
        <Transition show={!!toast} as={Fragment} enter="transform ease-out duration-300 transition" enterFrom="translate-y-2 opacity-0" enterTo="translate-y-0 opacity-100" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast?.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-slate-900 border-slate-800'} text-white`}>
            {toast?.type === 'error' ? <FiXCircle className="text-white w-5 h-5" /> : <FiCheckCircle className="text-green-400 w-5 h-5" />}
            <span className="text-sm font-bold tracking-tight">{toast?.message}</span>
          </div>
        </Transition>
      </div>
    </>
  );
}
