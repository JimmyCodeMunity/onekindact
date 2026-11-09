import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CampaignCard from '../components/CampaignCard.jsx';
import SEO from '../components/SEO.jsx';
import { campaignApi } from '../api/index.js';
import { CATEGORIES } from '../lib/utils.js';

const SORTS = [
  { value: '-createdAt',    label: 'Newest'         },
  { value: 'urgent',        label: 'Most Urgent'    },
  { value: 'most_funded',   label: 'Most Funded'    },
  { value: 'almost_funded', label: 'Almost Funded'  },
];

const STATUSES = ['all', 'active', 'urgent', 'completed'];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [totalPages,setTotalPages]= useState(1);

  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [status,   setStatus]   = useState('all');
  const [sort,     setSort]     = useState('-createdAt');
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    const params = {
      page,
      limit: 9,
      sort,
      ...(search   && { search }),
      ...(category !== 'All'  && { category }),
      ...(status   !== 'all'  && { status }),
    };
    campaignApi.getAll(params)
      .then(({ data }) => {
        setCampaigns(data.campaigns);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, category, status, sort]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, status, sort]);

  const clearFilters = () => {
    setSearch(''); setCategory('All'); setStatus('all'); setSort('-createdAt');
  };
  const hasFilters = search || category !== 'All' || status !== 'all' || sort !== '-createdAt';

  return (
    <main className="min-h-screen bg-stone-50">
      <SEO
        title="All Campaigns — Browse & Donate"
        description={`Browse ${total} verified donation campaigns. Support medical aid, emergency relief, education, and more. 100% transparent with photographic proof of impact.`}
        keywords="donation campaigns, charity, medical aid, emergency relief, crowdfunding, transparent giving"
      />
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">All Campaigns</h1>
          <p className="text-stone-300 text-lg">Browse {total} verified stories and choose who to help today.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ─── Search & Filter Bar ───────────────────────────────────── */}
        <div className="card p-4 mb-8 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns…"
              className="input pl-9 py-2.5 text-sm"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="md:hidden btn-ghost border border-stone-200 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {/* Desktop filters */}
          <div className={`${filterOpen ? 'flex' : 'hidden'} md:flex flex-wrap gap-3 w-full md:w-auto`}>
            <select className="input py-2.5 text-sm w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select className="input py-2.5 text-sm w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            <select className="input py-2.5 text-sm w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost text-sm text-red-500 border border-red-200">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ─── Results count ─────────────────────────────────────────── */}
        <p className="text-stone-500 text-sm mb-6">
          Showing <span className="font-semibold text-stone-900">{campaigns.length}</span> of <span className="font-semibold text-stone-900">{total}</span> campaigns
        </p>

        {/* ─── Grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-52 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-100 rounded" />
                  <div className="h-2 bg-stone-100 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No campaigns found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
            {campaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)}
          </div>
        )}

        {/* ─── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost border border-stone-200 disabled:opacity-40 text-sm"
            >
              ← Prev
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const num = i + 1;
              if (Math.abs(num - page) > 2 && num !== 1 && num !== totalPages) {
                if (num === 2 || num === totalPages - 1) return <span key={num} className="px-1 text-stone-400">…</span>;
                return null;
              }
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    page === num ? 'bg-brand-500 text-white' : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {num}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost border border-stone-200 disabled:opacity-40 text-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
