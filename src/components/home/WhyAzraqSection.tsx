import React from 'react';
import { ShieldCheck, Headphones, Award, FileCheck2, MapPin, CheckCircle2 } from 'lucide-react';

export const WhyAzraqSection: React.FC = () => {
  const credentials = [
    {
      icon: <MapPin className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Physical Desk in Dhaka',
      desc: 'Visit our Banani / Gulshan travel office for in-person consultations, passport handoffs, and group trip planning.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Dedicated WhatsApp Concierge',
      desc: 'Direct human assistance for flight re-scheduling, date changes, emergency baggage queries, and custom holiday quotes.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Transparent BDT Pricing',
      desc: 'All embassy fees, government taxes, and baggage allowances are clearly itemized upfront with zero hidden surcharges.',
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-[#17BEBB]" />,
      title: 'Bangladeshi Passport Expertise',
      desc: 'Every visa checklist is tailored to current embassy criteria in Dhaka, including bank solvency, tax returns, and NOCs.',
    },
  ];

  const travelPillars = [
    {
      number: '01',
      title: 'Verified Accommodations',
      description: 'We only partner with centrally-located hotels and resorts that meet strict cleanliness and safety standards for families and solo travelers.',
    },
    {
      number: '02',
      title: 'Direct Airline Inventory',
      description: 'Flight searches connect directly to licensed partner systems ensuring legitimate PNR issuance and verified baggage allowances.',
    },
    {
      number: '03',
      title: 'Customized Day-by-Day Itineraries',
      description: 'Tailored travel schedules that balance must-see landmarks, leisurely exploration, and vetted halal dining options.',
    },
  ];

  return (
    <section className="w-full bg-white/20 backdrop-blur-xl py-16 sm:py-20 border-y border-white/40">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 text-[#071A33] border border-white/60 backdrop-blur-md text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#17BEBB]" />
            <span>Why Choose Azraq</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#071A33] tracking-[-0.025em]">
            Built for Bangladeshi Travelers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-inter">
            We bridge the gap between global travel reservation systems and personalized local support right here in Dhaka.
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {credentials.map((c, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/65 shadow-[0_4px_20px_rgba(7,26,51,0.04)] hover:shadow-xl hover:border-[#17BEBB]/50 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-[#17BEBB]/10 border border-[#17BEBB]/20 flex items-center justify-center">
                {c.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#071A33] font-inter">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-inter">{c.desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#17BEBB]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Service</span>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Standards Grid */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#071A33]/85 backdrop-blur-2xl border border-white/20 text-white shadow-2xl">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#17BEBB] font-mono">
              Our Commitment
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-white">
              Every trip planned with care, precision, and honesty.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 border-t border-white/10 pt-8">
            {travelPillars.map((p, idx) => (
              <div key={idx} className="space-y-3">
                <span className="text-3xl font-bold text-[#17BEBB]">{p.number}</span>
                <h4 className="text-base font-bold text-white font-inter">{p.title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-inter">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
