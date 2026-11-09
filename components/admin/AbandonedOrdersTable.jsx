import { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiPhone, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { formatPhone, parseItems, parseItemQty } from '@/components/admin/orderDisplay';

const REFRESH_INTERVAL_MS = 60 * 1000;
const COLUMN_COUNT = 8;

function DateTime({ value }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const date = new Date(value);
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold text-slate-700 whitespace-nowrap mb-0.5">
        {date.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' })}
      </span>
      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
        {date.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

function Message({ children }) {
  return (
    <tr>
      <td colSpan={COLUMN_COUNT} className="py-32 text-center">{children}</td>
    </tr>
  );
}

export default function AbandonedOrdersTable({ onLoaded }) {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [thresholdMinutes, setThresholdMinutes] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const debounceRef = useRef(null);
  const latestRequest = useRef(0);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30, search });
      const response = await fetch(`/api/admin/abandoned-orders?${params}`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      if (requestId !== latestRequest.current) return;
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setThresholdMinutes(data.thresholdMinutes);
      setFailed(false);
      onLoadedRef.current?.();
    } catch {
      if (requestId === latestRequest.current) setFailed(true);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      if (!document.hidden) fetchOrders({ silent: true });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 400);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            onChange={handleSearchChange}
            placeholder="Customer name, phone, or address..."
            className="w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-black text-slate-800">{total}</span> abandoned
          {thresholdMinutes && <> · no activity for {thresholdMinutes}+ minutes</>}
        </p>
        <button
          onClick={() => fetchOrders()}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4 text-right">Order Details</th>
                <th className="px-6 py-4">Checkout</th>
                <th className="px-6 py-4">Abandoned</th>
                <th className="px-6 py-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && orders.length === 0 ? (
                <Message>
                  <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
                </Message>
              ) : failed && orders.length === 0 ? (
                <Message><p className="text-red-500 font-bold">Failed to load abandoned orders</p></Message>
              ) : orders.length === 0 ? (
                <Message><p className="text-slate-500 font-bold text-lg">No abandoned orders found</p></Message>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm mb-0.5">{order.name || 'No name yet'}</span>
                        <a href={`tel:${order.phone}`} className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1 whitespace-nowrap">
                          <FiPhone className="w-3 h-3" />
                          {formatPhone(order.phone)}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] leading-tight text-slate-700 min-w-[160px]">{parseItems(order.items)}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-slate-800">{parseItemQty(order.items)}</td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">{order.district || 'N/A'}</span>
                        <p className="text-xs text-slate-600 font-medium" title={order.address}>{order.address || '—'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm">৳{Number(order.grandTotal || 0).toLocaleString('en-BD')}</div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        ৳{order.totalPrice} + ৳{order.shippingCharge} shipping
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20">
                        <div className="text-[10px] font-bold text-slate-500 mb-1">{order.progress}% filled</div>
                        <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${order.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><DateTime value={order.abandonedAt} /></td>
                    <td className="px-6 py-4"><DateTime value={order.lastActivityAt} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Page <span className="text-blue-600">{page}</span> of {totalPages}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm">
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm">
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
