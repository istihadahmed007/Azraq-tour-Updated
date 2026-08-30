import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Phone,
  MapPin,
  FileText,
  Compass,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Heart,
  Plane,
  Globe,
  Bell,
  Utensils,
  RefreshCw,
  Check,
  Shield,
} from 'lucide-react';

const AVATAR_SEEDS = [
  'Tanvir',
  'Amina',
  'Rahim',
  'Fatima',
  'TravelerAzraq',
  'OceanExplorer',
  'DhakaWanderer',
  'BengalVoyager',
];

const TRAVEL_STYLES = [
  { id: 'solo', label: 'Solo Explorer', icon: '🎒' },
  { id: 'couple', label: 'Couple & Romantic', icon: '💖' },
  { id: 'family', label: 'Family Vacation', icon: '👨‍👩‍👧‍👦' },
  { id: 'luxury', label: 'Luxury Escapes', icon: '✨' },
  { id: 'adventure', label: 'Adventure & Trekking', icon: '🏔️' },
  { id: 'cultural', label: 'Halal & Heritage', icon: '🕌' },
  { id: 'beach', label: 'Beach & Island Relaxation', icon: '🏖️' },
  { id: 'budget', label: 'Budget Backpacker', icon: '✈️' },
];

const POPULAR_DESTINATIONS = [
  'Thailand',
  'Maldives',
  'Kashmir',
  'Saudi Arabia (Umrah)',
  'Malaysia',
  'Dubai & UAE',
  'Singapore',
  'Turkey',
  'Bali & Indonesia',
  'Cox\'s Bazar & Sajek',
  'Switzerland & Europe',
  'Japan',
];

const CABIN_CLASSES = [
  { id: 'economy', label: 'Economy Class' },
  { id: 'premium_economy', label: 'Premium Economy' },
  { id: 'business', label: 'Business Class' },
];

const DIETARY_OPTIONS = [
  'Halal Only',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'No Restrictions',
];

const PASSPORT_STATUSES = [
  'Valid for 6+ months (Ready to travel)',
  'Expiring in < 6 months (Renewing soon)',
  'Need new passport assistance',
];

const LANGUAGES = ['English', 'Bengali', 'Arabic', 'Hindi', 'Urdu', 'Spanish'];

const COUNTRY_CODES = [
  { code: '+880', country: 'BD', name: 'Bangladesh (+880)' },
  { code: '+1', country: 'US', name: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', name: 'UK (+44)' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia (+966)' },
  { code: '+971', country: 'AE', name: 'UAE (+971)' },
  { code: '+60', country: 'MY', name: 'Malaysia (+60)' },
  { code: '+65', country: 'SG', name: 'Singapore (+65)' },
  { code: '+66', country: 'TH', name: 'Thailand (+66)' },
  { code: '+91', country: 'IN', name: 'India (+91)' },
  { code: '+974', country: 'QA', name: 'Qatar (+974)' },
  { code: '+90', country: 'TR', name: 'Turkey (+90)' },
];

interface ProfileSetupWizardProps {
  onFinished: () => void;
}

export const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ onFinished }) => {
  const { user, updateUserProfile, showToast } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Basic info
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone?.replace(/^\+\d+\s*/, '') || '');
  const [homeLocation, setHomeLocation] = useState(user?.homeLocation || 'Dhaka, Bangladesh');
  const [bio, setBio] = useState(user?.bio || 'Travel enthusiast exploring the world with Azraq Trips.');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(
    user?.email ? user.email.split('@')[0] : 'Tanvir'
  );

  // Step 2: Travel preferences
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    user?.travelPreferences || ['family', 'cultural']
  );
  const [favoriteDestinations, setFavoriteDestinations] = useState<string[]>([
    'Thailand',
    'Maldives',
    'Saudi Arabia (Umrah)',
  ]);
  const [preferredCabin, setPreferredCabin] = useState('economy');

  // Step 3: Additional preferences
  const [dietaryPreference, setDietaryPreference] = useState('Halal Only');
  const [passportStatus, setPassportStatus] = useState(PASSPORT_STATUSES[0]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    user?.languages || ['English', 'Bengali']
  );
  const [flightAlertsEnabled, setFlightAlertsEnabled] = useState(true);

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleDestination = (dest: string) => {
    setFavoriteDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSaveAndProceed = async (nextStep?: 2 | 3 | 'finish') => {
    setIsSaving(true);
    try {
      const fullPhone = phoneNumber.trim()
        ? `${phoneCountryCode} ${phoneNumber.trim().replace(/^0/, '')}`
        : user?.phone || '';

      const photoURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        selectedAvatarSeed
      )}`;

      await updateUserProfile({
        fullName: fullName.trim() || user?.fullName || 'Traveler',
        phone: fullPhone,
        homeLocation: homeLocation.trim(),
        bio: bio.trim(),
        photoURL,
        travelPreferences: selectedStyles,
        languages: selectedLanguages,
        isProfileComplete: true,
      });

      if (nextStep === 'finish') {
        showToast('Profile setup completed! Welcome aboard. ✈️', 'success');
        onFinished();
      } else if (nextStep) {
        setStep(nextStep);
      }
    } catch (err: any) {
      console.warn('Profile save error:', err);
      // Even if update failed, allow proceeding so user is never locked out
      if (nextStep === 'finish') {
        onFinished();
      } else if (nextStep) {
        setStep(nextStep);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipAll = () => {
    showToast('You can update your profile anytime in the Dashboard.', 'info');
    onFinished();
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Step Indicator Header */}
      <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#17BEBB]/20 text-[#086788] text-xs font-bold">
              {step}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step {step} of 3 • {step === 1 ? 'Basic Info' : step === 2 ? 'Travel Preferences' : 'Extra Preferences'}
            </span>
          </div>

          <button
            onClick={handleSkipAll}
            type="button"
            className="text-xs font-semibold text-[#086788] hover:text-[#073B4C] hover:underline transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#17BEBB] to-[#FF6B5A] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Content Body */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h4 className="text-xl font-bold font-serif-display text-[#073B4C]">
                  Tell us a bit about you
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Personalize your tickets, quotes, and travel recommendations.
                </p>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Choose an Avatar
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                  {AVATAR_SEEDS.map((seed) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      seed
                    )}`;
                    const isSelected = selectedAvatarSeed === seed;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatarSeed(seed)}
                        className={`relative w-12 h-12 rounded-full border-2 p-0.5 transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'border-[#FF6B5A] ring-2 ring-[#FF6B5A]/30 scale-105 shadow-md bg-white'
                            : 'border-slate-200 hover:border-[#17BEBB] bg-slate-100'
                        }`}
                      >
                        <img
                          src={avatarUrl}
                          alt={seed}
                          className="w-full h-full rounded-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FF6B5A] text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] focus:bg-white text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mobile Number (For WhatsApp / Booking Updates)
                </label>
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="w-32 py-2.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] focus:bg-white text-slate-800 font-medium"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.country} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01712345678"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] focus:bg-white text-slate-900 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Home Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Home City / Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] focus:bg-white text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Short Bio (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Share what type of travel you enjoy..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17BEBB] focus:bg-white text-slate-900 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Travel Preferences */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h4 className="text-xl font-bold font-serif-display text-[#073B4C]">
                  Your Travel Style
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Select your travel vibe so our AI Planner tailors perfect trips for you.
                </p>
              </div>

              {/* Travel Styles */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  How do you like to travel?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => toggleStyle(style.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#086788] bg-[#EAF7F8] text-[#073B4C] shadow-xs ring-1 ring-[#086788]'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{style.icon}</span>
                        <span className="flex-1 truncate">{style.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#086788] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dream Destinations */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Favorite or Next Dream Destinations
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => {
                    const isSelected = favoriteDestinations.includes(dest);
                    return (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => toggleDestination(dest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#073B4C] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#17BEBB]" />}
                        <span>{dest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Cabin Class */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Preferred Flight Cabin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CABIN_CLASSES.map((cabin) => (
                    <button
                      key={cabin.id}
                      type="button"
                      onClick={() => setPreferredCabin(cabin.id)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        preferredCabin === cabin.id
                          ? 'border-[#FF6B5A] bg-[#FF6B5A]/10 text-[#FF6B5A]'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cabin.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Additional Preferences */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h4 className="text-xl font-bold font-serif-display text-[#073B4C]">
                  Finishing Touches
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Set your meal preferences and travel notifications.
                </p>
              </div>

              {/* Dietary Preferences */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#FF6B5A]" />
                  <span>Meal & Dietary Preference</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIETARY_OPTIONS.map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setDietaryPreference(diet)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        dietaryPreference === diet
                          ? 'border-[#086788] bg-[#EAF7F8] text-[#073B4C] ring-1 ring-[#086788]'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passport Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#17BEBB]" />
                  <span>Passport Status</span>
                </label>
                <div className="space-y-2">
                  {PASSPORT_STATUSES.map((status) => (
                    <label
                      key={status}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        passportStatus === status
                          ? 'border-[#17BEBB] bg-[#EAF7F8]/60 text-[#073B4C] font-semibold'
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="passportStatus"
                        checked={passportStatus === status}
                        onChange={() => setPassportStatus(status)}
                        className="accent-[#17BEBB] w-4 h-4"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#086788]" />
                  <span>Spoken Languages</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#086788] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Flight Price Alerts Toggle */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#EAF7F8] to-slate-50 border border-[#17BEBB]/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#17BEBB]/20 flex items-center justify-center text-[#086788]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#073B4C]">Price Drop & Deal Alerts</div>
                    <div className="text-[11px] text-slate-500">Get notified of cheap flights from Dhaka</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={flightAlertsEnabled}
                  onChange={(e) => setFlightAlertsEnabled(e.target.checked)}
                  className="accent-[#FF6B5A] w-5 h-5 rounded-md cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation Controls */}
      <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 sticky bottom-0 z-10">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as any)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSkipAll}
            className="px-4 py-2.5 rounded-xl border border-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Skip all
          </button>
        )}

        <div className="flex items-center gap-2">
          {step < 3 ? (
            <>
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Skip step
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveAndProceed((step + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Save & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveAndProceed('finish')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B5A] to-[#FF8577] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Profile</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
