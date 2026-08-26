import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Edit3,
  RotateCcw,
  X,
  ChevronRight,
  AlertCircle,
  Check,
  Package,
  FileCheck2,
  Plane,
  Users,
  SlidersHorizontal,
  MapPin,
  Trophy,
  Zap,
} from 'lucide-react';
import { NavView, OnboardingPathResponse, OnboardingStep } from '../types';
import {
  PRESET_ONBOARDING_GOALS,
  AVAILABLE_PRODUCT_CAPABILITIES,
} from '../data/onboardingAgentData';
import {
  generateOnboardingPath,
  getSavedOnboardingState,
  saveOnboardingState,
  clearOnboardingState,
  isOnboardingDismissed,
  setOnboardingDismissed,
  SavedOnboardingState,
} from '../services/onboardingAgentService';
import { useAuth } from '../context/AuthContext';

interface OnboardingAgentCardProps {
  currentView?: NavView;
  onNavigateToView: (view: NavView, params?: any) => void;
  onOpenVisaQuote?: (country?: string) => void;
  onSelectPackage?: (pkgId: string) => void;
  className?: string;
  forceShow?: boolean;
}

const CUSTOM_GOAL_MAX_LENGTH = 140;
const REGENERATE_COOLDOWN_SECONDS = 6;

export const OnboardingAgentCard: React.FC<OnboardingAgentCardProps> = ({
  currentView,
  onNavigateToView,
  onOpenVisaQuote,
  onSelectPackage,
  className = '',
  forceShow = false,
}) => {
  const { user, isGuest } = useAuth();

  // State
  const [savedState, setSavedState] = useState<SavedOnboardingState | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState<boolean>(false);

  // Goal input states
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [customGoalText, setCustomGoalText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Async & Generation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Initial Load from persistence
  useEffect(() => {
    const existing = getSavedOnboardingState();
    const dismissed = isOnboardingDismissed();
    setIsDismissed(dismissed);

    if (existing) {
      setSavedState(existing);
      setSelectedPresetId(existing.selectedPresetId || '');
      setCustomGoalText(existing.userGoal || '');
    } else {
      // First time without saved state: show goal selector
      setIsGoalSelectorOpen(true);
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Request generation
  const handleGeneratePath = async (goalToUse: string, presetId?: string) => {
    const trimmedGoal = goalToUse.trim();
    if (!trimmedGoal) {
      setError('Please select or specify what you are trying to accomplish.');
      return;
    }

    if (cooldownRemaining > 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pathResponse = await generateOnboardingPath({
        userGoal: trimmedGoal,
        userContext: {
          userName: user?.fullName || (isGuest ? 'Guest Traveler' : 'Traveler'),
          isGuest,
          currentView,
        },
      });

      const newState: SavedOnboardingState = {
        userGoal: trimmedGoal,
        selectedPresetId: presetId || (isCustomMode ? 'custom' : selectedPresetId),
        onboardingPath: pathResponse,
        completedStepIndices: [],
        isCompleted: false,
        createdAt: Date.now(),
        lastRegeneratedAt: Date.now(),
      };

      saveOnboardingState(newState);
      setSavedState(newState);
      setIsGoalSelectorOpen(false);
      setIsDismissed(false);
      setOnboardingDismissed(false);
      setCooldownRemaining(REGENERATE_COOLDOWN_SECONDS);
    } catch (err: any) {
      console.warn('Failed to generate onboarding path:', err);
      setError(err?.message || 'Unable to generate personalized setup. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Step Completion
  const handleToggleStep = (index: number) => {
    if (!savedState) return;

    const currentCompleted = savedState.completedStepIndices || [];
    const isAlreadyCompleted = currentCompleted.includes(index);
    let newCompleted: number[];

    if (isAlreadyCompleted) {
      newCompleted = currentCompleted.filter((i) => i !== index);
    } else {
      newCompleted = [...currentCompleted, index];
    }

    const totalSteps = savedState.onboardingPath.steps.length;
    const allDone = newCompleted.length >= totalSteps && totalSteps > 0;

    const updatedState: SavedOnboardingState = {
      ...savedState,
      completedStepIndices: newCompleted,
      isCompleted: allDone,
    };

    saveOnboardingState(updatedState);
    setSavedState(updatedState);
  };

  // Action Click Handler (Route navigation)
  const handleStepAction = (target: string, stepIndex?: number) => {
    if (stepIndex !== undefined && savedState && !savedState.completedStepIndices.includes(stepIndex)) {
      handleToggleStep(stepIndex);
    }

    const normalizedTarget = target.toLowerCase();
    if (normalizedTarget.includes('package')) {
      onNavigateToView('packages');
    } else if (normalizedTarget.includes('visa')) {
      if (onOpenVisaQuote) {
        onOpenVisaQuote();
      } else {
        onNavigateToView('visa');
      }
    } else if (normalizedTarget.includes('flight')) {
      window.location.href = 'https://flights.azraqtrips.com/';
    } else if (normalizedTarget.includes('planner') || normalizedTarget.includes('concierge') || normalizedTarget.includes('itinerary')) {
      onNavigateToView('planner');
    } else if (normalizedTarget.includes('feed') || normalizedTarget.includes('budd') || normalizedTarget.includes('community')) {
      onNavigateToView('feed');
    } else if (normalizedTarget.includes('destin')) {
      onNavigateToView('destinations');
    } else {
      onNavigateToView('discover');
    }
  };

  // Reset Onboarding Handler
  const handleReset = () => {
    clearOnboardingState();
    setSavedState(null);
    setSelectedPresetId('');
    setCustomGoalText('');
    setIsCustomMode(false);
    setIsGoalSelectorOpen(true);
    setIsDismissed(false);
    setError(null);
  };

  // Dismiss / Skip Handler
  const handleDismiss = () => {
    setIsDismissed(true);
    setOnboardingDismissed(true);
  };

  // Reopen when dismissed
  const handleReopen = () => {
    setIsDismissed(false);
    setOnboardingDismissed(false);
  };

  // If dismissed and not forced, show a subtle floating trigger pill
  if (isDismissed && !forceShow) {
    return (
      <div className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="flex items-center justify-between py-2 px-4 bg-sky-50/80 border border-sky-200/80 rounded-xl text-xs text-[#0759B8] shadow-2xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#1389E8]" />
            <span className="font-semibold">
              {savedState?.isCompleted
                ? 'Personalized setup completed!'
                : savedState
                ? `Personalized Setup: ${savedState.completedStepIndices.length}/${savedState.onboardingPath.steps.length} steps completed`
                : 'Need help finding the right travel service?'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleReopen}
            className="font-bold underline hover:text-[#003B80] transition-colors cursor-pointer text-xs"
          >
            {savedState ? 'View Setup Guide' : 'Start Quick Setup'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate next uncompleted step for Next Best Action suggestion
  const uncompletedStep = savedState?.onboardingPath.steps.find(
    (_, idx) => !savedState.completedStepIndices.includes(idx)
  );

  return (
    <section className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0759B8] to-[#0A4EA3] text-white p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/15 text-sky-200 border border-white/20 text-[11px] font-bold tracking-wide uppercase font-mono">
                <Compass className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                <span>Onboarding Agent</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80 font-normal">Personalized Path</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                {savedState
                  ? savedState.onboardingPath.welcome_message || 'Your Personalized Setup'
                  : 'What are you trying to accomplish today?'}
              </h2>
              {savedState && (
                <p className="text-xs text-sky-100/90 font-medium max-w-2xl">
                  {savedState.onboardingPath.summary}
                </p>
              )}
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {savedState && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsGoalSelectorOpen(!isGoalSelectorOpen)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Change your travel goal"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-200" />
                    <span>{isGoalSelectorOpen ? 'Close' : 'Change Goal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGeneratePath(savedState.userGoal, savedState.selectedPresetId)}
                    disabled={isLoading || cooldownRemaining > 0}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Regenerate steps"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : 'Regenerate'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    title="Reset onboarding"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Indicator when state exists */}
          {savedState && (
            <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sky-200 font-medium">Progress:</span>
                <div className="w-32 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (savedState.completedStepIndices.length /
                          Math.max(1, savedState.onboardingPath.steps.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="font-bold text-white">
                  {savedState.completedStepIndices.length} of{' '}
                  {savedState.onboardingPath.steps.length} completed
                </span>
              </div>

              {uncompletedStep && (
                <div className="flex items-center gap-1.5 text-sky-100 font-medium text-[11px] sm:text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Next best action:</span>
                  <button
                    type="button"
                    onClick={() => handleStepAction(uncompletedStep.action_target)}
                    className="font-bold text-white underline hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    {uncompletedStep.action_label}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Goal Selection Drawer / Initial State */}
        {isGoalSelectorOpen && (
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select your primary goal today:
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Pick a preset or enter your custom requirement
              </span>
            </div>

            {/* Preset Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PRESET_ONBOARDING_GOALS.map((preset) => {
                const isSelected = selectedPresetId === preset.id && !isCustomMode;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomGoalText(preset.goal);
                      setIsCustomMode(false);
                      handleGeneratePath(preset.goal, preset.id);
                    }}
                    disabled={isLoading}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-[#1389E8] text-[#0759B8] font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-[13px]">{preset.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-normal">
                      {preset.category}
                    </div>
                  </button>
                );
              })}

              {/* Other / Custom Option Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomMode(true);
                  setSelectedPresetId('custom');
                }}
                className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  isCustomMode
                    ? 'bg-sky-50 border-[#1389E8] text-[#0759B8] font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="font-semibold text-[13px]">✍️ Other (Custom Goal)</div>
                <div className="text-[11px] text-slate-500 mt-1 font-normal">
                  Type your specific travel need
                </div>
              </button>
            </div>

            {/* Custom Input Field with Character Counter */}
            {isCustomMode && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">Describe what you want to achieve:</span>
                  <span
                    className={`font-mono text-[11px] ${
                      customGoalText.length > CUSTOM_GOAL_MAX_LENGTH - 20
                        ? 'text-amber-600 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {customGoalText.length}/{CUSTOM_GOAL_MAX_LENGTH}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={CUSTOM_GOAL_MAX_LENGTH}
                    value={customGoalText}
                    onChange={(e) => setCustomGoalText(e.target.value)}
                    placeholder="e.g., Finding 3-day Sylhet tea garden tour for family under ৳15,000"
                    className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0759B8] focus:border-transparent font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGeneratePath(customGoalText, 'custom');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleGeneratePath(customGoalText, 'custom')}
                    disabled={isLoading || !customGoalText.trim()}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#0759B8] hover:bg-[#003B80] disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    Create My Path
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 sm:p-12 text-center space-y-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0759B8] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Creating your setup...</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Personalizing your onboarding path using Azraq Tour verified features and instant services.
            </p>
          </div>
        )}

        {/* Error State with Retry */}
        {error && !isLoading && (
          <div className="p-5 sm:p-6 bg-red-50 border-b border-red-200 flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-bold">Could not generate onboarding path</h4>
              <p className="text-xs text-red-700">{error}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleGeneratePath(
                      customGoalText || PRESET_ONBOARDING_GOALS[0].goal,
                      selectedPresetId || PRESET_ONBOARDING_GOALS[0].id
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Retry Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Steps List View */}
        {savedState && !isLoading && !savedState.isCompleted && (
          <div className="p-5 sm:p-6 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {savedState.onboardingPath.steps.map((step, idx) => {
                const isCompleted = savedState.completedStepIndices.includes(idx);
                const isHighPriority = step.priority === 'high';

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                        : 'bg-white border-slate-200/90 shadow-2xs hover:border-[#1389E8]/40 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStep(idx)}
                          className="flex items-center gap-2 text-left cursor-pointer group"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 group-hover:text-[#0759B8] shrink-0" />
                          )}
                          <span
                            className={`text-xs font-bold ${
                              isCompleted
                                ? 'line-through text-slate-500'
                                : 'text-slate-900'
                            }`}
                          >
                            Step {idx + 1}: {step.title}
                          </span>
                        </button>

                        {isHighPriority && !isCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                            Recommended
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium pl-7">
                        {step.description}
                      </p>

                      {step.why_it_matters && (
                        <p className="text-[11px] text-slate-500 pl-7 italic">
                          💡 {step.why_it_matters}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 pl-7 flex items-center justify-between mt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleStep(idx)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        {isCompleted ? 'Mark Pending' : 'Mark Done'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStepAction(step.action_target, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0759B8] hover:bg-[#003B80] rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{step.action_label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Footer CTA */}
            {savedState.onboardingPath.primary_cta && (
              <div className="mt-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-medium text-center sm:text-left">
                  Ready to jump straight in? You can complete all steps at your own pace.
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleStepAction(savedState.onboardingPath.primary_cta.action)
                  }
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>{savedState.onboardingPath.primary_cta.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completed Celebration State */}
        {savedState && !isLoading && savedState.isCompleted && (
          <div className="p-6 sm:p-8 bg-emerald-50/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              You’re All Set!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              You’ve completed your personalized onboarding checklist for{' '}
              <strong>"{savedState.userGoal}"</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Start New Goal
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
