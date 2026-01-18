'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useLicense } from './use-license';
import { getDeviceFingerprint } from '@/lib/fingerprint';

const STORAGE_KEY = 'squeezepix_daily_usage';
const ANON_DAILY_LIMIT = 10;
const SIGNED_IN_DAILY_LIMIT = 20;

interface DailyUsage {
  date: string;
  count: number;
  fingerprint?: string;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Multi-storage: localStorage + IndexedDB for redundancy
async function getStoredUsage(fingerprint: string): Promise<DailyUsage> {
  if (typeof window === 'undefined') {
    return { date: getTodayDateString(), count: 0, fingerprint };
  }

  const today = getTodayDateString();

  // Try localStorage first
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usage = JSON.parse(stored) as DailyUsage;
      // Check if same day AND same device
      if (usage.date === today && usage.fingerprint === fingerprint) {
        return usage;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Try IndexedDB as backup
  try {
    const dbUsage = await getIndexedDBUsage(fingerprint);
    if (dbUsage && dbUsage.date === today) {
      return dbUsage;
    }
  } catch {
    // Ignore errors
  }

  return { date: today, count: 0, fingerprint };
}

async function saveUsage(usage: DailyUsage): Promise<void> {
  if (typeof window === 'undefined') return;

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage errors
  }

  // Save to IndexedDB as backup
  try {
    await setIndexedDBUsage(usage);
  } catch {
    // Ignore errors
  }
}

// IndexedDB helpers for persistent storage
function openUsageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SqueezePix', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('usage')) {
        db.createObjectStore('usage', { keyPath: 'fingerprint' });
      }
    };
  });
}

async function getIndexedDBUsage(fingerprint: string): Promise<DailyUsage | null> {
  const db = await openUsageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('usage', 'readonly');
    const store = tx.objectStore('usage');
    const request = store.get(fingerprint);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function setIndexedDBUsage(usage: DailyUsage): Promise<void> {
  const db = await openUsageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('usage', 'readwrite');
    const store = tx.objectStore('usage');
    const request = store.put(usage);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function useAnonymousUsage() {
  const [usage, setUsage] = useState<DailyUsage>({ date: getTodayDateString(), count: 0 });
  const [mounted, setMounted] = useState(false);
  const [fingerprint, setFingerprint] = useState<string>('');
  const fingerprintRef = useRef<string>('');

  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { isPro } = useLicense();

  // Generate fingerprint and load usage on mount
  useEffect(() => {
    const init = async () => {
      // Get device fingerprint
      const fp = await getDeviceFingerprint();
      setFingerprint(fp);
      fingerprintRef.current = fp;

      // Load stored usage
      const storedUsage = await getStoredUsage(fp);
      setUsage(storedUsage);
      setMounted(true);

      // Also fetch from server for signed-in users
      if (isSignedIn) {
        try {
          const response = await fetch('/api/usage', {
            headers: { 'x-device-fingerprint': fp },
          });
          if (response.ok) {
            const data = await response.json();
            const serverUsage: DailyUsage = {
              date: getTodayDateString(),
              count: data.count,
              fingerprint: fp,
            };
            setUsage(serverUsage);
            await saveUsage(serverUsage);
          }
        } catch {
          // Use local data on error
        }
      }
    };

    init();
  }, [isSignedIn]);

  // Determine daily limit based on user status
  const getDailyLimit = useCallback((): number => {
    if (isPro) return Infinity;
    if (isSignedIn) return SIGNED_IN_DAILY_LIMIT;
    return ANON_DAILY_LIMIT;
  }, [isPro, isSignedIn]);

  const incrementUsage = useCallback(async (count: number = 1) => {
    // Pro users don't need tracking
    if (isPro) return;

    const today = getTodayDateString();
    const fp = fingerprintRef.current;

    // Optimistic update
    setUsage((prev) => {
      const currentCount = prev.date === today ? prev.count : 0;
      const newUsage: DailyUsage = {
        date: today,
        count: currentCount + count,
        fingerprint: fp,
      };
      // Save locally
      saveUsage(newUsage);
      return newUsage;
    });

    // Update server for signed-in users
    if (isSignedIn) {
      try {
        await fetch('/api/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-device-fingerprint': fp,
          },
          body: JSON.stringify({ count }),
        });
      } catch {
        // Local update already done
      }
    }
  }, [isPro, isSignedIn]);

  const resetUsage = useCallback(async () => {
    const fp = fingerprintRef.current;
    const newUsage: DailyUsage = { date: getTodayDateString(), count: 0, fingerprint: fp };
    await saveUsage(newUsage);
    setUsage(newUsage);
  }, []);

  const dailyLimit = getDailyLimit();
  const todayProcessed = usage.date === getTodayDateString() ? usage.count : 0;
  const remainingToday = Math.max(0, dailyLimit - todayProcessed);
  const hasReachedLimit = mounted && authLoaded && !isPro && todayProcessed >= dailyLimit;
  const shouldShowUpgradePrompt = hasReachedLimit;

  return {
    totalProcessed: todayProcessed,
    todayProcessed,
    incrementUsage,
    resetUsage,
    hasReachedLimit,
    remainingFree: remainingToday,
    remainingToday,
    shouldShowUpgradePrompt,
    freeLimit: dailyLimit,
    dailyLimit,
    anonLimit: ANON_DAILY_LIMIT,
    signedInLimit: SIGNED_IN_DAILY_LIMIT,
    isUnlimited: isPro,
    mounted,
    fingerprint,
  };
}
