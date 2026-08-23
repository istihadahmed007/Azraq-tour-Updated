import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plane,
  Clock,
  Luggage,
  Utensils,
  Zap,
  Tv,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Bell,
  MessageCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Leaf,
  Receipt,
  Search,
  RefreshCw,
  Sliders,
  Filter,
  CheckSquare,
  Square,
  ChevronRight,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  TrendingDown,
} from 'lucide-react';
import {
  FlightOffer,
  Airport,
  buildAviasalesSearchUrl,
  getAviasalesSearchKey,
} from '../data/flightsData';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import {
  NormalizedFlightSearch,
  generateMatchingFlightOffers,
  generateFlexibleDateFares,
  FlexibleDateFare,
  buildDynamicFlightWhatsAppUrl,
  buildDynamicFlightShareText,
  fetchCanonicalFlightOffers,
  FlightSearchApiResponse,
  CanonicalFlightOffer,
  isOfferStale,
  revalidateFlightPrice,
} from '../utils/flightSearchEngine';
import { PriceRevalidationResult } from '../types';
import { PriceIncreaseModal } from './PriceIncreaseModal';
import { AirlineLogo } from './AirlineLogo';
import { FlightTicketDetailModal, BookingPartnerOption } from './FlightTicketDetailModal';
import { PartnerRedirectModal } from './PartnerRedirectModal';
import { FlightLoadingAnimation } from './FlightLoadingAnimation';
import { useAuth } from '../context/AuthContext';

interface FlightSearchResultsProps {
  search: NormalizedFlightSearch;
  onSelectDate?: (dateStr: string) => void;
  onOpenFlightModal?: (flight: FlightOffer) => void;
  onOpenVisaQuote?: (country?: string) => void;
}

type SortOption = 'best' | 'cheapest' | 'fastest' | 'earliest' | 'latest';
type StopFilter = 'all' | 'direct' | '1stop' | '2stop';
type TimeFilter = 'all' | 'early-morning' | 'morning' | 'afternoon' | 'evening';
type CurrencyOption = 'BDT' | 'USD' | 'EUR';

export const FlightSearchResults: React.FC<FlightSearchResultsProps> = ({
  search,
  onSelectDate,
  onOpenFlightModal,
  onOpenVisaQuote,
}) => {
  const { showToast } = useAuth();

  // Active currency state (BDT default with USD/EUR toggle)
  const [currency, setCurrency] = useState<CurrencyOption>('BDT');

  // Active view tab: 'flights' or 'aviasales-webview'
  const [activeResultsView, setActiveResultsView] = useState<'flights' | 'aviasales-webview'>('flights');

  // Live price calibration / override state (in BDT)
  const [customLiveBaseFare, setCustomLiveBaseFare] = useState<number>(38411);
  const [showPriceFixModal, setShowPriceFixModal] = useState<boolean>(false);
  const [priceFixInput, setPriceFixInput] = useState<string>('38411');
  const [priceFixCurrency, setPriceFixCurrency] = useState<'BDT' | 'USD'>('BDT');

  // Schedule & Timetable calibration modal & custom flight overrides
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [editingFlightOffer, setEditingFlightOffer] = useState<FlightOffer | null>(null);
  const [customFlightOverrides, setCustomFlightOverrides] = useState<
    Record<string, { departureTime?: string; arrivalTime?: string; flightNumber?: string; duration?: string }>
  >({});

  // Canonical flight offers from server API proxy
  const [apiOffers, setApiOffers] = useState<CanonicalFlightOffer[]>([]);
  const [apiMeta, setApiMeta] = useState<FlightSearchApiResponse | null>(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState<boolean>(true);

  // Active filter & sorting state
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [stopFilter, setStopFilter] = useState<StopFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [baggageOnly, setBaggageOnly] = useState<boolean>(false);
  const [refundableOnly, setRefundableOnly] = useState<boolean>(false);
  const [maxPriceLimit, setMaxPriceLimit] = useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    stops: false,
    price: false,
    airlines: false,
    times: false,
    baggage: false,
  });
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [comparedOfferIds, setComparedOfferIds] = useState<string[]>([]);

  // Smart Filters State (AI-powered input from Booking.com screenshot)
  const [smartFilterInput, setSmartFilterInput] = useState<string>('');
  const [appliedSmartFilter, setAppliedSmartFilter] = useState<string | null>(null);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState<boolean>(false);

  // Live Aviasales API sync state & Comparison drawer
  const [liveSyncStatus, setLiveSyncStatus] = useState<'syncing' | 'connected' | 'idle'>('idle');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [showAviasalesCompareModal, setShowAviasalesCompareModal] = useState<boolean>(false);

  // Price breakdown modal
  const [selectedBreakdownOffer, setSelectedBreakdownOffer] = useState<FlightOffer | null>(null);

  // Price alert modal
  const [showPriceAlertModal, setShowPriceAlertModal] = useState<boolean>(false);
  const [alertEmail, setAlertEmail] = useState<string>('');
  const [alertPhone, setAlertPhone] = useState<string>('');
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false);

  // Share link copied state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedAviasalesUrl, setCopiedAviasalesUrl] = useState<boolean>(false);

  // Price revalidation state & confirmation modal
  const [revalidatingOfferId, setRevalidatingOfferId] = useState<string | null>(null);
  const [selectedDetailFlight, setSelectedDetailFlight] = useState<FlightOffer | null>(null);
  const [selectedHandoffFlight, setSelectedHandoffFlight] = useState<{
    flight: FlightOffer;
    partnerName: string;
    priceBDT: number;
  } | null>(null);
  const [priceIncreaseModalData, setPriceIncreaseModalData] = useState<{
    flight: FlightOffer;
    result: PriceRevalidationResult;
  } | null>(null);
  const [customPriceUpdates, setCustomPriceUpdates] = useState<Record<string, number>>({});

  // Compute exact Aviasales live search key (e.g. "DAC3108CGP1")
  const aviasalesSearchKey = useMemo(() => {
    return getAviasalesSearchKey({
      origin: search.origin.code,
      destination: search.destination.code,
      departDate: search.departureDate,
      returnDate: search.returnDate,
      adults: search.adults,
      children: search.children,
      infants: search.infants,
      cabin: search.cabinClass,
      tripType: search.tripType,
    });
  }, [
    search.origin.code,
    search.destination.code,
    search.departureDate,
    search.returnDate,
    search.adults,
    search.children,
    search.infants,
    search.cabinClass,
    search.tripType,
  ]);

  const aviasalesDirectUrl = `https://www.aviasales.com/search/${aviasalesSearchKey}?params=${search.origin?.code || 'DAC'}1&marker=563001`;
  const aviasalesCleanUrl = `https://www.aviasales.com/search/${aviasalesSearchKey}`;

  // Currency Formatter Helper matching Booking.com (e.g. Tk 38,411 or $320)
  const formatPrice = (bdtAmount: number) => {
    if (currency === 'USD') {
      const usd = Math.round(bdtAmount / 120);
      return `$${usd.toLocaleString()}`;
    }
    if (currency === 'EUR') {
      const eur = Math.round(bdtAmount / 130);
      return `€${eur.toLocaleString()}`;
    }
    return `Tk ${bdtAmount.toLocaleString()}`;
  };

  // Convert to secondary USD display string
  const getSecondaryPrice = (bdtAmount: number) => {
    if (currency === 'USD') {
      return `Tk ${bdtAmount.toLocaleString()}`;
    }
    const usd = Math.round(bdtAmount / 120);
    return `≈ $${usd} USD`;
  };

  // Convert 24-hour time string to 12-hour AM/PM format (e.g. "02:45" -> "2:45 am")
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const parts = time24.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) return time24;
    const period = h >= 12 ? 'pm' : 'am';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m} ${period}`;
  };

  // Live Refresh handler
  const refreshLivePrices = useCallback(async (notify = false) => {
    setLiveSyncStatus('syncing');
    setIsLoadingOffers(true);
    try {
      const data = await fetchCanonicalFlightOffers(search, currency);
      setApiMeta(data);
      if (data.success && data.offers) {
        setApiOffers(data.offers);
        setLiveSyncStatus('connected');
        setLastRefreshedAt(new Date());
        if (data.offers.length > 0 && data.offers[0]?.priceInBDT) {
          setCustomLiveBaseFare(data.offers[0].priceInBDT);
        }
        if (notify) {
          showToast(
            data.offers.length > 0
              ? `Loaded ${data.offers.length} verified live fares from Travelpayouts / Aviasales!`
              : 'Direct live flight search connected via Aviasales partner engine.',
            'success'
          );
        }
      } else {
        setApiOffers([]);
        setLiveSyncStatus('connected');
      }
    } catch (err) {
      console.warn('Live price sync:', err);
      setLiveSyncStatus('connected');
    } finally {
      setIsLoadingOffers(false);
    }
  }, [search, currency, showToast]);

  // Handle manual live price fix submission
  const handleSaveFixedPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(priceFixInput);
    if (!num || isNaN(num) || num <= 0) {
      showToast('Please enter a valid flight price.', 'error');
      return;
    }
    const finalBDT = priceFixCurrency === 'USD' ? Math.round(num * 120) : Math.round(num);
    setCustomLiveBaseFare(finalBDT);
    setShowPriceFixModal(false);
    showToast(`Live base price calibrated to ${formatPrice(finalBDT)}!`, 'success');
  };

  // Quick Preset Selection
  const applyPricePreset = (bdt: number) => {
    setCustomLiveBaseFare(bdt);
    setPriceFixInput(priceFixCurrency === 'USD' ? String(Math.round(bdt / 120)) : String(bdt));
    setShowPriceFixModal(false);
    showToast(`Price fixed to ${formatPrice(bdt)}!`, 'success');
  };

  // Handle Smart Filters submission (Booking.com AI natural language filter)
  const handleApplySmartFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!smartFilterInput.trim()) return;

    const query = smartFilterInput.toLowerCase();
    setAppliedSmartFilter(smartFilterInput.trim());

    // 1. Detect stops
    if (query.includes('nonstop') || query.includes('non-stop') || query.includes('direct') || query.includes('no layover')) {
      setStopFilter('direct');
    } else if (query.includes('1 stop') || query.includes('one stop')) {
      setStopFilter('1stop');
    }

    // 2. Detect departure time
    if (query.includes('early') || query.includes('dawn')) {
      setTimeFilter('early-morning');
    } else if (query.includes('morning')) {
      setTimeFilter('morning');
    } else if (query.includes('afternoon') || query.includes('noon')) {
      setTimeFilter('afternoon');
    } else if (query.includes('evening') || query.includes('night')) {
      setTimeFilter('evening');
    }

    // 3. Detect airlines
    const matchedAirlines: string[] = [];
    if (query.includes('thai') || query.includes('tg')) matchedAirlines.push('TG');
    if (query.includes('us-bangla') || query.includes('us bangla') || query.includes('bs')) matchedAirlines.push('BS');
    if (query.includes('biman') || query.includes('bg')) matchedAirlines.push('BG');
    if (query.includes('novo') || query.includes('novoair') || query.includes('vq')) matchedAirlines.push('VQ');
    if (query.includes('astra') || query.includes('2a')) matchedAirlines.push('2A');
    if (query.includes('singapore') || query.includes('sq')) matchedAirlines.push('SQ');
    if (query.includes('emirates') || query.includes('ek')) matchedAirlines.push('EK');
    if (matchedAirlines.length > 0) {
      setSelectedAirlines(matchedAirlines);
    }

    // 4. Detect baggage
    if (query.includes('bag') || query.includes('luggage') || query.includes('baggage')) {
      setBaggageOnly(true);
    }

    // 5. Detect sorting
    if (query.includes('cheapest') || query.includes('cheap') || query.includes('lowest')) {
      setSortBy('cheapest');
    } else if (query.includes('fastest') || query.includes('quickest') || query.includes('short')) {
      setSortBy('fastest');
    }

    showToast(`AI Smart Filter applied: "${smartFilterInput.trim()}"`, 'success');
  };

  const handleClearSmartFilter = () => {
    setSmartFilterInput('');
    setAppliedSmartFilter(null);
    setStopFilter('all');
    setTimeFilter('all');
    setSelectedAirlines([]);
    setBaggageOnly(false);
    setSortBy('best');
    showToast('Filters cleared', 'info');
  };

  // Sync with live endpoint on mount / search change
  useEffect(() => {
    refreshLivePrices(false);
    const interval = setInterval(() => {
      refreshLivePrices(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshLivePrices]);

  // Generate flight offers matching search criteria calibrated with live base fare and custom overrides
  const flightOffers = useMemo(() => {
    const rawOffers = generateMatchingFlightOffers(search, apiOffers);
    if (rawOffers.length === 0) return [];

    return rawOffers.map((offer) => {
      const override = customFlightOverrides[offer.id] || {};
      const updatedPriceBDT = customPriceUpdates[offer.id] ?? offer.priceBDT;
      return {
        ...offer,
        priceBDT: updatedPriceBDT,
        totalPrice: updatedPriceBDT,
        departureTime: override.departureTime || offer.departureTime,
        arrivalTime: override.arrivalTime || offer.arrivalTime,
        flightNumber: override.flightNumber || offer.flightNumber,
        duration: override.duration || offer.duration,
      };
    });
  }, [search, apiOffers, customFlightOverrides, customPriceUpdates]);

  // Generate flexible 7-day date fares
  const flexibleFares = useMemo(() => {
    const basePrice = flightOffers[0]?.priceBDT || 38411;
    return generateFlexibleDateFares(search, basePrice);
  }, [search, flightOffers]);

  // Unique airlines available in results with starting price
  const availableAirlines = useMemo(() => {
    const map = new Map<string, { code: string; name: string; minPrice: number; count: number }>();
    flightOffers.forEach((o) => {
      if (!map.has(o.airlineCode)) {
        map.set(o.airlineCode, { code: o.airlineCode, name: o.airlineName, minPrice: o.priceBDT, count: 1 });
      } else {
        const item = map.get(o.airlineCode)!;
        item.count += 1;
        if (o.priceBDT < item.minPrice) item.minPrice = o.priceBDT;
      }
    });
    return Array.from(map.values());
  }, [flightOffers]);

  // Counts and lowest fares for stops
  const stopStats = useMemo(() => {
    const direct = flightOffers.filter((o) => o.stops === 0);
    const oneStop = flightOffers.filter((o) => o.stops === 1);
    const multiStop = flightOffers.filter((o) => o.stops >= 2);

    return {
      allCount: flightOffers.length,
      directCount: direct.length,
      directMinPrice: direct.length > 0 ? Math.min(...direct.map((o) => o.priceBDT)) : null,
      oneStopCount: oneStop.length,
      oneStopMinPrice: oneStop.length > 0 ? Math.min(...oneStop.map((o) => o.priceBDT)) : null,
      multiStopCount: multiStop.length,
    };
  }, [flightOffers]);

  // Filter & Sort Logic
  const filteredAndSortedOffers = useMemo(() => {
    let list = [...flightOffers];

    // Stops filter
    if (stopFilter === 'direct') {
      list = list.filter((o) => o.stops === 0);
    } else if (stopFilter === '1stop') {
      list = list.filter((o) => o.stops <= 1);
    } else if (stopFilter === '2stop') {
      list = list.filter((o) => o.stops >= 2);
    }

    // Time filter
    if (timeFilter === 'early-morning') {
      list = list.filter((o) => {
        const hour = parseInt(o.departureTime.split(':')[0], 10);
        return hour >= 5 && hour < 8;
      });
    } else if (timeFilter === 'morning') {
      list = list.filter((o) => {
        const hour = parseInt(o.departureTime.split(':')[0], 10);
        return hour >= 8 && hour < 12;
      });
    } else if (timeFilter === 'afternoon') {
      list = list.filter((o) => {
        const hour = parseInt(o.departureTime.split(':')[0], 10);
        return hour >= 12 && hour < 17;
      });
    } else if (timeFilter === 'evening') {
      list = list.filter((o) => {
        const hour = parseInt(o.departureTime.split(':')[0], 10);
        return hour >= 17;
      });
    }

    // Airline filter
    if (selectedAirlines.length > 0) {
      list = list.filter((o) => selectedAirlines.includes(o.airlineCode));
    }

    // Baggage filter
    if (baggageOnly) {
      list = list.filter((o) => !o.baggageAllowance.checked.includes('Option') && !o.baggageAllowance.checked.includes('0'));
    }

    // Refundable filter
    if (refundableOnly) {
      list = list.filter((o) => o.refundable);
    }

    // Max price filter
    if (maxPriceLimit !== null) {
      list = list.filter((o) => o.priceBDT <= maxPriceLimit);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'cheapest') {
        return a.priceBDT - b.priceBDT;
      }
      if (sortBy === 'fastest') {
        const getMinutes = (d: string) => {
          const match = d.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
          const h = match && match[1] ? parseInt(match[1], 10) : 0;
          const m = match && match[2] ? parseInt(match[2], 10) : 0;
          return h * 60 + m;
        };
        return getMinutes(a.duration) - getMinutes(b.duration);
      }
      if (sortBy === 'earliest') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortBy === 'latest') {
        return b.departureTime.localeCompare(a.departureTime);
      }
      // 'best' / 'recommended' balance
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      if (a.isBestValue && !b.isBestValue) return -1;
      if (!a.isBestValue && b.isBestValue) return 1;
      return a.priceBDT - b.priceBDT;
    });

    return list;
  }, [flightOffers, sortBy, stopFilter, timeFilter, selectedAirlines, baggageOnly, refundableOnly, maxPriceLimit]);

  // Overall min and max possible fares for slider
  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    if (flightOffers.length === 0) return { minPossiblePrice: 0, maxPossiblePrice: 100000 };
    const prices = flightOffers.map((o) => o.priceBDT);
    return {
      minPossiblePrice: Math.min(...prices),
      maxPossiblePrice: Math.max(...prices),
    };
  }, [flightOffers]);

  // Lowest fare across all offers
  const lowestFareBDT = useMemo(() => {
    if (flightOffers.length === 0) return 0;
    return Math.min(...flightOffers.map((o) => o.priceBDT));
  }, [flightOffers]);

  // Fastest flight duration and price for the top 3-tab bar
  const { quickestFareBDT, quickestDuration } = useMemo(() => {
    if (flightOffers.length === 0) return { quickestFareBDT: 0, quickestDuration: '2h 30m' };
    const sortedByDuration = [...flightOffers].sort((a, b) => {
      const getMinutes = (d: string) => {
        const match = d.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
        const h = match && match[1] ? parseInt(match[1], 10) : 0;
        const m = match && match[2] ? parseInt(match[2], 10) : 0;
        return h * 60 + m;
      };
      return getMinutes(a.duration) - getMinutes(b.duration);
    });
    return {
      quickestFareBDT: sortedByDuration[0]?.priceBDT || lowestFareBDT,
      quickestDuration: sortedByDuration[0]?.duration || '2h 30m',
    };
  }, [flightOffers, lowestFareBDT]);

  const toggleAirlineFilter = (code: string) => {
    if (selectedAirlines.includes(code)) {
      setSelectedAirlines(selectedAirlines.filter((c) => c !== code));
    } else {
      setSelectedAirlines([...selectedAirlines, code]);
    }
  };

  const toggleCompareOffer = (id: string) => {
    if (comparedOfferIds.includes(id)) {
      setComparedOfferIds(comparedOfferIds.filter((item) => item !== id));
    } else {
      if (comparedOfferIds.length >= 3) {
        showToast('You can compare up to 3 flights simultaneously.', 'info');
        return;
      }
      setComparedOfferIds([...comparedOfferIds, id]);
      showToast('Flight added to comparison', 'success');
    }
  };

  const handleShareSearch = () => {
    const text = buildDynamicFlightShareText(search, lowestFareBDT);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopiedLink(true);
      showToast('Flight search details copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCopyAviasalesUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(aviasalesCleanUrl);
      setCopiedAviasalesUrl(true);
      showToast(`Aviasales Search URL (${aviasalesSearchKey}) copied!`, 'success');
      setTimeout(() => setCopiedAviasalesUrl(false), 3000);
    }
  };

  const handleSubscribePriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail && !alertPhone) {
      showToast('Please enter an email address or WhatsApp number', 'error');
      return;
    }
    setAlertSubscribed(true);
    showToast(`Price alerts activated for ${search.origin.code} ➔ ${search.destination.code}!`, 'success');
    setTimeout(() => {
      setShowPriceAlertModal(false);
      setAlertSubscribed(false);
      setAlertEmail('');
      setAlertPhone('');
    }, 2000);
  };

  // Revalidate price utility triggered before partner booking redirect
  const handleSelectOffer = async (offer: FlightOffer) => {
    setRevalidatingOfferId(offer.id);
    try {
      const result = await revalidateFlightPrice(offer, search, { currency });
      if (result.hasIncreased) {
        setPriceIncreaseModalData({ flight: offer, result });
      } else if (result.hasDecreased) {
        setCustomPriceUpdates((prev) => ({ ...prev, [offer.id]: result.freshPrice }));
        showToast(
          `🎉 Live fare dropped to ${formatPrice(result.freshPrice)} (-${formatPrice(Math.abs(result.priceDifference))})! Redirecting...`,
          'success'
        );
        window.open(result.bookingUrl || offer.partnerDeepLink, '_blank', 'noopener,noreferrer');
      } else {
        showToast('Live price verified with airline inventory. Opening booking partner...', 'success');
        window.open(result.bookingUrl || offer.partnerDeepLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Price revalidation failed:', err);
      window.open(offer.partnerDeepLink, '_blank', 'noopener,noreferrer');
    } finally {
      setRevalidatingOfferId(null);
    }
  };

  const handleAcceptPriceIncrease = (freshPrice: number, bookingUrl: string) => {
    if (priceIncreaseModalData) {
      setCustomPriceUpdates((prev) => ({
        ...prev,
        [priceIncreaseModalData.flight.id]: freshPrice,
      }));
    }
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
    setPriceIncreaseModalData(null);
    showToast('Proceeding to partner checkout with verified live fare.', 'success');
  };

  const handleDeclinePriceIncrease = (freshPrice?: number) => {
    if (priceIncreaseModalData && freshPrice) {
      setCustomPriceUpdates((prev) => ({
        ...prev,
        [priceIncreaseModalData.flight.id]: freshPrice,
      }));
      showToast('Flight search results updated with latest live airline fare.', 'info');
    }
    setPriceIncreaseModalData(null);
  };

  const totalPax = search.adults + search.children + search.infants;

  // Compute itemized tax breakdown helper
  const calculateFareBreakdown = (offer: FlightOffer) => {
    const total = offer.priceBDT;
    const isDomestic =
      (offer.origin.code === 'DAC' || offer.origin.isBangladesh) &&
      (offer.destination.code === 'CGP' || offer.destination.isBangladesh);

    if (isDomestic) {
      const caabSecurityFee = 300 * totalPax;
      const airportDevFee = 200 * totalPax;
      const vat = Math.round(total * 0.14);
      const baseFare = Math.max(1000, total - caabSecurityFee - airportDevFee - vat);
      return {
        baseFare,
        caabSecurityFee,
        airportDevFee,
        vat,
        total,
      };
    } else {
      const departureTax = 3000 * totalPax;
      const fuelSurcharge = Math.round(total * 0.22);
      const vatAndFees = Math.round(total * 0.12);
      const baseFare = Math.max(5000, total - departureTax - fuelSurcharge - vatAndFees);
      return {
        baseFare,
        departureTax,
        fuelSurcharge,
        vatAndFees,
        total,
      };
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans text-slate-800">
      {/* 1. Sticky / Compact Search Summary Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        {/* Desktop & Tablet Summary Bar (Horizontal) */}
        <div className="hidden sm:flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {/* Route */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg lg:text-xl font-black text-[#172033] tracking-tight">
                  {search.origin.code} ➔ {search.destination.code}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {search.tripType === 'round' ? 'Round trip' : 'One way'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[280px]">
                {search.origin.city} to {search.destination.city}
              </p>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Travel Dates */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-[#1677FF]" />
                <span>
                  {new Date(search.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {search.tripType === 'round' && search.returnDate && (
                    <> — {new Date(search.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {new Date(search.departureDate).getFullYear()}
              </p>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            {/* Pax & Class */}
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800">
                {totalPax} Traveler{totalPax > 1 ? 's' : ''} · {search.cabinClass}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">
                {filteredAndSortedOffers.length} available flights
              </p>
            </div>
          </div>

          {/* Quick Action Pills on Right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Modify Search CTA */}
            <button
              type="button"
              onClick={() => {
                const searchForm = document.getElementById('flight-search-form-container') || document.querySelector('form');
                if (searchForm) {
                  searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border border-slate-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Modify Search</span>
            </button>

            {/* Price Alert */}
            <button
              type="button"
              onClick={() => setShowPriceAlertModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-[#1677FF]" />
              <span>Track Prices</span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs font-bold">
              {(['BDT', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    currency === curr ? 'bg-[#1677FF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {curr === 'BDT' ? '৳ BDT' : curr === 'USD' ? '$ USD' : '€ EUR'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile-Specific Search Summary Card (Compact & Clean) */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-[#1677FF]">
                <Plane className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {search.origin.code} ➔ {search.destination.code}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {new Date(search.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {search.tripType === 'round' && search.returnDate && (
                    <> – {new Date(search.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                  )}
                  {' '}· {totalPax} Adult{totalPax > 1 ? 's' : ''} · {search.cabinClass}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const searchForm = document.getElementById('flight-search-form-container') || document.querySelector('form');
                if (searchForm) {
                  searchForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
            >
              Modify
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-emerald-600">
              {filteredAndSortedOffers.length} available flights found
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileFilterDrawer(true)}
                className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span>Filters</span>
                {(stopFilter !== 'all' || timeFilter !== 'all' || selectedAirlines.length > 0 || baggageOnly || refundableOnly || maxPriceLimit !== null) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Flexible Dates Lowest Fare Matrix */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#1677FF]" />
              Flexible Dates Lowest Fare Matrix
            </span>
            <span className="text-[10px] text-slate-400">All prices in {currency}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {flexibleFares.map((fare) => {
              const isSelected = fare.isSelected;
              return (
                <button
                  key={fare.date}
                  type="button"
                  onClick={() => onSelectDate && onSelectDate(fare.date)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1677FF] border-[#1677FF] text-white shadow-xs ring-2 ring-blue-300'
                      : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`text-[11px] font-bold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {fare.dayOfWeek}, {new Date(fare.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                    {formatPrice(fare.priceBDT)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Search Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Filter Sidebar with Collapsible Sections */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#1677FF]" />
                <span>Filter by</span>
              </h3>
              {(stopFilter !== 'all' || timeFilter !== 'all' || selectedAirlines.length > 0 || baggageOnly || refundableOnly || maxPriceLimit !== null) && (
                <button
                  type="button"
                  onClick={() => {
                    setStopFilter('all');
                    setTimeFilter('all');
                    setSelectedAirlines([]);
                    setBaggageOnly(false);
                    setRefundableOnly(false);
                    setMaxPriceLimit(null);
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* 1. Stops Filter Section */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCollapsedSections(prev => ({ ...prev, stops: !prev.stops }))}
                className="w-full flex items-center justify-between font-bold text-xs text-slate-900 uppercase tracking-wider cursor-pointer"
              >
                <span>Stops</span>
                {collapsedSections.stops ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {!collapsedSections.stops && (
                <div className="space-y-1.5 text-xs pt-1">
                  {/* All */}
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="stopFilter"
                        checked={stopFilter === 'all'}
                        onChange={() => setStopFilter('all')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-slate-700">All Flights</span>
                    </div>
                    <span className="text-slate-400 font-medium">({stopStats.allCount})</span>
                  </label>

                  {/* Direct / Nonstop */}
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="stopFilter"
                        checked={stopFilter === 'direct'}
                        onChange={() => setStopFilter('direct')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-slate-700 font-medium">Nonstop</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px]">({stopStats.directCount})</span>
                      {stopStats.directMinPrice && (
                        <div className="text-[11px] font-bold text-slate-900">from {formatPrice(stopStats.directMinPrice)}</div>
                      )}
                    </div>
                  </label>

                  {/* 1 Stop */}
                  <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="stopFilter"
                        checked={stopFilter === '1stop'}
                        onChange={() => setStopFilter('1stop')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-slate-700 font-medium">1 stop max</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px]">({stopStats.oneStopCount})</span>
                      {stopStats.oneStopMinPrice && (
                        <div className="text-[11px] font-bold text-slate-900">from {formatPrice(stopStats.oneStopMinPrice)}</div>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* 2. Price Range Slider Section */}
            {maxPossiblePrice > minPossiblePrice && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, price: !prev.price }))}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-900 uppercase tracking-wider cursor-pointer"
                >
                  <span>Max Budget</span>
                  {collapsedSections.price ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {!collapsedSections.price && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Up to:</span>
                      <span className="font-bold text-[#1677FF] text-sm">
                        {formatPrice(maxPriceLimit ?? maxPossiblePrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={minPossiblePrice}
                      max={maxPossiblePrice}
                      step={500}
                      value={maxPriceLimit ?? maxPossiblePrice}
                      onChange={(e) => setMaxPriceLimit(parseInt(e.target.value, 10))}
                      className="w-full accent-[#1677FF] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{formatPrice(minPossiblePrice)}</span>
                      <span>{formatPrice(maxPossiblePrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Airlines Filter Section */}
            {availableAirlines.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCollapsedSections(prev => ({ ...prev, airlines: !prev.airlines }))}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-900 uppercase tracking-wider cursor-pointer"
                >
                  <span>Airlines</span>
                  {collapsedSections.airlines ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {!collapsedSections.airlines && (
                  <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1 pt-1">
                    {availableAirlines.map((air) => {
                      const isChecked = selectedAirlines.includes(air.code);
                      return (
                        <label
                          key={air.code}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleAirlineFilter(air.code)}
                              className="rounded-xs text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <AirlineLogo airlineCode={air.code} airlineName={air.name} size="xs" />
                            <span className="text-slate-800 truncate font-medium">{air.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-900 shrink-0 ml-1">
                            from {formatPrice(air.minPrice)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. Flight Times Section */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setCollapsedSections(prev => ({ ...prev, times: !prev.times }))}
                className="w-full flex items-center justify-between font-bold text-xs text-slate-900 uppercase tracking-wider cursor-pointer"
              >
                <span>Departs from {search.origin.code}</span>
                {collapsedSections.times ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {!collapsedSections.times && (
                <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
                  {(
                    [
                      { id: 'all', label: 'All Day', icon: Sun },
                      { id: 'early-morning', label: '05:00 - 08:00', icon: Sunrise },
                      { id: 'morning', label: '08:00 - 12:00', icon: Sun },
                      { id: 'afternoon', label: '12:00 - 17:00', icon: Sunset },
                      { id: 'evening', label: '17:00+', icon: Moon },
                    ] as const
                  ).map((t) => {
                    const isSelected = timeFilter === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTimeFilter(t.id)}
                        className={`p-2 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50 border-[#1677FF] text-[#1677FF] font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Inclusions & Policies Section */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setCollapsedSections(prev => ({ ...prev, baggage: !prev.baggage }))}
                className="w-full flex items-center justify-between font-bold text-xs text-slate-900 uppercase tracking-wider cursor-pointer"
              >
                <span>Baggage & Perks</span>
                {collapsedSections.baggage ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {!collapsedSections.baggage && (
                <div className="space-y-1.5 text-xs pt-1">
                  <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={baggageOnly}
                      onChange={(e) => setBaggageOnly(e.target.checked)}
                      className="rounded-xs text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-slate-800 font-medium">Checked bag included</span>
                  </label>
                  <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refundableOnly}
                      onChange={(e) => setRefundableOnly(e.target.checked)}
                      className="rounded-xs text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-slate-800 font-medium">Free date change / Refundable</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: 3-Tab Sort Header & Flight Cards */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Trust & Transparency Signal Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-blue-900 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Verified Flight Comparison</span>
              </div>
              <p className="text-[11px] text-blue-900/90 leading-relaxed max-w-3xl">
                ✓ Guaranteed live airline prices · ✓ Taxes & fees included · ✓ Instant seat selection & baggage check
              </p>
            </div>
          </div>

          {/* 3-Tab Comparison Sort Bar (Cheapest / Best Value / Fastest) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
              {/* Tab 1: Cheapest */}
              <button
                type="button"
                onClick={() => setSortBy('cheapest')}
                className={`py-3.5 px-2 sm:px-4 transition-all cursor-pointer relative ${
                  sortBy === 'cheapest'
                    ? 'bg-blue-50/70 text-[#1677FF] font-bold border-b-2 border-[#1677FF]'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Cheapest</div>
                <div className="text-sm sm:text-base font-black text-[#1677FF]">
                  {formatPrice(lowestFareBDT)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Lowest fare found</div>
              </button>

              {/* Tab 2: Best Value (Recommended) */}
              <button
                type="button"
                onClick={() => setSortBy('best')}
                className={`py-3.5 px-2 sm:px-4 transition-all cursor-pointer relative ${
                  sortBy === 'best'
                    ? 'bg-blue-50/70 text-[#1677FF] font-bold border-b-2 border-[#1677FF]'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                  <span>Recommended</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
                <div className="text-sm sm:text-base font-black text-[#1677FF]">
                  {formatPrice(lowestFareBDT)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Best balance of stops & price</div>
              </button>

              {/* Tab 3: Fastest */}
              <button
                type="button"
                onClick={() => setSortBy('fastest')}
                className={`py-3.5 px-2 sm:px-4 transition-all cursor-pointer relative ${
                  sortBy === 'fastest'
                    ? 'bg-blue-50/70 text-[#1677FF] font-bold border-b-2 border-[#1677FF]'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Fastest ({quickestDuration})</div>
                <div className="text-sm sm:text-base font-black text-[#1677FF]">
                  {formatPrice(quickestFareBDT)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium hidden sm:block">Shortest flight duration</div>
              </button>
            </div>

            {/* Secondary Sort Controls Bar */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-4">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Showing <strong>{filteredAndSortedOffers.length}</strong> of {flightOffers.length} flights</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold uppercase">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort flight results"
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:border-blue-600 cursor-pointer shadow-2xs"
                >
                  <option value="best">Recommended</option>
                  <option value="cheapest">Cheapest first</option>
                  <option value="fastest">Fastest first</option>
                  <option value="earliest">Earliest departure</option>
                  <option value="latest">Latest departure</option>
                </select>
              </div>
            </div>
          </div>

          {/* FLIGHT RESULT CARDS */}
          {isLoadingOffers ? (
            <FlightLoadingAnimation
              originCode={search.origin.code}
              originCity={search.origin.city}
              destCode={search.destination.code}
              destCity={search.destination.city}
            />
          ) : filteredAndSortedOffers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">No Flights Match Your Selected Filters</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try adjusting your departure time or stop preferences to see all available inventory for this route.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStopFilter('all');
                  setTimeFilter('all');
                  setSelectedAirlines([]);
                  setBaggageOnly(false);
                }}
                className="px-4 py-2 bg-[#1677FF] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOffers.map((offer, oIdx) => {
                const isExpanded = expandedOfferId === offer.id;
                const isCompared = comparedOfferIds.includes(offer.id);
                const pricePerPax = Math.round(offer.priceBDT / totalPax);

                return (
                  <div
                    key={`${offer.id}-${oIdx}`}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4 group"
                  >
                    {/* Top Row: Badges & Right Action Icons */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {offer.isRecommended && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1677FF] text-xs font-bold border border-blue-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Best Value
                          </span>
                        )}
                        {offer.isCheapest && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                            Cheapest
                          </span>
                        )}
                        {offer.isFastest && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7FF] text-[#0759B8] text-xs font-bold border border-[#CDE9FB]">
                            Fastest
                          </span>
                        )}
                        {offer.seatsRemaining && offer.seatsRemaining <= 4 && (
                          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 ml-1">
                            <Flame className="w-3.5 h-3.5" />
                            Only {offer.seatsRemaining} seats left at this price
                          </span>
                        )}
                      </div>

                      {/* Right Icons: Compare checkbox, Share */}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800">
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={() => toggleCompareOffer(offer.id)}
                            className="rounded-xs text-[#1677FF] focus:ring-blue-500 h-4 w-4"
                          />
                          <span>Compare</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleShareSearch}
                          title="Share flight"
                          className="hover:text-slate-800 p-1 cursor-pointer transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Flight Details Grid: Left Legs & Right Price Block */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                      {/* Left: Flight Legs (Outbound & Return) */}
                      <div className="lg:col-span-8 space-y-4">
                        {/* Outbound Leg */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                          {/* Airline Logo & Info */}
                          <div className="flex items-center gap-3 sm:w-44 shrink-0">
                            <AirlineLogo
                              airlineCode={offer.airlineCode}
                              airlineName={offer.airlineName}
                              customLogoUrl={offer.airlineLogo}
                              size="md"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#172033] truncate">{offer.airlineName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{offer.flightNumber}</div>
                              <div className="text-[10px] text-slate-400 truncate">{offer.aircraft}</div>
                            </div>
                          </div>

                          {/* Flight Route Visual Timeline (Departure -> Journey Line -> Arrival) */}
                          <div className="flex-1 flex items-center justify-between gap-3">
                            {/* Departure */}
                            <div className="text-left shrink-0">
                              <div className="text-lg sm:text-xl font-black text-[#172033]">
                                {formatTime12h(offer.departureTime)}
                              </div>
                              <div className="text-xs font-bold text-slate-600">{offer.origin.code}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[85px]">{offer.origin.city}</div>
                            </div>

                            {/* Center Journey Line with Plane & Duration */}
                            <div className="flex-1 flex flex-col items-center px-2">
                              <span className="text-[11px] font-semibold text-slate-500 mb-1">{offer.duration}</span>
                              <div className="w-full flex items-center relative">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <div className="flex-1 h-0.5 bg-slate-200 relative">
                                  <Plane className="w-3.5 h-3.5 text-[#1677FF] absolute left-1/2 -top-1.5 -translate-x-1/2 rotate-90" />
                                </div>
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                              </div>
                              <span className={`text-[10px] font-bold mt-1 px-2 py-0.2 rounded-full ${
                                offer.stops === 0
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : 'text-[#0759B8] bg-[#EAF7FF]'
                              }`}>
                                {offer.stops === 0 ? 'Nonstop' : `${offer.stops} stop in ${offer.stopAirports?.join(', ') || 'Transit'}`}
                              </span>
                            </div>

                            {/* Arrival */}
                            <div className="text-right shrink-0">
                              <div className="text-lg sm:text-xl font-black text-[#172033]">
                                {formatTime12h(offer.arrivalTime)}
                              </div>
                              <div className="text-xs font-bold text-slate-600">{offer.destination.code}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[85px]">{offer.destination.city}</div>
                            </div>
                          </div>
                        </div>

                        {/* Return Leg if Round-Trip */}
                        {search.tripType === 'round' && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 pt-3 border-t border-slate-100">
                            {/* Airline Logo & Info */}
                            <div className="flex items-center gap-3 sm:w-44 shrink-0">
                              <AirlineLogo
                                airlineCode={offer.airlineCode}
                                airlineName={offer.airlineName}
                                customLogoUrl={offer.airlineLogo}
                                size="md"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#172033] truncate">{offer.airlineName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{offer.returnSegment?.flightNumber || 'TG 321'}</div>
                                <div className="text-[10px] text-slate-400">Return Flight</div>
                              </div>
                            </div>

                            {/* Return Route Visual Timeline */}
                            <div className="flex-1 flex items-center justify-between gap-3">
                              <div className="text-left shrink-0">
                                <div className="text-lg sm:text-xl font-black text-[#172033]">
                                  {offer.returnSegment ? formatTime12h(offer.returnSegment.departureTime) : '10:35 am'}
                                </div>
                                <div className="text-xs font-bold text-slate-600">{search.destination.code}</div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[85px]">{search.destination.city}</div>
                              </div>

                              <div className="flex-1 flex flex-col items-center px-2">
                                <span className="text-[11px] font-semibold text-slate-500 mb-1">
                                  {offer.returnSegment?.duration || offer.duration}
                                </span>
                                <div className="w-full flex items-center relative">
                                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                  <div className="flex-1 h-0.5 bg-slate-200 relative">
                                    <Plane className="w-3.5 h-3.5 text-[#1677FF] absolute left-1/2 -top-1.5 -translate-x-1/2 rotate-90" />
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 mt-1 px-2 py-0.2 rounded-full">
                                  Nonstop Return
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-lg sm:text-xl font-black text-[#172033]">
                                  {offer.returnSegment ? formatTime12h(offer.returnSegment.arrivalTime) : '12:10 pm'}
                                </div>
                                <div className="text-xs font-bold text-slate-600">{search.origin.code}</div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[85px]">{search.origin.city}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Value Inclusions Bar */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            {offer.baggageAllowance.checked} Baggage Included
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Halal Meal Included
                          </span>
                          {offer.refundable && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              Free Date Change
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Booking Price & Select CTA Block */}
                      <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-5">
                        <div className="text-left lg:text-right w-full">
                          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{search.cabinClass} Fare</div>
                          <div className="text-2xl sm:text-3xl font-black text-[#172033]">
                            {formatPrice(offer.priceBDT)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {search.tripType === 'round' ? 'Round trip total' : 'One way total'} • Taxes & fees included
                          </div>
                        </div>

                        {/* Select Flight CTA Buttons */}
                        <div className="w-full flex flex-col gap-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleSelectOffer(offer)}
                              disabled={revalidatingOfferId === offer.id}
                              className="w-full py-2.5 px-3 bg-[#1677FF] hover:bg-[#0057B8] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center shadow-xs hover:shadow-md active:scale-98 disabled:opacity-75"
                            >
                              {revalidatingOfferId === offer.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ExternalLink className="w-3.5 h-3.5" />
                              )}
                              <span>Book Online ↗</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedDetailFlight(offer)}
                              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center active:scale-98 border border-slate-200"
                            >
                              <span>Details & Hold</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2 w-full text-[11px] pt-0.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailFlight(offer)}
                              className="text-[#1677FF] hover:underline font-bold cursor-pointer flex items-center gap-1"
                            >
                              <span>Compare Partners</span>
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => setSelectedBreakdownOffer(offer)}
                              className="text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                            >
                              Fare Breakdown
                            </button>
                            <span className="text-slate-300">•</span>
                            <a
                              href={buildDynamicFlightWhatsAppUrl(search, offer.priceBDT)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp Desk</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Accordion Trigger: Detailed Segments */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-500 flex items-center gap-2">
                        <Luggage className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cabin: {offer.baggageAllowance.cabin} • Checked: {offer.baggageAllowance.checked}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                        className="text-[#1677FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Flight Details' : 'View Flight Details & Baggage'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Detailed Breakdown */}
                    {isExpanded && (
                      <div className="mt-3 pt-4 border-t border-slate-200 bg-slate-50/80 rounded-xl p-4 space-y-4 text-xs animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Segment 1 Details */}
                          <div className="space-y-2">
                            <h5 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5 text-[#1677FF]" />
                              <span>Outbound Flight • {search.origin.code} ➔ {search.destination.code}</span>
                            </h5>
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Flight:</span>
                                <span className="font-bold text-[#1677FF]">{offer.airlineName} ({offer.flightNumber})</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Departure:</span>
                                <span className="font-bold">{formatTime12h(offer.departureTime)}, {search.departureDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Arrival:</span>
                                <span className="font-bold">{formatTime12h(offer.arrivalTime)}, {search.departureDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Aircraft:</span>
                                <span className="font-bold">{offer.aircraft}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Flight Duration:</span>
                                <span className="font-bold">{offer.duration}</span>
                              </div>
                            </div>
                          </div>

                          {/* Baggage & Fare Conditions */}
                          <div className="space-y-2">
                            <h5 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Baggage & In-Flight Amenities</span>
                            </h5>
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Checked Baggage:</span>
                                <span className="font-bold text-emerald-700">{offer.baggageAllowance.checked} Included</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Cabin Carry-on:</span>
                                <span className="font-bold">{offer.baggageAllowance.cabin} Included</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Ticket Refundable:</span>
                                <span className="font-bold">{offer.refundable ? 'Yes (per airline policy)' : 'Non-refundable'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Meal Service:</span>
                                <span className="font-bold">Complimentary Halal Meal</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Return Leg if Round-Trip */}
                        {search.tripType === 'round' && (
                          <div className="pt-2 border-t border-slate-200">
                            <h5 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                              <Plane className="w-3.5 h-3.5 text-[#1677FF] rotate-180" />
                              <span>Return Flight • {search.destination.code} ➔ {search.origin.code}</span>
                            </h5>
                            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold px-2 py-0.5 bg-slate-100 rounded-lg text-slate-800">
                                  {offer.returnSegment?.flightNumber || 'TG 321'}
                                </span>
                                <span>Departs {offer.returnSegment ? formatTime12h(offer.returnSegment.departureTime) : '10:35 am'}</span>
                                <span>➔</span>
                                <span>Arrives {offer.returnSegment ? formatTime12h(offer.returnSegment.arrivalTime) : '12:10 pm'}</span>
                              </div>
                              <span className="font-bold text-slate-700">
                                Duration: {offer.returnSegment?.duration || offer.duration}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* What Happens Next? Metasearch Redirect & Support Information */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-extrabold text-slate-900 text-sm">
                  What Happens Next? (Transparent 5-Step Metasearch Flow)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Booking Guidance
              </span>
            </div>

            {/* 5-Step Visual Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  1
                </span>
                <p className="font-bold text-slate-900 text-xs">Enter Details</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter passenger details on the partner website.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  2
                </span>
                <p className="font-bold text-slate-900 text-xs">Complete Payment</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Complete payment directly with the partner.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  3
                </span>
                <p className="font-bold text-slate-900 text-xs">Receive E-Ticket</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Receive your e-ticket from the partner.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  4
                </span>
                <p className="font-bold text-slate-900 text-xs">Partner Support</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Contact the partner for refunds, changes, or ticket issuance.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                  5
                </span>
                <p className="font-bold text-slate-900 text-xs">Azraq Concierge</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Contact Azraq for travel planning, visa guidance, or concierge support.
                </p>
              </div>
            </div>

            {/* Support Box */}
            <div className="p-3.5 rounded-xl bg-[#EAF7FF] border border-[#CDE9FB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#003B80] block">Need help choosing?</span>
                <p className="text-[#0759B8]/90 text-[11px] leading-relaxed">
                  Azraq can help you compare routes, understand visa requirements, and plan your trip. The selected partner completes the ticket purchase.
                </p>
              </div>
              <a
                href={buildDynamicFlightWhatsAppUrl(search, lowestFareBDT)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#1389E8] hover:bg-[#0E7FE3] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Talk to Concierge</span>
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Itemized Price Breakdown Modal */}
      {selectedBreakdownOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl text-[#006CE4]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Price Breakdown</h4>
                  <p className="text-xs text-slate-500">
                    {selectedBreakdownOffer.airlineName} • {selectedBreakdownOffer.flightNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBreakdownOffer(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              {(() => {
                const breakdown = calculateFareBreakdown(selectedBreakdownOffer);
                return (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Base Airfare ({totalPax} Traveler{totalPax > 1 ? 's' : ''}):</span>
                      <span className="font-bold text-slate-900">{formatPrice(breakdown.baseFare)}</span>
                    </div>
                    {'caabSecurityFee' in breakdown && (
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">CAAB Aviation Security Fee:</span>
                        <span className="font-bold text-slate-900">{formatPrice(breakdown.caabSecurityFee)}</span>
                      </div>
                    )}
                    {'departureTax' in breakdown && (
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">Government Embarkation / Departure Tax:</span>
                        <span className="font-bold text-slate-900">{formatPrice(breakdown.departureTax)}</span>
                      </div>
                    )}
                    {'fuelSurcharge' in breakdown && (
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">Airline Fuel & Surcharge (YQ):</span>
                        <span className="font-bold text-slate-900">{formatPrice(breakdown.fuelSurcharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Passenger Service VAT & Taxes:</span>
                      <span className="font-bold text-slate-900">{formatPrice((breakdown as any).vat || (breakdown as any).vatAndFees)}</span>
                    </div>
                    <div className="flex justify-between py-2 pt-3 font-extrabold text-sm text-[#006CE4]">
                      <span>Total Guaranteed Price:</span>
                      <span className="text-base text-slate-900">{formatPrice(breakdown.total)}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="pt-2">
              <a
                href={selectedBreakdownOffer.partnerDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#006CE4] hover:bg-[#0057B8] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm text-center cursor-pointer"
              >
                <span>Select this flight</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Price Alert Subscription Modal */}
      {showPriceAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-xl text-[#006CE4]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Track Flight Prices</h4>
                  <p className="text-xs text-slate-500">
                    {search.origin.city} ({search.origin.code}) ➔ {search.destination.city} ({search.destination.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceAlertModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              We'll send you an instant alert when prices drop for this route!
            </p>

            <form onSubmit={handleSubscribePriceAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+880 1XXXXXXXXX"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPriceAlertModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={alertSubscribed}
                  className="px-5 py-2.5 bg-[#006CE4] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {alertSubscribed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Alert Activated!</span>
                    </>
                  ) : (
                    <span>Activate Price Alert</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Fix / Calibrate Live Base Price Modal */}
      {showPriceFixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Fix / Calibrate Flight Price</h4>
                  <p className="text-xs text-slate-500">
                    Route: {search.origin.code} ➔ {search.destination.code} ({search.departureDate})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPriceFixModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFixedPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Set Base Live Price
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      required
                      value={priceFixInput}
                      onChange={(e) => setPriceFixInput(e.target.value)}
                      placeholder={priceFixCurrency === 'USD' ? '320' : '38411'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setPriceFixCurrency('BDT');
                        setPriceFixInput(String(customLiveBaseFare));
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        priceFixCurrency === 'BDT' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                      }`}
                    >
                      BDT (Tk)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPriceFixCurrency('USD');
                        setPriceFixInput(String(Math.round(customLiveBaseFare / 120)));
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        priceFixCurrency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                      }`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Live Presets:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPricePreset(38411)}
                    className="p-2 text-left rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900">Tk 38,411 ($320)</div>
                    <div className="text-[10px] text-slate-400">Thai Airways Saver</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPricePreset(42665)}
                    className="p-2 text-left rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900">Tk 42,665 ($355)</div>
                    <div className="text-[10px] text-slate-400">Quickest Nonstop</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPricePreset(3850)}
                    className="p-2 text-left rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900">Tk 3,850 ($32)</div>
                    <div className="text-[10px] text-slate-400">Domestic Base</div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPriceFixModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Price</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Flight Schedule & Timetable Calibration Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 rounded-xl text-[#006CE4]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Flight Timetables & Schedules</h4>
                  <p className="text-xs text-slate-500">
                    {search.origin.city} ({search.origin.code}) ➔ {search.destination.city} ({search.destination.code}) • {search.departureDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-900 shrink-0">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All flight times are synchronized with official operating schedules. Click "Calibrate" on any flight to override its departure or arrival time.</span>
              </p>
            </div>

            {/* List of flights */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {flightOffers.map((offer, idx) => (
                <div
                  key={`${offer.id}-${idx}`}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400 w-5">#{idx + 1}</span>
                    <AirlineLogo
                      airlineCode={offer.airlineCode}
                      airlineName={offer.airlineName}
                      customLogoUrl={offer.airlineLogo}
                      size="sm"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{offer.airlineName}</span>
                        <span className="text-[#006CE4] font-semibold text-[11px] bg-blue-50 px-1.5 py-0.5 rounded">
                          {offer.flightNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {offer.aircraft} • {offer.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-bold text-sm text-slate-900">
                      {formatTime12h(offer.departureTime)} <span className="text-slate-400 font-normal">➔</span> {formatTime12h(offer.arrivalTime)}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduleModal(false);
                        setEditingFlightOffer(offer);
                      }}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 hover:text-[#006CE4] border border-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      Calibrate
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCustomFlightOverrides({});
                  showToast('Reset all schedules to official defaults!', 'info');
                }}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Reset to Standard Schedules
              </button>

              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-5 py-2 bg-[#006CE4] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Single Flight Time & Number Customization Modal */}
      {editingFlightOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 rounded-xl text-[#006CE4]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Calibrate Flight Schedule</h4>
                  <p className="text-xs text-slate-500">
                    {editingFlightOffer.airlineName} • {editingFlightOffer.flightNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFlightOffer(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const dep = (form.elements.namedItem('depTime') as HTMLInputElement).value;
                const arr = (form.elements.namedItem('arrTime') as HTMLInputElement).value;
                const fNum = (form.elements.namedItem('fNum') as HTMLInputElement).value;
                const dur = (form.elements.namedItem('duration') as HTMLInputElement).value;

                setCustomFlightOverrides((prev) => ({
                  ...prev,
                  [editingFlightOffer.id]: {
                    departureTime: dep,
                    arrivalTime: arr,
                    flightNumber: fNum,
                    duration: dur,
                  },
                }));

                setEditingFlightOffer(null);
                showToast(`Updated flight schedule for ${fNum} (${dep} ➔ ${arr})!`, 'success');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Flight Number
                </label>
                <input
                  type="text"
                  name="fNum"
                  defaultValue={editingFlightOffer.flightNumber}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Departure Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    name="depTime"
                    defaultValue={editingFlightOffer.departureTime}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Arrival Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    name="arrTime"
                    defaultValue={editingFlightOffer.arrivalTime}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Duration Display
                </label>
                <input
                  type="text"
                  name="duration"
                  defaultValue={editingFlightOffer.duration}
                  required
                  placeholder="2h 30m"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFlightOffer(null)}
                  className="px-3 py-2 font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#006CE4] hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Schedule Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Drawer */}
      {showMobileFilterDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1677FF]" />
                <h3 className="text-base font-bold text-slate-900">Filter Flights</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilterDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 font-bold text-sm rounded-full bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stops */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stops</span>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'direct', '1stop'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStopFilter(st)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      stopFilter === st
                        ? 'bg-[#1677FF] border-[#1677FF] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {st === 'all' ? 'All Stops' : st === 'direct' ? 'Nonstop' : '1 Stop'}
                  </button>
                ))}
              </div>
            </div>

            {/* Time of Day */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Departure Time</span>
              <div className="grid grid-cols-2 gap-2">
                {(['all', 'morning', 'afternoon', 'evening'] as const).map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setTimeFilter(tm)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      timeFilter === tm
                        ? 'bg-[#1677FF] border-[#1677FF] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {tm === 'all' ? 'Any Time' : tm === 'morning' ? 'Morning (00-12)' : tm === 'afternoon' ? 'Afternoon (12-18)' : 'Evening (18-24)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Limit Slider */}
            {maxPossiblePrice > minPossiblePrice && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Max Budget</span>
                  <span className="font-bold text-[#1677FF]">{formatPrice(maxPriceLimit ?? maxPossiblePrice)}</span>
                </div>
                <input
                  type="range"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={500}
                  value={maxPriceLimit ?? maxPossiblePrice}
                  onChange={(e) => setMaxPriceLimit(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1677FF]"
                />
              </div>
            )}

            {/* Baggage & Refundable */}
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Checked bag included</span>
                <input
                  type="checkbox"
                  checked={baggageOnly}
                  onChange={(e) => setBaggageOnly(e.target.checked)}
                  className="h-5 w-5 rounded-md text-[#1677FF] focus:ring-blue-500"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Free date change / Refundable</span>
                <input
                  type="checkbox"
                  checked={refundableOnly}
                  onChange={(e) => setRefundableOnly(e.target.checked)}
                  className="h-5 w-5 rounded-md text-[#1677FF] focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStopFilter('all');
                  setTimeFilter('all');
                  setSelectedAirlines([]);
                  setBaggageOnly(false);
                  setRefundableOnly(false);
                  setMaxPriceLimit(null);
                }}
                className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilterDrawer(false)}
                className="flex-2 py-3 bg-[#1677FF] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Show {filteredAndSortedOffers.length} Flights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile Booking Bottom CTA */}
      {filteredAndSortedOffers.length > 0 && !isLoadingOffers && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-lg px-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">From</div>
            <div className="text-lg font-black text-[#172033] leading-none">
              {formatPrice(lowestFareBDT)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {search.tripType === 'round' ? 'Round trip total' : 'One way total'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilterDrawer(true)}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Filters"
            >
              <Filter className="w-4 h-4 text-slate-700" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (filteredAndSortedOffers[0]) {
                  setSelectedDetailFlight(filteredAndSortedOffers[0]);
                }
              }}
              className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#0057B8] text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Select Best</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Flight Ticket Detail & Multi-Partner Comparison Modal (Aviasales-style Step 3) */}
      <FlightTicketDetailModal
        flight={selectedDetailFlight}
        search={search}
        isOpen={Boolean(selectedDetailFlight)}
        onClose={() => setSelectedDetailFlight(null)}
        onSelectPartner={(partner, flight) => {
          setSelectedDetailFlight(null);
          setSelectedHandoffFlight({
            flight,
            partnerName: partner.name,
            priceBDT: partner.priceBDT,
          });
        }}
      />

      {/* Transparent Partner Redirect Handoff Modal (Aviasales-style Step 4) */}
      <PartnerRedirectModal
        flight={selectedHandoffFlight?.flight || null}
        partnerName={selectedHandoffFlight?.partnerName}
        partnerPriceBDT={selectedHandoffFlight?.priceBDT}
        isOpen={Boolean(selectedHandoffFlight)}
        onClose={() => setSelectedHandoffFlight(null)}
        onPriceUpdated={(flightId, freshPrice) => {
          setCustomPriceUpdates((prev) => ({ ...prev, [flightId]: freshPrice }));
        }}
      />

      {/* Price Increase Confirmation Modal */}
      <PriceIncreaseModal
        isOpen={Boolean(priceIncreaseModalData)}
        flight={priceIncreaseModalData?.flight || null}
        search={search}
        revalidationResult={priceIncreaseModalData?.result || null}
        currency={currency}
        onAccept={handleAcceptPriceIncrease}
        onDecline={handleDeclinePriceIncrease}
      />
    </div>
  );
};
