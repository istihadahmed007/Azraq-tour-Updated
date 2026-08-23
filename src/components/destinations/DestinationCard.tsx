import React from 'react';
import { MapPin, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { Destination } from '../../types';

interface DestinationCardProps {
  destination: Destination;
  onClick: (destination: Destination) => void;
  className?: string;
}

export function DestinationCard({
  destination,
  onClick,
  className = '',
}: DestinationCardProps) {
  return (
    <div
      onClick={() => onClick(destination)}
      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col ${className}`}
    >
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-[#002244]/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#febb02]" />
          <span>{destination.country}</span>
        </div>
        {destination.badge && (
          <div className="absolute top-3 right-3 bg-[#febb02] text-[#002244] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            {destination.badge}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#006ce4] transition-colors">
            {destination.name}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
            {destination.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>From </span>
            <strong className="text-sm font-bold text-slate-900">
              {destination.priceRange || 'BDT 45,000'}
            </strong>
          </div>

          <span className="text-xs font-semibold text-[#006ce4] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View Guide <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default DestinationCard;
