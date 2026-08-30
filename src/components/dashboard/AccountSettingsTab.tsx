import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  User as UserIcon,
  Mail,
  Camera,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
} from 'lucide-react';

interface AccountSettingsTabProps {
  onOpenProfilePictureModal: () => void;
}

export const AccountSettingsTab: React.FC<AccountSettingsTabProps> = ({
  onOpenProfilePictureModal,
}) => {
  const { user, updateUserProfile, sendPasswordReset, logout, showToast } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsUpdatingPassword(true);
    try {
      const res = await sendPasswordReset(user.email);
      if (res.success) {
        showToast('Password reset instructions sent to your email!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
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
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Credentials</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
          Account Settings & Security
        </h2>
        <p className="text-xs text-sky-200/80 max-w-xl">
          Manage your login credentials, avatar image, verified email status, and session security.
        </p>
      </div>

      {/* Avatar & Identity Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 border-b border-white/10 pb-3">
          <UserIcon className="w-4 h-4" />
          <span>Profile Picture & Avatar</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <img
              src={
                user?.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  user?.fullName || user?.email || 'traveler'
                )}`
              }
              alt={user?.fullName || 'Traveler'}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/60 shadow-xl"
            />
            <button
              type="button"
              onClick={onOpenProfilePictureModal}
              className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-amber-300 mb-1" />
              <span className="text-[10px] font-bold text-amber-200 uppercase">Change</span>
            </button>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="text-base font-bold text-white">{user?.fullName}</h4>
            <p className="text-xs text-slate-300">{user?.email}</p>
            <button
              type="button"
              onClick={onOpenProfilePictureModal}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Update Profile Photo / Avatar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security & Password Reset */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2 border-b border-white/10 pb-3">
          <KeyRound className="w-4 h-4" />
          <span>Password & Authentication</span>
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Password Security</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              To update or reset your password, click the button below. A secure reset link will be sent to your registered email address (<strong className="text-white">{user?.email}</strong>).
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isUpdatingPassword}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isUpdatingPassword ? 'Sending Reset Link...' : 'Send Password Reset Email'}</span>
          </button>
        </div>
      </div>

      {/* Session Security & Logout */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Active Session & Sign Out</h4>
          <p className="text-xs text-slate-400">
            Securely sign out of this device. Your saved itineraries, preferences, and quotes remain safe in the cloud.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-6 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Securely</span>
        </button>
      </div>
    </div>
  );
};
