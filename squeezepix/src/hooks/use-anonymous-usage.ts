'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'squeezepix_anonymous_usage';
const FREE_LIMIT = 10;

interface AnonymousUsage {
  totalProcessed: number;
  lastProcessedAt: string | null;
}

function getStoredUsage(): AnonymousUsage {
  if (typeof window === 'undefined') {
    return { totalProcessed: 0, lastProcessedAt: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return { totalProcessed: 0, lastProcessedAt: null };
}

function saveUsage(usage: AnonymousUsage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

export function useAnonymousUsage() {
  const [usage, setUsage] = useState<AnonymousUsage>({ totalProcessed: 0, lastProcessedAt: null });
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setUsage(getStoredUsage());
    setMounted(true);
  }, []);

  const incrementUsage = useCallback((count: number = 1) => {
    setUsage((prev) => {
      const newUsage: AnonymousUsage = {
        totalProcessed: prev.totalProcessed + count,
        lastProcessedAt: new Date().toISOString(),
      };
      saveUsage(newUsage);
      return newUsage;
    });
  }, []);

  const resetUsage = useCallback(() => {
    const newUsage: AnonymousUsage = { totalProcessed: 0, lastProcessedAt: null };
    saveUsage(newUsage);
    setUsage(newUsage);
  }, []);

  const hasReachedLimit = mounted && usage.totalProcessed >= FREE_LIMIT;
  const remainingFree = Math.max(0, FREE_LIMIT - usage.totalProcessed);
  const shouldShowUpgradePrompt = mounted && usage.totalProcessed >= FREE_LIMIT;

  return {
    totalProcessed: usage.totalProcessed,
    lastProcessedAt: usage.lastProcessedAt,
    incrementUsage,
    resetUsage,
    hasReachedLimit,
    remainingFree,
    shouldShowUpgradePrompt,
    freeLimit: FREE_LIMIT,
    mounted,
  };
}
