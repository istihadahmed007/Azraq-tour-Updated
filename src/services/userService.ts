/**
 * Azraq Trips - API-First User Profile & Preference Service
 */

import { AuthUser, authService } from './authService';

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  country?: string;
  bio?: string;
  languages?: string[];
  homeLocation?: string;
  travelPreferences?: any;
  photoURL?: string;
}

export const userService = {
  // Update user profile fields
  async updateProfile(email: string, payload: UpdateProfilePayload): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile.' };
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile.' };
    }
  },

  // Change password for logged-in user
  async changePassword(email: string, currentPass: string, newPass: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword: currentPass, newPassword: newPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to change password.' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error changing password.' };
    }
  },
};
