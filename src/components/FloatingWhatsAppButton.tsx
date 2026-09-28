import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  phoneNumber = '8801851172032',
  defaultMessage = 'Hello Azraq! I would like to inquire about tour packages or visa assistance.',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Suppress floating widget when any modal or full-screen overlay is active
  useEffect(() => {
    const checkModalState = () => {
      setIsModalOpen(document.body.style.overflow === 'hidden');
    };
    checkModalState();

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => observer.disconnect();
  }, []);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  // If a modal is open, completely hide floating button to prevent covering any controls
  if (isModalOpen) {
    return null;
  }

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6 z-30 min-h-[44px] min-w-[44px] px-3 py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-xl backdrop-blur-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer opacity-80 hover:opacity-100 touch-manipulation focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
        title="Open Concierge Chat"
        aria-label="Open Concierge Chat"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline text-[11px] font-bold">Chat</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6 z-30 flex items-center gap-2 pointer-events-auto">
      {/* Tooltip on hover / expanded */}
      <div
        className={`hidden sm:flex items-center gap-2 bg-[#071A33]/95 text-white text-xs font-semibold py-2 px-3.5 rounded-2xl border border-emerald-400/40 shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none select-none ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Chat with Dhaka Concierge (Online)</span>
      </div>

      {/* Floating Action Container */}
      <div className="relative flex items-center">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          aria-label="Contact Azraq on WhatsApp"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 min-h-[44px] min-w-[44px] rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 touch-manipulation focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
        >
          {/* Subtle pulse ring (respects motion preference) */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none motion-reduce:hidden"></span>

          {/* WhatsApp Vector Icon */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-current drop-shadow-md group-hover:rotate-12 transition-transform duration-300"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.99.54 1.777.818 2.796.818 3.182 0 5.768-2.587 5.768-5.767.001-3.182-2.586-5.765-5.768-5.765zm0-2c4.28 0 7.768 3.488 7.768 7.766 0 4.279-3.488 7.768-7.768 7.768-1.282 0-2.483-.314-3.541-.869l-4.49 1.178 1.2-4.382c-.663-1.127-1.045-2.434-1.045-3.695 0-4.278 3.488-7.766 7.768-7.766zm4.17 10.976c-.227.639-1.129 1.173-1.57 1.218-.44.045-.968.106-3.125-.769-2.158-.876-3.524-3.08-3.633-3.224-.108-.143-.865-1.15-.865-2.193 0-1.044.544-1.558.74-1.772.196-.214.428-.268.571-.268.143 0 .286.002.411.008.132.006.31.05.474.444.173.414.59 1.44.641 1.546.052.106.086.23.018.367-.068.136-.102.222-.204.341-.102.12-.214.268-.306.36-.102.102-.209.213-.09.418.118.204.526.867 1.129 1.405.776.691 1.429.905 1.633 1.008.204.102.34.153.39.238.051.085.051.493-.176 1.132z" />
          </svg>

          {/* Online Status Dot */}
          <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-300 border-2 border-slate-950"></span>
        </a>

        {/* Dismiss / Minimize Button (touch-friendly min hit target) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#071A33] hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-[10px] border border-white/20 shadow-md cursor-pointer transition-colors"
          title="Minimize WhatsApp concierge"
          aria-label="Minimize WhatsApp concierge"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
