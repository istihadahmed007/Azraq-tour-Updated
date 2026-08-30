import React, { useState } from 'react';
import { User, Destination } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
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
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Crown,
  Languages,
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

interface ProfileDetailsTabProps {
  onSelectDestination?: (dest: Destination) => void;
}

export const ProfileDetailsTab: React.FC<ProfileDetailsTabProps> = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Defaults and fallbacks derived purely from real user data
  const displayName = user?.fullName || 'Distinguished Traveler';
  const email = user?.email || 'Not provided';
  const phone = user?.phone || 'Not provided';
  const country = user?.country || user?.homeLocation?.split(',').pop()?.trim() || 'Bangladesh';
  const nationality = user?.nationality || (country.toLowerCase().includes('bangladesh') ? 'Bangladeshi' : country);
  const preferredLanguage = user?.preferredLanguage || (user?.languages && user.languages[0]) || 'English';
  const preferredCurrency = user?.preferredCurrency || 'BDT (৳)';
  
  // Travel styles
  const travelStyles = user?.travelStyles && user.travelStyles.length > 0
    ? user.travelStyles
    : user?.travelStyle
    ? [user.travelStyle]
    : ['Luxury & VIP', 'Family Holiday'];

  // Travel interests
  const travelInterests = user?.travelInterests && user.travelInterests.length > 0
    ? user.travelInterests
    : user?.travelPreferences && user.travelPreferences.length > 0
    ? user.travelPreferences
    : ['Beach & Tropical Islands', 'Street Food & Fine Dining', 'Historical Heritage'];

  // Preferred destinations
  const preferredDestinations = user?.preferredDestinations && user.preferredDestinations.length > 0
    ? user.preferredDestinations
    : ['Thailand', 'Malaysia', 'Bali, Indonesia', 'Dubai, UAE'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with Edit Button */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 flex items-center gap-1 shadow-sm">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Azraq VIP Member Profile</span>
            </span>
            {user?.emailVerified && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Account</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
            Traveler Identity & Preferences
          </h2>
          <p className="text-xs text-sky-200/80 max-w-2xl leading-relaxed">
            Your verified personal credentials, regional preferences, and travel styling used to tailor VIP quotes, airline seats, and visa checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Preferences</span>
        </button>
      </div>

      {/* Grid: Identity Card & Regional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Core Contact & Personal Information */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Personal Information</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Contact Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Full Name
              </span>
              <p className="text-sm font-bold text-white">{displayName}</p>
            </div>

            {/* Email */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Email Address
              </span>
              <p className="text-xs sm:text-sm font-bold text-sky-200 truncate" title={email}>
                {email}
              </p>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Phone / WhatsApp
              </span>
              <p className="text-sm font-bold text-emerald-300">{phone}</p>
            </div>

            {/* Home Location */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Home City / Base
              </span>
              <p className="text-sm font-bold text-white">{user?.homeLocation || 'Dhaka, Bangladesh'}</p>
            </div>

            {/* Country */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Country
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{country}</span>
              </p>
            </div>

            {/* Nationality */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Nationality
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>{nationality}</span>
              </p>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Traveler Bio
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Card 2: Regional, Currency & Language Settings */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <span>Language & Currency</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Regional Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Language */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                  Preferred Language
                </span>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>{preferredLanguage}</span>
                </p>
                <p className="text-[11px] text-slate-400">Used for itinerary notes & quotes</p>
              </div>

              {/* Preferred Currency */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
                  Preferred Currency
                </span>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>{preferredCurrency}</span>
                </p>
                <p className="text-[11px] text-slate-400">Prices displayed across platform</p>
              </div>
            </div>

            {/* Travel Style Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Primary Travel Style</span>
                </span>
                <span className="text-[11px] text-slate-400">{travelStyles.length} active</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map((style) => (
                  <span
                    key={style}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/20 text-xs text-sky-200/90 flex items-center gap-3 mt-4">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              Your VIP preferences automatically tailor all AI-generated travel itineraries and flight quote assessments.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Travel Interests & Preferred Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 3: Travel Interests */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Travel Interests</span>
            </h3>
            <span className="text-[11px] text-slate-400">{travelInterests.length} selected</span>
          </div>

          <p className="text-xs text-slate-300">
            Experiences and activities you enjoy most when traveling internationally or domestically:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {travelInterests.map((interest) => (
              <span
                key={interest}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-200 border border-amber-400/30 flex items-center gap-1.5"
              >
                <span>✨</span>
                <span>{interest}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Card 4: Preferred Destinations */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Preferred Destinations</span>
            </h3>
            <span className="text-[11px] text-slate-400">{preferredDestinations.length} destinations</span>
          </div>

          <p className="text-xs text-slate-300">
            Countries and holiday spots at the top of your travel wishlist:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {preferredDestinations.map((dest) => (
              <span
                key={dest}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5"
              >
                <span>📍</span>
                <span>{dest}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
