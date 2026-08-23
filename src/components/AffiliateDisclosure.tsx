import React from 'react';
import { ShieldCheck, Info, MessageCircle, ExternalLink } from 'lucide-react';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';

interface AffiliateDisclosureProps {
  variant?: 'inline' | 'compact' | 'card';
  className?: string;
}

export const AffiliateDisclosure: React.FC<AffiliateDisclosureProps> = ({
  variant = 'inline',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-500 font-normal ${className}`}>
        <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <p className="leading-relaxed">
          Flight search and booking services are provided through our travel partners. We may earn a commission when you complete a booking through our affiliate links.
        </p>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                Official Travel Partner & Affiliate Disclosure
              </h4>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Official Partner
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {AZRAQ_AGENCY_CONFIG.officialAffiliateDisclosure}
            </p>
            <p className="text-xs text-slate-500 pt-1 flex items-center gap-2">
              <span>Need visa assistance or offline group flight bookings?</span>
              <a
                href={`https://wa.me/${AZRAQ_AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  'Hello Azraq Concierge! I need assistance with flights and visa from Dhaka.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat with Dhaka Desk</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-sky-50/60 border border-sky-200/70 text-xs text-slate-700 flex items-center justify-between gap-4 flex-wrap shadow-2xs font-sans ${className}`}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
        <Info className="w-4 h-4 text-sky-600 shrink-0" />
        <p className="leading-relaxed font-normal text-slate-600">
          {AZRAQ_AGENCY_CONFIG.officialAffiliateDisclosure}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs font-medium text-slate-600 shrink-0">
        <span className="text-slate-500">Powered by <strong>Aviasales / Travelpayouts</strong></span>
        <span className="text-slate-300">•</span>
        <a
          href={AZRAQ_AGENCY_CONFIG.aviasalesAffiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1 hover:underline underline-offset-2 transition-colors cursor-pointer"
        >
          <span>Partner Gateway</span>
          <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
        </a>
      </div>
    </div>
  );
};

