import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import {
  Plane,
  Building2,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  MapPin,
  Globe,
} from 'lucide-react';
import { Airport, BANGLADESH_AIRPORTS, POPULAR_AIRPORTS, trackFlightSearchEvent } from '../data/flightsData';
import { AutocompleteLocation } from '../types';
import { searchAirportsAndCities, normalizeLocationToAirport } from '../services/flightAutocompleteService';

interface AirportAutocompleteFieldProps {
  label: string;
  selectedAirport: Airport;
  onSelect: (airport: Airport) => void;
  otherAirportCode?: string; // To highlight or prevent same airport
  placeholder?: string;
  id?: string;
  className?: string;
}

export const AirportAutocompleteField: React.FC<AirportAutocompleteFieldProps> = ({
  label,
  selectedAirport,
  onSelect,
  otherAirportCode,
  placeholder = 'City or airport (e.g. DAC, London, Paris, CDG)...',
  id: customId,
  className = '',
}) => {
  const generatedId = useId();
  const inputId = customId || `airport-autocomplete-${generatedId}`;
  const listboxId = `listbox-${generatedId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'BD' | 'ME' | 'SEA' | 'EU' | 'NA'>('ALL');

  // Comprehensive categorized suggestions when query is short
  const allDefaultSuggestions: AutocompleteLocation[] = [
    // Bangladesh Hubs
    ...BANGLADESH_AIRPORTS.map((a) => ({
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
      countryCode: 'BD',
      type: 'airport' as const,
      isBangladesh: true,
      category: 'BD',
    })),
    // Popular Middle East & Umrah
    ...[
      { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport' },
      { code: 'JED', city: 'Jeddah / Makkah', country: 'Saudi Arabia', name: 'King Abdulaziz International Airport (Umrah)' },
      { code: 'MED', city: 'Medina', country: 'Saudi Arabia', name: 'Prince Mohammad Bin Abdulaziz Airport' },
      { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International Airport' },
      { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', name: 'Zayed International Airport' },
      { code: 'SHJ', city: 'Sharjah', country: 'United Arab Emirates', name: 'Sharjah International Airport' },
      { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', name: 'King Khalid International Airport' },
      { code: 'MCT', city: 'Muscat', country: 'Oman', name: 'Muscat International Airport' },
      { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', name: 'Kuwait International Airport' },
      { code: 'BAH', city: 'Manama', country: 'Bahrain', name: 'Bahrain International Airport' },
      { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
    ].map((a) => ({
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
      countryCode: '',
      type: 'airport' as const,
      isBangladesh: false,
      category: 'ME',
    })),
    // Popular Southeast & South Asia
    ...[
      { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
      { code: 'HKT', city: 'Phuket', country: 'Thailand', name: 'Phuket International Airport' },
      { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport' },
      { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport' },
      { code: 'DPS', city: 'Bali', country: 'Indonesia', name: 'I Gusti Ngurah Rai International Airport' },
      { code: 'MLE', city: 'Malé', country: 'Maldives', name: 'Velana International Airport' },
      { code: 'KTM', city: 'Kathmandu', country: 'Nepal', name: 'Tribhuvan International Airport' },
      { code: 'CMB', city: 'Colombo', country: 'Sri Lanka', name: 'Bandaranaike International Airport' },
      { code: 'HAN', city: 'Hanoi', country: 'Vietnam', name: 'Noi Bai International Airport' },
      { code: 'CCU', city: 'Kolkata', country: 'India', name: 'Netaji Subhash Chandra Bose International Airport' },
      { code: 'DEL', city: 'Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
      { code: 'MAA', city: 'Chennai', country: 'India', name: 'Chennai International Airport (Medical Hub)' },
      { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Tokyo Haneda Airport' },
      { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International Airport' },
      { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport' },
      { code: 'CAN', city: 'Guangzhou', country: 'China', name: 'Guangzhou Baiyun Airport' },
    ].map((a) => ({
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
      countryCode: '',
      type: 'airport' as const,
      isBangladesh: false,
      category: 'SEA',
    })),
    // Popular Europe & UK
    ...[
      { code: 'LHR', city: 'London (Heathrow)', country: 'United Kingdom', name: 'London Heathrow Airport' },
      { code: 'LGW', city: 'London (Gatwick)', country: 'United Kingdom', name: 'London Gatwick Airport' },
      { code: 'MAN', city: 'Manchester', country: 'United Kingdom', name: 'Manchester Airport' },
      { code: 'CDG', city: 'Paris (CDG)', country: 'France', name: 'Paris Charles de Gaulle Airport' },
      { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
      { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Airport Schiphol' },
      { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
      { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci Airport' },
      { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Josep Tarradellas Barcelona Airport' },
    ].map((a) => ({
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
      countryCode: '',
      type: 'airport' as const,
      isBangladesh: false,
      category: 'EU',
    })),
    // Popular North America & Australia
    ...[
      { code: 'JFK', city: 'New York (JFK)', country: 'United States', name: 'John F. Kennedy International Airport' },
      { code: 'EWR', city: 'New York / Newark', country: 'United States', name: 'Newark Liberty International Airport' },
      { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International Airport' },
      { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International Airport' },
      { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport' },
      { code: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International Airport' },
      { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport' },
      { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
    ].map((a) => ({
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country,
      countryCode: '',
      type: 'airport' as const,
      isBangladesh: false,
      category: 'NA',
    })),
  ];

  const defaultSuggestions = activeCategory === 'ALL'
    ? allDefaultSuggestions
    : allDefaultSuggestions.filter((item: any) => item.category === activeCategory);

  // Perform debounced search
  const performSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      trackFlightSearchEvent('airport_query', { query: searchTerm, field: label });
      const items = await searchAirportsAndCities(searchTerm, controller.signal);
      setResults(items);
      setHighlightedIndex(items.length > 0 ? 0 : -1);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Unable to load airports. Showing offline directory.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [label]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 300);
  };

  const handleSelectLocation = (loc: AutocompleteLocation) => {
    const airport = normalizeLocationToAirport(loc);
    onSelect(airport);
    trackFlightSearchEvent('airport_selected', {
      code: airport.code,
      city: airport.city,
      type: loc.type,
      field: label,
    });
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = query.trim().length >= 2 ? results : defaultSuggestions;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(items.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < items.length) {
        handleSelectLocation(items[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleOpenField = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const displayList = query.trim().length >= 2 ? results : defaultSuggestions;
  const isSearching = query.trim().length >= 2;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Visual Button / Box when closed or clicked */}
      <button
        type="button"
        id={inputId}
        onClick={handleOpenField}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="w-full h-[52px] px-3 py-2 bg-white rounded-lg border border-slate-300 hover:border-[#006ce4] focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm flex items-center justify-between cursor-pointer transition-all text-left group"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <MapPin className="w-4 h-4 text-slate-500 group-hover:text-[#006ce4] shrink-0 transition-colors" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              {selectedAirport.city} ({selectedAirport.code})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
            {selectedAirport.code}
          </span>
        </div>
      </button>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`${label} options`}
          className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 text-slate-900 animate-fadeIn"
        >
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={
                  highlightedIndex >= 0 ? `option-${generatedId}-${highlightedIndex}` : undefined
                }
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status & Error notice */}
          {isLoading && (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1389E8]" />
              <span>Searching global airports...</span>
            </div>
          )}

          {error && (
            <div className="p-2 text-xs text-rose-700 bg-rose-50 rounded-lg m-1 flex items-center gap-1.5 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Region Tabs when not typing search term */}
          {!isSearching && (
            <div className="p-2 border-b border-slate-100 bg-[#F8FAFC]">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5 px-0.5">
                <span className="flex items-center gap-1 text-slate-700">
                  <Globe className="w-3 h-3 text-[#1389E8]" /> Quick Select Destination
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Or type above to search 10,000+ airports
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { id: 'ALL', label: 'All Popular' },
                  { id: 'BD', label: 'Bangladesh 🇧🇩' },
                  { id: 'ME', label: 'Middle East & Umrah 🕌' },
                  { id: 'SEA', label: 'Southeast Asia 🏖️' },
                  { id: 'EU', label: 'Europe & UK 🇬🇧' },
                  { id: 'NA', label: 'Americas 🇺🇸' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCategory(tab.id as any);
                    }}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-[#1389E8] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Listbox Results */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-0.5">
            {isSearching && !isLoading && results.length === 0 && !error && (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">No airports or cities found for "{query}"</p>
                <p className="text-[11px] text-slate-400">Try searching by 3-letter IATA code (e.g. DAC, LHR, DXB, JFK) or full city name.</p>
              </div>
            )}

            {displayList.map((loc, idx) => {
              const isSelected = selectedAirport.code.toUpperCase() === loc.code.toUpperCase();
              const isHighlighted = highlightedIndex === idx;
              const isOtherSelected = otherAirportCode && otherAirportCode.toUpperCase() === loc.code.toUpperCase();

              return (
                <button
                  key={`${loc.code}-${loc.type}-${idx}`}
                  id={`option-${generatedId}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full p-2.5 text-left rounded-lg transition-colors cursor-pointer flex items-center justify-between group ${
                    isHighlighted ? 'bg-[#EAF7FF]' : 'hover:bg-[#F4FAFD]'
                  } ${isSelected ? 'bg-[#EAF7FF]/90 font-bold' : ''}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 w-6 h-6 rounded-md bg-[#F4FAFD] border border-[#E1EFF8] flex items-center justify-center text-slate-500 shrink-0">
                      {loc.type === 'city' ? (
                        <Building2 className="w-3.5 h-3.5 text-[#0759B8]" />
                      ) : (
                        <Plane className="w-3.5 h-3.5 text-[#1389E8]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{loc.city}</span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#EAF7FF] text-[#0759B8] border border-[#CDE9FB] rounded">
                          {loc.code}
                        </span>
                        {loc.country && (
                          <span className="text-[10px] text-slate-500 font-normal truncate">
                            • {loc.country}
                          </span>
                        )}
                        {loc.type === 'city' && (
                          <span className="text-[9px] uppercase px-1 bg-[#EAF7FF] text-[#0759B8] border border-[#CDE9FB] rounded font-semibold">
                            All Airports
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {loc.name}
                      </div>
                      {isOtherSelected && (
                        <div className="text-[10px] text-[#0759B8] font-semibold mt-0.5">
                          Currently selected as opposite airport (will swap)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isSelected && <Check className="w-4 h-4 text-[#1389E8]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
