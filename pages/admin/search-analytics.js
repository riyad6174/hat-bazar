import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { FiCheck, FiX, FiRefreshCw, FiSearch, FiExternalLink } from 'react-icons/fi';
import AdminProductLayout from '@/components/admin/AdminProductLayout';

const RANGES = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Found' },
  { value: 'failed', label: 'Not found' },
];

function StatusIcon({ success, size = 'w-5 h-5' }) {
  return success ? (
    <span className={`${size} rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0`} aria-label="Products found">
      <FiCheck className="w-3 h-3" strokeWidth={3.5} />
    </span>
  ) : (
    <span className={`${size} rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0`} aria-label="No products found">
      <FiX className="w-3 h-3" strokeWidth={3.5} />
    </span>
  );
}

function formatDay(isoDay) {
  // isoDay is a Dhaka calendar date (YYYY-MM-DD); format it without shifting.
  const [y, m, d] = isoDay.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const todayDhaka = new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
  const yesterdayDhaka = new Date(Date.now() + 6 * 3600 * 1000 - 86400000).toISOString().slice(0, 10);
  const label = date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  if (isoDay === todayDhaka) return `Today · ${label}`;
  if (isoDay === yesterdayDhaka) return `Yesterday · ${label}`;
  return label;
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' });
}

function KeywordPill({ item }) {
  const outcome = item.success
    ? `${item.resultCount} product(s) found`
    : item.resultCount > 0
      ? `No exact match (${item.resultCount} related shown)`
      : 'No products found';
  const title = `${outcome} · searched ${item.count}× · last at ${formatTime(item.lastAt)}`;
  return (
    <a
      href={`/shop?q=${encodeURIComponent(item.query)}`}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={`group inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-sm font-semibold transition-all hover:shadow-sm ${
        item.success
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400'
          : 'bg-red-50 border-red-200 text-red-900 hover:border-red-400'
      }`}
    >
      <StatusIcon success={item.success} />
      <span className="break-all">{item.query}</span>
      {item.count > 1 && (
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${item.success ? 'bg-emerald-200/70 text-emerald-800' : 'bg-red-200/70 text-red-800'}`}>
          ×{item.count}
        </span>
      )}
      <FiExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
    </a>
  );
}

function StatCard({ label, value, tone = 'slate', hint }) {
  const tones = {
    slate: 'text-slate-900',
    green: 'text-emerald-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${tones[tone]}`}>{value}</p>
      {hint && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{hint}</p>}
    </div>
  );
}

export default function SearchAnalyticsPage() {
  const [days, setDays] = useState(7);
  const [status, setStatus] = useState('all');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setKeyword(keywordInput.trim()), 300);
    return () => clearTimeout(t);
  }, [keywordInput]);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days), status, q: keyword });
      const r = await fetch(`/api/admin/search-logs?${params}`);
      if (!r.ok) throw new Error();
      const json = await r.json();
      if (requestId !== latestRequest.current) return;
      setData(json);
      setFailed(false);
    } catch {
      if (requestId === latestRequest.current) setFailed(true);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [days, status, keyword]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;
  const successRate = summary?.total ? Math.round((summary.successful / summary.total) * 100) : 0;

  return (
    <AdminProductLayout title="Search Analytics">
      <Head>
        <title>Search Analytics | Hat Bazar Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${days === r.days ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${status === s.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {s.value !== 'all' && <StatusIcon success={s.value === 'success'} size="w-3.5 h-3.5" />}
                {s.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0 lg:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Filter keywords..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:border-slate-400"
            />
          </div>
          <button
            onClick={load}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm lg:ml-auto"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </button>
        </div>

        {failed && !data ? (
          <div className="py-24 text-center text-red-500 font-bold">Failed to load search analytics</div>
        ) : !data ? (
          <div className="py-24">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total searches" value={summary.total.toLocaleString()} />
              <StatCard label="Found" value={summary.successful.toLocaleString()} tone="green" hint={`${successRate}% success rate`} />
              <StatCard label="Not found" value={summary.failed.toLocaleString()} tone="red" hint={summary.total ? `${100 - successRate}% of searches` : undefined} />
              <StatCard label="Unique keywords" value={summary.uniqueKeywords.toLocaleString()} tone="blue" />
            </div>

            {/* Demand we can't serve */}
            {data.topFailed.length > 0 && status !== 'success' && (
              <section className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                <h2 className="text-sm font-black text-slate-900">Most wanted, not found</h2>
                <p className="text-xs text-slate-500 mb-3">Customers searched for these but no product matched. Consider stocking them, or check the product names.</p>
                <div className="flex flex-wrap gap-2">
                  {data.topFailed.map((k) => (
                    <KeywordPill key={k.query} item={{ ...k, success: false, resultCount: 0 }} />
                  ))}
                </div>
              </section>
            )}

            {/* Date-wise keywords */}
            {data.byDay.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 text-center">
                <FiSearch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">No searches in this period</p>
              </div>
            ) : (
              <div className={`space-y-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
                {data.byDay.map((day) => (
                  <section key={day.date} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <h2 className="text-sm font-black text-slate-900">{formatDay(day.date)}</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {day.total} search{day.total !== 1 ? 'es' : ''}
                        {day.failed > 0 && <span className="text-red-500"> · {day.failed} not found</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.keywords.map((k) => (
                        <KeywordPill key={k.query} item={k} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminProductLayout>
  );
}
