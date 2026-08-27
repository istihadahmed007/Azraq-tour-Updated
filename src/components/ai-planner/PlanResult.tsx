import React from 'react';
import {
  Plane,
  FileText,
  Hotel,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  ExternalLink,
  MessageCircle,
  Luggage,
  Compass,
  ArrowRight,
  Sun,
  ShieldAlert,
  Car,
  Wifi,
  Ticket,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { AGENCY_CONFIG, AZRAQ_AFFILIATE_LINKS } from '../../data/agencyConfig';

export interface TravelPlanResultData {
  overview: string;
  dailyItinerary: Array<{
    day: number;
    activities: string[];
    meals: string[];
    accommodation: string;
  }>;
  flightSuggestions?: {
    from: string;
    to: string;
    airlines: string[];
    estimatedPrice: string;
  };
  visaInfo?: {
    required: boolean;
    type: string;
    processing: string;
    cost: string;
  };
  hotelSuggestions?: Array<{
    name: string;
    price: string;
    rating: string;
    area: string;
  }>;
  estimatedBudget?: {
    flights?: string;
    accommodation?: string;
    food?: string;
    activities?: string;
    transport?: string;
    total?: string;
  };
  packingTips?: string[];
  travelTips?: string[];
  bestTimeToVisit?: string;
  culturalNotes?: string[];
}

interface PlanResultProps {
  plan: TravelPlanResultData;
  destinationName?: string;
  onNavigateToFlights?: () => void;
  onNavigateToVisa?: () => void;
  className?: string;
}

export function PlanResult({
  plan,
  destinationName = 'Destination',
  onNavigateToFlights,
  onNavigateToVisa,
  className = '',
}: PlanResultProps) {
  const whatsappUrl = `https://wa.me/${AGENCY_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello Azraq Trips! I generated an AI Travel Plan for ${destinationName} and would like to proceed with booking/consultation.`
  )}`;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#006ce4]">
          <Sparkles className="w-4 h-4 text-[#febb02]" />
          <span>AI Verified Itinerary & Travel Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-4">
          Your Customized Trip to {destinationName}
        </h2>
        <p className="text-slate-700 leading-relaxed text-base">{plan.overview}</p>

        {plan.bestTimeToVisit && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium">
            <Sun className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Best Time to Visit:</strong> {plan.bestTimeToVisit}
            </span>
          </div>
        )}
      </div>

      {/* Flight & Visa Quick Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight Card */}
        {plan.flightSuggestions && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#006ce4] flex items-center justify-center">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Flight Suggestions</h3>
                    <p className="text-xs text-slate-500">
                      {plan.flightSuggestions.from} ➔ {plan.flightSuggestions.to}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-[#006ce4] px-2.5 py-1 rounded-full">
                  {plan.flightSuggestions.estimatedPrice}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 my-3">
                <p className="font-semibold text-slate-700">Recommended Airlines:</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.flightSuggestions.airlines.map((airline, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {airline}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToFlights}
              className="mt-4 w-full bg-[#006ce4] hover:bg-[#0057b8] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plane className="w-4 h-4" />
              <span>Search Flights on flights.azraqtrips.com</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Flight Arrival & Airport Transfers */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#0D6EFD]" />
                  <span>Flight Arrival & Airport Transfers</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Instant Pickup
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={AZRAQ_AFFILIATE_LINKS.kiwitaxi}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition flex items-center justify-between text-xs group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 group-hover:text-[#006ce4] flex items-center gap-1">
                      Kiwitaxi Airport Transfer
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#006ce4]" />
                    </span>
                    <p className="text-[11px] text-slate-500">Nameplate meet & greet at arrivals</p>
                  </div>
                </a>
                <a
                  href={AZRAQ_AFFILIATE_LINKS.gettransfer}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition flex items-center justify-between text-xs group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1">
                      GetTransfer Private Ride
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-700" />
                    </span>
                    <p className="text-[11px] text-slate-500">Chauffeur & intercity private cars</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Visa Card */}
        {plan.visaInfo && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Visa Requirements</h3>
                    <p className="text-xs text-slate-500">For Bangladeshi passport holders</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    plan.visaInfo.required
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {plan.visaInfo.required ? 'Visa Required' : 'Visa Free / VoA'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 my-3">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Type</span>
                  <span className="font-semibold text-slate-800">{plan.visaInfo.type}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Processing</span>
                  <span className="font-semibold text-slate-800">{plan.visaInfo.processing}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg col-span-2">
                  <span className="text-slate-400 block text-[11px]">Estimated Cost</span>
                  <span className="font-semibold text-slate-800">{plan.visaInfo.cost}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToVisa}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Get Visa Assistance Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Day-by-Day Itinerary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#006ce4]" />
            <span>Day-by-Day Travel Schedule</span>
          </h3>
          <a
            href={AZRAQ_AFFILIATE_LINKS.klook}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition shadow-2xs"
          >
            <Ticket className="w-4 h-4 text-amber-600" />
            <span>Book Tours & Activities on Klook</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          </a>
        </div>

        <div className="space-y-6">
          {plan.dailyItinerary.map((dayItem) => (
            <div
              key={dayItem.day}
              className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#002244] text-white text-xs font-bold flex items-center justify-center">
                  D{dayItem.day}
                </span>
                <h4 className="font-bold text-slate-900 text-base">Day {dayItem.day}</h4>
              </div>

              <div className="space-y-2 pl-9">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Activities & Highlights
                    </p>
                    <a
                      href={AZRAQ_AFFILIATE_LINKS.klook}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
                    >
                      <span>Find Day {dayItem.day} Passes on Klook</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <ul className="space-y-1.5">
                    {dayItem.activities.map((act, actIdx) => (
                      <li key={actIdx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {dayItem.meals && dayItem.meals.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Dining Suggestions
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {dayItem.meals.join(' • ')}
                    </p>
                  </div>
                )}

                {dayItem.accommodation && (
                  <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5 text-slate-400" />
                    <span>Stay: <strong className="text-slate-700">{dayItem.accommodation}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Klook Activities Callout Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Ticket className="w-4 h-4 text-amber-600" />
              <span>Activities & Sightseeing Tickets</span>
            </div>
            <p className="text-xs text-slate-600">
              Skip lines and secure tickets for theme parks, island cruises, city passes, and guided tours in {destinationName}.
            </p>
          </div>
          <a
            href={AZRAQ_AFFILIATE_LINKS.klook}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Book Tickets on Klook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Hotel Suggestions & Budget Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotels */}
        {plan.hotelSuggestions && plan.hotelSuggestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-[#006ce4]" />
              <span>Recommended Accommodations</span>
            </h3>
            <div className="space-y-3">
              {plan.hotelSuggestions.map((hotel, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{hotel.name}</h4>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      ★ {hotel.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {hotel.area}
                    </span>
                    <span className="font-semibold text-slate-900">{hotel.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Breakdown */}
        {plan.estimatedBudget && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Estimated Cost Breakdown</span>
              </h3>
              <div className="space-y-2.5 text-xs sm:text-sm">
                {plan.estimatedBudget.flights && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Round-trip Flights</span>
                    <span className="font-semibold text-slate-900">{plan.estimatedBudget.flights}</span>
                  </div>
                )}
                {plan.estimatedBudget.accommodation && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Hotel & Accommodation</span>
                    <span className="font-semibold text-slate-900">{plan.estimatedBudget.accommodation}</span>
                  </div>
                )}
                {plan.estimatedBudget.food && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600">Food & Dining</span>
                    <span className="font-semibold text-slate-900">{plan.estimatedBudget.food}</span>
                  </div>
                )}
                {plan.estimatedBudget.activities && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span>Activities & Sightseeing</span>
                      <a
                        href={AZRAQ_AFFILIATE_LINKS.klook}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold hover:underline"
                      >
                        Klook Deals
                      </a>
                    </span>
                    <span className="font-semibold text-slate-900">{plan.estimatedBudget.activities}</span>
                  </div>
                )}
                {plan.estimatedBudget.transport && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span>Local Transport</span>
                      <a
                        href={AZRAQ_AFFILIATE_LINKS.gettransfer}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold hover:underline"
                      >
                        Private Transfers
                      </a>
                    </span>
                    <span className="font-semibold text-slate-900">{plan.estimatedBudget.transport}</span>
                  </div>
                )}
                {plan.estimatedBudget.total && (
                  <div className="flex justify-between pt-2 text-base font-bold text-[#002244] border-t border-slate-200">
                    <span>Total Estimated Trip Cost</span>
                    <span className="text-[#006ce4]">{plan.estimatedBudget.total}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Need private airport pickup?</span>
              <a
                href={AZRAQ_AFFILIATE_LINKS.kiwitaxi}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="font-bold text-[#0D6EFD] hover:underline inline-flex items-center gap-1"
              >
                <span>Book on Kiwitaxi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Stay Connected / Global eSIM Section (Yesim & Airalo) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Trip Summary: Stay Connected Abroad</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Activate an instant travel eSIM before departure from Dhaka. Keep your Bangladeshi WhatsApp number active with seamless 4G/5G data.
            </p>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
            Zero Physical SIM Swap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Option: Yesim */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-sky-50/80 to-blue-50/40 border-2 border-sky-200/90 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-slate-900 text-sm">Yesim Global eSIM</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-600 text-white">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-speed unlimited data packs with instant digital activation. Keeps WhatsApp and OTP verification working flawlessly.
              </p>
              <ul className="space-y-1 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Works in 150+ countries with 5G speed</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unlimited & fixed GB options</span>
                </li>
              </ul>
            </div>

            <a
              href={AZRAQ_AFFILIATE_LINKS.yesim}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#006ce4] hover:bg-[#0057b8] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Get Yesim eSIM for {destinationName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Secondary Option: Airalo */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-slate-800 text-sm">Airalo eSIM</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                  Secondary Option
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Popular regional and local prepaid data eSIM packages starting from $4.50 for budget-conscious travelers.
              </p>
              <ul className="space-y-1 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Global coverage across 200+ countries</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Flexible 1GB to 20GB refillable plans</span>
                </li>
              </ul>
            </div>

            <a
              href={AZRAQ_AFFILIATE_LINKS.airalo}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>View Airalo eSIM Plans</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Practical Tips & Cultural Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.travelTips && plan.travelTips.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#006ce4]" />
              <span>Practical Travel Tips</span>
            </h3>
            <ul className="space-y-2">
              {plan.travelTips.map((tip, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006ce4] shrink-0 mt-2"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {plan.packingTips && plan.packingTips.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Luggage className="w-5 h-5 text-emerald-600" />
              <span>Essential Packing Advice</span>
            </h3>
            <ul className="space-y-2">
              {plan.packingTips.map((tip, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Final CTAs */}
      <div className="bg-[#002244] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold">Ready to Book Your {destinationName} Trip?</h3>
          <p className="text-slate-300 text-sm mt-1">
            Our Dhaka concierge team can lock in flights, hotels, and full visa processing today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3 rounded-xl font-semibold text-sm transition"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Desk
          </a>
        </div>
      </div>
    </div>
  );
}

export default PlanResult;
