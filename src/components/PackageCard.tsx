import React from 'react';
import { TourPackage } from '../types';
import { getVisaFeeForDestination } from '../data/visaRequirementsData';
import {
  Calendar,
  MapPin,
  FileText,
  CheckCircle2,
  FileCheck,
  Star,
  Heart,
  ArrowRight,
  Eye
} from 'lucide-react';
import { getOptimizedUnsplashUrl, getUnsplashSrcSet } from '../utils/imageOptimization';
import { usePackages } from '../context/PackageContext';

interface PackageCardProps {
  pkg: TourPackage;
  onViewDetails: (pkg: TourPackage) => void;
  onRequestQuote: (pkg: TourPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onViewDetails,
  onRequestQuote,
}) => {
  const packageContext = usePackages();
  const isPackageSaved = packageContext?.isPackageSaved;
  const toggleSavePackage = packageContext?.toggleSavePackage;
  const isSaved = typeof isPackageSaved === 'function' ? isPackageSaved(pkg.id) : false;

  const displayImage =
    pkg.images && pkg.images.length > 0
      ? pkg.images[0]
      : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=75';

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E1EFF8] hover:border-[#5BC7F4] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Hero Image & Badges */}
      <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100">
        <img
          src={getOptimizedUnsplashUrl(displayImage, 800, 75)}
          srcSet={getUnsplashSrcSet(displayImage, [400, 800, 1000], 75)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          alt={pkg.package_name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002f6c]/80 via-transparent to-transparent" />

        {/* Destination & Country Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0759B8] text-white shadow-md flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-200" />
            {pkg.destination_name}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-[#0759B8] backdrop-blur-md border border-white/60 shadow-xs">
            {pkg.country}
          </span>
        </div>

        {/* Wishlist Button (min 48x48px tap target) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof toggleSavePackage === 'function') {
              toggleSavePackage(pkg.id);
            }
          }}
          type="button"
          aria-label={isSaved ? 'Remove from saved trips' : 'Save trip to wishlist'}
          className="absolute top-2.5 right-2.5 z-20 min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/90 hover:bg-white border border-white/80 text-slate-700 flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} />
        </button>

        {/* Rating & Verified Tag */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-extrabold text-slate-900 shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>4.9 (Verified)</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#003B80]/95 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 shadow-lg text-right">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#5BC7F4]">From</p>
          <p className="text-base sm:text-lg font-black text-white font-mono leading-tight">
            {pkg.currency === 'BDT' ? '৳' : pkg.currency || '৳'}{' '}
            {pkg.price.toLocaleString()}
            <span className="text-[11px] font-normal text-sky-200"> / pax</span>
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
        <div>
          {/* Package Title */}
          <h3
            onClick={() => onViewDetails(pkg)}
            className="text-base sm:text-lg font-bold text-[#12304A] group-hover:text-[#0759B8] transition-colors line-clamp-2 cursor-pointer font-poppins"
          >
            {pkg.package_name}
          </h3>

          {/* Meta Bar */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1 bg-[#F4FAFD] px-2.5 py-1 rounded-lg border border-[#E1EFF8] text-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#1389E8]" />
              {pkg.duration}
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Visa: {pkg.visa_fee || getVisaFeeForDestination(pkg.country || pkg.destination_name)}
            </span>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>

          {/* Highlights */}
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0759B8]">Included Highlights</p>
              <div className="space-y-1">
                {pkg.highlights.slice(0, 2).map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="truncate">{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(pkg)}
            type="button"
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#F4FAFD] hover:bg-[#EAF7FF] text-[#0759B8] font-bold text-xs sm:text-sm border border-[#CDE9FB] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Eye className="w-4 h-4" />
            <span>Itinerary</span>
          </button>

          <button
            onClick={() => onRequestQuote(pkg)}
            type="button"
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1389E8] to-[#0759B8] hover:from-[#0E7FE3] hover:to-[#064B9C] text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>Book / Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
