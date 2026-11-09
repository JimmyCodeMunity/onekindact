import { useState, useEffect, useCallback } from 'react';
import { Search, CreditCard, Download } from 'lucide-react';
import { donationApi } from '../../api/index.js';
import { formatCurrency } from '../../lib/utils.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTS = ['all', 'completed', 'pending', 'failed', 'refunded'];

function exportCSV(donations) {
  const headers = ['Receipt', 'Donor', 'Email', 'Campaign', 'Amount', 'Status', 'Date'];
  const rows = donations.map((d) => [
    d.receiptNumber,
    d.isAnonymous ? 'Anonymous' : d.donorName,
    d.donorEmail,
    d.campaign?.title || '',
    d.amount,
    d.status,
    format(new Date(d.createdAt), 'yyyy-MM-dd HH:mm'),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'donations.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDonations() {
  const [donations,   setDonations]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('all');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalRaised, setTotalRaised] = useState(0);
  const [total,       setTotal]       = useState(0);

  const fetchDonations = useCallback(() => {
    setLoading(true);
    donationApi.getAll({
      page,
      limit: 15,
      ...(search && { search }),
      ...(status !== 'all' && { status }),
    })
      .then(({ data }) => {
        setDonations(data.donations);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setTotalRaised(data.totalRaised);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load donations'))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);
  useEffect(() => { setPage(1); }, [search, status]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900">Donations</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {total} total ·{' '}
            <span className="text-brand-600 font-semibold">{formatCurrency(totalRaised)} raised</span>
          </p>
        </div>
        <button
          onClick={() => exportCSV(donations)}
          className="btn-ghost border border-stone-200 text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor name, email, receipt…"
            className="input pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input py-2.5 text-sm w-auto"
        >
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Receipt', 'Donor', 'Campaign', 'Amount', 'Status', 'Date'].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wide
                      ${i === 2 ? 'hidden md:table-cell' : ''}
                      ${i === 5 ? 'hidden lg:table-cell' : ''}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-stone-400">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No donations found</p>
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d._id} className="hover:bg-stone-50 transition">
                    {/* Receipt */}
                    <td className="px-5 py-4 font-mono text-xs text-stone-400">
                      {d.receiptNumber}
                    </td>

                    {/* Donor */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-800">
                        {d.isAnonymous ? (
                          <em className="text-stone-400 not-italic">Anonymous</em>
                        ) : (
                          d.donorName || '—'
                        )}
                      </p>
                      <p className="text-xs text-stone-400">{d.donorEmail}</p>
                    </td>

                    {/* Campaign */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-stone-700 line-clamp-1 max-w-[180px]">
                        {d.campaign?.title || '—'}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-brand-600">
                        {formatCurrency(d.amount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`badge ${
                        d.status === 'completed' ? 'bg-green-100 text-green-700'  :
                        d.status === 'pending'   ? 'bg-amber-100 text-amber-700'  :
                        d.status === 'failed'    ? 'bg-red-100   text-red-700'    :
                        d.status === 'refunded'  ? 'bg-purple-100 text-purple-700' :
                                                   'bg-stone-100 text-stone-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-stone-400 hidden lg:table-cell">
                      {format(new Date(d.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-stone-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost text-sm border border-stone-200 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-stone-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost text-sm border border-stone-200 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
