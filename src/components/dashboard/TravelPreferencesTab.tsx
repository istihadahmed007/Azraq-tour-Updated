import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Heart,
  MapPin,
  Globe,
  Check,
  Plus,
  Save,
} from 'lucide-react';

const ALL_TRAVEL_STYLES = [
  'Solo Traveler',
  'Family Holiday',
  'Couple / Honeymoon',
  'Adventure & Trekking',
  'Cultural & Heritage',
  'Budget / Backpacker',
  'Halal-Friendly',
  'Wellness & Spa',
  'City Break & Shopping',
  'Luxury Travel',
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
  'Sunset Spots & Coastlines',
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
    user?.travelStyles || (user?.travelStyle ? [user.travelStyle] : ['Family Holiday', 'Explorer'])
  );
  const [travelInterests, setTravelInterests] = useState<string[]>(
    user?.travelInterests || user?.travelPreferences || ['Beach & Tropical Islands', 'Street Food & Fine Dining']
  );
  const [preferredDestinations, setPreferredDestinations] = useState<string[]>(
    user?.preferredDestinations || ['Thailand', 'Malaysia', 'Dubai, UAE']
  );
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'BDT');

  const [customDestination, setCustomDestination] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleTravelStyle = (style: string) => {
    setTravelStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleInterest = (interest: string) => {
    setTravelInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
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
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
            <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>AI Itinerary Customizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Travel Styles & Trip Preferences
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-2xl leading-relaxed">
            Select the trip styles, experiences, and destinations you love. Our AI trip generator and travel agents align recommendations with these settings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {/* Language & Currency Card */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Globe className="w-4 h-4 text-[#2DD4BF]" />
          <span>Language & Currency Selection</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#CBD5E1]">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-[#0F2339] text-white">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#CBD5E1]">Preferred Currency</label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0F2339] text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Travel Styles Section */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2DD4BF]" />
            <span>Travel Styles ({travelStyles.length} selected)</span>
          </h3>
          <span className="text-xs text-slate-400">Click to toggle</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_TRAVEL_STYLES.map((style) => {
            const selected = travelStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleTravelStyle(style)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selected
                    ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                    : 'bg-[#071426] hover:bg-slate-800 text-[#CBD5E1] border border-white/10'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                <span>{style}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Travel Interests Section */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#2DD4BF]" />
            <span>Travel Interests & Activities ({travelInterests.length} selected)</span>
          </h3>
          <span className="text-xs text-slate-400">Click to toggle</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map((interest) => {
            const selected = travelInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selected
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'bg-[#071426] hover:bg-slate-800 text-[#CBD5E1] border border-white/10'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                <span>{interest}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Destinations Section */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2DD4BF]" />
            <span>Preferred Destinations Wishlist ({preferredDestinations.length} chosen)</span>
          </h3>
          <span className="text-xs text-slate-400">Click to toggle</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {POPULAR_DESTINATIONS.map((dest) => {
            const selected = preferredDestinations.includes(dest);
            return (
              <button
                key={dest}
                type="button"
                onClick={() => toggleDestination(dest)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selected
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-[#071426] hover:bg-slate-800 text-[#CBD5E1] border border-white/10'
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                <span>{dest}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Destination Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customDestination}
            onChange={(e) => setCustomDestination(e.target.value)}
            placeholder="Add any other country, city, or island..."
            className="flex-1 px-4 py-2 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer border border-white/15"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
