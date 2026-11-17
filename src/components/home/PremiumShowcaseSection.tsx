import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart, ArrowRight, MapPin, Calendar, Clock, Star, Sparkles } from 'lucide-react';
import { Destination, TourPackage } from '../../types';
import { usePackages } from '../../context/PackageContext';

interface PremiumShowcaseSectionProps {
  destinations: Destination[];
  packages: TourPackage[];
  onSelectDestination: (dest: Destination) => void;
  onViewPackageDetails: (pkg: TourPackage) => void;
  onRequestQuote: (pkg: TourPackage) => void;
  onNavigateToView?: (view: string) => void;
}

export const PremiumShowcaseSection: React.FC<PremiumShowcaseSectionProps> = ({
  destinations,
  packages,
  onSelectDestination,
  onViewPackageDetails,
  onRequestQuote,
  onNavigateToView,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { isPackageSaved, toggleSavePackage } = usePackages();

  // Pick high-quality featured destination / package from existing authentic data
  const featuredPackage =
    packages.find((p) => p.destination_name?.toLowerCase().includes('kashmir') || p.package_name?.toLowerCase().includes('kashmir')) ||
    packages[0] ||
    ({
      id: 'pkg-kashmir-flagship',
      package_name: '5D4N Scenic Kashmir & Dal Lake Paradise',
      destination_name: 'Srinagar, Kashmir',
      country: 'India',
      duration: '5 Days / 4 Nights',
      price: 54500,
      currency: 'BDT',
      images: ['https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80'],
      inclusions: ['4-Star Houseboat & Hotel', 'Gulmarg Gondola Ride', 'Private Shikara Tour', 'All Airport Transfers'],
    } as TourPackage);

  const featuredImg =
    featuredPackage.images && featuredPackage.images.length > 0
      ? featuredPackage.images[0]
      : 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80';

  const isFeaturedSaved = typeof isPackageSaved === 'function' ? isPackageSaved(featuredPackage.id) : false;

  // 3 Popular Destinations (Top Row of Right Column)
  const popularThree = [
    {
      name: 'Bangkok',
      country: 'Thailand',
      tag: 'Grand Palace & Markets',
      price: '৳28,500',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Dubai',
      country: 'UAE',
      tag: 'Desert Safari & Marina',
      price: '৳46,900',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Kuala Lumpur',
      country: 'Malaysia',
      tag: 'Petronas & Batu Caves',
      price: '৳34,200',
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // 3 Featured Packages (Bottom Row of Right Column)
  const rightPackages = packages.filter((p) => p.id !== featuredPackage.id).slice(0, 3);
  const displayRightPackages =
    rightPackages.length >= 3
      ? rightPackages
      : [
          {
            id: 'pkg-bali-compact',
            package_name: 'Magical Bali Island Retreat',
            destination_name: 'Bali',
            country: 'Indonesia',
            duration: '4 Days / 3 Nights',
            price: 38900,
            currency: 'BDT',
            images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'],
            inclusions: ['Private Villa Stay', 'Ubud Tour'],
          },
          {
            id: 'pkg-maldives-compact',
            package_name: 'Crystal Maldives Water Villa',
            destination_name: 'Maldives',
            country: 'Maldives',
            duration: '5 Days / 4 Nights',
            price: 68500,
            currency: 'BDT',
            images: ['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80'],
            inclusions: ['Speedboat Transfer', 'Snorkeling Safari'],
          },
          {
            id: 'pkg-singapore-compact',
            package_name: 'Singapore City Explorer',
            destination_name: 'Singapore',
            country: 'Singapore',
            duration: '4 Days / 3 Nights',
            price: 49500,
            currency: 'BDT',
            images: ['https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80'],
            inclusions: ['Sentosa Pass', 'Marina Bay Access'],
          },
        ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ASYMMETRIC TWO-COLUMN COMPOSITION (Directly inspired by reference layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Large Featured Travel Showcase                               */}
        {/* ========================================================================= */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="lg:col-span-5 flex flex-col"
        >
          <div className="bg-[#E7F0F8] border border-white/80 shadow-[8px_8px_24px_rgba(166,185,204,0.45),-8px_-8px_24px_rgba(255,255,255,0.85)] rounded-[28px] p-4 sm:p-5 flex flex-col justify-between h-full group hover:shadow-[10px_10px_28px_rgba(166,185,204,0.5),-10px_-10px_28px_rgba(255,255,255,0.95)] transition-all duration-300">
            
            {/* Top Large Photography Showcase */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full rounded-[22px] overflow-hidden bg-slate-100 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]">
              <img
                src={featuredImg}
                alt={featuredPackage.package_name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Subtle light ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#263B55]/50 via-transparent to-transparent opacity-60" />

              {/* Floating Heart / Wishlist Badge (Inspired by reference orange-accent button) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof toggleSavePackage === 'function') {
                    toggleSavePackage(featuredPackage.id);
                  }
                }}
                aria-label="Save to wishlist"
                className="absolute top-3.5 right-3.5 z-10 w-11 h-11 rounded-full bg-white/95 border border-white/80 shadow-[2px_2px_10px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFeaturedSaved ? 'text-[#E67A60] fill-[#E67A60]' : 'text-[#63778D] hover:text-[#E67A60]'
                  }`}
                />
              </button>

              {/* Top Left Destination Badge */}
              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#73A9D2]" />
                <span className="text-xs font-bold text-[#263B55] tracking-tight">
                  {featuredPackage.destination_name || 'Kashmir'}
                </span>
              </div>

              {/* Rating Tag */}
              <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-bold text-[#263B55] shadow-xs">
                <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                <span>4.9 / 5.0 (Flagship Experience)</span>
              </div>
            </div>

            {/* Bottom Content & Booking Action */}
            <div className="pt-5 pb-1 flex flex-col justify-between flex-1">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#63778D]">
                  <Clock className="w-3.5 h-3.5 text-[#73A9D2]" />
                  <span>{featuredPackage.duration || '5 Days / 4 Nights'}</span>
                  <span>·</span>
                  <span>All Transfers Included</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#263B55] tracking-tight leading-snug">
                  {featuredPackage.package_name}
                </h3>

                <p className="text-xs sm:text-sm text-[#63778D] line-clamp-2 leading-relaxed">
                  Authentic verified itinerary with luxury houseboat stay, private Shikara ride, and Gulmarg Gondola excursion.
                </p>
              </div>

              {/* Price & Buy Now / Book Now Pill (Directly matching reference button) */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/70 mt-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#63778D] block">
                    Starting Price
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#263B55]">
                    ৳{featuredPackage.price.toLocaleString()}
                    <span className="text-xs font-medium text-[#63778D] ml-1">BDT</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onViewPackageDetails(featuredPackage)}
                  className="px-6 py-2.5 sm:py-3 rounded-full bg-[#E7F0F8] hover:bg-[#F7FAFD] border border-white/80 shadow-[3px_3px_10px_rgba(166,185,204,0.35),-3px_-3px_10px_rgba(255,255,255,0.85)] text-[#263B55] font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 text-[#73A9D2]" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 3 Popular Destinations (Top) + 3 Featured Packages (Bottom)  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6 sm:gap-7">
          
          {/* TOP ROW — 3 Popular Destinations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base sm:text-lg font-bold text-[#263B55] tracking-tight">
                Popular Destinations
              </h4>
              <button
                type="button"
                onClick={() => onNavigateToView && onNavigateToView('destinations')}
                className="text-xs font-bold text-[#73A9D2] hover:text-[#5A94C2] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {popularThree.map((dest, idx) => (
                <motion.div
                  key={dest.name}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : idx * 0.05 }}
                  className="bg-[#E7F0F8] border border-white/75 shadow-[5px_5px_14px_rgba(166,185,204,0.35),-5px_-5px_14px_rgba(255,255,255,0.85)] rounded-[22px] p-3 flex flex-col justify-between group hover:shadow-[7px_7px_18px_rgba(166,185,204,0.45),-7px_-7px_18px_rgba(255,255,255,0.95)] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    const found = destinations.find((d) => d.name.toLowerCase().includes(dest.name.toLowerCase()));
                    if (found) onSelectDestination(found);
                    else if (onNavigateToView) onNavigateToView('destinations');
                  }}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square w-full rounded-[16px] overflow-hidden bg-slate-100">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Floating Heart Wishlist Icon */}
                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 border border-white/80 shadow-xs flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-[#E67A60]" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="pt-2.5 space-y-1">
                    <h5 className="text-sm font-bold text-[#263B55] truncate">{dest.name}</h5>
                    <p className="text-[11px] text-[#63778D] truncate">{dest.tag}</p>
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#263B55]">{dest.price}</span>
                      <span className="text-[10px] text-[#73A9D2] font-semibold flex items-center gap-0.5">
                        Explore <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* BOTTOM ROW — Featured (Directly inspired by "Featured" section in reference) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold text-[#263B55] tracking-tight">
                  Featured
                </h4>
                <span className="text-xs text-[#63778D] font-medium hidden sm:inline">
                  Curated Packages
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToView && onNavigateToView('packages')}
                className="w-8 h-8 rounded-full bg-[#E7F0F8] border border-white/80 shadow-[2px_2px_6px_rgba(166,185,204,0.3),-2px_-2px_6px_rgba(255,255,255,0.8)] flex items-center justify-center text-[#263B55] hover:scale-105 transition-all cursor-pointer"
                title="View All Packages"
              >
                <ArrowRight className="w-4 h-4 text-[#73A9D2]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {displayRightPackages.map((pkg, idx) => {
                const pkgImg =
                  pkg.images && pkg.images.length > 0
                    ? pkg.images[0]
                    : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
                const isSaved = typeof isPackageSaved === 'function' ? isPackageSaved(pkg.id) : false;

                return (
                  <motion.div
                    key={pkg.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : idx * 0.05 }}
                    className="bg-[#E7F0F8] border border-white/75 shadow-[5px_5px_14px_rgba(166,185,204,0.35),-5px_-5px_14px_rgba(255,255,255,0.85)] rounded-[22px] p-3 flex flex-col justify-between group hover:shadow-[7px_7px_18px_rgba(166,185,204,0.45),-7px_-7px_18px_rgba(255,255,255,0.95)] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                    onClick={() => onViewPackageDetails(pkg as TourPackage)}
                  >
                    {/* Photo Container */}
                    <div className="relative aspect-square w-full rounded-[16px] overflow-hidden bg-slate-100">
                      <img
                        src={pkgImg}
                        alt={pkg.package_name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Floating Heart Wishlist Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof toggleSavePackage === 'function') {
                            toggleSavePackage(pkg.id);
                          }
                        }}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 border border-white/80 shadow-xs flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        aria-label="Save package"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isSaved ? 'text-[#E67A60] fill-[#E67A60]' : 'text-[#63778D]'
                          }`}
                        />
                      </button>

                      {/* Small duration pill */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#263B55]">
                        {pkg.duration?.split('/')[0]?.trim() || '4 Days'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-2.5 space-y-1">
                      <h5 className="text-xs sm:text-sm font-bold text-[#263B55] truncate">
                        {pkg.destination_name}
                      </h5>
                      <p className="text-[11px] text-[#63778D] truncate">{pkg.package_name}</p>

                      <div className="pt-1.5 flex items-center justify-between border-t border-white/70">
                        <span className="text-xs font-extrabold text-[#263B55]">
                          ৳{pkg.price.toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestQuote(pkg as TourPackage);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#E7F0F8] hover:bg-[#F7FAFD] border border-white/80 shadow-[2px_2px_5px_rgba(166,185,204,0.3),-2px_-2px_5px_rgba(255,255,255,0.8)] text-[10px] font-bold text-[#263B55] cursor-pointer transition-all"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
