import { Helmet } from 'react-helmet-async';

const SITE_NAME  = 'OneKindAct';
const SITE_URL   = typeof window !== 'undefined' ? window.location.origin : 'https://onekindact.org';
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop';
const DEFAULT_DESC = 'Donate directly to verified people in need. Authentic photographic documentation, 100% transparent delivery updates, and real impact tracking.';

/**
 * SEO component — drop into any page.
 *
 * Props:
 *  title        – page title (will append "| OneKindAct")
 *  description  – meta description (max ~155 chars)
 *  image        – og:image URL
 *  url          – canonical URL (defaults to current)
 *  type         – og:type (default "website", use "article" for campaigns)
 *  keywords     – string of comma-separated keywords
 *  jsonLd       – any valid JSON-LD object to inject as structured data
 *  noIndex      – set true for admin pages
 */
export default function SEO({
  title,
  description = DEFAULT_DESC,
  image       = DEFAULT_IMG,
  url,
  type        = 'website',
  keywords    = 'direct donation, charity, crowdfunding, medical aid, emergency relief, transparent charity',
  jsonLd,
  noIndex     = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Direct, Transparent Giving`;
  const canonical = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const ogImage   = image || DEFAULT_IMG;

  return (
    <Helmet>
      {/* ── Basic ─────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description"        content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical"           href={canonical} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* ── Open Graph (Facebook / LinkedIn / WhatsApp) ────────── */}
      <meta property="og:type"        content={type} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height"content="630" />
      <meta property="og:url"         content={canonical} />

      {/* ── Twitter Card ──────────────────────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@onekindact" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* ── JSON-LD Structured Data ───────────────────────────── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// ─── JSON-LD helpers ──────────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type':    'NonprofitOrganization',
    name:       'OneKindAct',
    url:        'https://onekindact.org',
    logo:       'https://onekindact.org/logo.png',
    description: DEFAULT_DESC,
    email:      'support@onekindact.org',
    sameAs: [
      'https://twitter.com/onekindact',
      'https://facebook.com/onekindact',
      'https://instagram.com/onekindact',
    ],
  };
}

export function campaignSchema(campaign, baseUrl = 'https://onekindact.org') {
  const coverImage = campaign.images?.find((i) => i.isCover)?.url || campaign.images?.[0]?.url || DEFAULT_IMG;
  return {
    '@context':   'https://schema.org',
    '@type':      'DonateAction',
    name:         campaign.title,
    description:  campaign.summary,
    url:          `${baseUrl}/campaigns/${campaign.slug}`,
    image:        coverImage,
    recipient: {
      '@type': 'Person',
      name:    campaign.beneficiary?.name,
      address: {
        '@type':           'PostalAddress',
        addressLocality:   campaign.beneficiary?.location,
      },
    },
    potentialAction: {
      '@type': 'DonateAction',
      target:  `${baseUrl}/campaigns/${campaign.slug}`,
    },
  };
}

export function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      crumb.name,
      item:      crumb.url,
    })),
  };
}
