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
} from 'lucide-react';
import { AGENCY_CONFIG } from '../../data/agencyConfig';

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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#006ce4]" />
          <span>Day-by-Day Travel Schedule</span>
        </h3>

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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Activities & Highlights
                  </p>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Estimated Cost Breakdown</span>
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm">
              {plan.estimatedBudget.flights && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Round-trip Flights</span>
                  <span className="font-semibold text-slate-900">{plan.estimatedBudget.flights}</span>
                </div>
              )}
              {plan.estimatedBudget.accommodation && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Hotel & Accommodation</span>
                  <span className="font-semibold text-slate-900">{plan.estimatedBudget.accommodation}</span>
                </div>
              )}
              {plan.estimatedBudget.food && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Food & Dining</span>
                  <span className="font-semibold text-slate-900">{plan.estimatedBudget.food}</span>
                </div>
              )}
              {plan.estimatedBudget.activities && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Activities & Sightseeing</span>
                  <span className="font-semibold text-slate-900">{plan.estimatedBudget.activities}</span>
                </div>
              )}
              {plan.estimatedBudget.transport && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Local Transport</span>
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
        )}
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
