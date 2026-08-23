import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X,
  Compass,
  FileText,
  Package,
  Plane,
  FileCheck2,
  Users,
  Settings,
  HelpCircle,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Tag,
  Clock,
  History,
  CheckCircle2,
  Zap,
  Bookmark,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { NavView, SmartSearchResponse, SmartSearchResultItem, SmartSearchResultType } from '../types';
import { executeSmartSearch } from '../services/smartSearchService';
import { POPULAR_SEARCH_SUGGESTIONS } from '../data/searchCatalogData';
import { useAuth } from '../context/AuthContext';

interface SmartSearchViewProps {
  initialQuery?: string;
  onNavigateToView: (view: NavView, params?: any) => void;
  onOpenVisaQuote?: (country?: string) => void;
  onSelectPackage?: (pkgId: string) => void;
}

const SEARCH_HISTORY_KEY = 'azraq_smart_search_history_v1';

export const SmartSearchView: React.FC<SmartSearchViewProps> = ({
  initialQuery = '',
  onNavigateToView,
  onOpenVisaQuote,
  onSelectPackage,
}) => {
  const { user, isGuest } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Search input state
  const [query, setQuery] = useState<string>(initialQuery);
  const [activeQuery, setActiveQuery] = useState<string>(initialQuery);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Response state
  const [searchData, setSearchData] = useState<SmartSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Load search history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (raw) {
        setSearchHistory(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Save query to history
  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...searchHistory.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setSearchHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  };

  // Perform search
  const handlePerformSearch = async (termToSearch: string) => {
    const trimmed = termToSearch.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setActiveQuery(trimmed);
    setIsLoading(true);
    setError(null);
    saveToHistory(trimmed);

    try {
      const res = await executeSmartSearch(trimmed, {
        userName: user?.fullName || (isGuest ? 'Guest Traveler' : 'Traveler'),
        isGuest,
        currentView: 'search',
      });
      setSearchData(res);
      setActiveFilter('all');
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.message || 'Unable to retrieve search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial query if provided
  useEffect(() => {
    if (initialQuery.trim()) {
      handlePerformSearch(initialQuery);
    } else {
      // Focus input on empty mount
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [initialQuery]);

  // Handle Result Navigation Action
  const handleResultAction = (result: SmartSearchResultItem) => {
    const targetUrl = (result.url || '').toLowerCase();

    if (targetUrl === 'visa') {
      if (onOpenVisaQuote) {
        onOpenVisaQuote();
      } else {
        onNavigateToView('visa');
      }
    } else if (targetUrl === 'packages') {
      onNavigateToView('packages');
    } else if (targetUrl === 'flights') {
      onNavigateToView('flights');
    } else if (targetUrl === 'planner') {
      onNavigateToView('planner');
    } else if (targetUrl === 'feed') {
      onNavigateToView('feed');
    } else if (targetUrl === 'profile') {
      onNavigateToView('profile');
    } else if (targetUrl === 'contact') {
      onNavigateToView('contact');
    } else if (targetUrl === 'about') {
      onNavigateToView('about');
    } else if (targetUrl === 'destinations') {
      onNavigateToView('destinations');
    } else {
      onNavigateToView('discover');
    }
  };

  // Type Badges & Icons
  const getTypeBadge = (type: SmartSearchResultType) => {
    switch (type) {
      case 'product':
        return {
          label: 'Tour Package',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Package className="w-3 h-3" />,
        };
      case 'article':
        return {
          label: 'Visa & Guide',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <FileCheck2 className="w-3 h-3" />,
        };
      case 'feature':
        return {
          label: 'Feature Tool',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Zap className="w-3 h-3" />,
        };
      case 'template':
        return {
          label: 'Trip Template',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Compass className="w-3 h-3" />,
        };
      case 'setting':
        return {
          label: 'Account Setting',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Settings className="w-3 h-3" />,
        };
      case 'page':
        return {
          label: 'Platform Page',
          bg: 'bg-sky-50 text-[#0759B8] border-sky-200',
          icon: <ChevronRight className="w-3 h-3" />,
        };
      case 'action':
        return {
          label: 'Instant Action',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <ArrowRight className="w-3 h-3" />,
        };
      default:
        return {
          label: 'Result',
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: <Tag className="w-3 h-3" />,
        };
    }
  };

  // Filter results
  const filteredResults = searchData?.results.filter((res) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'packages') return res.type === 'product';
    if (activeFilter === 'visa') return res.type === 'article' || res.url === 'visa';
    if (activeFilter === 'features') return res.type === 'feature' || res.type === 'template';
    if (activeFilter === 'settings') return res.type === 'setting';
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Search Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0759B8] text-xs font-bold font-mono tracking-wide uppercase">
                <Search className="w-3.5 h-3.5" />
                <span>Smart Natural Language Search</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Search Azraq Tour Knowledge & Services
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Ask in plain language — find tour packages, visa document checklists, flights, or profile settings.
              </p>
            </div>
          </div>

          {/* Natural Language Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(query);
            }}
            className="relative flex items-center"
          >
            <div className="absolute left-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Cheapest honeymoon package in Maldives' or 'What documents are required for Thailand visa?'"
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border-2 border-slate-200 focus:border-[#0759B8] rounded-2xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium transition-all focus:bg-white focus:outline-none shadow-xs"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-5 py-2.5 bg-[#0759B8] hover:bg-[#003B80] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Query Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Try asking:
            </span>
            {POPULAR_SEARCH_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePerformSearch(suggestion)}
                className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-[#0759B8] text-slate-600 rounded-lg transition-colors cursor-pointer font-medium text-[11px] sm:text-xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Search History Chips (if any) */}
        {searchHistory.length > 0 && !searchData && !isLoading && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent Searches</span>
              </div>
              <button
                type="button"
                onClick={clearHistory}
                className="text-[11px] text-slate-400 hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                Clear History
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePerformSearch(item)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0759B8] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Interpreting your search...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                Understanding intent for "{activeQuery}" and matching relevant packages, visa checklists, and system features.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-red-900">Search Failed</h3>
              <p className="text-xs text-red-700 font-medium">{error}</p>
              <button
                type="button"
                onClick={() => handlePerformSearch(activeQuery)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Retry Search
              </button>
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {searchData && !isLoading && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Interpreted Intent & Short Answer Card */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0759B8] to-[#0A4EA3] text-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-sky-200 border border-white/20 text-[11px] font-bold font-mono uppercase">
                  <Compass className="w-3 h-3" />
                  <span>Interpreted Goal</span>
                </div>
                <div className="text-[11px] text-sky-200/80 font-medium">
                  Confidence:{' '}
                  <span className="font-bold text-white capitalize">
                    {searchData.confidence}
                  </span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {searchData.interpreted_intent}
              </h2>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15 text-xs sm:text-sm text-sky-50 font-medium leading-relaxed">
                💡 <span className="font-semibold text-white">{searchData.answer}</span>
              </div>
            </div>

            {/* Filter Chips & Result Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All Results (${searchData.results.length})` },
                  { id: 'packages', label: 'Tour Packages' },
                  { id: 'visa', label: 'Visa & Embassy' },
                  { id: 'features', label: 'Tools & Planner' },
                  { id: 'settings', label: 'Account & Settings' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeFilter === f.id
                        ? 'bg-[#0759B8] text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing {filteredResults.length} relevant entries
              </div>
            </div>

            {/* Results Grid */}
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((item, idx) => {
                  const badge = getTypeBadge(item.type);

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-[#1389E8]/50 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>

                          {item.price && (
                            <span className="text-xs font-black text-[#0759B8] bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                              {item.price}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0759B8] transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {item.description}
                        </p>

                        {item.reason && (
                          <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium border border-slate-100">
                            <span className="font-bold text-slate-800">Match Reason:</span>{' '}
                            {item.reason}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                          Route: {item.url}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleResultAction(item)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0759B8] hover:bg-[#003B80] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer group-hover:shadow-xs"
                        >
                          <span>{item.action_label || 'Open'}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">
                  No matches found in this category
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Try switching the filter back to "All Results" or rephrasing your search query.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Suggested Actions & Refinements */}
            {searchData.suggested_actions && searchData.suggested_actions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Suggested Next Actions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchData.suggested_actions.map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleResultAction({ url: act.target } as any)}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-sky-50 hover:text-[#0759B8] hover:border-sky-300 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>{act.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Searches */}
            {searchData.related_searches && searchData.related_searches.length > 0 && (
              <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Related Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchData.related_searches.map((rel, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePerformSearch(rel)}
                      className="px-3.5 py-1.5 bg-white hover:bg-sky-50 hover:text-[#0759B8] text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{rel}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Helpful No-Query Empty State */}
        {!searchData && !isLoading && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 text-[#0759B8] flex items-center justify-center mx-auto shadow-2xs">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Explore Whatever You Need
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Smart Search understands complex natural queries across domestic & international packages, embassy visa specifications, flight bookings, and traveler settings.
              </p>
            </div>

            {/* Category Discovery Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
              {[
                {
                  title: 'Tour Packages',
                  desc: 'All-inclusive Maldives, Thailand, Sajek & Kashmir tours',
                  query: 'Best international holiday tour packages with BDT price',
                  icon: <Package className="w-5 h-5 text-blue-600" />,
                },
                {
                  title: 'Visa Checklists',
                  desc: 'Bank balance, photos & official embassy documents',
                  query: 'Thailand and Malaysia tourist visa requirements',
                  icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />,
                },
                {
                  title: 'Flight Deals',
                  desc: 'Non-stop flights & low airfare from Dhaka',
                  query: 'Find flights departing from Dhaka to Bangkok',
                  icon: <Plane className="w-5 h-5 text-sky-600" />,
                },
                {
                  title: 'Account & Settings',
                  desc: 'Passport validity, saved trips & emergency contacts',
                  query: 'Where can I update my passport number in profile?',
                  icon: <Settings className="w-5 h-5 text-purple-600" />,
                },
              ].map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePerformSearch(cat.query)}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-[#1389E8] hover:shadow-xs transition-all text-left space-y-2 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-[#0759B8] transition-colors">
                    {cat.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                    {cat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
