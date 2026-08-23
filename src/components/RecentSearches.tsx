import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, X, Sparkles, Plane } from 'lucide-react';
import { NormalizedFlightSearch } from '../utils/flightSearchEngine';

const RECENT_SEARCHES_STORAGE_KEY = 'azraq_recent_flight_searches_v2';

export interface RecentSearchItem {
  id: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  departDate: string;
  returnDate?: string;
  tripType: 'round' | 'oneway' | 'multi';
  adults: number;
  cabinClass: string;
  searchedAt: number;
}

interface RecentSearchesProps {
  onSelectSearch: (search: Partial<NormalizedFlightSearch>) => void;
  className?: string;
}

export const saveRecentFlightSearch = (search: NormalizedFlightSearch) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    const existing: RecentSearchItem[] = raw ? JSON.parse(raw) : [];

    const newItem: RecentSearchItem = {
      id: `${search.origin.code}-${search.destination.code}-${search.departureDate}-${search.tripType}`,
      originCode: search.origin.code,
      originCity: search.origin.city,
      destCode: search.destination.code,
      destCity: search.destination.city,
      departDate: search.departureDate,
      returnDate: search.returnDate,
      tripType: search.tripType,
      adults: search.adults,
      cabinClass: search.cabinClass,
      searchedAt: Date.now(),
    };

    // Remove duplicates and keep top 5
    const filtered = existing.filter((item) => item.id !== newItem.id);
    const updated = [newItem, ...filtered].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save recent search:', err);
  }
};

export const getRecentFlightSearches = (): RecentSearchItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) {
      // Return realistic defaults if empty
      return [
        {
          id: 'DAC-BKK-default',
          originCode: 'DAC',
          originCity: 'Dhaka',
          destCode: 'BKK',
          destCity: 'Bangkok',
          departDate: '2026-09-03',
          returnDate: '2026-09-10',
          tripType: 'round',
          adults: 1,
          cabinClass: 'Economy',
          searchedAt: Date.now() - 3600000,
        },
        {
          id: 'DAC-KUL-default',
          originCode: 'DAC',
          originCity: 'Dhaka',
          destCode: 'KUL',
          destCity: 'Kuala Lumpur',
          departDate: '2026-10-12',
          returnDate: '2026-10-18',
          tripType: 'round',
          adults: 1,
          cabinClass: 'Economy',
          searchedAt: Date.now() - 86400000,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const RecentSearches: React.FC<RecentSearchesProps> = ({ onSelectSearch, className = '' }) => {
  const [searches, setSearches] = useState<RecentSearchItem[]>([]);

  useEffect(() => {
    setSearches(getRecentFlightSearches());
  }, []);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = searches.filter((s) => s.id !== id);
    setSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelect = (item: RecentSearchItem) => {
    onSelectSearch({
      origin: {
        code: item.originCode,
        city: item.originCity,
        country: 'Airport',
        name: `${item.originCity} Airport`,
      },
      destination: {
        code: item.destCode,
        city: item.destCity,
        country: 'Airport',
        name: `${item.destCity} Airport`,
      },
      departureDate: item.departDate,
      returnDate: item.returnDate,
      tripType: item.tripType,
      adults: item.adults,
      cabinClass: item.cabinClass as any,
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  if (searches.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-[#1677FF]" />
          <span>Recent Searches</span>
        </div>
        <span className="text-[11px] text-slate-400">Click to restore search</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {searches.map((item) => {
          const dateSummary =
            item.tripType === 'round' && item.returnDate
              ? `${formatDate(item.departDate)} – ${formatDate(item.returnDate)}`
              : `${formatDate(item.departDate)} · One way`;

          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="group relative flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/80 hover:border-[#1677FF]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1677FF] group-hover:bg-[#1677FF] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Plane className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033] truncate">
                    <span>{item.originCity}</span>
                    <span className="text-slate-400">→</span>
                    <span>{item.destCity}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {dateSummary} · {item.adults} Pax
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={(e) => handleRemove(item.id, e)}
                  className="w-6 h-6 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from recent searches"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-[#1677FF]/10 text-slate-400 group-hover:text-[#1677FF] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
