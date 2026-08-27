import React from 'react';
import { VisaRequirement, OFFICIAL_VISA_DISCLAIMER } from '../data/visaRequirementsData';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import {
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
} from '../lib/seo';
import {
  ShieldCheck,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Building,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface VisaSeoDetailViewProps {
  visa: VisaRequirement;
  onNavigateToView: (view: string, extra?: any) => void;
  onOpenVisaQuote: (country: string) => void;
}

export const VisaSeoDetailView: React.FC<VisaSeoDetailViewProps> = ({
  visa,
  onNavigateToView,
  onOpenVisaQuote,
}) => {
  const visaUrl = `/visa/${visa.id}`;
  const canonicalUrl = `${SITE_URL}${visaUrl}`;

  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Visa Requirements', url: '/visa' },
      { name: `${visa.country} Visa`, url: visaUrl },
    ]),
    getFAQSchema(visa.faqs || []),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title={visa.seoTitle || `${visa.country} Visa Requirements for Bangladeshi Citizens – AzraqTrips`}
        description={visa.metaDescription || `Official ${visa.country} visa requirements for Bangladeshi passport holders. Check fees, processing time, bank balance, and required documents.`}
        canonical={canonicalUrl}
        keywords={[
          `${visa.country} visa for Bangladeshi`,
          `${visa.country} visa requirements Dhaka`,
          `${visa.country} visa fee in BDT`,
          `${visa.country} eVisa Bangladesh`,
          `${visa.country} embassy Dhaka visa processing`,
        ]}
        structuredData={structuredData}
      />

      {/* Header Banner */}
      <header className="bg-gradient-to-b from-[#002B66] to-[#0759B8] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'Visa Guide', onClick: () => onNavigateToView('visa') },
              { name: `${visa.country} Visa` },
            ]}
            className="text-white/80 mb-4"
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Visa Information for Bangladeshi Citizens</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {visa.title || `${visa.country} Visa Requirements`}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed">
            {visa.metaDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-300" />
              <span>Last Verified: {visa.lastUpdated || 'August 2026'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Processing Time: {visa.processingTime || '3–5 Working Days'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-8">
        {/* Quick Highlights Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Visa Type</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{visa.visaType}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Validity / Stay</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{visa.validity || '30–90 Days'}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Total Est. Cost</p>
            <p className="text-xs sm:text-sm font-bold text-[#0759B8] mt-0.5 font-mono">{visa.totalEstimatedBDT || visa.governmentFeeBDT || 'Contact'}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Min Bank Balance</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{visa.minimumBankBalanceBDT || visa.minBankBalance || 'BDT 100,000+'}</p>
          </div>
        </div>

        {/* Application Submission Center */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D6EFD]">
              <Building className="w-4 h-4" />
              <span>Submission Center in Bangladesh</span>
            </div>
            {visa.lastUpdated && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Verified: {visa.lastUpdated}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900">{visa.submissionCenter || 'Authorized Embassy / VFS Centre in Dhaka'}</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Applications for Bangladeshi citizens are processed either online (official e-Visa portal) or via authorized VAC centres / official embassy in Dhaka.
          </p>
          {visa.officialSourceUrl && (
            <div className="pt-1">
              <a
                href={visa.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#0759B8] hover:text-[#064B9C] font-bold hover:underline"
              >
                <span>Official Consular Authority: {visa.officialAuthorityName || 'Official Immigration Website'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Required Documents Checklist */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0D6EFD]" />
            <span>Required Documents Checklist (Bangladeshi Passport)</span>
          </h2>
          <div className="space-y-3">
            {(visa.requiredDocuments || visa.generalRequirements || []).map((doc: any, idx: number) => {
              const name = typeof doc === 'string' ? doc : doc.name || '';
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0D6EFD] shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{name}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Photo & Passport Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">📸 Photo Specification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{visa.photoSpec || 'Standard passport photo (35mm x 45mm, white background).'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">🛂 Passport Validity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{visa.passportValidity || 'Minimum 6 months validity from travel date.'}</p>
          </div>
        </div>

        {/* Professional Visa Support CTA Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#002B66] to-[#0759B8] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AzraqTrips Visa Assistance</span>
            </div>
            <h3 className="text-xl font-bold">Need Help with Your {visa.country} Visa?</h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-md">
              Our Dhaka-based visa specialists provide document vetting, appointment booking, hotel/flight itineraries, and full file preparation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenVisaQuote(visa.country)}
            className="px-6 py-3.5 rounded-xl bg-white text-[#002B66] font-extrabold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-lg shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Request Visa Support</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* FAQs */}
        {visa.faqs && visa.faqs.length > 0 && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <span>Frequently Asked Questions ({visa.country} Visa)</span>
            </h2>
            <div className="space-y-4">
              {visa.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Official Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> {visa.disclaimer || OFFICIAL_VISA_DISCLAIMER}
          </p>
        </div>
      </main>
    </div>
  );
};
