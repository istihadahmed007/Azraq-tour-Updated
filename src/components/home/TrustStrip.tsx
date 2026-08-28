import React from 'react';
import { Tag, ShieldCheck, Headphones, Compass } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustItems = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#17BEBB]" />,
      bg: 'bg-[#EAF7F8]',
      title: 'Secure Booking',
      desc: 'Encrypted partner reservations',
    },
    {
      icon: <Compass className="w-5 h-5 text-[#086788]" />,
      bg: 'bg-[#EAF7F8]',
      title: 'Verified Partners',
      desc: 'Official airlines & verified stays',
    },
    {
      icon: <Tag className="w-5 h-5 text-[#073B4C]" />,
      bg: 'bg-[#EAF7F8]',
      title: 'Transparent Pricing',
      desc: 'Zero hidden fees or markups in BDT',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#FF6B5A]" />,
      bg: 'bg-[#FFEAE8]',
      title: '24/7 Support',
      desc: 'Dedicated Dhaka concierge desk',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs hover:shadow-sm hover:border-[#17BEBB]/40 transition-all"
          >
            <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#073B4C] font-serif-display">{item.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
