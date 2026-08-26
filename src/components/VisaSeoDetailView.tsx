import React from 'react';
import { VisaRequirement } from '../data/visaRequirementsData';
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
  Phone,
  Plane,
  Building,
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
    getFAQSchema(visa.faqs),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title={visa.seoTitle}
        description={visa.metaDescription}
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
            {visa.title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed">
            {visa.metaDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-300" />
              <span>Last Verified: {visa.lastUpdated}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Processing Time: {visa.processingTime}</span>
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
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{visa.validity}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Embassy / Gov Fee</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{visa.governmentFeeBDT}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Required Bank Balance</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{visa.minimumBankBalanceBDT}</p>
          </div>
        </div>

        {/* Application Submission Center */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D6EFD] mb-2">
            <Building className="w-4 h-4" />
            <span>Submission Center in Bangladesh</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{visa.submissionCenter}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Applications for Bangladeshi citizens are processed either online (e-Visa portal) or via authorized VAC centres / official embassy in Dhaka.
          </p>
        </div>

        {/* Required Documents Checklist */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0D6EFD]" />
            <span>Required Documents Checklist (Bangladeshi Passport)</span>
          </h2>
          <div className="space-y-3">
            {visa.requiredDocuments?.map((doc: any, idx: number) => {
              const name = typeof doc === 'string' ? doc : doc.name || '';
              const details = typeof doc === 'string' ? '' : doc.details || '';
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0D6EFD] shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{name}</h3>
                    {details && <p className="text-xs text-slate-600 mt-0.5">{details}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step-by-Step Application Process */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Step-by-Step Application Guide</span>
          </h2>
          <div className="space-y-4">
            {visa.stepsToApply.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </section>

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

        {/* Official Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> {visa.disclaimer}
          </p>
        </div>
      </main>
    </div>
  );
};
