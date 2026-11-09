import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, TrendingUp, Users, Megaphone,
  CheckCircle, Zap, Cloud, CreditCard, ArrowRight
} from 'lucide-react';
import { analyticsApi } from '../../api/index.js';
import { formatCurrency, getCoverImage, STATUS_COLORS } from '../../lib/utils.js';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ label, value, sub, icon: Icon, color = 'brand' }) {
  const colors = {
    brand:  { bg: 'bg-brand-50',  text: 'text-brand-600',  icon: 'bg-brand-100'  },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  icon: 'bg-green-100'  },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100'   },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
  };
  const c = colors[color] || colors.brand;

  return (
    <div className={`card p-5 ${c.bg} border-0`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
      {sub && <p className="text-xs text-stone-400">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDashboard()
      .then(({ data: d }) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-stone-100" />)}
        </div>
        <div className="h-72 rounded-2xl bg-stone-100" />
      </div>
    );
  }

  const { stats, monthlyTrends, categoryStats, recentDonations, recentCampaigns } = data || {};

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-0.5">Platform overview & analytics</p>
        </div>
        <Link to="/admin/campaigns/new" className="btn-primary text-sm py-2.5 px-5">
          + New Campaign
        </Link>
      </div>

      {/* ─── Stats Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Raised"     value={formatCurrency(stats?.totalRaised ?? 0)}     icon={DollarSign}  color="brand"  sub={`Avg ${formatCurrency(stats?.avgDonation ?? 0)}/donation`} />
        <StatCard label="Total Donations"  value={stats?.totalDonationsCount ?? 0}              icon={CreditCard}  color="green"  />
        <StatCard label="Active Campaigns" value={stats?.activeCampaigns ?? 0}                  icon={TrendingUp}  color="blue"   sub={`${stats?.totalCampaigns ?? 0} total`} />
        <StatCard label="Completed"        value={stats?.completedCampaigns ?? 0}               icon={CheckCircle} color="purple" />
      </div>

      {/* ─── System Status ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium ${stats?.systemStatus?.cloudinaryConnected ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          <Cloud className="w-4 h-4" />
          Cloudinary: {stats?.systemStatus?.cloudinaryConnected ? '✓ Connected' : '⚠ Not configured (local fallback)'}
        </div>
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium ${stats?.systemStatus?.stripeLiveMode ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
          <Zap className="w-4 h-4" />
          Stripe: {stats?.systemStatus?.stripeLiveMode ? '✓ Live Mode' : '🧪 Sandbox / Test Mode'}
        </div>
      </div>

      {/* ─── Charts row ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-stone-800 mb-4">Donation Trends (6 months)</h2>
          {monthlyTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2.5} fill="url(#grad)" dot={{ r: 4, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-stone-400 text-sm">No trend data yet</div>
          )}
        </div>

        {/* Category bar chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-stone-800 mb-4">Campaigns by Category</h2>
          {categoryStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryStats} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ef" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="_id" type="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#fb923c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-stone-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* ─── Recent tables ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent donations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Recent Donations</h2>
            <Link to="/admin/donations" className="text-brand-500 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentDonations?.length > 0 ? (
            <ul className="space-y-3">
              {recentDonations.map((d) => (
                <li key={d._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                    {d.donorName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{d.donorName}</p>
                    <p className="text-xs text-stone-400 truncate">{d.campaign?.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-brand-600">{formatCurrency(d.amount)}</p>
                    <p className="text-xs text-stone-400">{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-stone-400 text-sm text-center py-6">No donations yet</p>}
        </div>

        {/* Recent campaigns */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Recent Campaigns</h2>
            <Link to="/admin/campaigns" className="text-brand-500 text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentCampaigns?.length > 0 ? (
            <ul className="space-y-3">
              {recentCampaigns.map((c) => (
                <li key={c._id} className="flex items-center gap-3">
                  <img
                    src={getCoverImage(c.images)}
                    alt={c.title}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{c.title}</p>
                    <p className="text-xs text-stone-400">{formatCurrency(c.raisedAmount)} raised · {c.donorsCount} donors</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-stone-400 text-sm text-center py-6">No campaigns yet</p>}
        </div>
      </div>
    </div>
  );
}
