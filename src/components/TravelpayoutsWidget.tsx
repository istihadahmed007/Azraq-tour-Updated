import React, { useState } from 'react';
import {
  Plane,
  Building2,
  Sparkles,
  ShieldCheck,
  Tag,
  Search,
  Globe,
  CalendarDays,
  ExternalLink,
  ArrowRight,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { trackFlightSearchEvent, BANGLADESH_AIRPORTS } from '../data/flightsData';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';

interface TravelpayoutsWidgetProps {
  defaultTab?: 'search' | 'deals' | 'schedule' | 'map';
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
    airline: 'Emirates / Flydubai / Biman',
    searchKey: 'DAC3108DXB0709100y',
    badge: 'Popular Umrah & Expat',
    duration: '4h 50m direct',
    category: 'Middle East',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'BKK',
    toCity: 'Bangkok',
    priceBDT: '৳28,900',
    airline: 'Biman / US-Bangla / Thai',
    searchKey: 'DAC3108BKK0709100y',
    badge: 'Best Value Holiday',
    duration: '2h 30m direct',
    category: 'Southeast Asia',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'KUL',
    toCity: 'Kuala Lumpur',
    priceBDT: '৳31,200',
    airline: 'Malaysia Airlines / Batik Air',
    searchKey: 'DAC3108KUL0709100y',
    badge: 'Direct Daily',
    duration: '3h 50m direct',
    category: 'Southeast Asia',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'JED',
    toCity: 'Jeddah / Makkah',
    priceBDT: '৳52,400',
    airline: 'Saudia / Biman Bangladesh',
    searchKey: 'DAC3108JED0709100y',
    badge: 'Umrah & Pilgrimage',
    duration: '6h 30m direct',
    category: 'Middle East',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'SIN',
    toCity: 'Singapore',
    priceBDT: '৳39,800',
    airline: 'Singapore Airlines / Biman',
    searchKey: 'DAC3108SIN0709100y',
    badge: 'Medical & Leisure',
    duration: '4h 05m direct',
    category: 'Southeast Asia',
  },
  {
    from: 'DAC',
    fromCity: 'Dhaka',
    to: 'LHR',
    toCity: 'London (Heathrow)',
    priceBDT: '৳84,500',
    airline: 'Biman / Qatar / Emirates',
    searchKey: 'DAC3108LHR0709100y',
    badge: 'UK Student & Diaspora',
    duration: '11h 15m direct',
    category: 'Europe',
  },
];

const FLIGHT_SCHEDULES = [
  {
    route: 'Dhaka (DAC) ➔ Dubai (DXB)',
    airlines: 'Emirates, Biman, Flydubai, US-Bangla',
    frequency: 'Daily (7+ flights/day)',
    duration: '4h 45m',
    direct: true,
    indicativeFare: 'From ৳38,500',
    code: 'DXB',
  },
  {
    route: 'Dhaka (DAC) ➔ Bangkok (BKK)',
    airlines: 'Thai Airways, Biman, US-Bangla',
    frequency: 'Daily (4 flights/day)',
    duration: '2h 30m',
    direct: true,
    indicativeFare: 'From ৳28,900',
    code: 'BKK',
  },
  {
    route: 'Dhaka (DAC) ➔ Jeddah / Makkah (JED)',
    airlines: 'Saudia, Biman Bangladesh',
    frequency: 'Daily (3 flights/day)',
    duration: '6h 30m',
    direct: true,
    indicativeFare: 'From ৳52,400',
    code: 'JED',
  },
  {
    route: 'Dhaka (DAC) ➔ Kuala Lumpur (KUL)',
    airlines: 'Malaysia Airlines, Biman, Batik Air, AirAsia',
    frequency: 'Daily (5 flights/day)',
    duration: '3h 50m',
    direct: true,
    indicativeFare: 'From ৳31,200',
    code: 'KUL',
  },
  {
    route: 'Dhaka (DAC) ➔ Singapore (SIN)',
    airlines: 'Singapore Airlines, Biman, US-Bangla',
    frequency: 'Daily (3 flights/day)',
    duration: '4h 05m',
    direct: true,
    indicativeFare: 'From ৳39,800',
    code: 'SIN',
  },
  {
    route: 'Dhaka (DAC) ➔ London (LHR)',
    airlines: 'Biman (Direct), Qatar Airways, Emirates (1 Stop)',
    frequency: 'Daily (Biman Direct 4x/week)',
    duration: '11h 15m direct',
    direct: true,
    indicativeFare: 'From ৳84,500',
    code: 'LHR',
  },
  {
    route: 'Dhaka (DAC) ➔ Doha (DOH)',
    airlines: 'Qatar Airways, Biman Bangladesh',
    frequency: 'Daily (4 flights/day)',
    duration: '5h 30m',
    direct: true,
    indicativeFare: 'From ৳44,200',
    code: 'DOH',
  },
  {
    route: 'Dhaka (DAC) ➔ New York (JFK)',
    airlines: 'Qatar Airways, Emirates, Turkish, Saudia',
    frequency: 'Daily (1 Stop via DOH/DXB/IST)',
    duration: '17h 30m',
    direct: false,
    indicativeFare: 'From ৳1,15,000',
    code: 'JFK',
  },
];

export const TravelpayoutsWidget: React.FC<TravelpayoutsWidgetProps> = ({
  defaultTab = 'search',
  className = '',
  onNavigateToSearch,
}) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'search' | 'deals' | 'schedule' | 'map'>(defaultTab);

  // Search tab inputs
  const [origin, setOrigin] = useState('DAC');
  const [destination, setDestination] = useState('DXB');
  const [tripType, setTripType] = useState<'round' | 'oneWay'>('round');
  const [departDate, setDepartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<'Y' | 'C' | 'F'>('Y');
  const [includeHotels, setIncludeHotels] = useState(false);

  const marker = AZRAQ_AGENCY_CONFIG.travelpayoutsMarker || '765415';
  const trs = AZRAQ_AGENCY_CONFIG.travelpayoutsTrsId || '565363';

  const handleLaunchSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const dDate = new Date(departDate);
    const depDDMM = `${String(dDate.getDate()).padStart(2, '0')}${String(dDate.getMonth() + 1).padStart(2, '0')}`;
    let retDDMM = '';
    if (tripType === 'round' && returnDate) {
      const rDate = new Date(returnDate);
      retDDMM = `${String(rDate.getDate()).padStart(2, '0')}${String(rDate.getMonth() + 1).padStart(2, '0')}`;
    }

    const paxCode = `${passengers}00`;
    const classCode = cabinClass.toLowerCase();
    const searchKey = `${origin}${depDDMM}${destination}${retDDMM}${paxCode}${classCode}`;
    const aviasalesUrl = `https://www.aviasales.com/search/${searchKey}?marker=${marker}&trs=${trs}&currency=bdt&locale=en&params=${origin}1`;

    trackFlightSearchEvent('partner_redirect', {
      origin,
      destination,
      tripType,
      partnerName: 'Aviasales Partner Network',
      directUrl: aviasalesUrl,
    });

    window.open(aviasalesUrl, '_blank', 'noopener,noreferrer');
  };

  const handleQuickDealClick = (deal: typeof TOP_FEATURED_DEALS[0]) => {
    const url = `https://www.aviasales.com/search/${deal.searchKey}?marker=${marker}&trs=${trs}&currency=bdt&locale=en&params=${deal.from}1`;
    trackFlightSearchEvent('partner_redirect', {
      origin: deal.from,
      destination: deal.to,
      partnerName: 'Aviasales Deal Card',
      priceBDT: deal.priceBDT,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleScheduleRouteClick = (item: typeof FLIGHT_SCHEDULES[0]) => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const depDDMM = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const searchKey = `DAC${depDDMM}${item.code}100y`;
    const url = `https://www.aviasales.com/search/${searchKey}?marker=${marker}&trs=${trs}&currency=bdt&locale=en&params=DAC1`;

    trackFlightSearchEvent('partner_redirect', {
      origin: 'DAC',
      destination: item.code,
      partnerName: 'Aviasales Route Schedule',
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="travelpayouts-booking-widget"
      className={`w-full rounded-2xl bg-[#071A33]/95 border border-sky-400/30 backdrop-blur-md p-4 sm:p-6 shadow-2xl transition-all ${className}`}
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
                  ? 'Low-Fare Route Explorer'
                  : activeWidgetTab === 'schedule'
                  ? 'Flight Schedules & Frequencies'
                  : 'Aviasales Flight & Hotel Engine'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                BDT ৳ Live
              </span>
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <span>Travelpayouts & Aviasales Direct Gateway</span>
              <span>•</span>
              <span className="text-sky-300 font-medium">Affiliate Marker: {marker}</span>
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
            <span>Top Deals</span>
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
            <span>Schedules</span>
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
            <span>Route Matrix</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Interactive Search Form */}
      {activeWidgetTab === 'search' && (
        <form onSubmit={handleLaunchSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Origin */}
            <div className="bg-white/10 border border-white/15 rounded-xl p-2.5">
              <label className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block mb-1">
                From (Origin)
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900/90 text-white text-sm font-semibold rounded-lg p-2 border border-white/10 focus:outline-none focus:border-[#22C7C9]"
              >
                <option value="DAC">Dhaka (DAC) - Hazrat Shahjalal</option>
                <option value="CGP">Chittagong (CGP) - Shah Amanat</option>
                <option value="ZYL">Sylhet (ZYL) - Osmani</option>
                <option value="CXB">Cox's Bazar (CXB)</option>
                <option value="JSR">Jashore (JSR)</option>
                <option value="RJH">Rajshahi (RJH)</option>
                <option value="SPD">Saidpur (SPD)</option>
                <option value="BZL">Barishal (BZL)</option>
              </select>
            </div>

            {/* Destination */}
            <div className="bg-white/10 border border-white/15 rounded-xl p-2.5">
              <label className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block mb-1">
                To (Destination)
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900/90 text-white text-sm font-semibold rounded-lg p-2 border border-white/10 focus:outline-none focus:border-[#22C7C9]"
              >
                <optgroup label="Middle East & Umrah">
                  <option value="DXB">Dubai (DXB) - UAE</option>
                  <option value="JED">Jeddah / Makkah (JED) - Saudi Arabia</option>
                  <option value="MED">Medina (MED) - Saudi Arabia</option>
                  <option value="DOH">Doha (DOH) - Qatar</option>
                  <option value="AUH">Abu Dhabi (AUH) - UAE</option>
                  <option value="SHJ">Sharjah (SHJ) - UAE</option>
                  <option value="RUH">Riyadh (RUH) - Saudi Arabia</option>
                  <option value="MCT">Muscat (MCT) - Oman</option>
                  <option value="KWI">Kuwait City (KWI) - Kuwait</option>
                </optgroup>
                <optgroup label="Southeast & South Asia">
                  <option value="BKK">Bangkok (BKK) - Thailand</option>
                  <option value="HKT">Phuket (HKT) - Thailand</option>
                  <option value="KUL">Kuala Lumpur (KUL) - Malaysia</option>
                  <option value="SIN">Singapore (SIN) - Singapore</option>
                  <option value="DPS">Bali (DPS) - Indonesia</option>
                  <option value="MLE">Malé (MLE) - Maldives</option>
                  <option value="KTM">Kathmandu (KTM) - Nepal</option>
                  <option value="CMB">Colombo (CMB) - Sri Lanka</option>
                  <option value="CCU">Kolkata (CCU) - India</option>
                  <option value="DEL">Delhi (DEL) - India</option>
                  <option value="MAA">Chennai (MAA) - India</option>
                </optgroup>
                <optgroup label="Europe & UK">
                  <option value="LHR">London Heathrow (LHR) - UK</option>
                  <option value="LGW">London Gatwick (LGW) - UK</option>
                  <option value="MAN">Manchester (MAN) - UK</option>
                  <option value="CDG">Paris (CDG) - France</option>
                  <option value="FRA">Frankfurt (FRA) - Germany</option>
                  <option value="AMS">Amsterdam (AMS) - Netherlands</option>
                  <option value="IST">Istanbul (IST) - Turkey</option>
                </optgroup>
                <optgroup label="Americas & Australia">
                  <option value="JFK">New York (JFK) - USA</option>
                  <option value="YYZ">Toronto (YYZ) - Canada</option>
                  <option value="SYD">Sydney (SYD) - Australia</option>
                  <option value="MEL">Melbourne (MEL) - Australia</option>
                </optgroup>
              </select>
            </div>

            {/* Travel Dates */}
            <div className="bg-white/10 border border-white/15 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-sky-200 uppercase tracking-wider">
                  {tripType === 'round' ? 'Departure & Return' : 'Departure Date'}
                </label>
                <div className="flex items-center gap-2 text-[10px] text-sky-300">
                  <button
                    type="button"
                    onClick={() => setTripType('round')}
                    className={`cursor-pointer ${tripType === 'round' ? 'font-bold underline text-white' : ''}`}
                  >
                    Round Trip
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setTripType('oneWay')}
                    className={`cursor-pointer ${tripType === 'oneWay' ? 'font-bold underline text-white' : ''}`}
                  >
                    One Way
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-slate-900/90 text-white text-xs font-semibold rounded-lg p-2 border border-white/10 focus:outline-none"
                />
                {tripType === 'round' ? (
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-900/90 text-white text-xs font-semibold rounded-lg p-2 border border-white/10 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center justify-center text-[11px] text-slate-400 bg-slate-900/50 rounded-lg">
                    One-Way
                  </div>
                )}
              </div>
            </div>

            {/* Passengers & Class */}
            <div className="bg-white/10 border border-white/15 rounded-xl p-2.5">
              <label className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block mb-1">
                Travelers & Cabin Class
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full bg-slate-900/90 text-white text-xs font-semibold rounded-lg p-2 border border-white/10 focus:outline-none"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                  <option value={5}>5+ Adults</option>
                </select>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as any)}
                  className="w-full bg-slate-900/90 text-white text-xs font-semibold rounded-lg p-2 border border-white/10 focus:outline-none"
                >
                  <option value="Y">Economy</option>
                  <option value="C">Business</option>
                  <option value="F">First Class</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeHotels}
                  onChange={(e) => setIncludeHotels(e.target.checked)}
                  className="w-4 h-4 rounded text-[#22C7C9] bg-slate-800 border-white/20"
                />
                <span>Also search hotels in destination (Aviasales & Hotels)</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D6EFD] via-[#1389E8] to-[#22C7C9] hover:opacity-95 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.99]"
            >
              <Plane className="w-4 h-4 text-slate-950" />
              <span>Search Flights on Aviasales (BDT ৳)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Top Deals Cards */}
      {activeWidgetTab === 'deals' && (
        <div className="rounded-xl bg-slate-900/90 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-sky-200">
                Live Flight Deals from Bangladesh • Verified Aviasales Gateway
              </span>
            </div>
            <span className="text-xs text-slate-400">Instant direct booking with official airline inventory</span>
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
                    onClick={() => handleQuickDealClick(deal)}
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
      )}

      {/* Tab 3: Flight Schedule & Frequencies */}
      {activeWidgetTab === 'schedule' && (
        <div className="rounded-xl bg-slate-900/90 border border-white/10 p-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-sky-200 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-2">Route</th>
                <th className="pb-2">Operating Airlines</th>
                <th className="pb-2">Frequency</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Indicative Fare</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {FLIGHT_SCHEDULES.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 font-bold text-white whitespace-nowrap">
                    {item.route}
                  </td>
                  <td className="py-2.5 text-slate-300 whitespace-nowrap">
                    {item.airlines}
                  </td>
                  <td className="py-2.5 text-slate-400 whitespace-nowrap">
                    {item.frequency}
                  </td>
                  <td className="py-2.5 whitespace-nowrap">
                    <span className="bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded text-[10px] font-mono">
                      {item.duration}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-emerald-400 whitespace-nowrap">
                    {item.indicativeFare}
                  </td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleScheduleRouteClick(item)}
                      className="px-2.5 py-1 rounded bg-[#22C7C9] text-slate-950 font-bold text-[11px] hover:bg-[#1fb3b5] cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Find Flights</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Route Matrix */}
      {activeWidgetTab === 'map' && (
        <div className="rounded-xl bg-slate-900/90 border border-white/10 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-xs font-bold text-[#22C7C9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Middle East & Holy Umrah
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href={`https://www.aviasales.com/search/DAC3108DXB0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Dubai</span> <span className="text-emerald-400 font-mono">৳38.5k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108JED0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Jeddah / Makkah</span> <span className="text-emerald-400 font-mono">৳52.4k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108MED0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Medina</span> <span className="text-emerald-400 font-mono">৳54.0k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108DOH0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Doha</span> <span className="text-emerald-400 font-mono">৳44.2k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108AUH0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Abu Dhabi</span> <span className="text-emerald-400 font-mono">৳39.0k</span></a></li>
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-xs font-bold text-[#22C7C9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Southeast Asia & Holidays
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href={`https://www.aviasales.com/search/DAC3108BKK0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Bangkok</span> <span className="text-emerald-400 font-mono">৳28.9k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108KUL0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Kuala Lumpur</span> <span className="text-emerald-400 font-mono">৳31.2k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108SIN0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Singapore</span> <span className="text-emerald-400 font-mono">৳39.8k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108DPS0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Bali</span> <span className="text-emerald-400 font-mono">৳46.5k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108MLE0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Maldives</span> <span className="text-emerald-400 font-mono">৳41.0k</span></a></li>
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-xs font-bold text-[#22C7C9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Europe & United Kingdom
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href={`https://www.aviasales.com/search/DAC3108LHR0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ London (LHR)</span> <span className="text-emerald-400 font-mono">৳84.5k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108MAN0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Manchester</span> <span className="text-emerald-400 font-mono">৳89.0k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108CDG0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Paris</span> <span className="text-emerald-400 font-mono">৳88.0k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108FRA0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Frankfurt</span> <span className="text-emerald-400 font-mono">৳86.5k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108IST0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Istanbul</span> <span className="text-emerald-400 font-mono">৳65.0k</span></a></li>
              </ul>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-xs font-bold text-[#22C7C9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Americas & Australia
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><a href={`https://www.aviasales.com/search/DAC3108JFK0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ New York (JFK)</span> <span className="text-emerald-400 font-mono">৳115k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108YYZ0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Toronto</span> <span className="text-emerald-400 font-mono">৳125k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108SYD0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Sydney</span> <span className="text-emerald-400 font-mono">৳98.0k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108MEL0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Melbourne</span> <span className="text-emerald-400 font-mono">৳99.5k</span></a></li>
                <li><a href={`https://www.aviasales.com/search/DAC3108LAX0709100y?marker=${marker}&trs=${trs}&params=DAC1`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-white hover:underline flex items-center justify-between"><span>Dhaka ➔ Los Angeles</span> <span className="text-emerald-400 font-mono">৳120k</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer reassurance */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-sky-200/70 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time BDT Fare Comparison & Direct Airline Booking</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Powered by Aviasales & Travelpayouts ({marker})</span>
        </div>
      </div>
    </div>
  );
};
