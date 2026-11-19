import React from 'react';
import { Plane, Package, FileCheck2, Sparkles, ArrowRight, MapPin, Smartphone, Car, Ticket } from 'lucide-react';

interface ServiceGridProps {
  onNavigateToView?: (view: string) => void;
  onOpenLocationFinder?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ onNavigateToView, onOpenLocationFinder, onScrollToSection }) => {

  const scrollTo = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const services = [
    {
      id: 'flights',
      icon: <Plane className="w-6 h-6 text-[#086788]" />,
      title: 'Flight Comparison & Ticketing',
      desc: 'Real-time airfares from Dhaka to Thailand, Malaysia, Singapore, UAE, Maldives, and beyond.',
      cta: 'Search Flights',
      bg: 'bg-[#EAF7F8]',
      border: 'hover:border-[#17BEBB]',
      action: () => {
        window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
      },
    },
    {
      id: 'packages',
      icon: <Package className="w-6 h-6 text-[#073B4C]" />,
      title: 'Curated Holiday Packages',
      desc: 'All-inclusive itineraries with 4-star & 5-star hotels, private airport transfers, and excursions.',
      cta: 'Explore Packages',
      bg: 'bg-[#EAF7F8]',
      border: 'hover:border-[#17BEBB]',
      action: () => onNavigateToView && onNavigateToView('packages'),
    },
    {
      id: 'location',
      icon: <MapPin className="w-6 h-6 text-[#FF6B5A]" />,
      title: 'Travel AI Location Scout',
      desc: 'Find exact coordinates, photo vantage points, entrance gates, transit directions, and halal food worldwide.',
      cta: 'Scout Exact GPS',
      bg: 'bg-[#FFEAE8]',
      border: 'hover:border-[#FF6B5A]',
      action: () => {
        if (onOpenLocationFinder) onOpenLocationFinder();
        else if (onNavigateToView) onNavigateToView('map');
      },
    },
    {
      id: 'visa',
      icon: <FileCheck2 className="w-6 h-6 text-[#086788]" />,
      title: 'Visa Documentation Desk',
      desc: 'Step-by-step document checklists, embassy appointment support, and eVisa processing guidance.',
      cta: 'Check Visa Rules',
      bg: 'bg-[#EAF7F8]',
      border: 'hover:border-[#17BEBB]',
      action: () => onNavigateToView && onNavigateToView('visa'),
    },
    {
      id: 'planner',
      icon: <Sparkles className="w-6 h-6 text-[#17BEBB]" />,
      title: 'AI Itinerary & Voice Planner',
      desc: 'Custom day-by-day travel plans customized to your budget, halal dietary needs, and vacation vibe.',
      cta: 'Plan with AI',
      bg: 'bg-[#EAF7F8]',
      border: 'hover:border-[#17BEBB]',
      action: () => onNavigateToView && onNavigateToView('planner'),
    },
    {
      id: 'things-to-do-shortcut',
      icon: <Ticket className="w-6 h-6 text-amber-600" />,
      title: 'Things to Do & Day Tours',
      desc: 'Browse Klook-verified attraction tickets, island tours, and theme park passes — prices shown in BDT.',
      cta: 'Explore Activities',
      bg: 'bg-amber-50',
      border: 'hover:border-amber-400',
      action: () => scrollTo('things-to-do'),
    },
    {
      id: 'travel-esim-shortcut',
      icon: <Smartphone className="w-6 h-6 text-sky-600" />,
      title: 'Travel eSIM & Global Data',
      desc: 'Instant digital SIM cards from Airalo & Yesim — stay connected in 200+ countries without swapping your SIM.',
      cta: 'Compare eSIMs',
      bg: 'bg-sky-50',
      border: 'hover:border-sky-400',
      action: () => scrollTo('travel-esim'),
    },
    {
      id: 'airport-transfers-shortcut',
      icon: <Car className="w-6 h-6 text-blue-600" />,
      title: 'Airport & Private Transfers',
      desc: 'Pre-book fixed-fare airport pickups (Kiwitaxi) or compare private driver bids (GetTransfer) worldwide.',
      cta: 'Book Transfer',
      bg: 'bg-blue-50',
      border: 'hover:border-blue-400',
      action: () => scrollTo('airport-transfers'),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#086788] font-mono">
          Comprehensive Services
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#073B4C] tracking-[-0.025em]">
          Everything You Need for a Seamless Journey
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {services.map((srv) => (
          <div
            key={srv.id}
            onClick={srv.action}
            className={`p-5 rounded-2xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/65 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group ${srv.border}`}
          >
            <div className="space-y-3">
              <div className={`w-11 h-11 rounded-xl ${srv.bg} flex items-center justify-center`}>
                {srv.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#073B4C] group-hover:text-[#086788] transition-colors font-inter line-clamp-2">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-inter">{srv.desc}</p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-white/50 flex items-center justify-between text-xs font-bold text-[#086788] group-hover:text-[#073B4C]">
              <span>{srv.cta}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#17BEBB] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
