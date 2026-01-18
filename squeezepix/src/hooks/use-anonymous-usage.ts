'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useLicense } from './use-license';

const STORAGE_KEY = 'squeezepix_daily_usage';
const ANON_DAILY_LIMIT = 10;
const SIGNED_IN_DAILY_LIMIT = 20;

interface DailyUsage {
  date: string; // YYYY-MM-DD format
  count: number;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getStoredUsage(): DailyUsage {
  if (typeof window === 'undefined') {
    return { date: getTodayDateString(), count: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usage = JSON.parse(stored) as DailyUsage;
      // Reset if it's a new day
      if (usage.date !== getTodayDateString()) {
        return { date: getTodayDateString(), count: 0 };
      }
      return usage;
    }
  } catch {
    // Ignore parse errors
  }

  return { date: getTodayDateString(), count: 0 };
}

function saveUsage(usage: DailyUsage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

export function useAnonymousUsage() {
  const [usage, setUsage] = useState<DailyUsage>({ date: getTodayDateString(), count: 0 });
  const [mounted, setMounted] = useState(false);

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { isPro } = useLicense();

  // Load from localStorage on mount
  useEffect(() => {
    setUsage(getStoredUsage());
    setMounted(true);
  }, []);

  // Determine daily limit based on user status
  const getDailyLimit = useCallback((): number => {
    if (isPro) return Infinity;
    if (isSignedIn) return SIGNED_IN_DAILY_LIMIT;
    return ANON_DAILY_LIMIT;
  }, [isPro, isSignedIn]);

  const incrementUsage = useCallback((count: number = 1) => {
    // Pro users don't need tracking
    if (isPro) return;

    setUsage((prev) => {
      const today = getTodayDateString();
      // Reset if new day
      const currentCount = prev.date === today ? prev.count : 0;

      const newUsage: DailyUsage = {
        date: today,
        count: currentCount + count,
      };
      saveUsage(newUsage);
      return newUsage;
    });
  }, [isPro]);

  const resetUsage = useCallback(() => {
    const newUsage: DailyUsage = { date: getTodayDateString(), count: 0 };
    saveUsage(newUsage);
    setUsage(newUsage);
  }, []);

  const dailyLimit = getDailyLimit();
  const todayProcessed = usage.date === getTodayDateString() ? usage.count : 0;
  const remainingToday = Math.max(0, dailyLimit - todayProcessed);
  const hasReachedLimit = mounted && authLoaded && !isPro && todayProcessed >= dailyLimit;
  const shouldShowUpgradePrompt = hasReachedLimit;

  return {
    totalProcessed: todayProcessed, // Renamed for backward compatibility
    todayProcessed,
    incrementUsage,
    resetUsage,
    hasReachedLimit,
    remainingFree: remainingToday, // Renamed for backward compatibility
    remainingToday,
    shouldShowUpgradePrompt,
    freeLimit: dailyLimit, // Current user's limit
    dailyLimit,
    anonLimit: ANON_DAILY_LIMIT,
    signedInLimit: SIGNED_IN_DAILY_LIMIT,
    isUnlimited: isPro,
    mounted,
  };
}
