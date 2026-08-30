import React from 'react';
import { FileCheck2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface VisaAssistanceSectionProps {
  onOpenVisaModal?: (country?: string) => void;
  onNavigateToVisa?: () => void;
}

export const VisaAssistanceSection: React.FC<VisaAssistanceSectionProps> = ({
  onOpenVisaModal,
  onNavigateToVisa,
}) => {
  const topCountries = [
    { name: 'Thailand', type: 'Sticker / eVisa', processing: '3-5 Working Days', fee: 'BDT 6,250' },
    { name: 'Malaysia', type: 'Single / Multiple eVisa', processing: '3-5 Working Days', fee: 'BDT 5,000' },
    { name: 'China', type: 'Single / Multi Entry Sticker', processing: '5-15 Working Days', fee: 'BDT 10,000' },
    { name: 'Singapore', type: 'E-Visa Assistance', processing: '5-7 Working Days', fee: 'BDT 6,500' },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#073B4C] via-[#086788] to-[#073B4C] text-white p-6 sm:p-10 shadow-xl border border-[#17BEBB]/20 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17BEBB]/20 text-[#EAF7F8] border border-[#17BEBB]/30 text-xs font-bold tracking-wide uppercase font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#17BEBB]" />
              <span>Bangladeshi Passport Assistance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white font-serif-display">
              Hassle-Free Visa Guidance & Document Prep
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-inter">
              We guide you through bank statement requirements, employer NOCs, invitation letters, photo dimensions, and embassy appointment scheduling with full transparency.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToVisa) onNavigateToVisa();
                else if (onOpenVisaModal) onOpenVisaModal();
              }}
              className="btn-coral-primary !min-h-[48px] !px-6 !py-3 !text-sm !rounded-2xl"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Check All Country Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top 4 Popular Visa Countries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCountries.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="text-sm font-bold text-white font-inter">{c.name}</h3>
                <p className="text-xs text-[#17BEBB] font-medium mt-0.5 font-inter">{c.type}</p>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300 border-t border-white/10 pt-2.5 font-inter">
                <div className="flex justify-between">
                  <span className="text-slate-300">Processing:</span>
                  <span className="font-semibold text-white">{c.processing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Standard Rate:</span>
                  <span className="font-semibold text-[#EAF7F8]">{c.fee}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenVisaModal) onOpenVisaModal(c.name);
                  else if (onNavigateToVisa) onNavigateToVisa();
                }}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#EAF7F8] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer font-inter"
              >
                <span>Check Checklist</span>
                <ArrowRight className="w-3 h-3 text-[#17BEBB]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
