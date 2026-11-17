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
    <div className="group bg-[#E7F0F8] hover:bg-[#F7FAFD] rounded-[24px] overflow-hidden border border-white/80 shadow-[6px_6px_20px_rgba(166,185,204,0.4),-6px_-6px_20px_rgba(255,255,255,0.85)] hover:shadow-[8px_8px_24px_rgba(166,185,204,0.5),-8px_-8px_24px_rgba(255,255,255,0.95)] transition-all duration-300 flex flex-col h-full">
      {/* Hero Image & Badges */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100">
        <img
          src={getOptimizedUnsplashUrl(displayImage, 800, 75)}
          srcSet={getUnsplashSrcSet(displayImage, [400, 800, 1000], 75)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          alt={pkg.package_name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#263B55]/60 via-transparent to-transparent" />

        {/* Destination & Country Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#263B55] text-white shadow-xs flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#73A9D2]" />
            {pkg.destination_name}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-[#263B55] backdrop-blur-md border border-white/60 shadow-xs">
            {pkg.country}
          </span>
        </div>

        {/* Wishlist Button (min 44x44px tap target) */}
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
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-[#E67A60] text-[#E67A60]' : 'text-[#63778D]'}`} />
        </button>

        {/* Rating & Verified Tag */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-white/70 px-2.5 py-1 rounded-lg text-xs font-bold text-[#263B55] shadow-xs">
          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
          <span>4.9 (Verified)</span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#F7FAFD]/95 backdrop-blur-md border border-white/80 rounded-xl px-3 py-1 shadow-md text-right">
          <p className="text-[9px] uppercase font-bold tracking-widest text-[#73A9D2]">From</p>
          <p className="text-base font-bold text-[#263B55] font-sans leading-tight">
            {pkg.currency === 'BDT' ? '৳' : pkg.currency || '৳'}{' '}
            {pkg.price.toLocaleString()}
            <span className="text-[10px] font-normal text-[#63778D]"> / pax</span>
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 bg-transparent">
        <div className="space-y-2">
          {/* Package Title */}
          <h3
            onClick={() => onViewDetails(pkg)}
            className="text-base sm:text-lg font-bold text-[#263B55] group-hover:text-[#73A9D2] transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {pkg.package_name}
          </h3>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#63778D] font-medium">
            <span className="flex items-center gap-1.5 bg-[#EAF2F8] px-2.5 py-1 rounded-lg border border-white/70 text-[#263B55]">
              <Calendar className="w-3.5 h-3.5 text-[#73A9D2]" />
              {pkg.duration}
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px] font-bold">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Visa: {pkg.visa_fee || getVisaFeeForDestination(pkg.country || pkg.destination_name)}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-[#63778D] leading-relaxed line-clamp-2 font-sans">
            {pkg.description}
          </p>

          {/* Highlights */}
          {pkg.highlights && pkg.highlights.length > 0 && (
            <div className="pt-2 border-t border-white/60 space-y-1">
              {pkg.highlights.slice(0, 2).map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#63778D]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#73A9D2] shrink-0 mt-0.5" />
                  <span className="truncate">{hl}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-white/60 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(pkg)}
            type="button"
            className="w-full min-h-[42px] py-2 px-3 rounded-full bg-[#E7F0F8] hover:bg-[#F7FAFD] text-[#263B55] font-bold text-xs border border-white/80 shadow-[2px_2px_5px_rgba(166,185,204,0.3),-2px_-2px_5px_rgba(255,255,255,0.85)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-[#63778D]" />
            <span>Itinerary</span>
          </button>

          <button
            onClick={() => onRequestQuote(pkg)}
            type="button"
            className="w-full min-h-[42px] py-2 px-3 rounded-full bg-[#73A9D2] hover:bg-[#5A94C2] text-white font-bold text-xs shadow-[3px_3px_8px_rgba(115,169,210,0.45)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
