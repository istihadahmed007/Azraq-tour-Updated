import React from 'react';
import { Tag, ShieldCheck, Headphones, Compass } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustItems = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#73A9D2]" />,
      title: 'Verified Reservations',
      desc: 'Direct IATA & accredited stays',
    },
    {
      icon: <Tag className="w-5 h-5 text-[#73A9D2]" />,
      title: 'Transparent Pricing',
      desc: 'All fees clearly itemized in BDT',
    },
    {
      icon: <Compass className="w-5 h-5 text-[#73A9D2]" />,
      title: 'Bangladeshi Travel Desk',
      desc: 'Customized for travelers from DAC',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#73A9D2]" />,
      title: 'WhatsApp Concierge',
      desc: 'Fast, real-time booking support',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#E7F0F8] border border-white/70 shadow-[-4px_-4px_10px_rgba(255,255,255,0.7),4px_4px_10px_rgba(166,185,204,0.3)] hover:shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_2px_6px_rgba(166,185,204,0.4)] transition-all cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F7FAFD] border border-white flex items-center justify-center shrink-0 shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(166,185,204,0.25)]">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#263B55] font-inter">{item.title}</h3>
              <p className="text-xs text-[#63778D] font-medium font-inter">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
