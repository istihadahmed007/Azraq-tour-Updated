import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Compass, Star, MapPin, Clock, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { AZRAQ_AFFILIATE_LINKS } from '../../data/agencyConfig';

interface ActivitiesSectionProps {
  onNavigateToView?: (view: string, extra?: any) => void;
  onOpenQuote?: () => void;
}

interface ActivityItem {
  id: string;
  title: string;
  location: string;
  country: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  priceBDT: number;
  originalPriceBDT: number;
  tag: string;
  image: string;
  klookUrl: string;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  onNavigateToView,
  onOpenQuote,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeCountry, setActiveCountry] = useState<string>('All');

  const ACTIVITIES: ActivityItem[] = [
    {
      id: 'act-phi-phi-speedboat',
      title: 'Phi Phi & Maya Bay Speedboat Day Tour with Buffet Lunch',
      location: 'Phuket / Krabi',
      country: 'Thailand',
      duration: '8 Hours',
      rating: 4.9,
      reviewsCount: 1420,
      priceBDT: 4800,
      originalPriceBDT: 6200,
      tag: 'Bestseller',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
      klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
    },
    {
      id: 'act-gardens-by-the-bay',
      title: 'Gardens by the Bay & Cloud Forest Direct Entry Pass',
      location: 'Marina Bay',
      country: 'Singapore',
      duration: 'Flexible',
      rating: 4.9,
      reviewsCount: 3890,
      priceBDT: 3200,
      originalPriceBDT: 3900,
      tag: 'Instant Voucher',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
      klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
    },
    {
      id: 'act-genting-skyworlds',
      title: 'Genting SkyWorlds Outdoor Theme Park + Cable Car Pass',
      location: 'Genting Highlands',
      country: 'Malaysia',
      duration: 'Full Day',
      rating: 4.8,
      reviewsCount: 980,
      priceBDT: 4500,
      originalPriceBDT: 5400,
      tag: 'Family Favorite',
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
      klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
    },
    {
      id: 'act-bali-atv-waterfall',
      title: 'Ubud Jungle ATV Quad Bike & Hidden Waterfall Rafting',
      location: 'Ubud, Bali',
      country: 'Indonesia',
      duration: '6 Hours',
      rating: 4.9,
      reviewsCount: 1120,
      priceBDT: 3900,
      originalPriceBDT: 5100,
      tag: 'Top Adventure',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
    },
    {
      id: 'act-burj-khalifa-top',
      title: 'Burj Khalifa 124th & 125th Floor Observation Deck Tickets',
      location: 'Downtown Dubai',
      country: 'UAE',
      duration: '2 Hours',
      rating: 4.8,
      reviewsCount: 2450,
      priceBDT: 5900,
      originalPriceBDT: 7200,
      tag: 'Must Visit',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
    },
    {
      id: 'act-maldives-nurse-shark',
      title: 'Maafushi Nurse Shark Snorkeling & Sandbank Lunch Cruise',
      location: 'South Male Atoll',
      country: 'Maldives',
      duration: '7 Hours',
      rating: 5.0,
      reviewsCount: 640,
      priceBDT: 6500,
      originalPriceBDT: 8000,
      tag: 'Underwater Tour',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
      klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
    },
  ];

  const countries = ['All', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'UAE', 'Maldives'];

  const filtered = activeCountry === 'All'
    ? ACTIVITIES
    : ACTIVITIES.filter((a) => a.country === activeCountry);

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#086788] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#17BEBB]" />
            <span>Top Things to Do</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#073B4C] tracking-tight font-serif-display">
            Popular Activities & Day Tours
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-inter">
            Book verified tickets, theme parks, island cruises, and adventure tours with transparent pricing in BDT.
          </p>
        </div>

        {/* Country Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCountry(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCountry === c
                  ? 'bg-[#073B4C] text-white shadow-xs'
                  : 'bg-white text-[#073B4C] border border-slate-200 hover:bg-[#EAF7F8] hover:border-[#17BEBB]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-x-visible no-scrollbar pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: shouldReduceMotion ? 0 : idx * 0.05,
              ease: 'easeOut',
            }}
            whileHover={shouldReduceMotion ? undefined : { y: -3 }}
            className="min-w-[270px] xs:min-w-[290px] sm:min-w-0 w-[82vw] max-w-[340px] sm:w-full snap-start shrink-0 sm:shrink group rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Tag */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#071A33] shadow-xs">
                {item.tag}
              </div>

              {/* Rating */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-white text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{item.rating}</span>
                <span className="text-slate-300 text-[10px]">({item.reviewsCount})</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{item.location}, {item.country}</span>
                  <span>·</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.duration}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#073B4C] group-hover:text-[#086788] transition-colors line-clamp-2 font-inter">
                  {item.title}
                </h3>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 line-through font-inter">
                    ৳{item.originalPriceBDT.toLocaleString('en-US')}
                  </span>
                  <div className="text-base font-bold text-[#073B4C] font-inter">
                    ৳{item.priceBDT.toLocaleString('en-US')}
                    <span className="text-[10px] font-normal text-slate-500 ml-1 font-inter">/ person</span>
                  </div>
                </div>

                <a
                  href={item.klookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#073B4C] hover:bg-[#086788] text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <span>Book Ticket</span>
                  <ExternalLink className="w-3 h-3 text-[#17BEBB]" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
