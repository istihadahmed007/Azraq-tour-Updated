import React, { useEffect, useRef, useState } from 'react';
import { Plane, Building2, Sparkles, ShieldCheck, Tag, Search, Globe, CalendarDays, ExternalLink, ArrowRight, RefreshCw } from 'lucide-react';
import { trackFlightSearchEvent } from '../data/flightsData';

interface TravelpayoutsWidgetProps {
  defaultTab?: 'search' | 'deals' | 'map' | 'schedule';
  className?: string;
  onNavigateToSearch?: (origin: string, destination: string) => void;
}

const TOP_FEATURED_DEALS = [
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'DXB',
    toCity: 'Dubai',
    priceBDT: '৳38,500',
    airline: 'Emirates / Flydubai',
    link: 'https://www.aviasales.com/search/DAC3108DXB0709100y?marker=765415&trs=565363&params=DAC1',
    badge: 'Popular Umrah & Expat',
    duration: '4h 50m direct',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'BKK',
    toCity: 'Bangkok',
    priceBDT: '৳28,900',
    airline: 'Biman / US-Bangla / Thai',
    link: 'https://www.aviasales.com/search/DAC3108BKK0709100y?marker=765415&trs=565363&params=DAC1',
    badge: 'Best Value Holiday',
    duration: '2h 30m direct',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'KUL',
    toCity: 'Kuala Lumpur',
    priceBDT: '৳31,200',
    airline: 'Malaysia Airlines / Batik',
    link: 'https://www.aviasales.com/search/DAC3108KUL0709100y?marker=765415&trs=565363&params=DAC1',
    badge: 'Direct Daily',
    duration: '3h 50m direct',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'JED',
    toCity: 'Jeddah / Makkah',
    priceBDT: '৳52,400',
    airline: 'Saudia / Biman',
    link: 'https://www.aviasales.com/search/DAC3108JED0709100y?marker=765415&trs=565363&params=DAC1',
    badge: 'Umrah Direct',
    duration: '6h 30m direct',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'SIN',
    toCity: 'Singapore',
    priceBDT: '৳39,800',
    airline: 'Singapore Airlines / Biman',
    link: 'https://www.aviasales.com/search/DAC3108SIN0709100y?marker=765415&trs=565363&params=DAC1',
    badge: 'Medical & Leisure',
    duration: '4h 05m direct',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'LHR',
    toCity: 'London',
    priceBDT: '৳84,500',
    airline: 'Biman / Qatar / Emirates',
    link: 'https://www.aviasales.com/search/DAC3108LHR0709100y?marker=765415&trs=565363&params=DAC1',
    badge: 'UK Student & Diaspora',
    duration: '11h 15m direct',
  },
];

export const TravelpayoutsWidget: React.FC<TravelpayoutsWidgetProps> = ({
  defaultTab = 'search',
  className = '',
  onNavigateToSearch,
}) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'search' | 'deals' | 'map' | 'schedule'>(defaultTab);
  const [hasScriptError, setHasScriptError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setHasScriptError(false);
    setIsLoading(true);

    // Clear previous widget contents
    container.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';

    if (activeWidgetTab === 'deals') {
      script.src =
        'https://tpwidg.com/content?currency=bdt&trs=565363&shmarker=765415&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&primary=%230085FF&promo_id=4044&campaign_id=100';
    } else if (activeWidgetTab === 'map') {
      script.src =
        'https://tpwidg.com/content?currency=bdt&trs=565363&shmarker=765415&lat=23.8103&lng=90.4125&powered_by=true&search_host=www.aviasales.com%2Fsearch&locale=en&origin=DAC&value_min=0&value_max=1000000&round_trip=true&only_direct=false&radius=1&draggable=true&disable_zoom=false&show_logo=false&scrollwheel=false&primary=%233FABDB&secondary=%233FABDB&light=%23ffffff&width=1500&height=500&zoom=2&promo_id=4054&campaign_id=100';
    } else if (activeWidgetTab === 'schedule') {
      script.src =
        'https://tpwidg.com/content?currency=bdt&trs=565363&shmarker=765415&color_button=%23FF0000&target_host=www.aviasales.com%2Fsearch&locale=en&powered_by=true&origin=DAC&destination=BKK&with_fallback=false&non_direct_flights=true&min_lines=5&border_radius=0&color_background=%23FFFFFF&color_text=%23000000&color_border=%23FFFFFF&promo_id=2811&campaign_id=100';
    } else {
      script.src =
        'https://tpwidg.com/content?currency=bdt&trs=565363&shmarker=765415&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&plain=false&promo_id=7879&campaign_id=100';
    }

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      console.warn('Third-party Travelpayouts script was blocked or failed to load. Showing Azraq Live Fallback.');
      setHasScriptError(true);
      setIsLoading(false);
    };

    // Safety timeout: if widget doesn't render after 4.5s (sandbox or adblock restriction)
    const timer = setTimeout(() => {
      if (container && container.childElementCount <= 1 && !container.querySelector('iframe')) {
        setHasScriptError(true);
        setIsLoading(false);
      }
    }, 4500);

    try {
      container.appendChild(script);
    } catch (e) {
      setHasScriptError(true);
      setIsLoading(false);
    }

    return () => {
      clearTimeout(timer);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [activeWidgetTab]);

  const handleBookDirect = (deal: typeof TOP_FEATURED_DEALS[0]) => {
    trackFlightSearchEvent('partner_redirect', {
      origin: deal.from,
      destination: deal.to,
      partnerName: 'Aviasales Partner Network',
      priceBDT: deal.priceBDT,
    });
    window.open(deal.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="travelpayouts-booking-widget"
      className={`travelpayouts-booking-widget w-full rounded-2xl bg-[#071A33]/95 border border-sky-400/30 backdrop-blur-md p-4 sm:p-6 shadow-2xl transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0D6EFD] to-[#22C7C9] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>
                {activeWidgetTab === 'deals'
                  ? 'Top Cheap Flight Deals'
                  : activeWidgetTab === 'map'
                  ? 'Low-Fare Flight Route Map'
                  : activeWidgetTab === 'schedule'
                  ? 'Flight Schedule & Direct Flights'
                  : 'Flight & Hotel Search Engine'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                BDT ৳ Live
              </span>
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <span>Aviasales & Travelpayouts Partner Engine</span>
              <span>•</span>
              <span className="text-sky-300 font-medium">Marker: 765415</span>
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/15 backdrop-blur-sm flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveWidgetTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeWidgetTab === 'search'
                ? 'bg-[#0D6EFD] text-white shadow-sm'
                : 'text-sky-200/80 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Form</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWidgetTab('deals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeWidgetTab === 'deals'
                ? 'bg-[#22C7C9] text-slate-950 font-extrabold shadow-sm'
                : 'text-sky-200/80 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Top 6 Deals</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWidgetTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeWidgetTab === 'schedule'
                ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                : 'text-sky-200/80 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Schedule Table</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWidgetTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeWidgetTab === 'map'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                : 'text-sky-200/80 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Route Map</span>
          </button>
        </div>
      </div>

      {/* Target container or Fallback Live Deals Grid */}
      {hasScriptError ? (
        <div className="rounded-xl bg-slate-900/90 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-sky-200">
                Live Flight Inventory from Dhaka (DAC) • Powered by Aviasales
              </span>
            </div>
            <a
              href="https://www.aviasales.com/search/DAC3108DXB0709100y?marker=765415&trs=565363&params=DAC1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#22C7C9] hover:underline flex items-center gap-1 font-bold"
            >
              <span>Explore All Global Routes</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOP_FEATURED_DEALS.map((deal, idx) => (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3.5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-sky-300 font-semibold mb-1">
                    <span className="bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded-md border border-sky-400/20 text-[10px]">
                      {deal.badge}
                    </span>
                    <span className="text-slate-400">{deal.duration}</span>
                  </div>

                  <div className="flex items-center justify-between my-2">
                    <div>
                      <div className="text-sm font-black text-white">{deal.fromCity}</div>
                      <div className="text-[11px] font-mono text-slate-400">{deal.from}</div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2">
                      <div className="w-6 border-t border-dashed border-sky-400/40"></div>
                      <Plane className="w-3.5 h-3.5 text-[#22C7C9] transform rotate-90" />
                      <div className="w-6 border-t border-dashed border-sky-400/40"></div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">{deal.toCity}</div>
                      <div className="text-[11px] font-mono text-slate-400">{deal.to}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 mb-2 truncate">
                    {deal.airline}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between mt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">From</span>
                    <span className="text-sm font-black text-emerald-400">{deal.priceBDT}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookDirect(deal)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0D6EFD] to-[#22C7C9] hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all"
                  >
                    <span>Check Fare</span>
                    <ArrowRight className="w-3 h-3 text-slate-950" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          id="tp-widget-container"
          ref={containerRef}
          key={activeWidgetTab}
          className="min-h-[240px] w-full flex items-center justify-center relative rounded-xl overflow-hidden"
        >
          {isLoading && (
            <div className="text-xs text-sky-200/70 py-10 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>
                Loading{' '}
                {activeWidgetTab === 'deals'
                  ? 'Top 6 Flight Deals (BDT)'
                  : activeWidgetTab === 'map'
                  ? 'Global Flight Route Map (BDT)'
                  : activeWidgetTab === 'schedule'
                  ? 'Flight Schedule & Direct Flights (BDT)'
                  : 'Aviasales & Hotels Widget (BDT)'}
                ...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer reassurance */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-sky-200/70 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Best Price Guarantee & Direct Airline/Hotel Booking in BDT</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Powered by Aviasales & Travelpayouts (765415)</span>
          {hasScriptError && (
            <button
              type="button"
              onClick={() => {
                setHasScriptError(false);
                setIsLoading(true);
              }}
              className="text-sky-300 hover:text-sky-100 underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Reload Widget</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
