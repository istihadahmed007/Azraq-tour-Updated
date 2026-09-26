import React, { useId } from 'react';
import { Car, ExternalLink, Smartphone, Ticket } from 'lucide-react';
import { getAffiliateLink, trackAffiliateClick, type AffiliateBrand } from '../data/agencyConfig';

type PartnerCategory = 'esim' | 'transfers' | 'activities';

const partnerGroups: {
  category: PartnerCategory;
  title: string;
  icon: typeof Car;
  brands: { brand: AffiliateBrand; label: string }[];
}[] = [
  { category: 'esim', title: 'Travel eSIM', icon: Smartphone, brands: [
    { brand: 'airalo', label: 'Airalo eSIM' },
    { brand: 'yesim', label: 'Yesim eSIM' },
  ] },
  { category: 'transfers', title: 'Airport transfers', icon: Car, brands: [
    { brand: 'kiwitaxi', label: 'Kiwitaxi transfers' },
    { brand: 'gettransfer', label: 'GetTransfer rides' },
  ] },
  { category: 'activities', title: 'Things to do', icon: Ticket, brands: [
    { brand: 'klook', label: 'Browse Klook activities' },
  ] },
];

interface PartnerQuickLinksProps {
  placement: string;
  title?: string;
  description?: string;
  categories?: readonly PartnerCategory[];
  dark?: boolean;
  showFlightAlternative?: boolean;
  className?: string;
}

/** Compact partner shortcuts for readers who do not reach the full essentials section. */
export function PartnerQuickLinks({
  placement,
  title = 'Plan the rest of your trip',
  description = 'Choose your destination and check coverage, prices and availability on the partner website.',
  categories = ['esim', 'transfers', 'activities'],
  dark = false,
  showFlightAlternative = false,
  className = '',
}: PartnerQuickLinksProps) {
  const headingId = useId();
  const groups = partnerGroups.filter(group => categories.includes(group.category));
  const linkClassName = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
    dark
      ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700'
      : 'border-slate-200 bg-white text-slate-900 hover:border-sky-400 hover:bg-sky-50'
  }`;
  const renderLink = (brand: AffiliateBrand, label: string) => {
    const subId = `${placement}_${brand}`.replace(/[^a-zA-Z0-9_]/g, '_');
    return (
      <a key={brand} href={getAffiliateLink(brand, subId)} target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        onClick={() => trackAffiliateClick(brand, subId)} className={linkClassName}>
        <span>{label}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  };

  return (
    <section aria-labelledby={headingId} className={`rounded-2xl border p-4 sm:p-5 ${
      dark ? 'border-slate-700 bg-slate-900 text-white' : 'border-white/70 bg-white/95 text-slate-900 shadow-sm'
    } ${className}`}>
      <h2 id={headingId} className="text-base font-bold sm:text-lg">{title}</h2>
      <p className={`mt-1 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
      <div className={`mt-4 grid gap-4 ${groups.length > 1 ? 'sm:grid-cols-3' : ''}`}>
        {groups.map(({ category, title: groupTitle, icon: Icon, brands }) => (
          <div key={category} className="min-w-0">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-sky-500" aria-hidden="true" />{groupTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {brands.map(({ brand, label }) => renderLink(brand, label))}
            </div>
          </div>
        ))}
      </div>
      {showFlightAlternative && (
        <div className="mt-4">{renderLink('aviasales', 'Alternative flight search on Aviasales')}</div>
      )}
      <p className={`mt-3 text-xs leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        Affiliate links: Azraq Trips may earn a commission on qualifying purchases at no extra cost to you.
      </p>
    </section>
  );
}
