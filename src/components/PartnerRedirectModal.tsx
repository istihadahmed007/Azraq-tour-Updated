import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Plane,
  MessageCircle,
  Clock,
  Luggage,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { FlightOffer } from '../data/flightsData';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import { revalidateFlightPrice, trackFlightOutboundClick } from '../utils/flightSearchEngine';
import { PriceRevalidationResult } from '../types';
import { AirlineLogo } from './AirlineLogo';

interface PartnerRedirectModalProps {
  flight: FlightOffer | null;
  partnerName?: string;
  partnerPriceBDT?: number;
  isOpen: boolean;
  onClose: () => void;
  onPriceUpdated?: (flightId: string, freshPrice: number) => void;
}

export const PartnerRedirectModal: React.FC<PartnerRedirectModalProps> = ({
  flight,
  partnerName = 'Aviasales / Partner',
  partnerPriceBDT,
  isOpen,
  onClose,
  onPriceUpdated,
}) => {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [revalidationResult, setRevalidationResult] = useState<PriceRevalidationResult | null>(null);

  if (!isOpen || !flight) return null;

  const targetPartnerName = partnerName || flight.airlineName || 'Partner Airline';
  const displayedFare = partnerPriceBDT || flight.priceBDT;

  const initialPartnerUrl =
    flight.partnerDeepLink ||
    AZRAQ_AGENCY_CONFIG.aviasalesAffiliateUrl ||
    'https://www.aviasales.com/?marker=765415&trs=565363&currency=bdt';

  const handleProceedBooking = async () => {
    setIsRevalidating(true);
    try {
      // Track outbound referral click event
      trackFlightOutboundClick({
        flightId: flight.id,
        airlineCode: flight.airlineCode,
        partnerName: targetPartnerName,
        origin: flight.origin.code,
        destination: flight.destination.code,
        priceBDT: displayedFare,
      });

      const result = await revalidateFlightPrice(flight);
      if (result.hasIncreased) {
        setRevalidationResult(result);
      } else {
        const targetUrl = result.bookingUrl || initialPartnerUrl;
        if (result.hasDecreased && onPriceUpdated) {
          onPriceUpdated(flight.id, result.freshPrice);
        }
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        handleCloseModal();
      }
    } catch (err) {
      window.open(initialPartnerUrl, '_blank', 'noopener,noreferrer');
      handleCloseModal();
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleAcceptPriceIncrease = () => {
    if (!revalidationResult) return;
    if (onPriceUpdated) {
      onPriceUpdated(flight.id, revalidationResult.freshPrice);
    }
    const targetUrl = revalidationResult.bookingUrl || initialPartnerUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setRevalidationResult(null);
    setIsRevalidating(false);
    onClose();
  };

  const currentPrice = revalidationResult ? revalidationResult.freshPrice : displayedFare;
  const cachedPrice = revalidationResult ? revalidationResult.cachedPrice : displayedFare;
  const priceDiff = revalidationResult ? revalidationResult.priceDifference : 0;
  const percentDiff = cachedPrice > 0 ? ((priceDiff / cachedPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`text-white p-5 sm:p-6 relative transition-colors ${
            revalidationResult?.hasIncreased
              ? 'bg-gradient-to-r from-amber-600 to-amber-700'
              : 'bg-[#071A33]'
          }`}
        >
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close handoff modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            {revalidationResult?.hasIncreased ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span className="text-amber-200">Live Fare Update Detected</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-400">Continue to partner</span>
              </>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif-display flex items-center gap-2">
            <AirlineLogo
              airlineCode={flight.airlineCode}
              airlineName={flight.airlineName}
              customLogoUrl={flight.airlineLogo}
              size="sm"
            />
            <span>{revalidationResult?.hasIncreased ? 'Live Fare Updated' : `Book with ${targetPartnerName}`}</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {flight.origin.city} ({flight.origin.code}) ➔ {flight.destination.city} ({flight.destination.code}) • {flight.airlineName} {flight.flightNumber}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 text-slate-700 text-sm max-h-[78vh] overflow-y-auto">
          {/* Transparent Handoff Statement */}
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/90 text-xs text-sky-950 space-y-2">
            <p className="font-semibold text-slate-900 leading-relaxed">
              You are leaving Azraq to complete your booking with <strong className="text-blue-700">{targetPartnerName}</strong>. Payment, ticket issuance, changes, and refunds are handled by the partner website.
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Azraq does not process flight payments or issue airline tickets. Your search parameters will remain open here so you can return anytime.
            </p>
          </div>

          {/* Price Increase Warning Box if applicable */}
          {revalidationResult?.hasIncreased && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Fare Change Summary
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{percentDiff}% (+Tk {priceDiff.toLocaleString()})</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60">
                  <span className="text-[11px] text-slate-400 font-bold block">Previous Cached Fare</span>
                  <span className="text-lg font-bold text-slate-400 line-through font-mono">
                    Tk {cachedPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-400">
                  <span className="text-[11px] text-amber-900 font-bold block">Verified Live Fare</span>
                  <span className="text-xl font-black text-amber-950 font-mono">
                    Tk {currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-amber-800 leading-relaxed">
                The airline or booking partner has adjusted seats in this fare class. Please confirm if you wish to proceed to checkout with the verified fare.
              </p>
            </div>
          )}

          {/* Itinerary Quick Summary & Displayed Fare */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">
                  Displayed Fare
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  BDT {currentPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700 block">
                  {flight.stops === 0 ? 'Non-stop Flight' : `${flight.stops} Stop (${flight.stopAirports?.join(', ') || 'Transit'})`}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Duration: {flight.duration}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                <span>Baggage: <strong>{flight.baggageAllowance?.checked || 'Included'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Partner Deep Link</span>
              </div>
            </div>
          </div>

          {/* 5-Step Transparency reminder */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Enter passenger details directly on <strong>{targetPartnerName}</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Complete payment securely on the partner website.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Receive your official e-ticket confirmation and airline PNR directly from {targetPartnerName}.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {revalidationResult?.hasIncreased ? (
              <>
                <button
                  type="button"
                  onClick={handleAcceptPriceIncrease}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-[#006CE4] hover:bg-[#0057B8] text-white font-extrabold text-xs sm:text-sm text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Accept & Continue (BDT {currentPrice.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Go back
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleProceedBooking}
                  disabled={isRevalidating}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-[#006CE4] hover:bg-[#0057B8] disabled:bg-blue-400 text-white font-extrabold text-xs sm:text-sm text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isRevalidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Opening {targetPartnerName}...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to {targetPartnerName}</span>
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Go back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

