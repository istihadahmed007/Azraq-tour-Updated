import React, { useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Flag,
  DollarSign,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_TRAVEL_STYLES = [
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
];

const AVAILABLE_INTERESTS = [
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
  'German',
  'Japanese',
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

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, showToast } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || 'Bangladesh');
  const [nationality, setNationality] = useState(user?.nationality || 'Bangladeshi');
  const [homeLocation, setHomeLocation] = useState(user?.homeLocation || 'Dhaka, Bangladesh');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'BDT');
  const [bio, setBio] = useState(user?.bio || '');

  // Arrays
  const [travelStyles, setTravelStyles] = useState<string[]>(
    user?.travelStyles || (user?.travelStyle ? [user.travelStyle] : ['Luxury & VIP', 'Family Holiday'])
  );
  const [travelInterests, setTravelInterests] = useState<string[]>(
    user?.travelInterests || user?.travelPreferences || ['Beach & Tropical Islands', 'Street Food & Fine Dining']
  );
  const [preferredDestinations, setPreferredDestinations] = useState<string[]>(
    user?.preferredDestinations || ['Thailand', 'Malaysia', 'Bali, Indonesia']
  );
  const [customDestinationInput, setCustomDestinationInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  const toggleDestination = (dest: string) => {
    setPreferredDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );
  };

  const addCustomDestination = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customDestinationInput.trim();
    if (clean && !preferredDestinations.includes(clean)) {
      setPreferredDestinations((prev) => [...prev, clean]);
      setCustomDestinationInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        nationality: nationality.trim(),
        homeLocation: homeLocation.trim(),
        preferredLanguage,
        preferredCurrency,
        travelStyle: travelStyles[0] || 'Explorer',
        travelStyles,
        travelInterests,
        travelPreferences: travelInterests, // keep in sync
        preferredDestinations,
        bio: bio.trim(),
        isProfileComplete: true,
      });

      if (res.success) {
        showToast('Profile & travel preferences updated successfully!', 'success');
        onClose();
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('An unexpected error occurred while saving profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0a192f] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400/20 to-emerald-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif-display font-bold text-white">Edit VIP Travel Profile</h2>
              <p className="text-xs text-sky-200/80">Customize your traveler identity and itinerary preferences</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 hide-scrollbar">
          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sky-200">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sky-200">Email Address (Verified)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/50 border border-white/10 text-slate-400 text-xs sm:text-sm cursor-not-allowed min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sky-200">Phone / WhatsApp *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1851-172032"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sky-200">Home City / Base</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sky-200">Country of Residence</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Bangladesh"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-sky-200">Nationality</label>
                <div className="relative">
                  <Flag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Bangladeshi"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sky-200">Traveler Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Share a short note about your travel aspirations or style..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 border border-sky-400/30 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Section 2: Regional & Language Preferences */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Language & Currency Settings</span>
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

          {/* Section 3: Travel Styles */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>Travel Style</span>
              </h3>
              <span className="text-[11px] text-slate-400">{travelStyles.length} selected</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TRAVEL_STYLES.map((style) => {
                const selected = travelStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleTravelStyle(style)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-sky-400 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{style}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Travel Interests */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Travel Interests</span>
              </h3>
              <span className="text-[11px] text-slate-400">{travelInterests.length} selected</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const selected = travelInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Preferred Destinations */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Preferred Destinations</span>
              </h3>
              <span className="text-[11px] text-slate-400">{preferredDestinations.length} chosen</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((dest) => {
                const selected = preferredDestinations.includes(dest);
                return (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => toggleDestination(dest)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-emerald-400 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{dest}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Destination Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customDestinationInput}
                onChange={(e) => setCustomDestinationInput(e.target.value)}
                placeholder="Add other favorite country or city..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
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
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Sparkles className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save VIP Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
