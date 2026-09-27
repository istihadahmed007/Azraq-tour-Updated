import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Compass, ShieldCheck } from 'lucide-react';

interface KlookActivitiesWidgetProps {
  className?: string;
}

/**
 * Exact Travelpayouts / Klook embed script URL
 * Parameters strictly preserved:
 * - currency=USD
 * - trs=566378
 * - shmarker=765415
 * - locale=en
 * - city_id=2
 * - category=4
 * - amount=3
 * - powered_by=true
 * - campaign_id=137
 * - promo_id=4497
 */
export const KLOOK_WIDGET_SCRIPT_SRC =
  'https://tpwidg.com/content?currency=USD&trs=566378&shmarker=765415&locale=en&city_id=2&category=4&amount=3&powered_by=true&campaign_id=137&promo_id=4497';

export const KLOOK_FALLBACK_URL = 'https://klook.tp.st/aXDQ3uLD';

export const KlookActivitiesWidget: React.FC<KlookActivitiesWidgetProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let isCancelled = false;
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Reset container contents to prevent duplicate visible widgets on re-mount or StrictMode
    currentContainer.innerHTML = '';
    setStatus('loading');

    // 1. Create script element with exact URL and attributes
    const script = document.createElement('script');
    script.src = KLOOK_WIDGET_SCRIPT_SRC;
    script.async = true;
    script.charset = 'utf-8';

    // 2. Direct script load failure / blocker detection
    script.onerror = () => {
      if (!isCancelled) {
        setStatus('failed');
      }
    };

    // 3. Verification of actual rendered content (checking for mounted iframe)
    const checkWidgetRendered = (): boolean => {
      if (isCancelled || !currentContainer) return false;
      const iframe = currentContainer.querySelector('iframe');
      if (iframe) {
        if (iframe.offsetHeight > 40 || iframe.getAttribute('src')) {
          setStatus('ready');
          return true;
        }
        iframe.addEventListener(
          'load',
          () => {
            if (!isCancelled) setStatus('ready');
          },
          { once: true }
        );
      }
      return false;
    };

    // 4. Observe DOM mutations in container
    const observer = new MutationObserver(() => {
      checkWidgetRendered();
    });

    observer.observe(currentContainer, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // 5. Append script to container after mounting (per React integration requirement)
    currentContainer.appendChild(script);

    // If Klook runner is already in memory from a prior session, trigger it safely
    if (typeof (window as any).klookaff_auto_dynamic_widget?.run === 'function') {
      try {
        (window as any).klookaff_auto_dynamic_widget.run();
      } catch (err) {
        console.warn('[Klook Widget Runner Notice]:', err);
      }
    }

    // 6. Polling verification with 6.5s timeout for ad-blockers / slow networks
    let elapsed = 0;
    const pollInterval = setInterval(() => {
      elapsed += 250;
      const isRendered = checkWidgetRendered();
      if (isRendered) {
        clearInterval(pollInterval);
      } else if (elapsed >= 6500) {
        clearInterval(pollInterval);
        if (!isCancelled) {
          // If no iframe content rendered after 6.5s, display fallback state
          setStatus((current) => (current === 'ready' ? 'ready' : 'failed'));
        }
      }
    }, 250);

    // 7. Scoped cleanup: strictly clean up container and observers
    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      observer.disconnect();
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <section
      className={`w-full bg-white/85 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(7,26,51,0.06)] p-5 sm:p-7 space-y-4 overflow-hidden ${className}`}
      data-testid="klook-activities-widget-section"
      aria-label="Explore activities with Klook"
    >
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0759B8]/10 text-[#0759B8] text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Partner Activities Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#071A33] font-poppins">
            Explore activities with Klook
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-inter">
            Featured tours, attraction passes, and day experiences (priced in USD $). Kept independent from your hotel results.
          </p>
        </div>

        {/* Fallback Direct Link Action */}
        <div className="shrink-0 self-start sm:self-center">
          <a
            href={KLOOK_FALLBACK_URL}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Browse Klook offers</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#0759B8]" />
          </a>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative w-full min-h-[460px]">
        {/* Loading Skeleton (Reserves space ~470px to avoid layout shift) */}
        {status === 'loading' && (
          <div
            className="w-full min-h-[460px] rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/70 p-6 flex flex-col justify-center items-center space-y-4 animate-pulse"
            aria-busy="true"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#0759B8] border-t-transparent animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">Loading Klook activities...</p>
              <p className="text-[11px] text-slate-400">Connecting to verified Travelpayouts partner feed</p>
            </div>
          </div>
        )}

        {/* Fallback State (Shown if script is blocked or unavailable) */}
        {status === 'failed' && (
          <div
            className="w-full py-10 px-5 sm:px-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-4"
            data-testid="klook-widget-fallback"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0759B8]/10 text-[#0759B8] flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-[#071A33]">Explore activities with Klook</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-inter">
                Interactive partner offers could not load (commonly due to an ad blocker or privacy extension). You can still browse and book all verified activities directly on Klook.
              </p>
            </div>
            <div>
              <a
                href={KLOOK_FALLBACK_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#073B4C] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Browse Klook offers</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5BC7F4]" />
              </a>
            </div>
          </div>
        )}

        {/* Container where the Travelpayouts / Klook script injects the iframe */}
        <div
          ref={containerRef}
          className={`w-full overflow-x-auto min-h-[460px] transition-opacity duration-300 ${
            status === 'ready'
              ? 'opacity-100 relative'
              : status === 'loading'
              ? 'opacity-0 absolute top-0 left-0 w-full pointer-events-none'
              : 'hidden'
          }`}
        />
      </div>

      {/* Partner Disclosure & Notice */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-100 font-inter">
        <p className="flex items-center gap-1.5 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#17BEBB] shrink-0" />
          <span>We may earn a commission when you book through these links. Bookings are completed on the partner’s website.</span>
        </p>
        <span className="text-slate-400 text-[10px]">
          Offers powered by Klook &bull; Fixed regional showcase (USD)
        </span>
      </div>
    </section>
  );
};
