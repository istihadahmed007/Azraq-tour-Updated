import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, ArrowRight, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { NavView } from '../types';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import { AzraqLogo } from './AzraqLogo';

interface FooterProps {
  onNavigate?: (view: NavView) => void;
  onOpenVisaQuote?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenVisaQuote,
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'faq' | 'terms' | 'privacy' | 'affiliate' | null>(null);
  const currentYear = new Date().getFullYear();

  const handleNav = (view: NavView) => {
    if (onNavigate) {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="w-full bg-[#071A33]/90 backdrop-blur-2xl border-t border-white/10 text-slate-300 pt-16 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Section: Brand + 4 Clean Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
            {/* Brand and Direct Desk Info (Span 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-1 border border-white/20 shrink-0">
                  <AzraqLogo size={36} className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-xl font-normal text-white tracking-tight font-serif-display">
                    Azraq Trips
                  </h3>
                  <p className="text-xs text-[#17BEBB] font-medium">
                    {AZRAQ_AGENCY_CONFIG.tagline}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                A modern travel platform engineered for Bangladeshi travelers. Transparent flight searches, verified embassy visa guidance, and bespoke Asian holiday packages.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#17BEBB] shrink-0" />
                  <span>Banani, Dhaka 1213, Bangladesh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#17BEBB] shrink-0" />
                  <a
                    href={`https://wa.me/${AZRAQ_AGENCY_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white font-mono"
                  >
                    {AZRAQ_AGENCY_CONFIG.phoneDisplay}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#17BEBB] shrink-0" />
                  <a
                    href={`mailto:${AZRAQ_AGENCY_CONFIG.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {AZRAQ_AGENCY_CONFIG.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Column 1: Explore */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Explore
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleNav('destinations')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Featured Destinations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('guides')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Editorial Travel Guides
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('itineraries')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Curated Itineraries
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('feed')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Travel Buddies
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Services */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Services
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => {
                      window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
                    }}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer text-left"
                  >
                    Flight Discovery from DAC
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('packages')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Holiday Packages
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('visa')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Visa Assistance Desk
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('planner')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    AI Itinerary Planner
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Support
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href={`https://wa.me/${AZRAQ_AGENCY_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#17BEBB] hover:text-white font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => handleNav('contact')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Contact Travel Desk
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('faq')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Frequently Asked Questions
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Company & Legal */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Company
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleNav('about')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    About Azraq
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('privacy')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('terms')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('affiliate')}
                    className="hover:text-[#17BEBB] transition-colors cursor-pointer"
                  >
                    Affiliate Disclosure
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Compliance & Partner Transparency */}
          <div className="text-[11px] text-slate-400 leading-relaxed space-y-2 border-b border-white/10 pb-8">
            <p>
              <strong className="text-slate-300">Transparency Notice:</strong> {AZRAQ_AGENCY_CONFIG.partnerDisclaimer}
            </p>
            <p className="text-slate-500">
              {AZRAQ_AGENCY_CONFIG.affiliateDisclosureText}
            </p>
          </div>

          {/* Bottom Bar: Copyright & Verified Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {currentYear} Azraq Tours & Travels. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Licensed Travel Agency Desk</span>
              <span>•</span>
              <span>Dhaka, Bangladesh</span>
              <span>•</span>
              <button
                onClick={() => setActiveLegalModal('affiliate')}
                className="hover:text-white underline cursor-pointer"
              >
                Affiliate Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Compliance Modals */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeLegalModal === 'faq' && (
              <div className="space-y-3">
                <h3 className="text-xl font-normal font-serif-display text-[#071A33]">Frequently Asked Questions</h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 max-h-80 overflow-y-auto pr-1">
                  <div>
                    <p className="font-bold text-slate-800">How does Azraq flight search work?</p>
                    <p>Azraq aggregates live flight routes and rates via our licensed travel distribution partner network. You can book directly with verified partners or contact our Dhaka desk for offline holds.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">How do I request a customized holiday package?</p>
                    <p>Click "Trip Planner" in the navigation bar or contact our Banani desk directly via WhatsApp.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">What documents are required for Asian tourist visas?</p>
                    <p>Visit our Visa tab for complete embassy checklists including minimum bank balances, solvency certificates, employer NOCs, and passport validity rules.</p>
                  </div>
                </div>
              </div>
            )}

            {activeLegalModal === 'affiliate' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#17BEBB]">
                  <ShieldCheck className="w-5 h-5 text-[#071A33]" />
                  <h3 className="text-xl font-normal font-serif-display text-[#071A33]">Affiliate & Partner Disclosure</h3>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p>
                    Azraq partners with global travel aggregators including Travelpayouts and Aviasales to provide transparent airfare and accommodation comparisons.
                  </p>
                  <p>
                    When you click on flight links and complete a purchase with our approved partners, Azraq may receive an affiliate referral commission at no extra cost to you.
                  </p>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    For direct offline booking assistance, corporate GDS ticketing, or invoice payments, please contact our Dhaka concierge desk.
                  </p>
                </div>
              </div>
            )}

            {activeLegalModal === 'privacy' && (
              <div className="space-y-3">
                <h3 className="text-xl font-normal font-serif-display text-[#071A33]">Privacy Policy</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Azraq collects traveler contact details and itinerary preferences strictly to issue flight reservations, package quotations, and visa support. We never sell or share your personal data with third-party marketers.
                </p>
              </div>
            )}

            {activeLegalModal === 'terms' && (
              <div className="space-y-3">
                <h3 className="text-xl font-normal font-serif-display text-[#071A33]">Terms & Conditions</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Package rates and hotel availability are subject to property verification until final booking confirmation. Visa issuance remains under the sole authority of the respective foreign embassy in Dhaka.
                </p>
              </div>
            )}

            <button
              onClick={() => setActiveLegalModal(null)}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-xs font-bold transition-colors cursor-pointer mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
