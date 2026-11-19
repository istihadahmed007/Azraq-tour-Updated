import React from 'react';
import { Tag, ShieldCheck, Headphones, Compass } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustItems = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Verified Reservations',
      desc: 'Direct IATA & accredited stays',
    },
    {
      icon: <Tag className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Transparent Pricing',
      desc: 'All fees clearly itemized in BDT',
    },
    {
      icon: <Compass className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Bangladeshi Travel Desk',
      desc: 'Customized for travelers from DAC',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#17BEBB]" />,
      title: 'WhatsApp Concierge',
      desc: 'Fast, real-time booking support',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/55 hover:bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-md hover:border-[#17BEBB]/50 transition-all cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-[#17BEBB]/10 border border-[#17BEBB]/20 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#071A33] font-inter">{item.title}</h3>
              <p className="text-xs text-slate-600 font-medium font-inter">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
