import React, { useState, useRef, useEffect } from 'react';
import {
  Plane,
  Building2,
  Package,
  FileCheck2,
  Sparkles,
  ArrowRightLeft,
  Calendar,
  Users,
  ChevronDown,
  Search,
  ArrowRight,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Mic,
  Loader2,
  Check,
} from 'lucide-react';
import {
  POPULAR_AIRPORTS,
  BANGLADESH_AIRPORTS,
  Airport,
  trackFlightSearchEvent,
} from '../data/flightsData';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import { AirportAutocompleteField } from './AirportAutocompleteField';

export type TripFinderMode = 'flights' | 'hotels' | 'packages' | 'visa' | 'planner';

export interface FlightSearchParams {
  tripType: 'round' | 'oneway' | 'multi';
  origin: Airport;
  destination: Airport;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  currency: string;
}

interface AzraqTripFinderProps {
  initialMode?: TripFinderMode;
  onSearchFlights: (params: FlightSearchParams) => void;
  onNavigateToView: (view: any, extra?: any) => void;
  onOpenVisaModal?: (country?: string) => void;
  onOpenQuoteModal?: () => void;
  onOpenVoiceModal?: (initialTranscript?: string) => void;
  className?: string;
}

export const AzraqTripFinder: React.FC<AzraqTripFinderProps> = ({
  initialMode = 'flights',
  onSearchFlights,
  onNavigateToView,
  onOpenVisaModal,
  onOpenQuoteModal,
  onOpenVoiceModal,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TripFinderMode>(initialMode);

  // Default dates: departure in 14 days, return in 21 days
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDepDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultRetDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Flight search states
  const [tripType, setTripType] = useState<'round' | 'oneway' | 'multi'>('round');
  const [origin, setOrigin] = useState<Airport>(BANGLADESH_AIRPORTS[0]); // DAC
  const [destination, setDestination] = useState<Airport>(
    POPULAR_AIRPORTS.find((a) => a.code === 'BKK') || POPULAR_AIRPORTS[4]
  );
  const [departureDate, setDepartureDate] = useState<string>(defaultDepDate);
  const [returnDate, setReturnDate] = useState<string>(defaultRetDate);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First'>('Economy');
  const [currency, setCurrency] = useState<string>('BDT');
  const [directOnly, setDirectOnly] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Popover menus & loading state
  const [openTravelersMenu, setOpenTravelersMenu] = useState(false);
  const [openCabinMenu, setOpenCabinMenu] = useState(false);
  const [openCurrencyMenu, setOpenCurrencyMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const travelersMenuRef = useRef<HTMLDivElement>(null);
  const cabinMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  // Hotel search states
  const [hotelCity, setHotelCity] = useState('Bangkok, Thailand');
  const [hotelCheckIn, setHotelCheckIn] = useState(defaultDepDate);
  const [hotelCheckOut, setHotelCheckOut] = useState(defaultRetDate);
  const [hotelGuests, setHotelGuests] = useState('2 adults · 1 room');

  // Tour Package states
  const [packageCountry, setPackageCountry] = useState('Thailand');
  const [packageStyle, setPackageStyle] = useState('Family Holiday');

  // Visa states
  const [visaCountry, setVisaCountry] = useState('Thailand');
  const [passportType, setPassportType] = useState('Bangladeshi Regular E-Passport');

  // Custom trip prompt
  const [plannerPrompt, setPlannerPrompt] = useState('5-day family holiday in Bangkok & Phuket with private transfers');

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (travelersMenuRef.current && !travelersMenuRef.current.contains(target)) {
        setOpenTravelersMenu(false);
      }
      if (cabinMenuRef.current && !cabinMenuRef.current.contains(target)) {
        setOpenCabinMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(target)) {
        setOpenCurrencyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Airport selection with auto-swap prevention for same airport
  const handleSelectOrigin = (selected: Airport) => {
    if (selected.code.toUpperCase() === destination.code.toUpperCase()) {
      setDestination(origin);
    }
    setOrigin(selected);
    setValidationError(null);
  };

  const handleSelectDestination = (selected: Airport) => {
    if (selected.code.toUpperCase() === origin.code.toUpperCase()) {
      setOrigin(destination);
    }
    setDestination(selected);
    setValidationError(null);
  };

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setValidationError(null);
  };

  // Date handlers
  const handleDepartureDateChange = (val: string) => {
    setDepartureDate(val);
    setValidationError(null);
    if (tripType === 'round' && returnDate && val > returnDate) {
      const depTime = new Date(val).getTime();
      const newRet = new Date(depTime + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setReturnDate(newRet);
    }
  };

  const handleReturnDateChange = (val: string) => {
    if (departureDate && val < departureDate) {
      setValidationError('Return date cannot be earlier than departure date.');
      return;
    }
    setValidationError(null);
    setReturnDate(val);
  };

  // Format date for airline display (e.g. "Wed, 16 Sep")
  const formatFlightDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      return `${dayName}, ${day} ${monthName}`;
    } catch {
      return dateStr;
    }
  };

  // Format date for Booking.com display (e.g., "Wed 9/2")
  const formatBookingDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `${dayName} ${month}/${day}`;
    } catch {
      return dateStr;
    }
  };

  const adjustDateByDays = (dateStr: string, days: number): string => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() + days);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) return todayStr;
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const handleFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.code === destination.code) {
      setValidationError('Origin and destination cannot be the same airport.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    trackFlightSearchEvent('search_submitted', {
      origin: origin.code,
      destination: destination.code,
      tripType,
      departureDate,
      returnDate: tripType === 'round' ? returnDate : undefined,
      adults,
      children,
      infants,
      cabinClass,
      currency,
    });

    onSearchFlights({
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'round' ? returnDate : departureDate,
      adults,
      children,
      infants,
      cabinClass,
      currency,
    });

    // Safety fallback to restore button state if navigation doesn't occur immediately
    setTimeout(() => {
      setIsSubmitting(false);
    }, 4000);
  };

  // Top quick routes from Dhaka
  const QUICK_ROUTES = [
    { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
    { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
    { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport' },
    { code: 'KTM', city: 'Kathmandu', country: 'Nepal', name: 'Tribhuvan International Airport' },
    { code: 'MLE', city: 'Male', country: 'Maldives', name: 'Velana International Airport' },
  ];

  const handleSelectQuickRoute = (r: typeof QUICK_ROUTES[0]) => {
    const dac = BANGLADESH_AIRPORTS[0];
    setOrigin(dac);
    setDestination({
      code: r.code,
      city: r.city,
      country: r.country,
      name: r.name,
    });
    setValidationError(null);
  };

  return (
    <div className={`w-full max-w-full ${className}`}>
      {/* 1. Mode Category Tabs (Refined Segmented Control) */}
      <div className="flex items-center gap-1 sm:gap-2 pb-3 overflow-x-auto no-scrollbar">
        <div className="inline-flex p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15">
          <button
            type="button"
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'flights'
                ? 'bg-white text-[#071A33] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Plane className={`w-4 h-4 ${activeTab === 'flights' ? 'text-[#17BEBB]' : 'text-white/70'}`} />
            <span>Flights</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-white text-[#071A33] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package className={`w-4 h-4 ${activeTab === 'packages' ? 'text-[#17BEBB]' : 'text-white/70'}`} />
            <span>Holiday Packages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visa')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'visa'
                ? 'bg-white text-[#071A33] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileCheck2 className={`w-4 h-4 ${activeTab === 'visa' ? 'text-[#17BEBB]' : 'text-white/70'}`} />
            <span>Visa Assistance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-white text-[#071A33] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'planner' ? 'text-amber-500' : 'text-white/70'}`} />
            <span>AI Trip Planner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'hotels'
                ? 'bg-white text-[#071A33] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'hotels' ? 'text-[#17BEBB]' : 'text-white/70'}`} />
            <span>Hotels</span>
          </button>
        </div>
      </div>

      {/* 2. Main Search Container: Premium Glassmorphic Floating Panel */}
      <div className="w-full bg-white/30 hover:bg-white/35 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(7,26,51,0.28)] border border-white/45 text-slate-900 ring-1 ring-white/30 relative overflow-hidden transition-all">
        {/* Luminous top specular refraction highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* ================= MODE 1: FLIGHTS ================= */}
        {activeTab === 'flights' && (
          <form onSubmit={handleFlightSubmit} className="space-y-4 relative z-10">
            {/* Top Secondary Controls Row (Segmented Pills & Popovers) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/25">
              <div className="flex flex-wrap items-center gap-2">
                {/* Trip Type Segmented Control */}
                <div className="inline-flex p-1 rounded-xl bg-white/35 backdrop-blur-md border border-white/35 text-xs font-semibold shadow-xs">
                  <button
                    type="button"
                    onClick={() => setTripType('round')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tripType === 'round'
                        ? 'bg-white text-[#071A33] shadow-sm font-bold'
                        : 'text-[#071A33]/80 hover:text-[#071A33] hover:bg-white/20'
                    }`}
                  >
                    Round-trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('oneway')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tripType === 'oneway'
                        ? 'bg-white text-[#071A33] shadow-sm font-bold'
                        : 'text-[#071A33]/80 hover:text-[#071A33] hover:bg-white/20'
                    }`}
                  >
                    One-way
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('multi')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tripType === 'multi'
                        ? 'bg-white text-[#071A33] shadow-sm font-bold'
                        : 'text-[#071A33]/80 hover:text-[#071A33] hover:bg-white/20'
                    }`}
                  >
                    Multi-city
                  </button>
                </div>

                {/* Cabin Class Popover */}
                <div className="relative" ref={cabinMenuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenCabinMenu(!openCabinMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/45 hover:bg-white/60 backdrop-blur-md border border-white/45 text-xs font-bold text-[#071A33] shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{cabinClass}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#071A33]/70" />
                  </button>
                  {openCabinMenu && (
                    <div className="absolute top-full left-0 mt-1.5 w-44 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/60 z-50 p-1 text-slate-800 space-y-0.5 animate-fadeIn">
                      {(['Economy', 'Premium Economy', 'Business', 'First'] as const).map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => {
                            setCabinClass(cls);
                            setOpenCabinMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                            cabinClass === cls ? 'bg-[#071A33] text-white' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{cls}</span>
                          {cabinClass === cls && <Check className="w-3.5 h-3.5 text-[#17BEBB]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Passenger Selector Button & Popover */}
                <div className="relative" ref={travelersMenuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenTravelersMenu(!openTravelersMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/45 hover:bg-white/60 backdrop-blur-md border border-white/45 text-xs font-bold text-[#071A33] shadow-xs transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#071A33]" />
                    <span>
                      {adults} {adults === 1 ? 'Adult' : 'Adults'}
                      {children > 0 ? `, ${children} Child` : ''}
                      {infants > 0 ? `, ${infants} Infant` : ''}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#071A33]/70" />
                  </button>

                  {openTravelersMenu && (
                    <div className="absolute top-full left-0 mt-1.5 w-68 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 z-50 p-4 text-slate-900 space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                          Travelers
                        </span>
                        <span className="text-xs font-bold text-[#071A33]">
                          {adults + children + infants} Total
                        </span>
                      </div>

                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Adults</div>
                          <div className="text-[10px] text-slate-500">Age 12+</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-4 text-center text-xs font-bold">{adults}</span>
                          <button
                            type="button"
                            disabled={adults >= 9}
                            onClick={() => setAdults(adults + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Children</div>
                          <div className="text-[10px] text-slate-500">Age 2-11</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={children <= 0}
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-4 text-center text-xs font-bold">{children}</span>
                          <button
                            type="button"
                            disabled={children >= 8}
                            onClick={() => setChildren(children + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Infants</div>
                          <div className="text-[10px] text-slate-500">Under 2 (on lap)</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={infants <= 0}
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold disabled:opacity-30 cursor-pointer flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-4 text-center text-xs font-bold">{infants}</span>
                          <button
                            type="button"
                            disabled={infants >= adults}
                            onClick={() => setInfants(infants + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-bold cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenTravelersMenu(false)}
                        className="w-full py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0B2545] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>

                {/* Currency Selector Popover */}
                <div className="relative" ref={currencyMenuRef}>
                  <button
                    type="button"
                    onClick={() => setOpenCurrencyMenu(!openCurrencyMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/45 hover:bg-white/60 backdrop-blur-md border border-white/45 text-xs font-bold text-[#071A33] shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-[#071A33] font-bold">
                      {currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : '€'}
                    </span>
                    <span>{currency}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#071A33]/70" />
                  </button>
                  {openCurrencyMenu && (
                    <div className="absolute top-full left-0 mt-1.5 w-32 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/60 z-50 p-1 text-slate-800 space-y-0.5 animate-fadeIn">
                      {[
                        { code: 'BDT', symbol: '৳' },
                        { code: 'USD', symbol: '$' },
                        { code: 'EUR', symbol: '€' },
                      ].map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCurrency(c.code);
                            setOpenCurrencyMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                            currency === c.code ? 'bg-[#071A33] text-white' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>
                            {c.code} ({c.symbol})
                          </span>
                          {currency === c.code && <Check className="w-3.5 h-3.5 text-[#17BEBB]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Flights Only Toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-bold text-[#071A33] hover:text-black cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={(e) => setDirectOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#071A33] border-white/60 focus:ring-[#071A33] cursor-pointer"
                />
                <span>Direct flights only</span>
              </label>
            </div>

            {/* Main Primary Search Row (Unified Flight Engine Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
              {/* Origin & Destination with Centered Swap Button */}
              <div className="lg:col-span-6 relative grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Origin Field */}
                <div>
                  <AirportAutocompleteField
                    label="Leaving from"
                    selectedAirport={origin}
                    onSelect={handleSelectOrigin}
                    otherAirportCode={destination.code}
                    placeholder="Where from? (DAC, LHR...)"
                    variant="hero"
                  />
                </div>

                {/* Desktop Center Swap Button */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    aria-label="Swap origin and destination"
                    className="w-10 h-10 rounded-full bg-white/85 hover:bg-white backdrop-blur-lg border border-white shadow-md hover:shadow-lg text-[#071A33] hover:text-[#17BEBB] hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                  >
                    <ArrowRightLeft className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                </div>

                {/* Mobile Swap Button */}
                <div className="flex sm:hidden justify-center -my-1 z-10">
                  <button
                    type="button"
                    onClick={handleSwapAirports}
                    aria-label="Swap origin and destination"
                    className="px-3 py-1 rounded-full bg-white/85 hover:bg-white backdrop-blur-lg border border-white shadow-xs text-xs font-bold text-[#071A33] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#17BEBB]" />
                    <span>Swap cities</span>
                  </button>
                </div>

                {/* Destination Field */}
                <div>
                  <AirportAutocompleteField
                    label="Going to"
                    selectedAirport={destination}
                    onSelect={handleSelectDestination}
                    otherAirportCode={origin.code}
                    placeholder="Where to? (BKK, DXB...)"
                    variant="hero"
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div className="lg:col-span-2 relative">
                <div className="w-full min-h-[72px] p-3 sm:p-3.5 bg-white/80 hover:bg-white/95 focus-within:bg-white backdrop-blur-md rounded-2xl border border-white/60 hover:border-white focus-within:ring-2 focus-within:ring-[#071A33] shadow-sm flex items-center justify-between cursor-pointer transition-all relative">
                  <div className="flex items-center gap-3 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-[#071A33]/10 text-[#17BEBB] flex items-center justify-center shrink-0 backdrop-blur-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
                        Departure
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#071A33] block truncate leading-tight mt-0.5">
                        {formatFlightDate(departureDate)}
                      </span>
                      <span className="text-xs text-slate-600 block truncate mt-0.5">
                        {tripType === 'round' ? 'Outbound flight' : 'One-way departure'}
                      </span>
                    </div>
                  </div>

                  {/* Day Stepper */}
                  <div className="flex items-center z-10 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDepartureDateChange(adjustDateByDays(departureDate, -1));
                      }}
                      className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                      title="Previous Day"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDepartureDateChange(adjustDateByDays(departureDate, 1));
                      }}
                      className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                      title="Next Day"
                    >
                      ›
                    </button>
                  </div>

                  {/* Native Date Picker Overlay */}
                  <input
                    type="date"
                    min={todayStr}
                    value={departureDate}
                    onChange={(e) => handleDepartureDateChange(e.target.value)}
                    aria-label="Departure Date"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-0"
                  />
                </div>
              </div>

              {/* Return Date */}
              <div className="lg:col-span-2 relative">
                <div
                  onClick={() => {
                    if (tripType === 'oneway') {
                      setTripType('round');
                    }
                  }}
                  className={`w-full min-h-[72px] p-3 sm:p-3.5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all relative ${
                    tripType === 'oneway'
                      ? 'bg-white/40 hover:bg-white/55 border-dashed border-2 border-white/70 text-slate-600 backdrop-blur-md'
                      : 'bg-white/80 hover:bg-white/95 focus-within:bg-white backdrop-blur-md border border-white/60 hover:border-white focus-within:ring-2 focus-within:ring-[#071A33]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tripType === 'oneway'
                          ? 'bg-white/50 text-slate-500'
                          : 'bg-[#071A33]/10 text-[#17BEBB] backdrop-blur-xs'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">
                        Return
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#071A33] block truncate leading-tight mt-0.5">
                        {tripType === 'oneway' ? 'Add return' : formatFlightDate(returnDate)}
                      </span>
                      <span className="text-xs text-slate-600 block truncate mt-0.5">
                        {tripType === 'oneway' ? 'Click for round-trip' : 'Return flight'}
                      </span>
                    </div>
                  </div>

                  {tripType === 'round' && (
                    <div className="flex items-center z-10 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newD = adjustDateByDays(returnDate, -1);
                          if (newD >= departureDate) handleReturnDateChange(newD);
                        }}
                        className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                        title="Previous Day"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReturnDateChange(adjustDateByDays(returnDate, 1));
                        }}
                        className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                        title="Next Day"
                      >
                        ›
                      </button>
                    </div>
                  )}

                  {tripType === 'round' && (
                    <input
                      type="date"
                      min={departureDate || todayStr}
                      value={returnDate}
                      onChange={(e) => handleReturnDateChange(e.target.value)}
                      aria-label="Return Date"
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-0"
                    />
                  )}
                </div>
              </div>

              {/* Primary Search CTA Button with Voice Search Option */}
              <div className="lg:col-span-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 min-h-[72px] px-5 sm:px-6 rounded-2xl bg-[#071A33]/90 hover:bg-[#071A33] backdrop-blur-md border border-white/25 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#17BEBB]" />
                      <span>Finding flights...</span>
                    </>
                  ) : (
                    <>
                      <span>Search Flights</span>
                      <ArrowRight className="w-5 h-5 text-[#17BEBB] transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                {onOpenVoiceModal && (
                  <button
                    type="button"
                    onClick={() => onOpenVoiceModal()}
                    className="min-h-[72px] px-3.5 rounded-2xl bg-white/80 hover:bg-white/95 backdrop-blur-md border border-white/60 text-[#071A33] shadow-sm transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    title="Voice Flight Search"
                  >
                    <Mic className="w-5 h-5 text-[#17BEBB]" />
                  </button>
                )}
              </div>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="p-3 rounded-2xl bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Quick Route Shortcuts & Trust Strip */}
            <div className="pt-3 border-t border-white/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#071A33] text-[11px] uppercase tracking-wider font-mono">
                  Direct from Dhaka:
                </span>
                {QUICK_ROUTES.map((r) => {
                  const isCurrent = origin.code === 'DAC' && destination.code === r.code;
                  return (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => handleSelectQuickRoute(r)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#071A33] text-white shadow-sm border border-transparent'
                          : 'bg-white/45 hover:bg-white/65 backdrop-blur-md text-[#071A33] border border-white/50 shadow-xs'
                      }`}
                    >
                      DAC ➔ {r.city} ({r.code})
                    </button>
                  );
                })}
              </div>
              <div className="hidden md:flex items-center gap-3 text-[11px] text-[#071A33]/85 font-bold">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#17BEBB]" />
                  Verified Partner Fare Guarantee
                </span>
                <span>•</span>
                <span>Official PNR Tickets</span>
              </div>
            </div>
          </form>
        )}

        {/* ================= MODE 2: STAYS & HOTELS ================= */}
        {activeTab === 'hotels' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-center">
              {/* Destination Input */}
              <div className="sm:col-span-2 lg:col-span-5 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <MapPin className="w-4 h-4 text-[#1389E8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Where are you going?
                    </label>
                    <input
                      type="text"
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                      placeholder="e.g. Bangkok, Dubai, Maldives, Singapore..."
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none placeholder-slate-400 truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Check-in / Check-out Dates */}
              <div className="sm:col-span-1 lg:col-span-3 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <Calendar className="w-4 h-4 text-[#1389E8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Check-in — Check-out
                    </label>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {formatBookingDate(hotelCheckIn)} — {formatBookingDate(hotelCheckOut)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="sm:col-span-1 lg:col-span-2 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <Users className="w-4 h-4 text-[#1389E8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Rooms & Guests
                    </label>
                    <input
                      type="text"
                      value={hotelGuests}
                      onChange={(e) => setHotelGuests(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Search Stays Button */}
              <div className="sm:col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => onNavigateToView('hotels')}
                  className="w-full h-[54px] px-4 rounded-xl bg-[#1389E8] hover:bg-[#0E7FE3] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Stays</span>
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E1EFF8] text-xs text-slate-600 font-medium">
              Vetted 4★ and 5★ luxury hotels with breakfast, airport transfers, and halal dining options.
            </div>
          </div>
        )}

        {/* ================= MODE 3: TOUR PACKAGES ================= */}
        {activeTab === 'packages' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-center">
              {/* Destination Country */}
              <div className="sm:col-span-2 lg:col-span-5 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <Package className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Destination Country
                    </label>
                    <select
                      value={packageCountry}
                      onChange={(e) => setPackageCountry(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                    >
                      <option value="Thailand">Thailand (Bangkok, Pattaya, Phuket)</option>
                      <option value="UAE">United Arab Emirates (Dubai & Abu Dhabi)</option>
                      <option value="Malaysia">Malaysia (Kuala Lumpur & Langkawi)</option>
                      <option value="Maldives">Maldives (Overwater Luxury Resort)</option>
                      <option value="Nepal">Nepal (Kathmandu & Pokhara)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Package Type */}
              <div className="sm:col-span-1 lg:col-span-4 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <ShieldCheck className="w-4 h-4 text-[#1389E8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Travel Style
                    </label>
                    <select
                      value={packageStyle}
                      onChange={(e) => setPackageStyle(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                    >
                      <option value="Family Holiday">Family Holiday Package</option>
                      <option value="Honeymoon Escape">Honeymoon & Couple Escape</option>
                      <option value="Group & Corporate">Group & Corporate Tour</option>
                      <option value="Budget Getaway">Budget-Friendly Getaway</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Packages Button */}
              <div className="sm:col-span-1 lg:col-span-3">
                <button
                  type="button"
                  onClick={() => onNavigateToView('packages')}
                  className="w-full h-[54px] px-4 rounded-xl bg-[#1389E8] hover:bg-[#0E7FE3] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <span>Explore Packages</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E1EFF8] text-xs text-slate-600 font-medium">
              Handcrafted packages starting from BDT 14,999 with verified Dhaka desk concierge.
            </div>
          </div>
        )}

        {/* ================= MODE 4: VISA ASSISTANCE ================= */}
        {activeTab === 'visa' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-center">
              {/* Destination Country */}
              <div className="sm:col-span-2 lg:col-span-5 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <FileCheck2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Destination Embassy
                    </label>
                    <select
                      value={visaCountry}
                      onChange={(e) => setVisaCountry(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                    >
                      <option value="Thailand">Thailand (Tourist / Sticker Visa)</option>
                      <option value="Malaysia">Malaysia (eVisa & Single Entry)</option>
                      <option value="Singapore">Singapore (e-Visa via Dhaka Desk)</option>
                      <option value="UAE">United Arab Emirates (30/60 Days)</option>
                      <option value="Nepal">Nepal (On Arrival / Gratis Entry)</option>
                      <option value="Maldives">Maldives (30-Day Tourist Entry)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Passport Type */}
              <div className="sm:col-span-1 lg:col-span-4 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <ShieldCheck className="w-4 h-4 text-[#1389E8] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Passport Type
                    </label>
                    <select
                      value={passportType}
                      onChange={(e) => setPassportType(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                    >
                      <option value="Bangladeshi Regular E-Passport">Bangladeshi Regular E-Passport</option>
                      <option value="Bangladeshi MRP Passport">Bangladeshi MRP Passport</option>
                      <option value="Official / Diplomatic Passport">Official / Diplomatic Passport</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Check Visa Button */}
              <div className="sm:col-span-1 lg:col-span-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenVisaModal) onOpenVisaModal(visaCountry);
                    else onNavigateToView('visa');
                  }}
                  className="w-full h-[54px] px-4 rounded-xl bg-[#1389E8] hover:bg-[#0E7FE3] text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <span>Check Visa Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E1EFF8] text-xs text-slate-600 font-medium">
              Clear document checklists, NOC templates, and application verification at our Dhaka desk.
            </div>
          </div>
        )}

        {/* ================= MODE 5: AI TRIP PLANNER ================= */}
        {activeTab === 'planner' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-center">
              {/* Trip Dream & Prompt */}
              <div className="sm:col-span-2 lg:col-span-9 relative">
                <div className="w-full h-[54px] px-3 py-1.5 bg-[#F4FAFD] hover:bg-white rounded-xl border border-[#E1EFF8] hover:border-[#1389E8] shadow-xs flex items-center gap-2 transition-all">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Describe your dream holiday (AI with Live Maps Grounding)
                    </label>
                    <input
                      type="text"
                      value={plannerPrompt}
                      onChange={(e) => setPlannerPrompt(e.target.value)}
                      placeholder="e.g., 5-day luxury family escape in Bangkok & Pattaya with halal seafood"
                      className="w-full text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="sm:col-span-2 lg:col-span-3">
                <button
                  type="button"
                  onClick={() => onNavigateToView('planner', { destination: plannerPrompt })}
                  className="w-full h-[54px] px-4 rounded-xl bg-gradient-to-r from-[#0D6EFD] to-[#0759B8] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>Plan with AI</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="pt-2 border-t border-[#E1EFF8] flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-400">Popular ideas:</span>
              {[
                '4-Day Bangkok Foodie & Shopping',
                '7-Day Bali Island Honeymoon',
                '5-Day Dubai Luxury & Desert Safari',
                '6-Day Maldives Overwater Villa',
              ].map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setPlannerPrompt(idea);
                    onNavigateToView('planner', { destination: idea });
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#EAF7FF] hover:bg-[#DDF4FD] text-[#0759B8] font-medium border border-[#CDE9FB] transition-colors cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
