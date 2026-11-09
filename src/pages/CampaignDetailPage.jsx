import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MapPin, Users, Calendar, ArrowLeft, Clock } from 'lucide-react';
import { campaignApi } from '../api/index.js';
import { formatCurrency, progressPercent, getCoverImage, STATUS_COLORS } from '../lib/utils.js';
import DonationModal from '../components/DonationModal.jsx';
import SEO, { campaignSchema, breadcrumbSchema } from '../components/SEO.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function CampaignDetailPage() {
  const { slug } = useParams();
  const [campaign, setCampaign]             = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [notFound, setNotFound]             = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [activeImg, setActiveImg]           = useState(0);

  useEffect(() => {
    campaignApi.getBySlug(slug)
      .then(({ data }) => {
        setCampaign(data.campaign);
        setRecentDonations(data.recentDonations || []);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-500">
        <p className="text-2xl font-heading font-bold">Campaign not found</p>
        <Link to="/campaigns" className="btn-primary">← Browse campaigns</Link>
      </div>
    );
  }

  const pct = progressPercent(campaign.raisedAmount, campaign.targetAmount);
  const images = campaign.images ?? [];

  return (
    <>
      {campaign && (
        <SEO
          title={campaign.seo?.metaTitle || campaign.title}
          description={campaign.seo?.metaDescription || campaign.summary}
          image={campaign.seo?.ogImage || getCoverImage(campaign.images)}
          url={`${window.location.origin}/campaigns/${campaign.slug}`}
          type="article"
          keywords={[
            campaign.category,
            campaign.beneficiary?.location,
            ...(campaign.seo?.keywords || []),
            'donation', 'charity', 'direct giving',
          ].filter(Boolean).join(', ')}
          jsonLd={{
            '@graph': [
              campaignSchema(campaign, window.location.origin),
              breadcrumbSchema([
                { name: 'Home',      url: window.location.origin },
                { name: 'Campaigns', url: `${window.location.origin}/campaigns` },
                { name: campaign.title, url: `${window.location.origin}/campaigns/${campaign.slug}` },
              ]),
            ],
          }}
        />
      )}
      <main className="min-h-screen bg-stone-50 pb-20">
        {/* Back */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <Link to="/campaigns" className="btn-ghost text-sm -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to campaigns
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 grid lg:grid-cols-3 gap-8 items-start">
          {/* ─── Left: Story ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-72 md:h-96">
                <img
                  src={images[activeImg]?.url || getCoverImage(images)}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                <div className="absolute top-4 left-4 flex gap-2">
                  {campaign.isUrgent && <span className="badge bg-red-500 text-white animate-pulse-slow">🚨 Urgent</span>}
                  <span className={`badge ${STATUS_COLORS[campaign.status] || ''}`}>{campaign.status}</span>
                </div>

                <span className="absolute bottom-4 right-4 badge bg-black/60 text-white">{campaign.category}</span>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        i === activeImg ? 'border-brand-500' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Story */}
            <div className="card p-6 md:p-8">
              <h1 className="font-heading text-3xl font-bold text-stone-900 mb-2">{campaign.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-6">
                {campaign.beneficiary?.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{campaign.beneficiary.location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                </span>
              </div>

              <p className="text-stone-600 font-medium mb-4 leading-relaxed">{campaign.summary}</p>

              <div className="prose prose-stone max-w-none text-stone-700 whitespace-pre-line leading-relaxed">
                {campaign.story}
              </div>
            </div>

            {/* Updates */}
            {campaign.updates?.length > 0 && (
              <div className="card p-6 md:p-8">
                <h2 className="font-heading text-xl font-bold text-stone-900 mb-5">📰 Progress Updates</h2>
                <div className="space-y-6">
                  {campaign.updates.map((update) => (
                    <div key={update._id} className="border-l-4 border-brand-400 pl-5">
                      <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(update.postedAt), { addSuffix: true })}
                        {update.amountSpent > 0 && (
                          <span className="badge bg-green-100 text-green-700 ml-2">
                            {formatCurrency(update.amountSpent)} spent
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-stone-800 mb-1">{update.title}</h3>
                      <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{update.content}</p>
                      {update.images?.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                          {update.images.map((img, i) => (
                            <img key={i} src={img.url} alt={img.caption || ''} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Sticky donation sidebar ──────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* Donation widget */}
            <div className="card p-6">
              <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-3xl font-bold text-brand-600">{formatCurrency(campaign.raisedAmount)}</span>
                  <span className="text-stone-400 text-sm">of {formatCurrency(campaign.targetAmount)}</span>
                </div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-stone-500 mt-1">
                  <span className="font-semibold text-brand-500">{pct}% funded</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {campaign.donorsCount ?? 0} donors</span>
                </div>
              </div>

              {campaign.status !== 'completed' ? (
                <button onClick={() => setShowModal(true)} className="btn-primary w-full py-4 text-base">
                  <Heart className="w-5 h-5 fill-white" /> Donate Now
                </button>
              ) : (
                <div className="text-center py-4 rounded-xl bg-green-50 text-green-700 font-semibold">
                  ✅ Fully funded — thank you!
                </div>
              )}
            </div>

            {/* Beneficiary */}
            {campaign.beneficiary && (
              <div className="card p-6">
                <h3 className="font-semibold text-stone-900 mb-3">About the Beneficiary</h3>
                <div className="space-y-1 text-sm text-stone-600">
                  <p><span className="font-medium">Name: </span>{campaign.beneficiary.name}</p>
                  {campaign.beneficiary.age && <p><span className="font-medium">Age: </span>{campaign.beneficiary.age}</p>}
                  {campaign.beneficiary.location && <p><span className="font-medium">Location: </span>{campaign.beneficiary.location}</p>}
                  {campaign.beneficiary.situation && <p className="mt-2 text-stone-500 leading-relaxed">{campaign.beneficiary.situation}</p>}
                </div>
              </div>
            )}

            {/* Recent donors */}
            {recentDonations.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-stone-900 mb-3">Recent Donations</h3>
                <ul className="space-y-3">
                  {recentDonations.map((d) => (
                    <li key={d._id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-stone-700">{d.isAnonymous ? 'Anonymous' : d.donorName}</p>
                        {d.message && <p className="text-stone-400 text-xs italic line-clamp-1">{d.message}</p>}
                      </div>
                      <span className="font-semibold text-brand-500 flex-shrink-0 ml-2">{formatCurrency(d.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && <DonationModal campaign={campaign} onClose={() => setShowModal(false)} />}
    </>
  );
}
