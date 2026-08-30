import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Heart,
  MapPin,
  Globe,
  DollarSign,
  Sparkles,
  Check,
  Plus,
  Save,
} from 'lucide-react';

const ALL_TRAVEL_STYLES = [
  'Luxury & VIP',
  'Solo Traveler',
  'Family Holiday',
  'Couple / Honeymoon',
  'Adventure & Trekking',
  'Cultural & Heritage',
  'Budget / Backpacker',
  'Halal-Friendly',
  'Wellness & Spa',
  'City Break & Shopping',
  'Road Trips',
  'Eco & Sustainable',
];

const ALL_INTERESTS = [
  'Beach & Tropical Islands',
  'Historical Monuments',
  'Street Food & Fine Dining',
  'Mountains & Nature Hiking',
  'Wildlife & Safari',
  'Theme Parks & Leisure',
  'Modern City Skylines',
  'Photography & Scenery',
  'Scuba Diving & Watersports',
  'Local Bazaars & Crafts',
  'Museums & Art Galleries',
  'Nightlife & Sunset Spots',
];

const POPULAR_DESTINATIONS = [
  'Thailand',
  'Malaysia',
  'Bali, Indonesia',
  'Singapore',
  'Dubai, UAE',
  'Maldives',
  'Kashmir, India',
  'Japan',
  'Turkey',
  'Vietnam',
  'Cox\'s Bazar, BD',
  'Sajek Valley, BD',
  'Sylhet & Sreemangal',
  'Switzerland',
  'Saudi Arabia (Umrah/Tour)',
  'Egypt',
  'Sri Lanka',
  'Nepal',
];

const CURRENCIES = [
  { code: 'BDT', label: 'Bangladeshi Taka (BDT ৳)' },
  { code: 'USD', label: 'US Dollar (USD $)' },
  { code: 'EUR', label: 'Euro (EUR €)' },
  { code: 'AED', label: 'UAE Dirham (AED د.إ)' },
  { code: 'MYR', label: 'Malaysian Ringgit (MYR RM)' },
  { code: 'THB', label: 'Thai Baht (THB ฿)' },
  { code: 'GBP', label: 'British Pound (GBP £)' },
  { code: 'SAR', label: 'Saudi Riyal (SAR ﷼)' },
  { code: 'SGD', label: 'Singapore Dollar (SGD S$)' },
];

const LANGUAGES = [
  'English',
  'Bengali (বাংলা)',
  'Arabic (العربية)',
  'Hindi / Urdu',
  'Malay / Indonesian',
  'Thai',
  'French',
  'Spanish',
];

export const TravelPreferencesTab: React.FC = () => {
  const { user, updateUserProfile, showToast } = useAuth();

  const [travelStyles, setTravelStyles] = useState<string[]>(
    user?.travelStyles || (user?.travelStyle ? [user.travelStyle] : ['Luxury & VIP', 'Family Holiday'])
  );
  const [travelInterests, setTravelInterests] = useState<string[]>(
    user?.travelInterests || user?.travelPreferences || ['Beach & Tropical Islands', 'Street Food & Fine Dining']
  );
  const [preferredDestinations, setPreferredDestinations] = useState<string[]>(
    user?.preferredDestinations || ['Thailand', 'Malaysia', 'Bali, Indonesia']
  );
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'BDT');
  const [customDestination, setCustomDestination] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleStyle = (s: string) => {
    setTravelStyles((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleInterest = (i: string) => {
    setTravelInterests((prev) =>
      prev.includes(i) ? prev.filter((item) => item !== i) : [...prev, i]
    );
  };

  const toggleDestination = (d: string) => {
    setPreferredDestinations((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const addCustomDestination = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customDestination.trim();
    if (clean && !preferredDestinations.includes(clean)) {
      setPreferredDestinations((prev) => [...prev, clean]);
      setCustomDestination('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateUserProfile({
        travelStyles,
        travelStyle: travelStyles[0] || 'Explorer',
        travelInterests,
        travelPreferences: travelInterests,
        preferredDestinations,
        preferredLanguage,
        preferredCurrency,
      });

      if (res.success) {
        showToast('Travel preferences saved successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to save preferences', 'error');
      }
    } catch {
      showToast('Error saving travel preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with Save Button */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Itinerary Customizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
            Travel Styles & Trip Preferences
          </h2>
          <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
            Select the trip styles, experiences, and destinations you love. Our AI trip generator and travel agents will align all recommendations with these criteria.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Language & Currency Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>Language & Currency Selection</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-sky-200">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-white">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-sky-200">Preferred Currency</label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Travel Styles Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span>Travel Styles ({travelStyles.length} selected)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click to toggle</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {ALL_TRAVEL_STYLES.map((style) => {
            const selected = travelStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selected
                    ? 'bg-sky-400 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                }`}
              >
                {selected && <Check className="w-4 h-4 stroke-[3]" />}
                <span>{style}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Travel Interests Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>Travel Interests & Activities ({travelInterests.length} selected)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click to toggle</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {ALL_INTERESTS.map((interest) => {
            const selected = travelInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selected
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                }`}
              >
                {selected && <Check className="w-4 h-4 stroke-[3]" />}
                <span>{interest}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Destinations Section */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Preferred Destinations Wishlist ({preferredDestinations.length} chosen)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Click to toggle</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {POPULAR_DESTINATIONS.map((dest) => {
            const selected = preferredDestinations.includes(dest);
            return (
              <button
                key={dest}
                type="button"
                onClick={() => toggleDestination(dest)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selected
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                }`}
              >
                {selected && <Check className="w-4 h-4 stroke-[3]" />}
                <span>{dest}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Destination Input */}
        <div className="flex gap-2 pt-3">
          <input
            type="text"
            value={customDestination}
            onChange={(e) => setCustomDestination(e.target.value)}
            placeholder="Add any other country, city, or island..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomDestination(e);
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomDestination}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>
    </div>
  );
};
