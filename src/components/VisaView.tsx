import React, { useState } from 'react';
import {
  CANONICAL_COUNTRY_VISAS,
  CanonicalCountryVisa,
  VisaCategoryVariant,
  OFFICIAL_VISA_DISCLAIMER
} from '../data/visaRequirementsData';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Building,
  ExternalLink,
  Calendar,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { getBreadcrumbSchema, SITE_URL } from '../lib/seo';

interface VisaViewProps {
  onOpenVisaQuote: (country?: string) => void;
}

export const VisaView: React.FC<VisaViewProps> = ({ onOpenVisaQuote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CanonicalCountryVisa>(CANONICAL_COUNTRY_VISAS[0]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(CANONICAL_COUNTRY_VISAS[0].primaryCategory.id);
  const [activeTab, setActiveTab] = useState<'general' | 'job' | 'business' | 'student'>('general');

  const filteredCountries = CANONICAL_COUNTRY_VISAS.filter(
    (item) =>
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryCategory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryCategory.entryType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine current active variant data
  const currentVariant: VisaCategoryVariant =
    selectedCountry.availableVariants?.find((v) => v.id === selectedVariantId) ||
    selectedCountry.primaryCategory;

  const canonicalUrl = `${SITE_URL}/visa`;

  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Visa Assistance', url: '/visa' },
    ]),
  ];

  const handleSelectCountry = (country: CanonicalCountryVisa) => {
    setSelectedCountry(country);
    setSelectedVariantId(country.primaryCategory.id);
    setActiveTab('general');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fadeIn">
      <SEOHead
        title="Tourist Visa Assistance for Bangladeshi Citizens – AzraqTrips"
        description="Official tourist visa requirements, bank solvency guidelines, embassy fees, and step-by-step document preparation for Bangladeshi passport holders traveling from Dhaka."
        canonical={canonicalUrl}
        keywords={[
          'Tourist visa Bangladesh',
          'Malaysia visa Dhaka',
          'Thailand visa VFS Bangladesh',
          'Singapore eVisa Dhaka',
          'Japan visa Bangladesh',
          'Dubai visa processing BD',
        ]}
        structuredData={structuredData}
      />

      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Visa Assistance' },
        ]}
      />

      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7FF] border border-[#CDE9FB] text-[#0759B8] text-xs font-bold uppercase tracking-wider">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Official Visa & Embassy Guidance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#12304A] tracking-tight font-poppins">
          Visa Assistance for Bangladeshi Travelers
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Accurate documentation checklists, bank solvency rules, embassy fee breakdowns, and end-to-end submission support for Bangladeshi passport holders.
        </p>
      </div>

      {/* 3 Step Process Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white border border-[#E1EFF8] shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#EAF7FF] text-[#0759B8] font-black flex items-center justify-center shrink-0 text-sm">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#12304A]">Choose Destination</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select from top countries visited by Bangladeshi tourists and business travelers.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#EAF7FF] text-[#0759B8] font-black flex items-center justify-center shrink-0 text-sm">
            2
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#12304A]">Verify Requirements</h3>
            <p className="text-xs text-slate-500 mt-0.5">Check official embassy fees, 6-month bank statement rules, and occupation checklists.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#EAF7FF] text-[#0759B8] font-black flex items-center justify-center shrink-0 text-sm">
            3
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#12304A]">Hassle-Free Submission</h3>
            <p className="text-xs text-slate-500 mt-0.5">Our Dhaka visa desk verifies all papers before embassy / VFS submission.</p>
          </div>
        </div>
      </div>

      {/* Quick Destination Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Popular:</span>
        {[
          { label: 'All Destinations', query: '' },
          { label: '🇲🇾 Malaysia', query: 'Malaysia' },
          { label: '🇹🇭 Thailand', query: 'Thailand' },
          { label: '🇨🇳 China', query: 'China' },
          { label: '🇸🇬 Singapore', query: 'Singapore' },
          { label: '🇮🇩 Indonesia', query: 'Indonesia' },
          { label: '🇮🇳 India', query: 'India' },
          { label: '🇱🇰 Sri Lanka', query: 'Sri Lanka' },
          { label: '🇦🇪 UAE / Dubai', query: 'United Arab Emirates' },
          { label: '🇻🇳 Vietnam', query: 'Vietnam' },
          { label: '🇯🇵 Japan', query: 'Japan' },
          { label: '🇲🇻 Maldives', query: 'Maldives' },
          { label: '🇳🇵 Nepal', query: 'Nepal' },
          { label: '🇸🇦 Saudi Arabia', query: 'Saudi Arabia' },
          { label: '🇹🇷 Turkey', query: 'Turkey' },
        ].map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setSearchQuery(f.query)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              searchQuery.toLowerCase() === f.query.toLowerCase()
                ? 'bg-[#0759B8] text-white shadow-xs'
                : 'bg-white border border-[#E1EFF8] text-slate-700 hover:bg-[#F4FAFD]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search and Country Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Country List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination (e.g. Malaysia, Thailand)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E1EFF8] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1389E8] shadow-xs"
            />
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredCountries.map((item) => {
              const isSelected = selectedCountry.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectCountry(item)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#EAF7FF] border-[#0759B8] shadow-xs ring-1 ring-[#0759B8]/20'
                      : 'bg-white border-[#E1EFF8] hover:border-[#CDE9FB] hover:bg-[#F4FAFD]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flagEmoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#12304A]">{item.country}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.primaryCategory.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#0759B8] font-mono block">
                      {item.primaryCategory.totalEstimatedBDT}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.primaryCategory.processingTime}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Country Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E1EFF8] p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCountry.flagEmoji}</span>
                <span className="text-xs font-bold text-[#0759B8] uppercase tracking-wider">
                  {selectedCountry.targetNationality}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#12304A] mt-1 font-poppins">
                {selectedCountry.country} Visa Guidelines
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedCountry.overview}
              </p>
            </div>

            <button
              onClick={() => onOpenVisaQuote(selectedCountry.country)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1389E8] to-[#0759B8] hover:from-[#0E7FE3] hover:to-[#064B9C] text-white font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Request Assistance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Visa Sub-Variant Selector (if multiple exist for this country) */}
          {(selectedCountry.availableVariants && selectedCountry.availableVariants.length > 0) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Available Visa Categories for {selectedCountry.country}:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVariantId(selectedCountry.primaryCategory.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedVariantId === selectedCountry.primaryCategory.id
                      ? 'bg-[#0759B8] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {selectedCountry.primaryCategory.name}
                </button>
                {selectedCountry.availableVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedVariantId === variant.id
                        ? 'bg-[#0759B8] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Processing Time</span>
              </div>
              <p className="text-sm font-bold text-[#12304A] mt-1">
                {currentVariant.processingTime}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Estimated</span>
              </div>
              <p className="text-sm font-bold text-[#0759B8] mt-1 font-mono">
                {currentVariant.totalEstimatedBDT}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Min Bank Balance</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#12304A] mt-1 truncate">
                {currentVariant.minBankBalanceBDT}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Method</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#12304A] mt-1 truncate">
                {currentVariant.applicationMethod}
              </p>
            </div>
          </div>

          {/* Submission Center & Official Authority */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0759B8]" />
                <span className="text-xs font-bold text-slate-800">Submission Center / Authority:</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Calendar className="w-3 h-3" />
                <span>Verified: {selectedCountry.lastVerifiedDate}</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              {selectedCountry.submissionCenter}
            </p>
            {selectedCountry.officialEmbassySourceUrl && (
              <div className="pt-1">
                <a
                  href={selectedCountry.officialEmbassySourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#0759B8] hover:text-[#064B9C] font-bold hover:underline"
                >
                  <span>Official Authority: {selectedCountry.officialAuthorityName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-[#EAF7FF] text-[#0759B8]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              General Checklist
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'job'
                  ? 'bg-[#EAF7FF] text-[#0759B8]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Job Holders
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'business'
                  ? 'bg-[#EAF7FF] text-[#0759B8]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Business Owners
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-[#EAF7FF] text-[#0759B8]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Students / Minors
            </button>
          </div>

          {/* Checklist Area */}
          <div className="space-y-3 min-h-[160px]">
            {activeTab === 'general' && (
              <ul className="space-y-2.5">
                {currentVariant.generalRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'job' && (
              <ul className="space-y-2.5">
                {(currentVariant.occupationRequirements?.jobHolder || selectedCountry.primaryCategory.occupationRequirements?.jobHolder || [
                  'No Objection Certificate (NOC) on company letterhead.',
                  'Official Visiting Card & Employee ID copy.',
                  'Salary bank statement for last 6 months.',
                  'Pay slips / salary certificate for last 3 months.',
                ]).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'business' && (
              <ul className="space-y-2.5">
                {(currentVariant.occupationRequirements?.businessPerson || selectedCountry.primaryCategory.occupationRequirements?.businessPerson || [
                  'Valid Trade License translated into English with Notary public.',
                  'Memorandum of Articles for Limited Companies.',
                  'Company blank letterhead & visiting card.',
                  'Company bank statement and solvency certificate.',
                ]).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'student' && (
              <ul className="space-y-2.5">
                {(currentVariant.occupationRequirements?.student || selectedCountry.primaryCategory.occupationRequirements?.student || [
                  'Valid Student ID card photocopy.',
                  'Leave letter / permission letter from educational institution.',
                  'Parent/Sponsor financial documents & affidavit of support.',
                  'Birth certificate copy (for child/infant applications).'
                ]).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Photo & Passport Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block mb-1">📸 Photo Specification:</span>
              <p className="text-slate-600 leading-relaxed">{selectedCountry.photoSpec}</p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-1">🛂 Passport Validity:</span>
              <p className="text-slate-600 leading-relaxed">{selectedCountry.passportValidity}</p>
            </div>
          </div>

          {/* Trust & Safety Disclaimer Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900">
              <p className="font-bold">Visa Trust & Safety Advisory:</p>
              <p className="leading-relaxed">{selectedCountry.disclaimer || OFFICIAL_VISA_DISCLAIMER}</p>
            </div>
          </div>

          {/* Quick CTA Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Need assistance preparing your embassy file? Our Dhaka visa desk is ready.</span>
            <button
              onClick={() => onOpenVisaQuote(selectedCountry.country)}
              className="text-[#0759B8] font-bold hover:underline cursor-pointer"
            >
              Start Free Visa Check →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
