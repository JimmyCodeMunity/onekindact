import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Shield, Eye, Zap, Flame, Star, AlertCircle } from 'lucide-react';
import CampaignCard from '../components/CampaignCard.jsx';
import SEO, { organizationSchema } from '../components/SEO.jsx';
import { campaignApi, analyticsApi } from '../api/index.js';
import { formatCurrency } from '../lib/utils.js';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function StatCard({ value, label }) {
  return (
    <div className="text-center p-6">
      <div className="text-3xl md:text-4xl font-heading font-bold text-brand-500 mb-1">{value}</div>
      <div className="text-stone-500 text-sm">{label}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-52 bg-stone-200 rounded-t-2xl" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-2/3" />
        <div className="h-2 bg-stone-100 rounded mt-2" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-stone-100 rounded w-1/3" />
          <div className="h-8 bg-stone-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label, title, to }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        {label && (
          <div className="flex items-center gap-2 mb-1.5">
            {icon}
            <span className="font-semibold text-sm uppercase tracking-wide">{label}</span>
          </div>
        )}
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-stone-900">{title}</h2>
      </div>
      {to && (
        <Link
          to={to}
          className="hidden md:flex items-center gap-1 text-brand-600 font-semibold text-sm hover:gap-2 transition-all"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [impact,       setImpact]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);

  useEffect(() => {
    Promise.all([
      // Fetch a generous batch so we can slice into sections client-side
      campaignApi.getAll({ sort: '-createdAt', limit: 12, status: 'active' }),
      analyticsApi.getPublicImpact(),
    ])
      .then(([c, i]) => {
        setAllCampaigns(c.data.campaigns || []);
        setImpact(i.data.impact);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Derive sections from the one batch
  const urgentCampaigns   = allCampaigns.filter((c) => c.isUrgent).slice(0, 3);
  const featuredCampaigns = allCampaigns.filter((c) => c.isFeatured).slice(0, 3);
  // "More" = everything not already shown above (deduped by _id), max 6
  const shownIds = new Set([...urgentCampaigns, ...featuredCampaigns].map((c) => c._id));
  const moreCampaigns = allCampaigns.filter((c) => !shownIds.has(c._id)).slice(0, 6);
  // Fallback: if no urgent / featured, show first 3 / next 3 from recent
  const displayFeatured = featuredCampaigns.length > 0 ? featuredCampaigns : allCampaigns.slice(0, 3);
  const displayMore     = moreCampaigns.length > 0     ? moreCampaigns     : allCampaigns.slice(3, 9);

  return (
    <>
      <SEO
        title="Direct Donation Platform — Verified Stories, Real Impact"
        description="Donate directly to verified people in critical need. Authentic photographic stories, 100% transparent delivery updates, and real-time impact tracking. No middlemen."
        jsonLd={organizationSchema()}
      />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-brand-900 text-white overflow-hidden min-h-[88vh] flex items-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 animate-fade-in">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-sm font-medium mb-6">
                <Heart className="w-4 h-4 fill-brand-400 text-brand-400" />
                Direct &amp; Transparent Giving
              </span>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance mb-6">
                One Kind Act<br />
                <span className="text-brand-400">Changes Everything</span>
              </h1>

              <p className="text-stone-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                We connect caring donors directly with verified individuals and families in critical need —
                with authentic photographic stories and transparent proof of impact.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/campaigns" className="btn-primary text-base py-3.5 px-8">
                  <Heart className="w-5 h-5" /> Give Now
                </Link>
                <a
                  href="#campaigns"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition"
                >
                  Browse Campaigns <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="#fafaf9" />
            </svg>
          </div>
        </section>

        {/* ── Impact Stats ───────────────────────────────────────────────── */}
        <section className="bg-stone-50" id="campaigns">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-1">
            <div className="card shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-100">
                <StatCard value={impact ? formatCurrency(impact.totalRaised) : '—'} label="Total Raised" />
                <StatCard value={impact?.totalDonors        ?? '—'} label="Generous Donors" />
                <StatCard value={impact?.verifiedCauses     ?? '—'} label="Verified Causes" />
                <StatCard value={impact?.communitiesReached ?? '—'} label="Communities Reached" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Error state ────────────────────────────────────────────────── */}
        {error && (
          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="card p-8 text-center text-stone-400 border border-amber-200 bg-amber-50">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="font-medium text-stone-700">Could not load campaigns — is the backend running?</p>
                <p className="text-sm mt-1">Start it with <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-700">cd backend &amp;&amp; npm run dev</code></p>
              </div>
            </div>
          </section>
        )}

        {/* ── Urgent Campaigns ───────────────────────────────────────────── */}
        {(loading || urgentCampaigns.length > 0) && (
          <section className="py-16 bg-red-50/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                icon={<Flame className="w-5 h-5 text-red-500 animate-pulse" />}
                label={<span className="text-red-600">Urgent — Act Now</span>}
                title="These Families Can't Wait"
                to="/campaigns"
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                  ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
                  : urgentCampaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)
                }
              </div>
            </div>
          </section>
        )}

        {/* ── Featured Campaigns ─────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              icon={<Star className="w-5 h-5 text-brand-500" />}
              label={<span className="text-brand-600">Featured</span>}
              title="Stories Waiting for One Kind Act"
              to="/campaigns"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
                : displayFeatured.length > 0
                  ? displayFeatured.map((c) => <CampaignCard key={c._id} campaign={c} />)
                  : (
                    <div className="col-span-full text-center py-12 text-stone-400">
                      <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No campaigns yet — <Link to="/admin/campaigns/new" className="text-brand-500 hover:underline">create the first one</Link></p>
                    </div>
                  )
              }
            </div>
          </div>
        </section>

        {/* ── Trust Pillars ──────────────────────────────────────────────── */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-stone-900 mb-3">Why OneKindAct?</h2>
              <p className="text-stone-500 max-w-xl mx-auto">
                We believe in radical transparency. Every donation goes directly to a verified person,
                with photographic proof of delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Shield className="w-7 h-7 text-brand-500" />, title: 'Verified & Direct',   desc: 'Every beneficiary is personally verified. Your donation goes directly to them — no middle-men, no overhead.' },
                { icon: <Eye    className="w-7 h-7 text-brand-500" />, title: '100% Transparent',    desc: 'We post photographic updates of every delivery, so you see exactly how your generosity changes lives.' },
                { icon: <Zap    className="w-7 h-7 text-brand-500" />, title: 'Immediate Impact',    desc: 'Funds are dispatched the same day a campaign hits its goal — no waiting, no bureaucracy.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="card p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">{icon}</div>
                  <h3 className="font-heading font-bold text-stone-900 text-lg mb-2">{title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── More Campaigns ─────────────────────────────────────────────── */}
        {(loading || displayMore.length > 0) && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <SectionHeader
                title="More Campaigns"
                to="/campaigns"
              />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                  ? [1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)
                  : displayMore.map((c) => <CampaignCard key={c._id} campaign={c} />)
                }
              </div>
              <div className="text-center mt-10">
                <Link to="/campaigns" className="btn-secondary">
                  Browse all campaigns <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── CTA Banner ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-r from-brand-500 to-brand-700 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <Heart className="w-12 h-12 mx-auto mb-4 fill-white opacity-80" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Your next act of kindness is one click away.
            </h2>
            <p className="text-brand-100 mb-8">
              Join thousands of donors making a real, documented difference in people's lives today.
            </p>
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-white text-brand-600 hover:bg-brand-50 transition shadow-lg"
            >
              <Heart className="w-5 h-5 fill-brand-500 text-brand-500" /> Start Giving
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
