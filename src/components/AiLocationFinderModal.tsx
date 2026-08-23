import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Search,
  MapPin,
  Compass,
  Navigation as NavIcon,
  Sparkles,
  Camera,
  Utensils,
  Clock,
  DollarSign,
  Copy,
  ExternalLink,
  Share2,
  Check,
  Mic,
  MicOff,
  Layers,
  ArrowRight,
  ShieldCheck,
  Train,
  Plane,
  X,
  RefreshCw,
  Info,
  Map as MapIcon,
  ChevronRight,
  Car,
} from 'lucide-react';
import { AiLocationResult, AiNearbySpot } from '../types';
import { useAuth } from '../context/AuthContext';

interface AiLocationFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialDestination?: string;
  onSaveToPlanner?: (location: AiLocationResult) => void;
}

const PRESET_POPULAR_SPOTS = [
  { label: 'Wat Arun (Bangkok)', query: 'Wat Arun Temple of Dawn Bangkok exact entrance and ferry pier', category: 'Culture & Temple' },
  { label: 'Burj Khalifa (Dubai)', query: 'Burj Khalifa At The Top observatory entrance Dubai Mall', category: 'Sightseeing' },
  { label: 'Lalbagh Fort (Dhaka)', query: 'Lalbagh Fort Old Dhaka main gate and Tomb of Pari Bibi', category: 'Culture & Temple' },
  { label: 'Shibuya Sky (Tokyo)', query: 'Shibuya Sky rooftop 46th floor observation deck Tokyo', category: 'Photo Spot' },
  { label: 'Inani Beach (Cox\'s Bazar)', query: 'Inani Coral Beach and Marine Drive Cox\'s Bazar', category: 'Nature & Beach' },
  { label: 'Kelingking Beach (Bali)', query: 'Kelingking T-Rex cliff viewpoint Nusa Penida Bali', category: 'Nature & Beach' },
  { label: 'Fushimi Inari (Kyoto)', query: 'Fushimi Inari Taisha thousand torii gates Kyoto', category: 'Culture & Temple' },
  { label: 'Petronas Towers (KL)', query: 'Petronas Twin Towers Skybridge concourse Kuala Lumpur', category: 'Sightseeing' },
];

const CATEGORIES = [
  { id: 'All', label: 'All Places', icon: Compass },
  { id: 'Photo Spot', label: 'Photo Spots', icon: Camera },
  { id: 'Culture & Temple', label: 'Culture & Heritage', icon: MapPin },
  { id: 'Food & Dining', label: 'Halal Food', icon: Utensils },
  { id: 'Nature & Beach', label: 'Nature & Beaches', icon: Sparkles },
  { id: 'Sightseeing', label: 'Landmarks', icon: NavIcon },
];

export const AiLocationFinderModal: React.FC<AiLocationFinderModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialDestination = '',
  onSaveToPlanner,
}) => {
  const { showToast } = useAuth();

  const [query, setQuery] = useState(initialQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState(initialDestination || '');
  const [isLoading, setIsLoading] = useState(false);
  const [locationResult, setLocationResult] = useState<AiLocationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transit' | 'tips' | 'nearby'>('overview');

  // Mini Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuery && initialQuery !== query) {
        setQuery(initialQuery);
        handleScoutLocation(initialQuery, initialDestination);
      } else if (!locationResult && !query) {
        // Pre-load default iconic spot (Wat Arun) for instant visual delight
        handleScoutLocation('Wat Arun Temple of Dawn Bangkok exact entrance and ferry pier', 'Bangkok');
      }
    }
  }, [isOpen, initialQuery, initialDestination]);

  // Voice Search Web Speech API
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Voice search is not supported in this browser. Please type your query.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak any place, landmark, or hidden spot!', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          setIsListening(false);
          handleScoutLocation(transcript, selectedDestination);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech error:', err);
      setIsListening(false);
    }
  };

  // Perform AI Scouting API Call
  const handleScoutLocation = async (searchQuery: string, destContext?: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/ai/find-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          destination: destContext || selectedDestination || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.data) {
        setLocationResult(data.data);
      } else {
        showToast('Could not scout location. Please try a different query.', 'error');
      }
    } catch (err) {
      console.error('Error scouting location:', err);
      showToast('Failed to connect to location AI service.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize or Update Leaflet Mini Map when locationResult changes
  useEffect(() => {
    if (!isOpen || !locationResult || !mapContainerRef.current) return;

    const lat = locationResult.lat;
    const lng = locationResult.lng;

    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    let timer: any = null;

    try {
      // If map already exists, simply pan to new coordinates
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.setPopupContent(`
            <div class="p-2 text-slate-900 font-sans">
              <p class="font-bold text-xs text-[#0759B8]">${locationResult.name}</p>
              <p class="text-[11px] text-slate-600">${locationResult.formattedAddress}</p>
              <p class="text-[10px] text-emerald-600 font-mono mt-1">${lat.toFixed(5)}°, ${lng.toFixed(5)}°</p>
            </div>
          `);
        }

        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng]);
        }

        timer = setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 200);

        return;
      }

      // Clean container if needed
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        minZoom: 3,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Voyager tiles for crisp high-contrast luxury look
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OSM',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom pulsing AI Pin Icon
      const customPinIcon = L.divIcon({
        className: 'custom-ai-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer" style="width: 40px; height: 40px;">
            <span class="absolute -inset-2 rounded-full bg-[#0759B8]/30 animate-ping"></span>
            <div class="relative w-8 h-8 rounded-full bg-[#0759B8] border-2 border-white shadow-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-4 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              EXACT PIN
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      marker.bindPopup(`
        <div class="p-2 text-slate-900 font-sans max-w-[200px]">
          <p class="font-bold text-xs text-[#0759B8]">${locationResult.name}</p>
          <p class="text-[11px] text-slate-600 line-clamp-2">${locationResult.formattedAddress}</p>
          <p class="text-[10px] text-emerald-600 font-mono mt-1 font-semibold">${lat.toFixed(5)}°, ${lng.toFixed(5)}°</p>
        </div>
      `);

      const circle = L.circle([lat, lng], {
        radius: 120,
        color: '#0759B8',
        fillColor: '#0759B8',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;

      timer = setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);
    } catch (e) {
      console.error('Error rendering Leaflet modal map:', e);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, locationResult]);

  // Clean up map when modal closes
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        // ignore
      }
      mapInstanceRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    }
  }, [isOpen]);

  const handleCopyCoordinates = () => {
    if (!locationResult) return;
    const coordsStr = `${locationResult.lat.toFixed(6)}, ${locationResult.lng.toFixed(6)}`;
    navigator.clipboard.writeText(coordsStr);
    setCopiedCoords(true);
    showToast(`Copied exact coordinates: ${coordsStr}`, 'success');
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!locationResult) return;
    const text = `📍 *${locationResult.name}*\n` +
      `📌 *Address:* ${locationResult.formattedAddress}\n` +
      `🌐 *Coordinates:* ${locationResult.lat.toFixed(5)}, ${locationResult.lng.toFixed(5)}\n` +
      `🗺️ *Google Maps:* ${locationResult.googleMapsUrl}\n\n` +
      `Scouted via Azraq Travel AI Concierge.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-location-finder-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] transition-all">
        
        {/* Modal Top Header */}
        <div className="px-5 sm:px-8 py-4 bg-gradient-to-r from-[#0759B8] via-[#0D6EFD] to-[#0A58CA] text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Travel AI Exact Location Scout
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Live GPS AI
                </span>
              </div>
              <p className="text-xs text-sky-100 font-normal">
                Find exact coordinates, street addresses, photo vantage points, and transit guides worldwide.
              </p>
            </div>
          </div>

          <button
            id="close-location-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Fast Query Pills */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScoutLocation(query, selectedDestination);
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any place: 'Wat Arun entrance', 'Lalbagh Fort', 'Burj Khalifa view point', 'Halal ramen Tokyo'..."
                className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl border border-slate-300 focus:border-[#0759B8] focus:ring-4 focus:ring-[#0759B8]/10 text-slate-900 text-sm font-medium transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/30'
                    : 'text-slate-400 hover:text-[#0759B8] hover:bg-slate-100'
                }`}
                title={isListening ? 'Listening...' : 'Voice Search'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="scout-location-submit-btn"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 rounded-2xl bg-[#0759B8] hover:bg-[#0A58CA] disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Scouting GPS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Find Exact Location</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Spot Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#0759B8]" />
              Popular:
            </span>
            {PRESET_POPULAR_SPOTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(preset.query);
                  handleScoutLocation(preset.query);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#0759B8]/10 text-slate-700 hover:text-[#0759B8] border border-slate-200 hover:border-[#0759B8]/30 font-medium whitespace-nowrap transition-all text-xs cursor-pointer shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body (Scrollable Split: Map on Left, Intelligence Cards on Right) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {isLoading && !locationResult ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative w-16 h-16 rounded-full bg-[#0759B8]/10 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-[#0759B8] border-t-transparent animate-spin"></span>
                <MapPin className="w-8 h-8 text-[#0759B8] animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-slate-900 text-base">Scouting Exact Coordinates & Spatial Data</h3>
                <p className="text-xs text-slate-500">
                  Retrieving high-precision satellite coordinates, street entrance guides, transit connections, and nearby verified halal spots...
                </p>
              </div>
            </div>
          ) : locationResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive Mini Map & Quick Action Navigation */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* Map Wrapper */}
                <div className="relative w-full h-[280px] sm:h-[340px] rounded-3xl border border-slate-200 shadow-md overflow-hidden bg-slate-100">
                  <div ref={mapContainerRef} className="w-full h-full z-10" />

                  {/* Floating Coordinates & Country Badge on Map */}
                  <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2 text-xs">
                    <span className="text-base">{locationResult.countryFlag || '📍'}</span>
                    <div>
                      <p className="font-bold text-[11px] leading-tight text-white">{locationResult.city}, {locationResult.country}</p>
                      <p className="font-mono text-[10px] text-emerald-400 font-semibold">
                        {locationResult.lat.toFixed(5)}°, {locationResult.lng.toFixed(5)}°
                      </p>
                    </div>
                  </div>

                  {/* Recenter / Pin Indicator Button */}
                  <button
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([locationResult.lat, locationResult.lng], 16, { animate: true });
                      }
                    }}
                    className="absolute bottom-3 left-3 z-20 bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 shadow-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-[#0759B8]" />
                    <span>Recenter Pin</span>
                  </button>
                </div>

                {/* Primary Action Buttons Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. Open Google Maps */}
                  <a
                    href={locationResult.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-[#0759B8] hover:bg-[#0A58CA] text-white flex flex-col items-center justify-center gap-1 text-center shadow-sm hover:shadow transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Google Maps</span>
                  </a>

                  {/* 2. Direct Navigation / Driving Route */}
                  <a
                    href={locationResult.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col items-center justify-center gap-1 text-center shadow-sm hover:shadow transition-all group"
                  >
                    <NavIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Directions</span>
                  </a>

                  {/* 3. Copy Coordinates */}
                  <button
                    onClick={handleCopyCoordinates}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group"
                  >
                    {copiedCoords ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-bold">{copiedCoords ? 'Copied!' : 'Copy Coords'}</span>
                  </button>

                  {/* 4. WhatsApp Share */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer group"
                  >
                    <Share2 className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Share Spot</span>
                  </button>
                </div>

                {/* Formatted Address Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0759B8]" />
                      Full Street Address
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0759B8]/10 text-[#0759B8]">
                      {locationResult.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                    {locationResult.formattedAddress}
                  </p>
                  {locationResult.neighborhood && (
                    <p className="text-[11px] text-slate-500">
                      Neighborhood: <span className="font-semibold text-slate-700">{locationResult.neighborhood}</span>
                    </p>
                  )}
                </div>

                {/* Image Preview Banner if available */}
                {locationResult.imageUrl && (
                  <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-200 group">
                    <img
                      src={locationResult.imageUrl}
                      alt={locationResult.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                      <p className="text-white text-xs font-semibold drop-shadow">
                        {locationResult.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Deep Location Intelligence & AI Insights Tabs */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* Spot Title & Category Header */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0759B8]/10 text-[#0759B8] font-bold text-xs border border-[#0759B8]/20">
                      {locationResult.category}
                    </span>
                    {locationResult.confidenceScore && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>GPS Verified ({Math.round(locationResult.confidenceScore * 100)}%)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                    {locationResult.name}
                  </h3>

                  {locationResult.alternateNames && locationResult.alternateNames.length > 0 && (
                    <p className="text-xs text-slate-500 italic">
                      Also known as: {locationResult.alternateNames.join(' • ')}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {locationResult.description}
                  </p>
                </div>

                {/* Sub-Tabs for Deep Intelligence */}
                <div className="flex items-center border-b border-slate-200 gap-1 sm:gap-2 overflow-x-auto scrollbar-none text-xs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'overview'
                        ? 'border-[#0759B8] text-[#0759B8]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    🎯 Gate & Spot Guide
                  </button>
                  <button
                    onClick={() => setActiveTab('transit')}
                    className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'transit'
                        ? 'border-[#0759B8] text-[#0759B8]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    🧭 How to Reach
                  </button>
                  <button
                    onClick={() => setActiveTab('tips')}
                    className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'tips'
                        ? 'border-[#0759B8] text-[#0759B8]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    📸 Photo & Tips
                  </button>
                  <button
                    onClick={() => setActiveTab('nearby')}
                    className={`pb-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'nearby'
                        ? 'border-[#0759B8] text-[#0759B8]'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    🍛 Halal & Nearby
                  </button>
                </div>

                {/* Tab 1: Overview & Entrance Guide */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 animate-fadeIn text-xs sm:text-sm">
                    {/* Exact Location & Entrance Guide Card */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-amber-700" />
                        <span>Exact Entrance & Gate Guide</span>
                      </div>
                      <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                        {locationResult.exactLocationGuide}
                      </p>
                    </div>

                    {/* Timings, Pricing, Dress Code Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {locationResult.openingHours && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#0759B8]" />
                            Opening Hours
                          </span>
                          <p className="text-xs font-semibold text-slate-900">{locationResult.openingHours}</p>
                        </div>
                      )}

                      {locationResult.admissionPrice && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            Admission / Tickets
                          </span>
                          <p className="text-xs font-semibold text-slate-900">{locationResult.admissionPrice}</p>
                        </div>
                      )}

                      {locationResult.bestTimeToVisit && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Best Time to Visit
                          </span>
                          <p className="text-xs font-semibold text-slate-900">{locationResult.bestTimeToVisit}</p>
                        </div>
                      )}

                      {locationResult.dressCode && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Dress Code
                          </span>
                          <p className="text-xs font-semibold text-slate-900">{locationResult.dressCode}</p>
                        </div>
                      )}
                    </div>

                    {/* Safety Alert Note */}
                    {locationResult.safetyNotes && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                        <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-medium">{locationResult.safetyNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Transit & Directions Guide */}
                {activeTab === 'transit' && (
                  <div className="space-y-3 animate-fadeIn text-xs sm:text-sm">
                    {locationResult.howToReach.nearestStation && (
                      <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                        <span className="text-[11px] font-bold text-sky-900 uppercase flex items-center gap-1.5">
                          <Train className="w-4 h-4 text-sky-700" />
                          Nearest Station / Stop
                        </span>
                        <p className="text-xs font-semibold text-slate-900">
                          {locationResult.howToReach.nearestStation}
                        </p>
                      </div>
                    )}

                    {locationResult.howToReach.publicTransit && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <Train className="w-3.5 h-3.5 text-[#0759B8]" />
                          Subway / Metro / Public Transit
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {locationResult.howToReach.publicTransit}
                        </p>
                      </div>
                    )}

                    {locationResult.howToReach.fromAirport && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 text-amber-600" />
                          Directions From Airport
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {locationResult.howToReach.fromAirport}
                        </p>
                      </div>
                    )}

                    {locationResult.howToReach.taxiRideshare && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-emerald-600" />
                          Taxi / Rideshare (Grab / Uber / Bolt)
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {locationResult.howToReach.taxiRideshare}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Photography & Pro Tips */}
                {activeTab === 'tips' && (
                  <div className="space-y-4 animate-fadeIn text-xs sm:text-sm">
                    {locationResult.photoSpots && locationResult.photoSpots.length > 0 && (
                      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs uppercase tracking-wider">
                          <Camera className="w-4 h-4 text-purple-700" />
                          <span>Top Photography Angles & Vantage Points</span>
                        </div>
                        <ul className="space-y-1.5">
                          {locationResult.photoSpots.map((spot, idx) => (
                            <li key={idx} className="text-xs text-purple-950 font-medium flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                              <span>{spot}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {locationResult.insiderTips && locationResult.insiderTips.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Azraq Concierge Insider Tips</span>
                        </div>
                        <ul className="space-y-1.5">
                          {locationResult.insiderTips.map((tip, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0759B8] mt-1.5 shrink-0"></span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Nearby Halal Food & Attractions */}
                {activeTab === 'nearby' && (
                  <div className="space-y-4 animate-fadeIn text-xs sm:text-sm">
                    {/* Halal Food Section */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                        <Utensils className="w-4 h-4 text-emerald-700" />
                        <span>Verified Nearby Halal & Muslim-Friendly Dining</span>
                      </div>
                      {locationResult.halalFoodNearby && locationResult.halalFoodNearby.length > 0 ? (
                        <div className="space-y-1.5">
                          {locationResult.halalFoodNearby.map((food, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-emerald-950 font-medium bg-white/70 p-2 rounded-xl border border-emerald-200/50">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {food}
                              </span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food + ' near ' + locationResult.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#0759B8] font-bold hover:underline flex items-center gap-0.5"
                              >
                                <span>Find</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600">Muslim-friendly and seafood options available in this district.</p>
                      )}
                    </div>

                    {/* Nearby Attractions */}
                    {locationResult.nearbyAttractions && locationResult.nearbyAttractions.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#0759B8]" />
                            Nearby Scouted Attractions
                          </span>
                        </div>
                        <div className="space-y-2">
                          {locationResult.nearbyAttractions.map((attr, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setQuery(attr.name);
                                handleScoutLocation(attr.name, locationResult.city);
                              }}
                              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#0759B8]/5 border border-slate-200 hover:border-[#0759B8]/30 transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <p className="font-bold text-xs text-slate-900 group-hover:text-[#0759B8]">
                                  {attr.name}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {attr.category} • <span className="font-semibold text-emerald-600">{attr.distance} away</span>
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0759B8] group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Search any place, landmark, or photo spot above to view its exact coordinates and navigation guide.
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-5 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>High-precision cartographic engine powered by Gemini AI.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            {locationResult && (
              <a
                href={locationResult.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#0759B8] hover:bg-[#0A58CA] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Navigate on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
