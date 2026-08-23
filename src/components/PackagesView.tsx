import React, { useState } from 'react';
import { usePackages } from '../context/PackageContext';
import { PackageCard } from './PackageCard';
import { PackageDetailModal } from './PackageDetailModal';
import { PackageQuotationModal } from './PackageQuotationModal';
import { PackageComparisonModal } from './PackageComparisonModal';
import { TourPackage } from '../types';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  FileText,
  DollarSign,
  Compass,
  RefreshCw,
  Scale,
} from 'lucide-react';
import { getOptimizedUnsplashUrl, getUnsplashSrcSet } from '../utils/imageOptimization';

export const PackagesView: React.FC = () => {
  const {
    packages,
    destinations,
    allCountries,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    selectedDestinationId,
    setSelectedDestinationId,
    selectedDuration,
    setSelectedDuration,
    maxPriceFilter,
    setMaxPriceFilter,
    filteredPackages,
    activePackageModal,
    setActivePackageModal,
    activeQuotationModal,
    setActiveQuotationModal,
    clearAllPackages,
  } = usePackages();

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (pkgId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : prev.length < 3 ? [...prev, pkgId] : prev
    );
  };

  const packagesToCompare = packages.filter((p) => selectedForCompare.includes(p.id));

  return (
    <div className="w-full min-h-screen pb-20 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#002f6c] via-[#0759B8] to-[#003B80] border border-white/20 shadow-xl p-6 sm:p-10 text-white">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <FileText className="w-4 h-4 text-[#5BC7F4]" />
            Verified Agency PDF Packages
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-poppins">
            Explore Curated <span className="text-[#5BC7F4]">Tour Packages</span>
          </h1>

          <p className="text-sm sm:text-base text-sky-100 font-medium leading-relaxed">
            Browse verified travel itineraries, pricing tiers, and complete day-by-day tour programs curated by Azraq Bangladesh.
          </p>

          {/* Quick Metrics Badge */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-white">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/25 text-white font-extrabold text-sm shadow-xs">
              <Compass className="w-4 h-4 text-[#5BC7F4]" />
              {filteredPackages.length === packages.length
                ? `${packages.length} Tour Packages Available`
                : `${filteredPackages.length} of ${packages.length} Packages Showing`}
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-sky-200">
              <MapPin className="w-4 h-4 text-amber-300" />
              {destinations.length} Destination Spots ({allCountries.length} Countries)
            </span>
          </div>
        </div>

        {/* Ambient Glow background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E1EFF8] shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0759B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by package name, destination, country, or hotel..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F4FAFD] border border-[#CDE9FB] text-[#12304A] placeholder-slate-400 text-sm focus:outline-none focus:border-[#1389E8] focus:bg-white transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-slate-100">
          {/* Country Filter */}
          <div>
            <label className="block text-xs font-bold text-[#12304A] uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1389E8]" />
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedDestinationId('All');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8] text-[#12304A] text-sm font-semibold focus:outline-none focus:border-[#1389E8] cursor-pointer"
            >
              <option value="All">All Countries ({allCountries.length})</option>
              {allCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#12304A] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#1389E8]" />
              Destination
            </label>
            <select
              value={selectedDestinationId}
              onChange={(e) => setSelectedDestinationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8] text-[#12304A] text-xs font-semibold focus:outline-none focus:border-[#1389E8] cursor-pointer"
            >
              <option value="All">All Destinations ({destinations.length})</option>
              {destinations
                .filter((d) => selectedCountry === 'All' || d.country === selectedCountry)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.packageCount} pkg)
                  </option>
                ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#12304A] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#1389E8]" />
              Duration
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F4FAFD] border border-[#E1EFF8] text-[#12304A] text-xs font-semibold focus:outline-none focus:border-[#1389E8] cursor-pointer"
            >
              <option value="All">All Durations</option>
              <option value="Short (1-3 Days)">Short (1-3 Days)</option>
              <option value="Medium (4-6 Days)">Medium (4-6 Days)</option>
              <option value="Long (7+ Days)">Long (7+ Days)</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-[#12304A] uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#0759B8]" />
                Max Price
              </label>
              <span className="text-xs font-mono font-extrabold text-[#0759B8]">
                ৳ {maxPriceFilter.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={2000}
              max={100000}
              step={1000}
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full accent-[#0759B8] cursor-pointer"
            />
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(selectedCountry !== 'All' ||
          selectedDestinationId !== 'All' ||
          selectedDuration !== 'All' ||
          searchQuery !== '' ||
          maxPriceFilter < 100000) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500">Active Filters:</span>
            {selectedCountry !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7FF] text-[#0759B8] border border-[#CDE9FB]">
                Country: {selectedCountry}
              </span>
            )}
            {selectedDestinationId !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7FF] text-[#0759B8] border border-[#CDE9FB]">
                Destination: {destinations.find((d) => d.id === selectedDestinationId)?.name || selectedDestinationId}
              </span>
            )}
            {selectedDuration !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7FF] text-[#0759B8] border border-[#CDE9FB]">
                Duration: {selectedDuration}
              </span>
            )}
            {maxPriceFilter < 100000 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Under ৳ {maxPriceFilter.toLocaleString()}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCountry('All');
                setSelectedDestinationId('All');
                setSelectedDuration('All');
                setMaxPriceFilter(100000);
                setSearchQuery('');
              }}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Featured Destinations Row */}
      {destinations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#12304A] flex items-center gap-2 font-poppins">
              <Compass className="w-5 h-5 text-[#0759B8]" />
              Popular Destinations ({destinations.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {destinations.map((dest) => {
              const isSelected = selectedDestinationId === dest.id;
              return (
                <button
                  key={dest.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedDestinationId('All');
                    } else {
                      setSelectedDestinationId(dest.id);
                      setSelectedCountry(dest.country);
                    }
                  }}
                  className={`relative rounded-2xl overflow-hidden h-28 border text-left group transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0759B8] ring-2 ring-[#1389E8]/50 shadow-md scale-105'
                      : 'border-[#E1EFF8] hover:border-[#5BC7F4] hover:shadow-sm'
                  }`}
                >
                  <img
                    src={getOptimizedUnsplashUrl(dest.image, 300, 70)}
                    srcSet={getUnsplashSrcSet(dest.image, [200, 350], 70)}
                    sizes="(max-width: 640px) 120px, 160px"
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002f6c]/90 via-[#002f6c]/30 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-bold text-white truncate">{dest.name}</p>
                    <p className="text-[10px] text-sky-200 font-medium">{dest.country}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tour Packages Grid Header & Compare Trigger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#12304A] flex items-center gap-2 font-poppins">
            <Sparkles className="w-5 h-5 text-[#0759B8]" />
            Tour Packages List ({filteredPackages.length})
          </h2>

          <div className="flex items-center gap-2">
            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Selected ({selectedForCompare.length}/3)</span>
              </button>
            )}

            {filteredPackages.length >= 2 && selectedForCompare.length === 0 && (
              <button
                onClick={() => {
                  setSelectedForCompare(filteredPackages.slice(0, 3).map((p) => p.id));
                  setIsCompareModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-[#0759B8] border border-[#CDE9FB] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Scale className="w-4 h-4 text-amber-500" />
                <span>Quick Compare Top 3</span>
              </button>
            )}
          </div>
        </div>

        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const isCompared = selectedForCompare.includes(pkg.id);
              return (
                <div key={pkg.id} className="relative flex flex-col">
                  {/* Floating Compare Checkbox */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(pkg.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold backdrop-blur-md border transition-all flex items-center gap-1 cursor-pointer ${
                        isCompared
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                          : 'bg-slate-950/80 text-slate-300 border-slate-700/60 hover:text-white'
                      }`}
                      title="Add to side-by-side comparison"
                    >
                      <Scale className="w-3 h-3" />
                      <span>{isCompared ? 'Comparing' : '+ Compare'}</span>
                    </button>
                  </div>

                  <PackageCard
                    pkg={pkg}
                    onViewDetails={setActivePackageModal}
                    onRequestQuote={setActiveQuotationModal}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl mx-auto">
              🌴
            </div>
            <h3 className="text-lg font-bold text-white">No Tour Packages Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No tour packages matched your selected search criteria or price filters. Try resetting your search filters or browse all destinations.
            </p>
            <button
              onClick={() => {
                setSelectedCountry('All');
                setSelectedDestinationId('All');
                setSelectedDuration('All');
                setMaxPriceFilter(100000);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Show All Packages
            </button>
          </div>
        )}
      </div>

      {/* Active Modals */}
      <PackageDetailModal
        pkg={activePackageModal}
        onClose={() => setActivePackageModal(null)}
        onRequestQuote={setActiveQuotationModal}
      />

      <PackageQuotationModal
        pkg={activeQuotationModal}
        onClose={() => setActiveQuotationModal(null)}
      />

      <PackageComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        packages={packagesToCompare.length > 0 ? packagesToCompare : filteredPackages.slice(0, 3)}
        onRequestQuote={(pkg) => {
          setIsCompareModalOpen(false);
          setActiveQuotationModal(pkg);
        }}
      />
    </div>
  );
};
