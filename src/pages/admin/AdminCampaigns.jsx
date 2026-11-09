import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, Loader2, X } from 'lucide-react';
import { campaignApi } from '../../api/index.js';
import { formatCurrency, progressPercent, getCoverImage, STATUS_COLORS } from '../../lib/utils.js';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('all');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    campaignApi.getAll({
      page,
      limit: 10,
      ...(search && { search }),
      ...(status !== 'all' && { status }),
    }).then(({ data }) => {
      setCampaigns(data.campaigns);
      setTotalPages(data.totalPages);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);
  useEffect(() => { setPage(1); }, [search, status]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await campaignApi.delete(id);
      toast.success('Campaign deleted');
      setConfirmDelete(null);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900">Campaigns</h1>
          <p className="text-stone-500 text-sm mt-0.5">Manage all donation campaigns</p>
        </div>
        <Link to="/admin/campaigns/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="input pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input py-2.5 text-sm w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="urgent">Urgent</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wide">Campaign</th>
                <th className="text-left px-4 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wide hidden lg:table-cell">Progress</th>
                <th className="text-left px-4 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wide hidden md:table-cell">Created</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    No campaigns found. <Link to="/admin/campaigns/new" className="text-brand-500 hover:underline">Create one →</Link>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const pct = progressPercent(c.raisedAmount, c.targetAmount);
                  return (
                    <tr key={c._id} className="hover:bg-stone-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getCoverImage(c.images)}
                            alt={c.title}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 line-clamp-1">{c.title}</p>
                            <p className="text-xs text-stone-400 mt-0.5">{c.donorsCount ?? 0} donors</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="badge bg-stone-100 text-stone-600 text-xs">{c.category}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="min-w-[120px]">
                          <div className="flex justify-between text-xs text-stone-500 mb-1">
                            <span>{formatCurrency(c.raisedAmount)}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`badge ${STATUS_COLORS[c.status] || 'bg-stone-100 text-stone-600'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-stone-400 text-xs hidden md:table-cell">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <a
                            href={`/campaigns/${c.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition"
                            title="View public"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => navigate(`/admin/campaigns/edit/${c._id}`)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(c)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-500 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-stone-50">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm border border-stone-200 disabled:opacity-40">← Prev</button>
            <span className="px-4 py-2 text-sm text-stone-500">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-sm border border-stone-200 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Delete Campaign</h3>
                <p className="text-sm text-stone-500 mt-1">Are you sure you want to delete <strong>{confirmDelete.title}</strong>? This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1 border border-stone-200">Cancel</button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={!!deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
