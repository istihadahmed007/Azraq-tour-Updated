import React, { useState } from 'react';
import { Sparkles, Calendar, Users, DollarSign, Compass, ArrowRight, Loader2 } from 'lucide-react';

export interface PlanRequestData {
  destination: string;
  budget: string;
  duration: number;
  travelers: number;
  style: string;
}

interface PlannerFormProps {
  onSubmit: (data: PlanRequestData) => void;
  isLoading?: boolean;
  initialDestination?: string;
  className?: string;
}

export function PlannerForm({
  onSubmit,
  isLoading = false,
  initialDestination = '',
  className = '',
}: PlannerFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [budget, setBudget] = useState('75000');
  const [duration, setDuration] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState('Cultural & Exploration');

  const popularDestinations = [
    'Bangkok, Thailand',
    'Dubai, UAE',
    'Kuala Lumpur, Malaysia',
    'Singapore',
    'Bali, Indonesia',
    'Cox\'s Bazar & Sylhet',
    'Maldives',
    'Jeddah & Makkah (Umrah)',
  ];

  const travelStyles = [
    'Cultural & Exploration',
    'Relaxation & Scenic',
    'Family Friendly',
    'Pocket-Friendly / Backpacker',
    'Luxury & VIP',
    'Adventure & Trekking',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSubmit({
      destination: destination.trim(),
      budget: budget.trim(),
      duration: Number(duration),
      travelers: Number(travelers),
      style,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 ${className}`}
    >
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Where do you want to travel?
        </label>
        <div className="relative">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Thailand, Dubai, Malaysia, Maldives..."
            required
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006ce4] focus:border-transparent text-sm"
          />
          <Compass className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Quick pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-500 font-medium">Popular:</span>
          {popularDestinations.slice(0, 4).map((dest) => (
            <button
              type="button"
              key={dest}
              onClick={() => setDestination(dest)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Duration (Days)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="21"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Math.min(21, Number(e.target.value))))}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006ce4]"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Travelers
          </label>
          <div className="relative">
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006ce4] cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Traveler' : 'Travelers'}
                </option>
              ))}
            </select>
            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Budget per Person (BDT)
          </label>
          <div className="relative">
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 75000"
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006ce4]"
            />
            <span className="text-slate-400 text-sm font-bold absolute left-3 top-2.5">৳</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Travel Style & Vibe
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {travelStyles.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setStyle(item)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition cursor-pointer ${
                style === item
                  ? 'bg-blue-50 border-[#006ce4] text-[#006ce4] font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !destination.trim()}
        className="w-full min-h-[48px] bg-[#006ce4] hover:bg-[#0057b8] text-white font-semibold text-base py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Crafting Your Custom Itinerary...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-[#febb02]" />
            <span>Generate Free AI Travel Plan</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}

export default PlannerForm;
