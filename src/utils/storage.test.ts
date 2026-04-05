import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTraceData,
  saveDailyEntry,
  getDailyEntry,
  getDayNumber,
  getPhaseForDay,
  completeOnboarding,
  clearAllData,
} from './storage';

beforeEach(() => {
  localStorage.removeItem('trace_data');
});

describe('getTraceData', () => {
  it('returns defaults when storage is empty', () => {
    const data = getTraceData();
    expect(data.system_entered).toBe(false);
    expect(data.onboarding_completed).toBe(false);
  });
});

describe('getDayNumber', () => {
  it('returns 1 when no start date exists', () => {
    expect(getDayNumber()).toBe(1);
  });

  it('returns 1 on the start date itself', () => {
    const today = new Date().toISOString();
    expect(getDayNumber(today)).toBe(1);
  });

  it('returns correct day for a past start date', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(getDayNumber(threeDaysAgo.toISOString())).toBe(4);
  });

  it('never returns less than 1', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(getDayNumber(future.toISOString())).toBe(1);
  });
});

describe('saveDailyEntry / getDailyEntry', () => {
  it('saves and retrieves a daily entry', () => {
    saveDailyEntry(1, 'test awareness', true, false, 'test reflection');
    const entry = getDailyEntry(1);
    expect(entry).toBeDefined();
    expect(entry!.awareness_text).toBe('test awareness');
    expect(entry!.alignment_done).toBe(true);
    expect(entry!.integrity_done).toBe(false);
    expect(entry!.reflection_text).toBe('test reflection');
    expect(entry!.saved_at).toBeTruthy();
  });

  it('returns undefined for missing entries', () => {
    expect(getDailyEntry(99)).toBeUndefined();
  });
});

describe('getPhaseForDay', () => {
  it('returns awareness for days 1-7', () => {
    expect(getPhaseForDay(1)).toBe('awareness');
    expect(getPhaseForDay(7)).toBe('awareness');
  });

  it('returns honesty for days 8-14', () => {
    expect(getPhaseForDay(8)).toBe('honesty');
    expect(getPhaseForDay(14)).toBe('honesty');
  });

  it('returns integrity for days 15-21', () => {
    expect(getPhaseForDay(15)).toBe('integrity');
    expect(getPhaseForDay(21)).toBe('integrity');
  });

  it('returns stabilization for days 22-30', () => {
    expect(getPhaseForDay(22)).toBe('stabilization');
    expect(getPhaseForDay(30)).toBe('stabilization');
  });
});

describe('completeOnboarding', () => {
  it('sets onboarding_completed and season_start_date', () => {
    completeOnboarding();
    const data = getTraceData();
    expect(data.onboarding_completed).toBe(true);
    expect(data.season_start_date).toBeTruthy();
  });
});

describe('clearAllData', () => {
  it('removes all trace data', () => {
    saveDailyEntry(1, 'test', true, true, 'test');
    clearAllData();
    expect(getDailyEntry(1)).toBeUndefined();
  });
});
