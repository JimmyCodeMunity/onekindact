import { Link } from 'react-router-dom';
import { Heart, MapPin, Users } from 'lucide-react';
import { formatCurrency, progressPercent, getCoverImage, STATUS_COLORS } from '../lib/utils.js';

export default function CampaignCard({ campaign }) {
  const pct = progressPercent(campaign.raisedAmount, campaign.targetAmount);

  return (
    <article className="card-hover flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={getCoverImage(campaign.images)}
          alt={campaign.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {campaign.isUrgent && (
            <span className="badge bg-red-500 text-white text-xs animate-pulse-slow">🚨 Urgent</span>
          )}
          {campaign.isFeatured && (
            <span className="badge bg-brand-500 text-white text-xs">⭐ Featured</span>
          )}
        </div>

        <span className={`absolute top-3 right-3 badge ${STATUS_COLORS[campaign.status] || STATUS_COLORS.active}`}>
          {campaign.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-heading font-semibold text-stone-900 text-lg leading-snug line-clamp-2 mb-1">
          {campaign.title}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 mb-3 flex-1">{campaign.summary}</p>

        <div className="flex items-center gap-1 text-stone-400 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{campaign.beneficiary?.location}</span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="progress-bar mb-1">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-stone-500">
            <span className="font-semibold text-brand-600">{formatCurrency(campaign.raisedAmount)}</span>
            <span>of {formatCurrency(campaign.targetAmount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-stone-400 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{campaign.donorsCount ?? 0} donors</span>
          </div>
          <Link
            to={`/campaigns/${campaign.slug}`}
            className="btn-primary text-sm py-2 px-4"
          >
            <Heart className="w-3.5 h-3.5" /> Give
          </Link>
        </div>
      </div>
    </article>
  );
}
