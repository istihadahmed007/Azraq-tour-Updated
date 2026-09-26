import React from 'react';
import { Ticket, Smartphone, Car, ExternalLink, ShieldCheck, Compass, Sparkles } from 'lucide-react';
import { getAffiliateLink, trackAffiliateClick, AFFILIATE_DISCLOSURE_TEXT } from '../../data/agencyConfig';

export const TravelEssentialsSection: React.FC = () => {
  return (
    <section
      id="travel-essentials"
      aria-label="Travel Essentials"
      className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7F8] border border-[#17BEBB]/40 text-[#086788] text-xs font-bold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#17BEBB]" />
          <span>Curated Travel Essentials</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#073B4C] tracking-[-0.025em]">
          Essential Services for Your International Trip
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-inter">
          Compare verified partner options for tours, global connectivity, and door-to-door ground transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Tours & Tickets: Klook */}
        <div className="p-6 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-xl transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full">
                Partner: Klook
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#073B4C]">Tours, Attractions & Experiences</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-inter">
                Browse popular city landmarks, museum passes, theme park admissions, and guided excursions across Asia and worldwide.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500 pt-1">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified global booking inventory</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#086788] shrink-0" />
                <span>Real-time availability confirmed on Klook</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <a
              href={getAffiliateLink('klook', 'home_essentials_klook')}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick('klook', 'home_essentials_klook')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Explore activities on Klook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 2. Travel eSIM: Airalo & Yesim */}
        <div className="p-6 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-xl transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-full">
                Partners: Airalo · Yesim
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#073B4C]">International Travel eSIM</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-inter">
                Stay connected abroad with instant digital data packs. Keep your Bangladesh WhatsApp active without physical SIM swapping.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500 pt-1">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant QR code installation for compatible phones</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#086788] shrink-0" />
                <span>Coverage in 200+ countries with 4G/5G speeds</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <a
              href={getAffiliateLink('airalo', 'home_essentials_airalo')}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick('airalo', 'home_essentials_airalo')}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Compare Airalo</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href={getAffiliateLink('yesim', 'home_essentials_yesim')}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick('yesim', 'home_essentials_yesim')}
              className="py-2.5 px-3 rounded-xl bg-[#006ce4] hover:bg-[#0057b8] text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Compare Yesim</span>
              <ExternalLink className="w-3 h-3 text-sky-200" />
            </a>
          </div>
        </div>

        {/* 3. Transfers: Kiwitaxi & GetTransfer */}
        <div className="p-6 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-xl transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2.5 py-1 rounded-full">
                Partners: Kiwitaxi · GetTransfer
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#073B4C]">Airport & Private Transfers</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-inter">
                Pre-book terminal pickups with driver meet-and-greet, or compare chauffeur quotes for intercity road travel.
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500 pt-1">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Flight arrival tracking & nameplate meetup</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#086788] shrink-0" />
                <span>Fixed fares and competitive driver bidding</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <a
              href={getAffiliateLink('kiwitaxi', 'home_essentials_kiwitaxi')}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick('kiwitaxi', 'home_essentials_kiwitaxi')}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Kiwitaxi Transfers</span>
              <ExternalLink className="w-3 h-3 text-blue-200" />
            </a>
            <a
              href={getAffiliateLink('gettransfer', 'home_essentials_gettransfer')}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick('gettransfer', 'home_essentials_gettransfer')}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>GetTransfer Rides</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>
          </div>
        </div>
      </div>

      {/* Transparent Affiliate Disclosure Banner */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 text-xs leading-relaxed">
        <p>{AFFILIATE_DISCLOSURE_TEXT}</p>
      </div>
    </section>
  );
};
