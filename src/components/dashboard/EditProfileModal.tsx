import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Flag,
  Compass,
  Heart,
  MapPin,
  Check,
  Plus,
  ShieldCheck,
  AlertCircle,
  Save,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_TRAVEL_STYLES = [
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
    user?.travelStyles || (user?.travelStyle ? [user.travelStyle] : ['Family Holiday', 'Explorer'])
  );
  const [travelInterests, setTravelInterests] = useState<string[]>(
    user?.travelInterests || user?.travelPreferences || ['Beach & Tropical Islands', 'Street Food & Fine Dining']
  );
  const [preferredDestinations, setPreferredDestinations] = useState<string[]>(
    user?.preferredDestinations || ['Thailand', 'Malaysia', 'Dubai, UAE']
  );
  const [customDestinationInput, setCustomDestinationInput] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track initial snapshot for dirty warning
  const initialSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      const initName = user?.fullName || '';
      const initPhone = user?.phone || '';
      const initCountry = user?.country || 'Bangladesh';
      const initNat = user?.nationality || 'Bangladeshi';
      const initHome = user?.homeLocation || 'Dhaka, Bangladesh';
      const initLang = user?.preferredLanguage || 'English';
      const initCurr = user?.preferredCurrency || 'BDT';
      const initBio = user?.bio || '';
      const initStyles = user?.travelStyles || (user?.travelStyle ? [user.travelStyle] : ['Family Holiday']);
      const initInterests = user?.travelInterests || user?.travelPreferences || ['Beach & Tropical Islands'];
      const initDests = user?.preferredDestinations || ['Thailand', 'Malaysia'];

      setFullName(initName);
      setPhone(initPhone);
      setCountry(initCountry);
      setNationality(initNat);
      setHomeLocation(initHome);
      setPreferredLanguage(initLang);
      setPreferredCurrency(initCurr);
      setBio(initBio);
      setTravelStyles(initStyles);
      setTravelInterests(initInterests);
      setPreferredDestinations(initDests);
      setNameError(null);

      initialSnapshotRef.current = JSON.stringify({
        fullName: initName,
        phone: initPhone,
        country: initCountry,
        nationality: initNat,
        homeLocation: initHome,
        preferredLanguage: initLang,
        preferredCurrency: initCurr,
        bio: initBio,
        travelStyles: initStyles,
        travelInterests: initInterests,
        preferredDestinations: initDests,
      });
    }
  }, [isOpen, user]);

  const isFormDirty = (): boolean => {
    const current = JSON.stringify({
      fullName,
      phone,
      country,
      nationality,
      homeLocation,
      preferredLanguage,
      preferredCurrency,
      bio,
      travelStyles,
      travelInterests,
      preferredDestinations,
    });
    return current !== initialSnapshotRef.current;
  };

  const handleAttemptClose = () => {
    if (isSubmitting) return;
    if (isFormDirty()) {
      if (window.confirm('You have unsaved profile changes. Discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, fullName, phone, bio, travelStyles, travelInterests, preferredDestinations]);

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
      setNameError('Full name is required.');
      showToast('Please enter your full name.', 'error');
      return;
    }

    setNameError(null);
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
        travelPreferences: travelInterests,
        preferredDestinations,
        bio: bio.trim(),
        isProfileComplete: true,
      });

      if (res.success) {
        showToast('Profile and preferences updated successfully!', 'success');
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="absolute inset-0" onClick={handleAttemptClose} />

      <div className="relative w-full max-w-3xl bg-[#0F2339] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-6 text-[#F8FAFC] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#071426] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center text-[#2DD4BF]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-profile-title" className="text-base sm:text-lg font-bold text-white">
                Edit Profile & Preferences
              </h2>
              <p className="text-xs text-[#CBD5E1]">Update your traveler credentials and itinerary preferences</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 hide-scrollbar">
          {/* SECTION 1: VERIFIED ACCOUNT INFORMATION (Read-only / Protected) */}
          <div className="space-y-3 p-4 rounded-xl bg-[#071426]/80 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Account Information</span>
              </span>
              <span className="text-[11px] text-[#CBD5E1] bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                Protected Credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#CBD5E1]">Primary Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    aria-readonly="true"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F2339]/60 border border-white/10 text-slate-400 text-xs sm:text-sm cursor-not-allowed min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Linked to your login identity</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#CBD5E1]">Account Reference UID</label>
                <input
                  type="text"
                  value={user?.uid || 'N/A'}
                  disabled
                  aria-readonly="true"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F2339]/60 border border-white/10 text-slate-400 font-mono text-xs cursor-not-allowed min-h-[44px]"
                />
                <p className="text-[11px] text-slate-400">Authenticated customer account ID</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: EDITABLE PERSONAL DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <UserIcon className="w-4 h-4 text-[#2DD4BF]" />
              <span>Editable Traveler Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-fullname" className="text-xs font-semibold text-[#CBD5E1]">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="edit-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#071426] border text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px] ${
                    nameError ? 'border-rose-500' : 'border-white/15'
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-phone" className="text-xs font-semibold text-[#CBD5E1]">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="edit-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1851-172032"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Used for booking confirmations & WhatsApp hold</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-home" className="text-xs font-semibold text-[#CBD5E1]">
                  Home City / Base
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="edit-home"
                    type="text"
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-country" className="text-xs font-semibold text-[#CBD5E1]">
                  Country of Residence
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="edit-country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Bangladesh"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-nationality" className="text-xs font-semibold text-[#CBD5E1]">
                  Nationality
                </label>
                <div className="relative">
                  <Flag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="edit-nationality"
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Bangladeshi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-bio" className="text-xs font-semibold text-[#CBD5E1]">
                  Traveler Bio
                </label>
                <textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Share a short note about your travel style or bucket-list spots..."
                  className="w-full px-4 py-2 rounded-xl bg-[#071426] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: REGIONAL & LANGUAGE SETTINGS */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2DD4BF]" />
              <span>Language & Currency</span>
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

          {/* SECTION 4: TRAVEL STYLES */}
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2DD4BF]" />
                <span>Travel Styles</span>
              </h3>
              <span className="text-xs text-slate-400">{travelStyles.length} chosen</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TRAVEL_STYLES.map((style) => {
                const selected = travelStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleTravelStyle(style)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-[#2563EB] text-white shadow-xs'
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

          {/* SECTION 5: TRAVEL INTERESTS */}
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#2DD4BF]" />
                <span>Travel Interests</span>
              </h3>
              <span className="text-xs text-slate-400">{travelInterests.length} chosen</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const selected = travelInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-teal-600 text-white shadow-xs'
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

          {/* SECTION 6: PREFERRED DESTINATIONS */}
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2DD4BF]" />
                <span>Preferred Destinations</span>
              </h3>
              <span className="text-xs text-slate-400">{preferredDestinations.length} chosen</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((dest) => {
                const selected = preferredDestinations.includes(dest);
                return (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => toggleDestination(dest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-xs'
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
                value={customDestinationInput}
                onChange={(e) => setCustomDestinationInput(e.target.value)}
                placeholder="Add other favorite destination..."
                className="flex-1 px-4 py-2 rounded-xl bg-[#071426] border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
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
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer border border-white/15"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Sticky Modal Actions Bar */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-[#0F2339] py-3 z-10">
            <button
              type="button"
              onClick={handleAttemptClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#CBD5E1] font-semibold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
            >
              <Save className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
