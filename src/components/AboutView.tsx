import React from 'react';
import { ShieldCheck, MapPin, Users, Phone, Mail, Award, Clock, HeartHandshake, ArrowRight } from 'lucide-react';
import { SEOHead } from './SEOHead';
import { getOrganizationSchema } from '../lib/seo';
import { AzraqLogo } from './AzraqLogo';

interface AboutViewProps {
  onNavigateToContact?: () => void;
  onOpenTripPlanner?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateToContact, onOpenTripPlanner }) => {
  return (
    <article className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 animate-fadeIn">
      <SEOHead
        title="About Azraq Trips – Leading Bangladesh Travel Agency & Tour Operator"
        description="Learn about Azraq Trips Dhaka. Certified outbound tour packages, authorized Asian visa processing, direct flight connections, and AI-driven custom travel itineraries."
        canonical="https://www.azraqtrips.com/about"
        structuredData={getOrganizationSchema()}
      />

      {/* Hero Intro */}
      <section aria-labelledby="about-heading" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-gradient-to-r from-blue-50/60 via-white to-sky-50/60 p-6 sm:p-8 rounded-3xl border border-blue-100">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0047BA] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Official Travel Agency &amp; Operator</span>
          </div>
          <h1 id="about-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#071A33] tracking-tight leading-tight">
            Curating Exceptional Journeys Across Asia
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Founded with a mission to eliminate travel stress, Azraq provides bespoke itineraries, authorized visa documentation, and curated holiday experiences for travelers exploring Asia and beyond.
          </p>
        </div>

        <div className="shrink-0 self-center md:self-auto p-3 rounded-full bg-white shadow-md border border-blue-100/80">
          <AzraqLogo size={120} />
        </div>
      </section>

      {/* 4 Pillars of Credibility */}
      <section aria-label="Core Pillars of Service" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D6EFD] flex items-center justify-center" aria-hidden="true">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#071A33]">Trusted Support</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Personalized guidance from licensed travel consultants throughout your entire journey.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center" aria-hidden="true">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#071A33]">Personalized Service</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Trips engineered specifically around your individual preferences, pace, and budget.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center" aria-hidden="true">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#071A33]">Visa Guidance</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Exacting documentation checks for high approval rates across Asian and Middle Eastern embassies.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center" aria-hidden="true">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#071A33]">Local Expertise</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Direct ground partnerships in Thailand, Malaysia, Singapore, Dubai, and Maldives.
          </p>
        </div>
      </section>

      {/* Office & Operations Card */}
      <section aria-labelledby="office-heading" className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Dhaka Head Office</span>
          <h2 id="office-heading" className="text-2xl sm:text-3xl font-bold">Visit or Contact Our Travel Desk</h2>
          <p className="text-sm text-slate-300">
            Our experienced concierge and visa desk is located in Dhaka, ready to assist with custom quotes, group packages, or individual getaways.
          </p>
        </div>

        <address className="not-italic grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>Location</span>
            </div>
            <p className="text-sm text-slate-200">
              Dhaka, Bangladesh
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>Direct Hotline</span>
            </div>
            <a
              href="tel:+8801851172032"
              className="text-sm text-slate-200 font-mono hover:text-sky-400 transition-colors block focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none rounded"
              aria-label="Call Azraq Hotline at +880 1851-172032"
            >
              +880 1851-172032
            </a>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Inquiries</span>
            </div>
            <a
              href="mailto:info@azraqtrips.com"
              className="text-sm text-slate-200 hover:text-sky-400 transition-colors block focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none rounded"
              aria-label="Send email to info@azraqtrips.com"
            >
              info@azraqtrips.com
            </a>
          </div>
        </address>
      </section>
    </article>
  );
};
