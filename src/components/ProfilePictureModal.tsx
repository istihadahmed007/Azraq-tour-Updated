import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
  X,
  UploadCloud,
  Camera,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPhotoURL: string | null) => void;
}

/**
 * Pre-processes an image file on the client using HTML5 Canvas.
 * Caps dimension at 800px and produces an optimized JPEG Data URL (~80-120KB).
 * This ensures lightning-fast uploads without browser or network timeouts.
 */
async function prepareAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file could not be decoded as an image.'));
      img.onload = () => {
        try {
          const MAX_DIM = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(reader.result as string);
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.9);
          resolve(compressed);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateUserProfile, showToast } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.photoURL || null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(user?.photoURL || null);
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [isOpen, user?.photoURL]);

  if (!isOpen) return null;

  const currentAvatar =
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      user?.fullName || user?.email || 'traveler'
    )}`;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size must be under 15MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, or WEBP).', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) {
      showToast('Please select a photo to upload.', 'info');
      return;
    }

    if (!user) {
      showToast('Please log in to update your profile photo.', 'error');
      return;
    }

    const token = authService.getSessionToken() || localStorage.getItem('azraq_tours_session_token');
    if (!token) {
      showToast('Authentication session expired. Please sign in again.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // 1. Client-side canvas preprocessing (downscale & compress)
      const dataUrl = await prepareAvatarDataUrl(selectedFile);
      setUploadProgress(50);

      // 2. Direct upload to authenticated /api/upload/avatar endpoint
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file: dataUrl }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload profile picture.');
      }

      setUploadProgress(90);
      const newPhotoURL = data.url || data.secure_url || data.photoURL;

      // 3. Update Firebase Auth user profile if currentUser exists (non-blocking)
      if (auth.currentUser) {
        try {
          updateProfile(auth.currentUser, {
            photoURL: newPhotoURL,
          }).catch((authErr) => console.warn('Firebase Auth updateProfile notice:', authErr));
        } catch (authErr) {
          console.warn('Firebase Auth updateProfile notice:', authErr);
        }
      }

      // 4. Update Travel Buddy Profile & User doc in Firestore (background safe)
      if (db && user.uid && auth.currentUser) {
        try {
          const buddyRef = doc(db, 'travel_buddies_profiles', user.uid);
          updateDoc(buddyRef, {
            avatarUrl: newPhotoURL,
            updatedAt: new Date().toISOString(),
          }).catch((e) => console.warn('Travel buddy avatar Firestore notice:', e));
        } catch (buddyErr) {
          console.warn('Travel buddy profile photo update notice:', buddyErr);
        }
      }

      // 5. Update AuthContext, state, and local session
      await updateUserProfile({
        photoURL: newPhotoURL,
      });

      setPreviewUrl(newPhotoURL);
      setUploadProgress(100);
      showToast('Profile picture updated successfully! ✨', 'success');

      if (onSuccess) onSuccess(newPhotoURL);
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      console.error('Failed to update profile picture:', err);
      showToast(err?.message || 'Failed to upload profile photo.', 'error');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to remove your profile picture and restore the default avatar?')) {
      return;
    }

    setIsRemoving(true);
    try {
      const token = authService.getSessionToken() || localStorage.getItem('azraq_tours_session_token');
      if (token) {
        await fetch('/api/upload/avatar', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }

      // Update Firebase Auth user
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            photoURL: '',
          });
        } catch {}
      }

      // Update Travel Buddy Profile in Firestore
      try {
        if (db && user.uid) {
          const buddyRef = doc(db, 'travel_buddies_profiles', user.uid);
          await updateDoc(buddyRef, {
            avatarUrl: '',
            updatedAt: new Date().toISOString(),
          });
        }
      } catch {}

      // Update AuthContext state
      await updateUserProfile({
        photoURL: '',
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      showToast('Profile photo removed. Default avatar restored.', 'info');

      if (onSuccess) onSuccess(null);
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove profile photo.', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      id="profile-picture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Profile Photo</h3>
              <p className="text-[11px] text-slate-400">Personalize your Azraq VIP identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center gap-5">
          {/* Avatar Preview Ring */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-400/80 shadow-2xl ring-4 ring-amber-400/20 bg-slate-950 flex items-center justify-center">
              <img
                src={previewUrl || currentAvatar}
                alt={user?.fullName || 'Traveler'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = currentAvatar;
                }}
              />
            </div>

            {selectedFile && (
              <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] shadow-lg border-2 border-slate-900 animate-bounce">
                New Photo
              </span>
            )}
          </div>

          {/* Drag and Drop / Choose File Section */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-sky-400 bg-sky-500/10'
                : 'border-white/15 hover:border-sky-400/50 bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP (Max 15MB)
              </p>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="w-full space-y-1.5 animate-in fade-in">
              <div className="flex justify-between text-[11px] text-sky-200">
                <span>Saving photo across your profile & posts...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5 pt-2 border-t border-white/10">
            <button
              onClick={handleSavePhoto}
              disabled={!selectedFile || isUploading || isRemoving}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading & Saving Photo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save New Profile Picture</span>
                </>
              )}
            </button>

            {user?.photoURL && (
              <button
                onClick={handleRemovePhoto}
                disabled={isUploading || isRemoving}
                className="w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRemoving ? 'Removing...' : 'Remove Photo & Reset to Default'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
