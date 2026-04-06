const STORAGE_KEY = 'trace_data';

interface DailyEntry {
  awareness_text: string;
  alignment_done: boolean;
  integrity_done: boolean;
  reflection_text: string;
  saved_at: string;
}

interface TraceData {
  system_entered: boolean;
  onboarding_completed: boolean;
  onboarding_avoidance_text?: string;
  onboarding_anti_drift_text?: string;
  season_start_date?: string;
  daily_entries?: Record<number, DailyEntry>;
  milestone_day_7?: string;
  milestone_day_14?: string;
  milestone_day_30?: {
    what_changed: string;
    what_stayed: string;
    next_effort: string;
  };
  season_closed?: boolean;
}

export const getTraceData = (): TraceData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { system_entered: false, onboarding_completed: false };
};

export const saveOnboardingData = (
  avoidanceText: string,
  antiDriftText: string
) => {
  const data = getTraceData();
  data.onboarding_avoidance_text = avoidanceText;
  data.onboarding_anti_drift_text = antiDriftText;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const completeOnboarding = () => {
  const data = getTraceData();
  data.onboarding_completed = true;
  data.season_start_date = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const isSystemEntered = (): boolean => {
  return getTraceData().system_entered;
};

export const enterSystem = () => {
  const data = getTraceData();
  data.system_entered = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};


export const isOnboardingCompleted = (): boolean => {
  return getTraceData().onboarding_completed;
};

/**
 * Returns the current day number based on completed entries (not calendar days).
 * Day = number of saved entries + 1 (for today), capped at 30.
 */
export const getDayNumber = (_seasonStartDate?: string): number => {
  const data = getTraceData();
  const entries = data.daily_entries || {};
  const completedCount = Object.values(entries).filter(e => e.saved_at).length;
  // Next day to fill = completedCount + 1, capped at 30
  return Math.min(completedCount + 1, 30);
};

/**
 * Check if today's entry has already been saved (one entry per calendar day).
 */
export const isTodaySaved = (): boolean => {
  const data = getTraceData();
  const entries = data.daily_entries || {};
  const today = new Date().toISOString().split('T')[0];
  return Object.values(entries).some(e => {
    if (!e.saved_at) return false;
    return e.saved_at.split('T')[0] === today;
  });
};

export const getDailyEntry = (dayNumber: number): DailyEntry | undefined => {
  const data = getTraceData();
  return data.daily_entries?.[dayNumber];
};

export const saveDailyEntry = (
  dayNumber: number,
  awarenessText: string,
  alignmentDone: boolean,
  integrityDone: boolean,
  reflectionText: string
) => {
  const data = getTraceData();
  if (!data.daily_entries) {
    data.daily_entries = {};
  }

  data.daily_entries[dayNumber] = {
    awareness_text: awarenessText,
    alignment_done: alignmentDone,
    integrity_done: integrityDone,
    reflection_text: reflectionText,
    saved_at: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveMilestoneDay7 = (response: string) => {
  const data = getTraceData();
  data.milestone_day_7 = response;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveMilestoneDay14 = (response: string) => {
  const data = getTraceData();
  data.milestone_day_14 = response;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const saveMilestoneDay30 = (
  whatChanged: string,
  whatStayed: string,
  nextEffort: string
) => {
  const data = getTraceData();
  data.milestone_day_30 = {
    what_changed: whatChanged,
    what_stayed: whatStayed,
    next_effort: nextEffort,
  };
  data.season_closed = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getPhaseForDay = (dayNumber: number): string => {
  if (dayNumber >= 1 && dayNumber <= 7) return 'awareness';
  if (dayNumber >= 8 && dayNumber <= 14) return 'honesty';
  if (dayNumber >= 15 && dayNumber <= 21) return 'integrity';
  if (dayNumber >= 22 && dayNumber <= 30) return 'stabilization';
  return 'stabilization';
};

export const getContextLineForDay = (): string => {
  return '';
};

export const isSeasonClosed = (): boolean => {
  return getTraceData().season_closed || false;
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
