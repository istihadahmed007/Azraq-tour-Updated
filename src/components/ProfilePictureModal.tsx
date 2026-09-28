import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Move,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPhotoURL: string | null) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const CONTAINER_SIZE = 210; // Pixel dimension of the square crop preview

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, updateUserProfile, showToast } = useAuth();

  // File & image preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Cropping & repositioning state
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Upload & error states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setRawImageSrc(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setUploadError(null);
      setImgNaturalSize({ width: 0, height: 0 });
    }
  }, [isOpen]);

  // Load raw image element to get natural dimensions
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  // Keyboard navigation / escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading) {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUploading, selectedFile]);

  const handleAttemptClose = () => {
    if (selectedFile && !isUploading) {
      if (window.confirm('Discard unsaved photo changes?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Calculate pan boundaries based on current zoom and image aspect ratio
  const getPanBounds = useCallback((currentZoom: number) => {
    if (!imgNaturalSize.width || !imgNaturalSize.height) {
      return { maxX: 0, maxY: 0 };
    }
    const baseScale = Math.max(
      CONTAINER_SIZE / imgNaturalSize.width,
      CONTAINER_SIZE / imgNaturalSize.height
    );
    const renderedW = imgNaturalSize.width * baseScale * currentZoom;
    const renderedH = imgNaturalSize.height * baseScale * currentZoom;
    const maxX = Math.max(0, (renderedW - CONTAINER_SIZE) / 2);
    const maxY = Math.max(0, (renderedH - CONTAINER_SIZE) / 2);
    return { maxX, maxY };
  }, [imgNaturalSize]);

  // Safely update zoom while keeping the image clamped within the viewport
  const updateZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(clampedZoom);
    const { maxX, maxY } = getPanBounds(clampedZoom);
    setOffset((prev) => ({
      x: Math.max(-maxX, Math.min(maxX, prev.x)),
      y: Math.max(-maxY, Math.min(maxY, prev.y)),
    }));
  }, [getPanBounds]);

  const validateAndProcessFile = (file: File) => {
    setUploadError(null);

    // 1. Check for HEIC / HEIF format
    const lowerName = file.name.toLowerCase();
    const isHeic =
      lowerName.endsWith('.heic') ||
      lowerName.endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';

    if (isHeic) {
      setUploadError(
        'Apple HEIC/HEIF photos are not directly supported by web browsers. Please upload a standard JPEG, PNG, or WebP photo, or convert it first.'
      );
      showToast('HEIC format not supported. Please use JPEG, PNG, or WebP.', 'error');
      return;
    }

    // 2. Validate MIME type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setUploadError('Unsupported file type. Please select a valid JPEG, PNG, or WebP image.');
      showToast('Please select a JPEG, PNG, or WebP image.', 'error');
      return;
    }

    // 3. Validate size <= 5 MB
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(
        `Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The maximum allowed photo size is 5 MB.`
      );
      showToast('File exceeds the 5 MB limit. Please select a smaller photo.', 'error');
      return;
    }

    // Read as Data URL and precalculate dimensions
    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try another photo.');
    };
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setSelectedFile(file);
        setRawImageSrc(src);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      img.onerror = () => {
        setSelectedFile(file);
        setRawImageSrc(src);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    validateAndProcessFile(files[0]);
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
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Mouse / Touch Pan Handlers with boundary clamping
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const { maxX, maxY } = getPanBounds(zoom);
    const rawX = clientX - dragStart.x;
    const rawY = clientY - dragStart.y;
    setOffset({
      x: Math.max(-maxX, Math.min(maxX, rawX)),
      y: Math.max(-maxY, Math.min(maxY, rawY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    updateZoom(+(zoom + delta).toFixed(2));
  };

  // Render cropped image to Canvas and generate optimized square JPEG
  const generateCroppedDataUrl = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!rawImageSrc) {
        return reject(new Error('No image loaded.'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for cropping.'));
      img.onload = () => {
        try {
          const TARGET_SIZE = 400; // Standard 400x400 avatar
          const canvas = document.createElement('canvas');
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas 2D context unavailable.'));

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Base cover scale as displayed in preview
          const baseScale = Math.max(
            CONTAINER_SIZE / img.naturalWidth,
            CONTAINER_SIZE / img.naturalHeight
          );
          const renderedWidth = img.naturalWidth * baseScale * zoom;
          const renderedHeight = img.naturalHeight * baseScale * zoom;

          // Center of the rendered image in container coordinates
          const centerX = CONTAINER_SIZE / 2 + offset.x;
          const centerY = CONTAINER_SIZE / 2 + offset.y;

          // Top-left of rendered image relative to the container
          const imgLeft = centerX - renderedWidth / 2;
          const imgTop = centerY - renderedHeight / 2;

          // Viewport [0, 0, CONTAINER_SIZE, CONTAINER_SIZE] in rendered image space
          const viewportLeftInRendered = -imgLeft;
          const viewportTopInRendered = -imgTop;

          // Convert to natural image pixel coordinates
          const scaleFactor = img.naturalWidth / renderedWidth;
          const sourceX = viewportLeftInRendered * scaleFactor;
          const sourceY = viewportTopInRendered * scaleFactor;
          const sourceWidth = CONTAINER_SIZE * scaleFactor;
          const sourceHeight = CONTAINER_SIZE * scaleFactor;

          // Clamp safe boundaries
          const safeSourceX = Math.max(0, Math.min(img.naturalWidth - 1, sourceX));
          const safeSourceY = Math.max(0, Math.min(img.naturalHeight - 1, sourceY));
          const safeSourceW = Math.max(1, Math.min(sourceWidth, img.naturalWidth - safeSourceX));
          const safeSourceH = Math.max(1, Math.min(sourceHeight, img.naturalHeight - safeSourceY));

          // Draw directly to 400x400 canvas
          ctx.drawImage(
            img,
            safeSourceX,
            safeSourceY,
            safeSourceW,
            safeSourceH,
            0,
            0,
            TARGET_SIZE,
            TARGET_SIZE
          );

          // Export high-quality progressive JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = rawImageSrc;
    });
  };

  const handleSavePhoto = async () => {
    if (!selectedFile && !rawImageSrc) {
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
    setUploadError(null);

    try {
      // 1. Generate cropped & centered square data URL
      const croppedDataUrl = await generateCroppedDataUrl();

      // 2. Direct upload to authenticated /api/upload/avatar endpoint
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file: croppedDataUrl }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload profile picture.');
      }

      // Add cache buster timestamp to ensure immediate visual refresh
      const rawUrl = data.url || data.secure_url || data.photoURL;
      const newPhotoURL = rawUrl.includes('?') ? `${rawUrl}&t=${Date.now()}` : `${rawUrl}?t=${Date.now()}`;

      // 3. Update Firebase Auth user profile if available
      if (auth.currentUser) {
        try {
          updateProfile(auth.currentUser, { photoURL: newPhotoURL }).catch(() => {});
        } catch {}
      }

      // 4. Update Travel Buddy Profile & User doc in Firestore (non-blocking)
      if (db && user.uid && auth.currentUser) {
        try {
          const buddyRef = doc(db, 'travel_buddies_profiles', user.uid);
          updateDoc(buddyRef, {
            avatarUrl: newPhotoURL,
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
        } catch {}
      }

      // 5. Update AuthContext state and persistence
      await updateUserProfile({
        photoURL: newPhotoURL,
      });

      showToast('Profile photo updated successfully!', 'success');
      if (onSuccess) onSuccess(newPhotoURL);
      onClose();
    } catch (err: any) {
      console.error('Failed to update profile picture:', err);
      const msg = err?.message || 'Failed to upload profile photo.';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    if (!window.confirm('Remove profile picture and restore default initials?')) {
      return;
    }

    setIsRemoving(true);
    setUploadError(null);

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
          await updateProfile(auth.currentUser, { photoURL: '' });
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
      setRawImageSrc(null);
      showToast('Profile photo removed. Default initials restored.', 'info');
      if (onSuccess) onSuccess(null);
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Failed to remove profile photo.';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isOpen) return null;

  // Calculate base image display dimensions to cover the crop container
  const baseScale =
    imgNaturalSize.width && imgNaturalSize.height
      ? Math.max(CONTAINER_SIZE / imgNaturalSize.width, CONTAINER_SIZE / imgNaturalSize.height)
      : 1;
  const baseW = imgNaturalSize.width ? Math.round(imgNaturalSize.width * baseScale) : CONTAINER_SIZE;
  const baseH = imgNaturalSize.height ? Math.round(imgNaturalSize.height * baseScale) : CONTAINER_SIZE;

  return (
    <div
      id="profile-picture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0" onClick={handleAttemptClose} />

      <div className="relative w-full max-w-md bg-[#0F2339] border border-white/15 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col text-[#F8FAFC] max-h-[92vh] sm:max-h-[88vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 flex items-center justify-between bg-[#071426] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center text-[#2DD4BF] shadow-xs shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                Update Profile Photo
              </h3>
              <p className="text-xs text-[#CBD5E1]">Supported: JPEG, PNG, WebP • Max 5 MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#CBD5E1] hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Sleek, compact & scrollbar-free */}
        <div className="p-4 sm:p-5 flex flex-col items-center gap-3.5 overflow-y-auto hide-scrollbar flex-1">
          {/* Error Banner with Retry */}
          {uploadError && (
            <div className="w-full p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p>{uploadError}</p>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    className="underline text-white font-semibold hover:text-rose-100 cursor-pointer block text-xs"
                  >
                    Retry Upload
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW A: No Image Selected yet -> Current Avatar & Picker */}
          {!rawImageSrc ? (
            <div className="w-full flex flex-col items-center gap-4 py-1">
              {/* Current Avatar Display */}
              <div className="relative group">
                <UserAvatar
                  photoURL={user?.photoURL}
                  name={user?.fullName}
                  email={user?.email}
                  size="2xl"
                  className="border-4 border-white/20 shadow-xl"
                />
              </div>

              <p className="text-xs text-[#CBD5E1] text-center max-w-sm leading-relaxed">
                {user?.photoURL
                  ? 'Click below or drag in a new image to replace your current profile photo.'
                  : 'No custom photo uploaded yet. Your initials are currently displayed across Azraq Trips.'}
              </p>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Upload photo. Click to choose a file or drag and drop here."
                className={`w-full border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                  dragActive
                    ? 'border-[#2DD4BF] bg-[#2DD4BF]/10'
                    : 'border-white/20 hover:border-[#2563EB] bg-[#071426]/60'
                }`}
              >
                <input
                  id="avatar-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-xl bg-[#2563EB]/15 text-[#2DD4BF] flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white">Choose a photo or drag & drop here</p>
                  <p className="text-xs text-[#CBD5E1]">JPEG, PNG, or WebP up to 5 MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW B: Image Selected -> Interactive Square Crop & Reposition Preview */
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-center space-y-0.5">
                <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  <span>Reposition & Zoom</span>
                </span>
                <p className="text-xs text-[#CBD5E1]">Drag photo to center face, or use slider to adjust zoom</p>
              </div>

              {/* Square Crop Viewport with Pro Circular Cutout Mask */}
              <div
                ref={cropContainerRef}
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onWheel={handleWheel}
                onTouchStart={(e) => {
                  if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={handlePointerUp}
                style={{ width: `${CONTAINER_SIZE}px`, height: `${CONTAINER_SIZE}px` }}
                className="relative rounded-2xl overflow-hidden bg-[#071426] cursor-grab active:cursor-grabbing select-none flex items-center justify-center touch-none border border-white/20 shadow-2xl"
                title="Drag to reposition photo (Scroll to zoom)"
              >
                {/* Scaled & Pinned Image */}
                <img
                  src={rawImageSrc}
                  alt="Crop preview"
                  onLoad={handleImageLoaded}
                  draggable={false}
                  style={{
                    width: `${baseW}px`,
                    height: `${baseH}px`,
                    minWidth: `${baseW}px`,
                    minHeight: `${baseH}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  }}
                  className="pointer-events-none select-none max-w-none max-h-none object-contain"
                />

                {/* Circular Mask Guide: Highlights circular avatar cut-out while dimming outer corners */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-[#2DD4BF] shadow-[0_0_0_999px_rgba(7,20,38,0.7)] pointer-events-none z-10"
                  aria-hidden="true"
                />
              </div>

              {/* Zoom & Reset Controls */}
              <div className="w-full max-w-xs space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-xs text-[#CBD5E1]">
                  <span className="flex items-center gap-1">
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </span>
                  <span className="font-mono font-bold text-white text-xs">{zoom.toFixed(1)}x</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateZoom(+(zoom - 0.2).toFixed(1))}
                    disabled={zoom <= 1}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer transition-colors"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => updateZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#2563EB] cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    aria-label="Zoom level"
                  >
                  </input>

                  <button
                    type="button"
                    onClick={() => updateZoom(+(zoom + 0.2).toFixed(1))}
                    disabled={zoom >= 3}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer transition-colors"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white cursor-pointer ml-1 transition-colors"
                    title="Reset Crop Position"
                    aria-label="Reset crop"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Replace Photo File Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#2DD4BF] hover:underline cursor-pointer flex items-center gap-1.5 pt-0.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Choose a different photo</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-white/10 shrink-0">
            {rawImageSrc ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setRawImageSrc(null);
                  }}
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#CBD5E1] text-xs font-semibold transition-colors cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="flex-[2] py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Photo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Apply Photo</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              user?.photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isRemoving}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 min-h-[42px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isRemoving ? 'Removing Photo...' : 'Remove Photo & Use Initials'}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
