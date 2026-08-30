import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Tag, Sparkles, Clock, ArrowRight, ShieldCheck, CheckCircle, Plane, Building2, FileCheck } from 'lucide-react';
import { TourPackage } from '../../types';

interface DealsSectionProps {
  onOpenQuote?: (pkg?: TourPackage) => void;
  onNavigateToView?: (view: string, extra?: any) => void;
}

interface DealItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  destination: string;
  country: string;
  duration: string;
  originalPriceBDT: number;
  dealPriceBDT: number;
  saveBDT: number;
  tagline: string;
  image: string;
  inclusions: string[];
  expiresInDays: number;
  category: 'package' | 'flight' | 'visa' | 'stay';
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  onOpenQuote,
  onNavigateToView,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<'all' | 'package' | 'flight' | 'visa' | 'stay'>('all');

  const DEALS: DealItem[] = [
    {
      id: 'deal-bkk-pattaya',
      badge: 'Bestseller Package',
      badgeColor: 'bg-emerald-500 text-white',
      title: 'Bangkok & Pattaya Escape Combo',
      destination: 'Bangkok & Pattaya',
      country: 'Thailand',
      duration: '4 Nights 5 Days',
      originalPriceBDT: 48500,
      dealPriceBDT: 41999,
      saveBDT: 6501,
      tagline: '4★ City Hotels + Coral Island Speedboat + Safari World + Transfers',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
      inclusions: ['4-Star Hotel Stays', 'Daily Breakfast', 'Coral Island Speedboat', 'Airport Pick & Drop'],
      expiresInDays: 4,
      category: 'package',
    },
    {
      id: 'deal-bali-honeymoon',
      badge: 'Honeymoon Special',
      badgeColor: 'bg-rose-500 text-white',
      title: 'Bali Tropical Private Villa Retreat',
      destination: 'Ubud & Kuta',
      country: 'Indonesia',
      duration: '5 Nights 6 Days',
      originalPriceBDT: 72000,
      dealPriceBDT: 62500,
      saveBDT: 9500,
      tagline: 'Private Pool Villa in Ubud + Mount Batur Sunrise + Tanah Lot Sunset Tour',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      inclusions: ['Private Pool Villa', 'Floating Breakfast', 'Full-Day Island Tours', 'VIP Airport Transfer'],
      expiresInDays: 6,
      category: 'stay',
    },
    {
      id: 'deal-sin-kl-combo',
      badge: 'Twin-City Deal',
      badgeColor: 'bg-blue-600 text-white',
      title: 'Singapore & Malaysia Twin Metropolis',
      destination: 'Singapore & Kuala Lumpur',
      country: 'Singapore / Malaysia',
      duration: '5 Nights 6 Days',
      originalPriceBDT: 68000,
      dealPriceBDT: 59900,
      saveBDT: 8100,
      tagline: 'Marina Bay Sands View + Genting Cable Car + Batu Caves & Express Coach',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
      inclusions: ['3★-4★ Central Hotels', 'Genting Highlands Pass', 'Intercity Coach', 'City Highlights Tour'],
      expiresInDays: 5,
      category: 'package',
    },
    {
      id: 'deal-maldives-resort',
      badge: 'Island Luxury',
      badgeColor: 'bg-teal-500 text-white',
      title: 'Maldives Maafushi & Resort Day-Pass',
      destination: 'Maafushi & Kaafu Atoll',
      country: 'Maldives',
      duration: '3 Nights 4 Days',
      originalPriceBDT: 55000,
      dealPriceBDT: 47800,
      saveBDT: 7200,
      tagline: 'Beachfront Hotel + Nurse Shark Snorkeling + Sandbank Lunch & Speedboat',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
      inclusions: ['Beachfront Hotel Room', 'Nurse Shark Snorkeling', 'Sandbank Picnic', 'Speedboat Airport Transfer'],
      expiresInDays: 3,
      category: 'package',
    },
    {
      id: 'deal-dubai-desert',
      badge: 'Middle East Hot Deal',
      badgeColor: 'bg-amber-500 text-white',
      title: 'Dubai Glamour & Desert Safari',
      destination: 'Dubai',
      country: 'United Arab Emirates',
      duration: '4 Nights 5 Days',
      originalPriceBDT: 64000,
      dealPriceBDT: 56900,
      saveBDT: 7100,
      tagline: 'Burj Khalifa At The Top + Dune Bashing Desert Safari with BBQ Dinner',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      inclusions: ['4-Star City Hotel', 'Desert Safari & BBQ', 'Burj Khalifa Entry', 'Dubai City Sightseeing'],
      expiresInDays: 7,
      category: 'package',
    },
    {
      id: 'deal-visa-bundle',
      badge: 'Visa Fast-Track',
      badgeColor: 'bg-indigo-600 text-white',
      title: 'Thailand & Malaysia Dual Visa Bundle',
      destination: 'Bangkok & KL',
      country: 'Thailand / Malaysia',
      duration: 'Express 48hr Processing',
      originalPriceBDT: 15500,
      dealPriceBDT: 12500,
      saveBDT: 3000,
      tagline: 'Full file preparation, bank solvency review, verified booking vouchers included',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      inclusions: ['Embassy File Prep', 'Flight & Hotel Vouchers', 'Document Vetting', '24/7 Agent Follow-up'],
      expiresInDays: 9,
      category: 'visa',
    },
  ];

  const filteredDeals = activeCategory === 'all' 
    ? DEALS 
    : DEALS.filter((d) => d.category === activeCategory);

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B5A] font-mono">
            <Tag className="w-3.5 h-3.5" />
            <span>Limited-Time Offers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#073B4C] tracking-tight font-serif-display">
            Featured Deals & Exclusive Promotions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-inter">
            Save more on handpicked Asian holiday packages, resort stays, and verified travel bundles from Dhaka.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Deals' },
            { id: 'package', label: 'Tour Packages' },
            { id: 'stay', label: 'Luxury Stays' },
            { id: 'visa', label: 'Visa Bundles' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#073B4C] text-white shadow-xs'
                  : 'bg-white text-[#073B4C] border border-slate-200 hover:bg-[#EAF7F8] hover:border-[#17BEBB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible no-scrollbar pb-3 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
        {filteredDeals.map((deal, idx) => (
          <motion.div
            key={deal.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: shouldReduceMotion ? 0 : idx * 0.05,
              ease: 'easeOut',
            }}
            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            className="min-w-[280px] xs:min-w-[300px] md:min-w-0 w-[84vw] max-w-[340px] md:w-full snap-start shrink-0 md:shrink group rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Image Banner */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
              <img
                src={deal.image}
                alt={deal.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-extrabold uppercase tracking-wide shadow-md ${deal.badgeColor}`}>
                  {deal.badge}
                </span>
              </div>

              {/* Countdown / Expiry */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{deal.expiresInDays} days left</span>
              </div>

              {/* Bottom Destination & Duration on Image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[11px] font-medium uppercase tracking-wider text-sky-300 font-mono">
                  {deal.country} · {deal.duration}
                </p>
                <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 group-hover:text-sky-200 transition-colors">
                  {deal.title}
                </h3>
              </div>
            </div>

            {/* Deal Content & Inclusions */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {deal.tagline}
                </p>

                {/* Key Inclusions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {deal.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium truncate">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 line-through">
                      ৳{deal.originalPriceBDT.toLocaleString('en-US')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Save ৳{deal.saveBDT.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[#073B4C] font-inter">
                    ৳{deal.dealPriceBDT.toLocaleString('en-US')}
                    <span className="text-[10px] font-normal text-slate-500 ml-1">/ person</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenQuote) {
                      onOpenQuote({
                        id: deal.id,
                        package_name: deal.title,
                        country: deal.country,
                        destination_name: deal.destination,
                        price: deal.dealPriceBDT,
                        duration: deal.duration,
                        description: deal.tagline,
                        inclusions: deal.inclusions,
                      } as any);
                    } else if (onNavigateToView) {
                      onNavigateToView('packages');
                    }
                  }}
                  className="btn-coral-primary !min-h-[40px] !py-2 !px-4 !text-xs !rounded-xl"
                >
                  <span>Claim Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#073B4C] to-[#086788] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#17BEBB]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-serif-display text-base">100% Price & Availability Guarantee</h4>
            <p className="text-xs text-slate-200 font-inter">All prices include applicable government taxes, hotel vat, and 24/7 dedicated Dhaka concierge support.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToView && onNavigateToView('contact')}
          className="btn-ghost-ocean !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 hover:!border-white/30 !min-h-[40px] !py-2 !px-4 !text-xs whitespace-nowrap"
        >
          Talk to a Concierge
        </button>
      </div>
    </section>
  );
};
