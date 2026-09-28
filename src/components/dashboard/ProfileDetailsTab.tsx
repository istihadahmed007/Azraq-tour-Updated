import React, { useState } from 'react';
import { Destination } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Globe,
  Flag,
  DollarSign,
  Compass,
  Heart,
  MapPin,
  Edit3,
  CheckCircle2,
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
  const displayName = user?.fullName || 'Traveler';
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
    : ['Family Holiday', 'Explorer'];

  // Travel interests
  const travelInterests = user?.travelInterests && user.travelInterests.length > 0
    ? user.travelInterests
    : user?.travelPreferences && user.travelPreferences.length > 0
    ? user.travelPreferences
    : ['Beach & Tropical Islands', 'Historical Heritage'];

  // Preferred destinations
  const preferredDestinations = user?.preferredDestinations && user.preferredDestinations.length > 0
    ? user.preferredDestinations
    : ['Thailand', 'Malaysia', 'Dubai, UAE'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with Edit Button */}
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Traveler Profile</span>
            </span>
            {user?.emailVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Account</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Traveler Identity & Preferences
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-2xl leading-relaxed">
            Your personal travel credentials, regional preferences, and holiday styling used to tailor flight seats, package itineraries, and visa assessments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Preferences</span>
        </button>
      </div>

      {/* Grid: Identity Card & Regional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Core Contact & Personal Information */}
        <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#2DD4BF]" />
              <span>Personal Information</span>
            </h3>
            <span className="text-xs text-[#CBD5E1]">Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Name */}
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Full Name
              </span>
              <p className="text-sm font-bold text-white">{displayName}</p>
            </div>

            {/* Email */}
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Email Address (Verified)
              </span>
              <p className="text-xs sm:text-sm font-bold text-sky-200 truncate" title={email}>
                {email}
              </p>
            </div>

            {/* Phone */}
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Phone / WhatsApp
              </span>
              <p className="text-sm font-bold text-white">{phone}</p>
            </div>

            {/* Home Location */}
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Home City / Base
              </span>
              <p className="text-sm font-bold text-white">{user?.homeLocation || 'Dhaka, Bangladesh'}</p>
            </div>

            {/* Country */}
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Country
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{country}</span>
              </p>
            </div>

            {/* Nationality */}
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Nationality
              </span>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>{nationality}</span>
              </p>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
              <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                Traveler Bio
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed italic">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Card 2: Regional, Currency & Language Settings */}
        <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#2DD4BF]" />
                <span>Language & Currency</span>
              </h3>
              <span className="text-xs text-[#CBD5E1]">Regional Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Preferred Language */}
              <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
                <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                  Preferred Language
                </span>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2DD4BF]" />
                  <span>{preferredLanguage}</span>
                </p>
                <p className="text-[11px] text-slate-400">Used for itinerary notes & quotes</p>
              </div>

              {/* Preferred Currency */}
              <div className="p-3.5 rounded-xl bg-[#071426]/70 border border-white/5 space-y-1">
                <span className="text-[11px] font-semibold text-[#CBD5E1] uppercase tracking-wider block">
                  Preferred Currency
                </span>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sky-400" />
                  <span>{preferredCurrency}</span>
                </p>
                <p className="text-[11px] text-slate-400">Official currency: BDT (৳)</p>
              </div>
            </div>

            {/* Travel Style Overview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Primary Travel Style</span>
                </span>
                <span className="text-xs text-slate-400">{travelStyles.length} active</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map((style) => (
                  <span
                    key={style}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/30"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Travel Interests & Preferred Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 3: Travel Interests */}
        <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#2DD4BF]" />
              <span>Travel Interests</span>
            </h3>
            <span className="text-xs text-[#CBD5E1]">{travelInterests.length} selected</span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Activities you enjoy most when traveling domestically or abroad:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {travelInterests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[#F8FAFC] border border-white/15 flex items-center gap-1.5"
              >
                <span>✨</span>
                <span>{interest}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Card 4: Preferred Destinations */}
        <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2DD4BF]" />
              <span>Preferred Destinations</span>
            </h3>
            <span className="text-xs text-[#CBD5E1]">{preferredDestinations.length} destinations</span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Destinations and holiday spots at the top of your travel wishlist:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {preferredDestinations.map((dest) => (
              <span
                key={dest}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-[#2DD4BF] border border-teal-500/30 flex items-center gap-1.5"
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
