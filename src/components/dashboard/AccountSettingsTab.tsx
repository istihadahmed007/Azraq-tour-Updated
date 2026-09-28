import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  User as UserIcon,
  Camera,
  LogOut,
  Lock,
} from 'lucide-react';
import { UserAvatar } from '../UserAvatar';

interface AccountSettingsTabProps {
  onOpenProfilePictureModal: () => void;
}

export const AccountSettingsTab: React.FC<AccountSettingsTabProps> = ({
  onOpenProfilePictureModal,
}) => {
  const { user, sendPasswordReset, logout, showToast } = useAuth();

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsUpdatingPassword(true);
    try {
      const res = await sendPasswordReset(user.email);
      if (res.success) {
        showToast('Password reset instructions sent to your email!', 'success');
      } else {
        showToast(res.error || 'Failed to send password reset', 'error');
      }
    } catch {
      showToast('Error requesting password reset', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
          <span>Security & Credentials</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Account Settings & Security
        </h2>
        <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl">
          Manage your login credentials, profile photo, verified email status, and active session.
        </p>
      </div>

      {/* Avatar & Identity Card */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <UserIcon className="w-4 h-4 text-[#2DD4BF]" />
          <span>Profile Picture & Avatar</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <UserAvatar
              photoURL={user?.photoURL}
              name={user?.fullName}
              email={user?.email}
              size="2xl"
              className="border-3 border-white/20 shadow-md"
            />
            <button
              type="button"
              onClick={onOpenProfilePictureModal}
              className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:opacity-100 focus:outline-none"
              title="Change photo"
              aria-label="Change profile photo"
            >
              <Camera className="w-6 h-6 text-[#2DD4BF] mb-1" />
              <span className="text-[10px] font-bold text-white uppercase">Change</span>
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="text-base font-bold text-white">{user?.fullName || 'Traveler'}</h4>
            <p className="text-xs sm:text-sm text-[#CBD5E1]">{user?.email}</p>
            <button
              type="button"
              onClick={onOpenProfilePictureModal}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Update Profile Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Password Reset */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <KeyRound className="w-4 h-4 text-[#2DD4BF]" />
          <span>Password & Authentication</span>
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#071426]/70 border border-white/5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              <span>Password Security</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              To update or reset your password, click the button below. A secure reset link will be sent to your registered email address (<strong className="text-white">{user?.email}</strong>).
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isUpdatingPassword}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isUpdatingPassword ? 'Sending Reset Link...' : 'Send Password Reset Email'}</span>
          </button>
        </div>
      </div>

      {/* Session Security & Logout */}
      <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Active Session & Sign Out</h4>
          <p className="text-xs text-[#CBD5E1]">
            Securely sign out of this device. Your saved itineraries, preferences, and quotes remain safe in the cloud.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Securely</span>
        </button>
      </div>
    </div>
  );
};
