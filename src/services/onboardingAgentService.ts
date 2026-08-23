import { OnboardingPathResponse, OnboardingStep } from '../types';
import {
  AVAILABLE_PRODUCT_CAPABILITIES,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_DISMISSED_KEY,
} from '../data/onboardingAgentData';

export interface SavedOnboardingState {
  userGoal: string;
  selectedPresetId?: string;
  onboardingPath: OnboardingPathResponse;
  completedStepIndices: number[];
  isCompleted: boolean;
  createdAt: number;
  lastRegeneratedAt?: number;
}

/**
 * Loads saved onboarding progress from localStorage
 */
export function getSavedOnboardingState(): SavedOnboardingState | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves onboarding progress to localStorage
 */
export function saveOnboardingState(state: SavedOnboardingState): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to persist onboarding state:', err);
  }
}

/**
 * Clears saved onboarding state
 */
export function clearOnboardingState(): void {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_DISMISSED_KEY);
  } catch (err) {
    console.warn('Failed to clear onboarding state:', err);
  }
}

/**
 * Checks if user explicitly dismissed the onboarding banner
 */
export function isOnboardingDismissed(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sets dismissed flag
 */
export function setOnboardingDismissed(dismissed: boolean): void {
  try {
    if (dismissed) {
      localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    } else {
      localStorage.removeItem(ONBOARDING_DISMISSED_KEY);
    }
  } catch {}
}

/**
 * Calls the Onboarding Agent API to generate a personalized path
 */
export async function generateOnboardingPath(params: {
  userGoal: string;
  userContext?: {
    userName?: string;
    isGuest: boolean;
    savedTripsCount?: number;
    currentView?: string;
  };
}): Promise<OnboardingPathResponse> {
  const response = await fetch('/api/ai/onboarding-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userGoal: params.userGoal,
      autoContext: {
        platform: 'Azraq Tour Bangladesh Travel Portal',
        user: params.userContext || { isGuest: true },
      },
      availableCapabilities: AVAILABLE_PRODUCT_CAPABILITIES,
      currentUserState: {
        isLoggedIn: !params.userContext?.isGuest,
        currentView: params.userContext?.currentView || 'discover',
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned ${response.status}`);
  }

  const json = await response.json();
  if (!json.success || !json.data) {
    throw new Error('Invalid onboarding path received from server');
  }

  return json.data as OnboardingPathResponse;
}
