import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function progressPercent(raised, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

export function getCoverImage(images) {
  if (!images?.length) return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop';
  const cover = images.find((img) => img.isCover);
  return cover?.url || images[0]?.url;
}

export const CATEGORIES = [
  'All',
  'Medical Aid',
  'Emergency Relief',
  'Food & Essentials',
  'Shelter & Housing',
  'Children & Education',
  'Elderly Care',
  'Disability Support',
  'Community Projects',
];

export const STATUS_COLORS = {
  active:    'bg-green-100 text-green-700',
  urgent:    'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  paused:    'bg-stone-100 text-stone-600',
};
