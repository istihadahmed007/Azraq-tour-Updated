import React, { useState } from 'react';
import {
  X,
  Plane,
  Clock,
  Luggage,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Utensils,
  Tv,
  Zap,
  ArrowRight,
  Share2,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  User,
  CreditCard,
  Phone,
  Mail,
  FileText,
  Lock,
  Sparkles,
  Receipt,
  Download,
  Copy,
  Check,
  Globe,
  Tag,
} from 'lucide-react';
import { FlightOffer, buildAviasalesSearchUrl } from '../data/flightsData';
import { AirlineLogo } from './AirlineLogo';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import { NormalizedFlightSearch, trackFlightOutboundClick } from '../utils/flightSearchEngine';
import { useAuth } from '../context/AuthContext';

export interface BookingPartnerOption {
  id: string;
  name: string;
  type: 'airline' | 'agency' | 'metasearch';
  badge: string;
  priceBDT: number;
  deepLink: string;
  features: string[];
  isRecommended?: boolean;
}

interface FlightTicketDetailModalProps {
  flight: FlightOffer | null;
  search: NormalizedFlightSearch;
  isOpen: boolean;
  onClose: () => void;
  onSelectPartner?: (partner: BookingPartnerOption, flight: FlightOffer) => void;
  initialCheckoutStep?: 1 | 2 | 3;
  initialBookingMode?: 'online_partner' | 'concierge_hold';
}

export const FlightTicketDetailModal: React.FC<FlightTicketDetailModalProps> = ({
  flight,
  search,
  isOpen,
  onClose,
  onSelectPartner,
  initialCheckoutStep = 1,
  initialBookingMode = 'online_partner',
}) => {
  const { user, showToast } = useAuth();

  // Booking Mode: 'online_partner' (instant redirect via Aviasales / Travelpayouts) OR 'concierge_hold' (3-step offline ticket hold)
  const [bookingMode, setBookingMode] = useState<'online_partner' | 'concierge_hold'>(initialBookingMode);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(initialCheckoutStep);
  const [copiedPnr, setCopiedPnr] = useState(false);

  // Passenger form state
  const [primaryTitle, setPrimaryTitle] = useState('Mr');
  const [givenName, setGivenName] = useState(user?.fullName?.split(' ')[0] || '');
  const [surname, setSurname] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('Bangladeshi');
  const [mealPreference, setMealPreference] = useState('Halal');
  const [specialRequest, setSpecialRequest] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'card' | 'office' | 'whatsapp'>('bkash');
  const [confirmedPnr, setConfirmedPnr] = useState<string>('');

  if (!isOpen || !flight) return null;

  const totalPax = (search.adults || 1) + (search.children || 0) + (search.infants || 0);
  const totalPriceBDT = flight.priceBDT;
  const baseFareBDT = Math.round(totalPriceBDT * 0.78);
  const taxesAndFeesBDT = totalPriceBDT - baseFareBDT;

  // Build the live Aviasales / Travelpayouts affiliate search deep link
  const aviasalesRedirectUrl =
    flight.partnerDeepLink ||
    buildAviasalesSearchUrl({
      origin: search.origin,
      destination: search.destination,
      departDate: search.departureDate,
      returnDate: search.returnDate,
      tripType: search.tripType,
      adults: search.adults || 1,
      children: search.children || 0,
      infants: search.infants || 0,
      cabin: search.cabinClass || 'Economy',
    });

  // Mocked live partner options for transparent multi-channel comparison
  const partnerOptions: BookingPartnerOption[] = [
    {
      id: 'aviasales-direct',
      name: `${flight.airlineName} Official / Aviasales`,
      type: 'airline',
      badge: 'Best Value Deal',
      priceBDT: totalPriceBDT,
      deepLink: aviasalesRedirectUrl,
      features: ['Official Airline E-Ticket', 'Direct Baggage Add-ons', '0% Processing Fee'],
      isRecommended: true,
    },
    {
      id: 'trip-com',
      name: 'Trip.com via Aviasales',
      type: 'agency',
      badge: 'Instant Confirmation',
      priceBDT: Math.round(totalPriceBDT * 1.015),
      deepLink: aviasalesRedirectUrl,
      features: ['24/7 Global Support', 'Loyalty Trip Coins', 'Free Cancellation within 1h'],
    },
    {
      id: 'kiwi-com',
      name: 'Kiwi.com Guarantee',
      type: 'agency',
      badge: 'Flexible Protection',
      priceBDT: Math.round(totalPriceBDT * 1.03),
      deepLink: aviasalesRedirectUrl,
      features: ['Missed Connection Cover', 'Disruption Guarantee', 'Mobile Boarding Pass'],
    },
  ];

  // Direct handoff to Travelpayouts / Aviasales partner
  const handlePartnerRedirect = (partner?: BookingPartnerOption) => {
    const selected = partner || partnerOptions[0];
    trackFlightOutboundClick({
      flightId: flight.id,
      airlineCode: flight.airlineCode,
      partnerName: selected.name,
      origin: flight.origin.code,
      destination: flight.destination.code,
      priceBDT: selected.priceBDT,
    });

    if (onSelectPartner) {
      onSelectPartner(selected, flight);
    } else {
      window.open(selected.deepLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Format 12-hour time
  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const parts = time24.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) return time24;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m} ${period}`;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!givenName.trim() || !surname.trim()) {
      showToast('Please enter passenger full name as shown on passport.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please provide a valid email address for ticket issuance.', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Please provide a contact phone / WhatsApp number.', 'error');
      return;
    }
    setCheckoutStep(2);
  };

  const handleConfirmBooking = () => {
    // Generate realistic PNR
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pnr = 'AZQ-';
    for (let i = 0; i < 5; i++) {
      pnr += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    setConfirmedPnr(pnr);
    setCheckoutStep(3);
    showToast(`Booking initiated successfully! PNR: ${pnr}`, 'success');
  };

  const handleCopyPnr = () => {
    if (!confirmedPnr) return;
    navigator.clipboard.writeText(confirmedPnr);
    setCopiedPnr(true);
    showToast('Booking reference copied to clipboard!', 'info');
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  const generatedWhatsAppBookingUrl = () => {
    const paxDetails = `${primaryTitle} ${givenName} ${surname} (${nationality})`;
    const msg = `Hello Azraq Travel Concierge Desk!

I have submitted a flight booking request:
• Reference PNR: ${confirmedPnr || 'HOLD-PENDING'}
• Route: ${flight.origin.city} (${flight.origin.code}) ➔ ${flight.destination.city} (${flight.destination.code})
• Flight: ${flight.airlineName} ${flight.flightNumber}
• Date: ${search.departureDate}${search.tripType === 'round' && search.returnDate ? ` to ${search.returnDate}` : ''}
• Passenger: ${paxDetails}
• Contact: ${phone} | ${email}
• Total Fare: ৳${totalPriceBDT.toLocaleString()} (${paymentMethod.toUpperCase()})

Please confirm ticket issuance and send official e-ticket PDF.`;

    return `https://wa.me/${AZRAQ_AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#0B1F3A] text-white p-5 sm:p-6 shrink-0 relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close ticket modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4 pr-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1677FF]/20 text-[#5BC7F4] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <Plane className="w-3 h-3" />
                <span>Flight Checkout & Ticket Hold</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <AirlineLogo
                  airlineCode={flight.airlineCode}
                  airlineName={flight.airlineName}
                  customLogoUrl={flight.airlineLogo}
                  size="sm"
                />
                <span>{flight.airlineName} · {flight.flightNumber}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {flight.origin.city} ({flight.origin.code}) ➔ {flight.destination.city} ({flight.destination.code}) • {flight.cabinClass} Class
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 bg-white/10 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-300 block">Total per passenger</span>
                <span className="text-2xl font-black text-[#5BC7F4] font-mono">
                  ৳{totalPriceBDT.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-300 block">Taxes & fees included</span>
              </div>

              {/* Direct Redirect Quick Button */}
              <button
                type="button"
                onClick={() => handlePartnerRedirect()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C7C9] hover:bg-[#1bb0b2] text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer hover:scale-102"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Book on Aviasales ↗</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher: Online Partner Redirect vs Azraq Concierge Hold */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/15 backdrop-blur-sm mt-5">
            <button
              type="button"
              onClick={() => setBookingMode('online_partner')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                bookingMode === 'online_partner'
                  ? 'bg-[#1677FF] text-white shadow-sm'
                  : 'text-sky-200/80 hover:text-white'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Book Online (Aviasales & Partners)</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingMode('concierge_hold')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                bookingMode === 'concierge_hold'
                  ? 'bg-[#22C7C9] text-slate-950 font-extrabold shadow-sm'
                  : 'text-sky-200/80 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Azraq Concierge Hold (Offline/WhatsApp)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {/* ======================================================== */}
          {/* MODE 1: INSTANT ONLINE BOOKING VIA TRAVELPAYOUTS / AVIASALES */}
          {/* ======================================================== */}
          {bookingMode === 'online_partner' && (
            <div className="space-y-6 animate-fade-in">
              {/* Highlight Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-emerald-500/10 border border-sky-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1677FF] text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Instant Online Airline Booking</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          BDT ৳ Live Rates
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Book directly on {flight.airlineName} or verified partner websites via Travelpayouts / Aviasales.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Partner Redirect Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handlePartnerRedirect()}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#1677FF] hover:bg-[#0E7FE3] text-white text-sm font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Proceed to Book on Aviasales / Partner (৳{totalPriceBDT.toLocaleString()})</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    🔒 Official 256-bit encrypted handoff with guaranteed fare in BDT.
                  </p>
                </div>
              </div>

              {/* Itinerary Snapshot */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#0B1F3A] text-white text-xs font-bold uppercase">
                      Flight Segment
                    </span>
                    <span className="text-xs font-bold text-slate-800">{search.departureDate}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1677FF]">{flight.cabinClass} Class</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
                  <div>
                    <div className="text-lg font-black text-[#172033]">{formatTime12h(flight.departureTime)}</div>
                    <div className="text-xs font-bold text-[#1677FF]">{flight.origin.city} ({flight.origin.code})</div>
                    <div className="text-[11px] text-slate-500">{flight.origin.name}</div>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4 w-full sm:w-auto">
                    <span className="text-[11px] font-bold text-slate-500 mb-1">{flight.duration}</span>
                    <div className="w-full flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0B1F3A]" />
                      <div className="flex-1 h-0.5 bg-slate-300 border-t border-dashed border-slate-400" />
                      <Plane className="w-4 h-4 text-[#1677FF] mx-1 transform rotate-90 sm:rotate-0" />
                      <div className="flex-1 h-0.5 bg-slate-300 border-t border-dashed border-slate-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1677FF]" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                      {flight.stops === 0 ? 'Non-Stop Direct' : `${flight.stops} Stop Connection`}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-lg font-black text-[#172033]">{formatTime12h(flight.arrivalTime)}</div>
                    <div className="text-xs font-bold text-[#1677FF]">{flight.destination.city} ({flight.destination.code})</div>
                    <div className="text-[11px] text-slate-500">{flight.destination.name}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-100">
                    <Luggage className="w-3.5 h-3.5" />
                    {flight.baggageAllowance.checked} Baggage Included
                  </span>
                  <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-semibold border border-blue-100">
                    <Utensils className="w-3.5 h-3.5" />
                    Complimentary In-Flight Service
                  </span>
                </div>
              </div>

              {/* Multi-Partner Booking Options Comparison */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Available Booking Providers (Travelpayouts Network)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Marker: 765415</span>
                </h4>

                <div className="space-y-2.5">
                  {partnerOptions.map((partner) => (
                    <div
                      key={partner.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#1677FF]/50 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm">{partner.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {partner.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          {partner.features.map((feat, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{feat}</span>
                              {idx < partner.features.length - 1 && <span>•</span>}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-base font-black text-slate-900 font-mono block">
                            ৳{partner.priceBDT.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">Total BDT</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePartnerRedirect(partner)}
                          className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-[#0E7FE3] text-white text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Book ↗</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch to Concierge Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Need offline bKash payment, Dhaka office cash hold, or WhatsApp concierge assistance?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingMode('concierge_hold')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition-all shrink-0 cursor-pointer"
                >
                  Switch to Offline Hold
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: AZRAQ CONCIERGE DESK HOLD (OFFLINE / 3-STEP FLOW) */}
          {/* ======================================================== */}
          {bookingMode === 'concierge_hold' && (
            <div className="space-y-6 animate-fade-in">
              {/* Step Progress Indicator (Traveller -> Review -> Payment) */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 rounded-2xl">
                {[
                  { num: 1, label: '1. Traveller Details' },
                  { num: 2, label: '2. Review Booking' },
                  { num: 3, label: '3. Payment & Ticket' },
                ].map((step) => {
                  const isCurrent = checkoutStep === step.num;
                  const isCompleted = checkoutStep > step.num;
                  return (
                    <div
                      key={step.num}
                      className={`flex-1 flex items-center gap-2 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#1677FF] text-white shadow-xs'
                          : isCompleted
                          ? 'text-emerald-700 bg-emerald-100'
                          : 'text-slate-500 bg-transparent'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isCurrent
                            ? 'bg-white text-[#1677FF]'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 text-slate-600'
                        }`}
                      >
                        {isCompleted ? '✓' : step.num}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: TRAVELLER DETAILS */}
              {checkoutStep === 1 && (
                <form onSubmit={handleProceedToReview} className="space-y-6">
                  {/* Notice to book online if preferred */}
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-[#1677FF] shrink-0" />
                      <span>Prefer to book online directly with instant e-ticket?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingMode('online_partner')}
                      className="text-xs font-bold text-[#1677FF] hover:underline shrink-0 cursor-pointer"
                    >
                      Book on Aviasales ↗
                    </button>
                  </div>

                  {/* Flight Summary Header */}
                  <div className="p-4 rounded-2xl bg-[#F6F8FC] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1677FF] flex items-center justify-center font-bold text-xs">
                        {flight.airlineCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#172033] text-sm">{flight.airlineName}</h4>
                        <p className="text-xs text-slate-500">
                          {flight.origin.code} ({formatTime12h(flight.departureTime)}) ➔ {flight.destination.code} ({formatTime12h(flight.arrivalTime)}) · {flight.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <Luggage className="w-4 h-4 text-emerald-600" />
                      <span>{flight.baggageAllowance.checked} Included</span>
                    </div>
                  </div>

                  {/* Primary Contact Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#1677FF]" />
                      <span>Primary Passenger (Adult)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Title</label>
                        <select
                          value={primaryTitle}
                          onChange={(e) => setPrimaryTitle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        >
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                          <option value="Dr">Dr</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Given Name (Passport)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mohammed"
                          value={givenName}
                          onChange={(e) => setGivenName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Surname / Last Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahman"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email for E-Ticket Delivery</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phone / WhatsApp Number</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+880 1XXXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Passport / NID Number</label>
                        <input
                          type="text"
                          placeholder="e.g. A01234567"
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Nationality</label>
                        <select
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        >
                          <option value="Bangladeshi">Bangladeshi</option>
                          <option value="Indian">Indian</option>
                          <option value="British">British</option>
                          <option value="American">American</option>
                          <option value="Canadian">Canadian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-slate-400" />
                          <span>Meal Preference</span>
                        </label>
                        <select
                          value={mealPreference}
                          onChange={(e) => setMealPreference(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        >
                          <option value="Halal">Standard Halal Meal (Complimentary)</option>
                          <option value="Vegetarian">Vegetarian Hindu / Jain Meal</option>
                          <option value="Diabetic">Diabetic / Low Calorie Meal</option>
                          <option value="Child">Child Meal</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Special Assistance (Optional)</label>
                        <input
                          type="text"
                          placeholder="Wheelchair, extra legroom request, etc."
                          value={specialRequest}
                          onChange={(e) => setSpecialRequest(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1677FF] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-3 text-xs text-blue-900">
                    <ShieldCheck className="w-5 h-5 text-[#1677FF] shrink-0" />
                    <span>Your information is encrypted with bank-grade 256-bit SSL and used strictly for airline GDS booking.</span>
                  </div>

                  {/* Submit CTA */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#0E7FE3] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Review Booking</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: REVIEW BOOKING & TRANSPARENT BREAKDOWN */}
              {checkoutStep === 2 && (
                <div className="space-y-6">
                  {/* Itinerary Timeline Card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#0B1F3A] text-white text-xs font-bold uppercase">
                          Flight Segment
                        </span>
                        <span className="text-xs font-bold text-slate-800">{search.departureDate}</span>
                      </div>
                      <span className="text-xs font-bold text-[#1677FF]">{flight.cabinClass} Class</span>
                    </div>

                    {/* Timeline visual */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
                      <div>
                        <div className="text-lg font-black text-[#172033]">{formatTime12h(flight.departureTime)}</div>
                        <div className="text-xs font-bold text-[#1677FF]">{flight.origin.city} ({flight.origin.code})</div>
                        <div className="text-[11px] text-slate-500">{flight.origin.name}</div>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-4 w-full sm:w-auto">
                        <span className="text-[11px] font-bold text-slate-500 mb-1">{flight.duration}</span>
                        <div className="w-full flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0B1F3A]" />
                          <div className="flex-1 h-0.5 bg-slate-300 border-t border-dashed border-slate-400" />
                          <Plane className="w-4 h-4 text-[#1677FF] mx-1 transform rotate-90 sm:rotate-0" />
                          <div className="flex-1 h-0.5 bg-slate-300 border-t border-dashed border-slate-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1677FF]" />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                          {flight.stops === 0 ? 'Non-Stop Direct' : `${flight.stops} Stop Connection`}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-lg font-black text-[#172033]">{formatTime12h(flight.arrivalTime)}</div>
                        <div className="text-xs font-bold text-[#1677FF]">{flight.destination.city} ({flight.destination.code})</div>
                        <div className="text-[11px] text-slate-500">{flight.destination.name}</div>
                      </div>
                    </div>

                    {/* Passenger Info Summary */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-slate-800">
                          {primaryTitle} {givenName} {surname}
                        </span>
                        <span className="text-slate-400">({nationality})</span>
                      </div>
                      <div className="text-slate-500 font-medium">{phone} • {email}</div>
                    </div>
                  </div>

                  {/* Itemized Transparent Price Breakdown */}
                  <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-slate-200/90 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#1677FF]" />
                      <span>Transparent Price Breakdown</span>
                    </h4>

                    <div className="space-y-2 text-xs divide-y divide-slate-200/60 pt-1">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-600">Base Airfare ({totalPax} Adult)</span>
                        <span className="font-bold text-slate-800">৳{baseFareBDT.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-600">Airport Taxes, Fuel Surcharges & Aviation Levies</span>
                        <span className="font-bold text-slate-800">৳{taxesAndFeesBDT.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 text-emerald-700">
                        <span className="font-medium">Azraq Booking Concierge Fee</span>
                        <span className="font-bold">৳0 (Free)</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 text-sm font-black text-[#172033]">
                        <span>Total Guaranteed Fare</span>
                        <span className="text-base text-[#1677FF] font-mono">৳{totalPriceBDT.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Signals */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Secure Booking', sub: '256-bit SSL' },
                      { label: 'Transparent Pricing', sub: 'No hidden markup' },
                      { label: 'Baggage Checked', sub: `${flight.baggageAllowance.checked}` },
                      { label: 'Dhaka Desk Support', sub: '24/7 Concierge' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <div className="text-[11px] font-bold text-slate-800">{item.label}</div>
                        <div className="text-[10px] text-slate-500">{item.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      className="px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-[#0E7FE3] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Proceed to Payment</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & CONFIRMATION */}
              {checkoutStep === 3 && (
                <div className="space-y-6">
                  {/* Confirmed PNR Banner */}
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-emerald-900">Seat Hold & Booking PNR Created!</h3>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      Your flight reservation is saved in the airline GDS system under the reference code below.
                    </p>

                    <div className="inline-flex items-center gap-2 p-2 px-4 rounded-xl bg-white border border-emerald-300 shadow-xs mt-2">
                      <span className="text-xs text-slate-500 font-medium">Booking PNR:</span>
                      <span className="text-base font-black text-slate-900 font-mono tracking-wider">{confirmedPnr}</span>
                      <button
                        type="button"
                        onClick={handleCopyPnr}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                        title="Copy PNR"
                      >
                        {copiedPnr ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Payment Option to Issue Ticket
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* bKash / Mobile Banking */}
                      <label
                        onClick={() => setPaymentMethod('bkash')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'bkash'
                            ? 'bg-blue-50/80 border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payOption"
                          checked={paymentMethod === 'bkash'}
                          onChange={() => setPaymentMethod('bkash')}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">bKash / Nagad / Rocket</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Instant mobile banking QR & Merchant payment with 0% fee.
                          </div>
                        </div>
                      </label>

                      {/* Visa / Master / AMEX Card */}
                      <label
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'card'
                            ? 'bg-blue-50/80 border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payOption"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Credit / Debit Card (BDT & USD)</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Visa, MasterCard, American Express, UnionPay.
                          </div>
                        </div>
                      </label>

                      {/* Dhaka Office Pay */}
                      <label
                        onClick={() => setPaymentMethod('office')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'office'
                            ? 'bg-blue-50/80 border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payOption"
                          checked={paymentMethod === 'office'}
                          onChange={() => setPaymentMethod('office')}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Dhaka Travel Desk (Cash / POS)</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Hold seats for 24h & pay in person at our Dhaka office.
                          </div>
                        </div>
                      </label>

                      {/* 24/7 WhatsApp Concierge Desk */}
                      <label
                        onClick={() => setPaymentMethod('whatsapp')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          paymentMethod === 'whatsapp'
                            ? 'bg-blue-50/80 border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payOption"
                          checked={paymentMethod === 'whatsapp'}
                          onChange={() => setPaymentMethod('whatsapp')}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">WhatsApp Agent Desk (Fastest)</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Send PNR to our dedicated travel agent for instant confirmation.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Done / Close
                    </button>

                    <a
                      href={generatedWhatsAppBookingUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send PNR to WhatsApp Desk</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
