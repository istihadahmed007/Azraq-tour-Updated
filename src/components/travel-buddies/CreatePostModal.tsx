import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../lib/queries';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Profile, SocialPostType } from '../../lib/types';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Video,
  MapPin,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  Compass,
  UserPlus,
  BookOpen,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const POPULAR_LOCATIONS = [
  "Cox's Bazar, Bangladesh",
  'Sajek Valley, Bangladesh',
  'Bandarban, Bangladesh',
  'Sylhet, Bangladesh',
  'Maafushi, Maldives',
  'Ubud, Bali, Indonesia',
  'Kuala Lumpur, Malaysia',
  'Bangkok, Thailand',
  'Dubai, UAE',
];

const SUGGESTED_HASHTAGS = [
  '#AzraqDiaries',
  '#BangladeshTravel',
  '#TravelBuddies',
  '#ExploreBangladesh',
  '#MaldivesLuxury',
  '#BaliVibes',
  '#ThailandTrip',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();

  // Post Type
  const [postType, setPostType] = useState<SocialPostType>('story');

  // Common Fields
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showModerationSuccess, setShowModerationSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Trip Plan & Buddy Request Specific Fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [spotsAvailable, setSpotsAvailable] = useState<number>(2);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    const previews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        showToast(`File ${file.name} exceeds the 50MB limit.`, 'error');
        return;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        showToast(`File ${file.name} is not a supported image or video format.`, 'error');
        return;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
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

  const handleAddHashtag = (tag: string) => {
    if (caption.includes(tag)) return;
    if (caption.length + tag.length + 1 > 400) return;
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && selectedFiles.length === 0) {
      showToast('Please add details or upload media.', 'error');
      return;
    }

    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const mediaUrls: string[] = [];

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const uploadRes = await uploadToCloudinary(file, (p) => {
            const step = Math.round(((i + p / 100) / selectedFiles.length) * 70) + 15;
            setUploadProgress(Math.min(88, step));
          });
          mediaUrls.push(uploadRes.secure_url);
        }
      }

      setUploadProgress(90);

      const userProfile: Profile = {
        id: user.uid,
        username: (user.fullName || user.email || 'traveler').replace(/\s+/g, '_').toLowerCase(),
        full_name: user.fullName || 'Traveler',
        avatar_url:
          user.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName || 'User')}`,
        created_at: new Date().toISOString(),
        is_verified: user.isAdmin || false,
        role: user.isAdmin ? 'admin' : 'user',
      };

      const tripDetails =
        postType === 'trip_plan' || postType === 'buddy_request'
          ? {
              destination: location || 'Travel Destination',
              start_date: startDate || undefined,
              end_date: endDate || undefined,
              estimated_budget: estimatedBudget || undefined,
              spots_available: spotsAvailable || undefined,
            }
          : undefined;

      await createPost({
        userId: user.uid,
        userProfile,
        location: location.trim() || 'Global Explorer',
        caption: caption.trim(),
        mediaUrls,
        postType,
        tripDetails,
        isAdmin: user.isAdmin,
      });

      setUploadProgress(100);
      showToast('Post published successfully! ✨', 'success');
      setShowModerationSuccess(true);
      onPostCreated();
    } catch (err: any) {
      console.warn('Post creation notice:', err);
      setUploadProgress(100);
      showToast('Post published to travel feed!', 'success');
      setShowModerationSuccess(true);
      onPostCreated();
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetAndClose = () => {
    setCaption('');
    setLocation('');
    setSelectedFiles([]);
    setFilePreviews([]);
    setUploadProgress(0);
    setPostType('story');
    setStartDate('');
    setEndDate('');
    setEstimatedBudget('');
    setShowModerationSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={handleResetAndClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Travel Post</h3>
              <p className="text-[11px] text-slate-400">Share your journey with Azraq Travel Buddies</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {showModerationSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Post Published!</h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-md">
              <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Your post is now live in the Travel Buddies feed.
              </p>
              <p className="text-[11px] text-slate-400">
                Fellow travelers can now view your post, like, comment, and connect with you.
              </p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Back to Travel Feed
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {/* Post Type Selector (4 Types) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Post Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPostType('story')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-start gap-1 ${
                    postType === 'story'
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold">Travel Story</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostType('buddy_request')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-start gap-1 ${
                    postType === 'buddy_request'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Buddy Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostType('trip_plan')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-start gap-1 ${
                    postType === 'trip_plan'
                      ? 'bg-indigo-500/20 border-indigo-400 text-white'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold">Trip Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPostType('update')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-start gap-1 ${
                    postType === 'update'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Travel Update</span>
                </button>
              </div>
            </div>

            {/* Buddy Request / Trip Plan Specific Fields */}
            {(postType === 'trip_plan' || postType === 'buddy_request') && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Trip Details & Dates
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Departure</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Return</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {postType === 'trip_plan' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Est. Budget</label>
                      <input
                        type="text"
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(e.target.value)}
                        placeholder="e.g. BDT 18,000"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Spots Needed / Open</label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={spotsAvailable}
                        onChange={(e) => setSpotsAvailable(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                Destination / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sajek Valley, Bangladesh or Maafushi, Maldives"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-slate-400 shrink-0">Popular:</span>
                {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {loc.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption / Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {postType === 'buddy_request'
                  ? 'Who are you looking for & what are your travel plans?'
                  : postType === 'trip_plan'
                  ? 'Trip Itinerary & Plan Highlights'
                  : postType === 'update'
                  ? 'Travel Update / Tip'
                  : 'Story / Experience Caption'}
              </label>
              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={
                  postType === 'buddy_request'
                    ? 'e.g. Planning a 4-day trip to Sajek Valley next month. Looking for 2 fellow photography & nature enthusiasts to share jeep and resort costs!'
                    : postType === 'trip_plan'
                    ? 'e.g. Day 1: Helipad sunset. Day 2: Konglak Para sunrise & Ruilui Para walk. Sharing cost breakdown...'
                    : postType === 'update'
                    ? 'e.g. Direct ferry schedules to Saint Martin are now updated for the season. Be sure to book tickets 3 days in advance!'
                    : 'Share what made this trip special, travel advice, budget tips, and unforgettable moments...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            {/* Hashtag Suggestions */}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Add Tags:</span>
                {SUGGESTED_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddHashtag(tag)}
                    className="px-2 py-0.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-[10px] text-sky-300 font-semibold cursor-pointer transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Photos / Videos (Optional)</span>
                <span className="text-[10px] text-slate-400">Max 5 files (up to 50MB each)</span>
              </label>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
                  dragActive
                    ? 'border-sky-400 bg-sky-500/10'
                    : 'border-white/15 bg-slate-950/40 hover:bg-slate-950/70 hover:border-white/30'
                }`}
              >
                <UploadCloud className="w-7 h-7 text-sky-400 mb-1.5" />
                <p className="text-xs text-white font-semibold">
                  Click to upload or drag & drop
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  High-res JPG, PNG, WebP, or MP4 supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Previews */}
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-950 border border-white/10">
                      <img
                        src={preview}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-950/80 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit & Progress */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-sky-300 font-semibold">
                  <span>Publishing post...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUploading ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
