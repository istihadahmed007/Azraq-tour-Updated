import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Clock, DollarSign, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { AGENCY_CONFIG } from '../../data/agencyConfig';

export interface VisaDetailsProps {
  country: string;
  visaType?: string;
  processingTime?: string;
  feesBDT?: number | string;
  validity?: string;
  stayDuration?: string;
  requirements?: string[];
  notes?: string;
  onApplyNow?: (country: string) => void;
  className?: string;
}

export function VisaInfo({
  country,
  visaType = 'Tourist Visa / eVisa',
  processingTime = '3-5 Business Days',
  feesBDT = 'BDT 4,500 - 8,500',
  validity = '90 Days',
  stayDuration = '30 Days per Entry',
  requirements = [
    'Original Passport with minimum 6 months validity',
    '2 copies recent 35x45mm biometric photos on matte paper with white background',
    'Last 6 months updated bank statement & bank solvency certificate',
    'Employment Verification / NOC on company letterhead OR Trade License with translation for business owners',
    'Visiting card & office ID copy',
    'Confirmed round-trip flight booking & hotel voucher reservation',
  ],
  notes,
  onApplyNow,
  className = '',
}: VisaDetailsProps) {
  const whatsappUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello Azraq Visa Desk! I need assistance with applying for a ${country} tourist visa.`
  )}`;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#006ce4] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#006ce4] uppercase tracking-wider">
              Official Consular Guide
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {country} Visa Requirements for Bangladeshi Citizens
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Guidelines
          </span>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl">
          <span className="text-xs text-slate-500 block">Visa Type</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{visaType}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl">
          <span className="text-xs text-slate-500 block">Processing Time</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{processingTime}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl">
          <span className="text-xs text-slate-500 block">Validity</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{validity}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl">
          <span className="text-xs text-slate-500 block">Estimated Fees</span>
          <span className="font-bold text-[#006ce4] text-sm mt-0.5 block">{feesBDT}</span>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Mandatory Document Checklist</span>
        </h3>
        <ul className="space-y-2.5">
          {requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006ce4] shrink-0 mt-2"></span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onApplyNow ? (
          <button
            onClick={() => onApplyNow(country)}
            className="flex-1 bg-[#006ce4] hover:bg-[#0057b8] text-white font-semibold text-sm py-3 px-5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Request Visa Processing from Azraq Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#006ce4] hover:bg-[#0057b8] text-white font-semibold text-sm py-3 px-5 rounded-xl transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consult Visa Specialist on WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default VisaInfo;
