import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import {
  getSoftwareApplicationSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
} from '../lib/seo';
import {
  Sparkles,
  Zap,
  DollarSign,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Plane,
  Heart,
  Mic,
} from 'lucide-react';

interface AiPlannerLandingViewProps {
  onPlanTripPrompt: (prompt: string) => void;
  onNavigateToView: (view: string) => void;
  onOpenVoiceModal?: (initialTranscript?: string) => void;
}

export const AiPlannerLandingView: React.FC<AiPlannerLandingViewProps> = ({
  onPlanTripPrompt,
  onNavigateToView,
  onOpenVoiceModal,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const samplePrompts = [
    '5-day family trip to Kuala Lumpur and Genting Highlands under ৳70,000 per person with Halal food focus',
    '7-day romantic honeymoon in Bali with private pool villas in Ubud and beach sunsets in Seminyak',
    '4-day weekend trip to Bangkok from Dhaka for shopping at Pratunam and river dinner cruise',
    '7-day cultural holiday in Japan exploring Tokyo, Kyoto bullet train, and Mount Fuji views',
    '4-day luxury holiday in Dubai with Burj Khalifa, Desert Safari BBQ, and Dubai Mall',
  ];

  const faqs = [
    {
      question: 'How does the AzraqTrips AI Travel Planner work?',
      answer: 'Our AI Planner uses advanced intelligence to generate complete, personalized day-by-day itineraries based on your starting city (Dhaka/Chittagong), destination, traveler type, budget in BDT, and preferences (such as Halal dining and kid-friendly attractions).',
    },
    {
      question: 'Is the AI Travel Planner free to use?',
      answer: 'Yes, generating, customizing, and saving your AI travel itineraries on AzraqTrips is completely free for all travelers.',
    },
    {
      question: 'Can the AI account for flights from Dhaka and visa requirements?',
      answer: 'Yes! Every generated itinerary automatically provides flight scheduling guidance from Dhaka (DAC), visa checklist timelines, and local currency / BDT budget conversions.',
    },
  ];

  const canonicalUrl = `${SITE_URL}/ai-travel-planner`;

  const structuredData = [
    getSoftwareApplicationSchema({
      name: 'AzraqTrips AI Travel Itinerary Planner',
      description: 'Generate customized day-by-day travel itineraries with Halal food spots, BDT budgeting, and flight options from Dhaka.',
      url: '/ai-travel-planner',
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'AI Travel Planner', url: '/ai-travel-planner' },
    ]),
    getFAQSchema(faqs),
  ];

  const handleStart = (promptToUse?: string) => {
    const prompt = promptToUse || customPrompt.trim();
    if (prompt) {
      onPlanTripPrompt(prompt);
    } else {
      onPlanTripPrompt('5-day trip to Malaysia with family from Dhaka');
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title="AI Travel Planner for Bangladeshi Travelers – AzraqTrips"
        description="Free AI-powered travel planner for Bangladeshi travelers. Create personalized day-by-day itineraries with Dhaka flight schedules, BDT budget calculators, halal dining spots, and visa checklists in seconds."
        canonical={canonicalUrl}
        keywords={[
          'AI travel planner Bangladesh',
          'Free trip itinerary generator Dhaka',
          'AI trip planner Malaysia Thailand Bali',
          'Travel budget calculator BDT',
          'Halal travel planner AI',
        ]}
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#002B66] via-[#054394] to-[#0759B8] text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'AI Travel Planner' },
            ]}
            className="text-white/80 justify-center mb-6"
          />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI-Powered Itinerary Generator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Plan Your Dream Vacation in Seconds with AI
          </h1>

          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Tailored specifically for Bangladeshi travelers. Get complete day-by-day itineraries with exact BDT budget estimates, Dhaka flight routes, and Halal dining spots.
          </p>

          {/* Interactive AI Prompt Box */}
          <div className="mt-8 bg-white rounded-2xl p-3 sm:p-4 shadow-2xl max-w-2xl mx-auto text-left border border-white/20">
            <div className="relative">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Where do you want to go? E.g., 5-day holiday in Bali for a couple under ৳90,000 with private pool villa..."
                className="w-full p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] resize-none h-24 border border-slate-200"
              />
            </div>

            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                ✨ Powered by AzraqTrips AI Travel Intelligence
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenVoiceModal && (
                  <button
                    type="button"
                    onClick={() => onOpenVoiceModal()}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0D6EFD] font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    title="Speak your travel request"
                  >
                    <Mic className="w-4 h-4 text-[#0D6EFD] animate-pulse" />
                    <span>Speak</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleStart()}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-[#1389E8] to-[#0759B8] hover:from-[#0E7FE3] hover:to-[#064B9C] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Itinerary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Clickable Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs text-blue-200 py-1 font-semibold">Try searching:</span>
            {samplePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStart(prompt)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg backdrop-blur-xs transition-colors text-left truncate max-w-[280px] sm:max-w-none cursor-pointer"
              >
                "{prompt.slice(0, 45)}..."
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0D6EFD] mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">BDT Budget Optimization</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Every spot, hotel, meal, and flight includes transparent cost estimates converted into Bangladeshi Taka (BDT).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Halal Dining & Prayer Friendly</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Automatic recommendations for JAKIM / MUIS certified restaurants, local mosques, and prayer facilities.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Dhaka Visa & Flight Integration</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Connect your itinerary directly with direct flights from Dhaka (DAC) and official embassy visa checklists.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
