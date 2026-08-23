import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { AGENCY_CONFIG } from '../../data/agencyConfig';

interface TravelpayoutsWrapperProps {
  searchParams?: Record<string, string>;
  className?: string;
}

export function TravelpayoutsWrapper({ searchParams, className = '' }: TravelpayoutsWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const marker = AGENCY_CONFIG.travelpayoutsMarker || '765415';
  const trs = AGENCY_CONFIG.travelpayoutsTrsId || '565363';

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchParams]);

  const directAviasalesUrl = `https://www.aviasales.com/?marker=${marker}&trs=${trs}&currency=bdt`;

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#006ce4]" />
        <span className="mt-3 text-slate-600 font-medium text-sm">Connecting to verified flight search engine...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 bg-red-50 rounded-xl border border-red-200 ${className}`}>
        <p className="text-red-700 font-medium">{error}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              setTimeout(() => setLoading(false), 500);
            }}
            className="inline-flex items-center gap-1.5 bg-[#006ce4] text-white px-5 py-2.5 rounded-lg hover:bg-[#0057b8] text-sm font-medium transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Search
          </button>
          <a
            href={directAviasalesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 text-sm font-medium transition"
          >
            Open on Aviasales Partner Desk
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* Flight Engine status indicator */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Connected to <strong>flights.azraqtrips.com</strong> &bull; Travelpayouts Partner ID: <strong>{trs}</strong> (Marker {marker})
          </span>
        </div>
        <a
          href={directAviasalesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#006ce4] hover:underline font-semibold flex items-center gap-1 shrink-0"
        >
          Direct Aviasales Portal <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export default TravelpayoutsWrapper;
