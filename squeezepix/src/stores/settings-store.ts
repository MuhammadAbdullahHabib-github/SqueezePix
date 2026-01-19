'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeoCity } from '@/types/geo';

interface SettingsStore {
  // Processing settings
  defaultQuality: number;
  defaultCity: GeoCity | null;

  // Export settings
  includeMetadataCsv: boolean;

  // UI preferences
  showPreview: boolean;
  autoProcess: boolean;

  // Actions
  setDefaultQuality: (quality: number) => void;
  setDefaultCity: (city: GeoCity | null) => void;
  toggleMetadataCsv: () => void;
  toggleShowPreview: () => void;
  toggleAutoProcess: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  defaultQuality: 80,
  defaultCity: null,
  includeMetadataCsv: true,
  showPreview: true,
  autoProcess: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setDefaultQuality: (quality: number) => {
        set({ defaultQuality: Math.min(100, Math.max(1, quality)) });
      },

      setDefaultCity: (city: GeoCity | null) => {
        set({ defaultCity: city });
      },

      toggleMetadataCsv: () => {
        set((state) => ({ includeMetadataCsv: !state.includeMetadataCsv }));
      },

      toggleShowPreview: () => {
        set((state) => ({ showPreview: !state.showPreview }));
      },

      toggleAutoProcess: () => {
        set((state) => ({ autoProcess: !state.autoProcess }));
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'squeezepix-settings',
    }
  )
);
