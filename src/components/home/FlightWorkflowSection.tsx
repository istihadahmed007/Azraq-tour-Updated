import React from 'react';
import { Search, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface FlightWorkflowSectionProps {
  onNavigateToFlights?: () => void;
}

export const FlightWorkflowSection: React.FC<FlightWorkflowSectionProps> = ({
  onNavigateToFlights,
}) => {
  const steps = [
    {
      step: '01',
      icon: <Search className="w-5 h-5 text-[#086788]" />,
      bg: 'bg-[#EAF7F8]',
      title: 'Compare Live Airfares',
      desc: 'Browse direct and 1-stop routes from Dhaka across Asia and the Middle East with live pricing in BDT.',
    },
    {
      step: '02',
      icon: <FileText className="w-5 h-5 text-[#FF6B5A]" />,
      bg: 'bg-[#FFEAE8]',
      title: 'Request VIP Quote',
      desc: 'Lock in group rates, baggage allowances, and special requests with our Dhaka travel specialists.',
    },
    {
      step: '03',
      icon: <CheckCircle2 className="w-5 h-5 text-[#17BEBB]" />,
      bg: 'bg-[#EAF7F8]',
      title: 'Receive Instant E-Tickets',
      desc: 'Get your verified PNR and official ticket sent directly via WhatsApp and email with zero hidden fees.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#086788] font-mono">
          How Azraq Works
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#073B4C] tracking-[-0.025em]">
          Simple, Transparent Flight & Travel Booking
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-inter">
          We combine real-time global inventory with dedicated local travel desk support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/65 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-xl transition-all relative space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                {s.icon}
              </div>
              <span className="text-2xl font-black text-[#17BEBB]/40 font-mono">{s.step}</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#073B4C] tracking-[-0.015em]">{s.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-inter">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => {
            if (onNavigateToFlights) onNavigateToFlights();
            else window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#086788] hover:text-[#073B4C] transition-colors cursor-pointer"
        >
          <span>Start flight search</span>
          <ArrowRight className="w-4 h-4 text-[#17BEBB]" />
        </button>
      </div>
    </section>
  );
};
