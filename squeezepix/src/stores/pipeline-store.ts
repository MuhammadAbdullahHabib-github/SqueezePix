'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pipeline, PipelineStep, PipelineStepSettings, Preset } from '@/types/pipeline';
import { DEFAULT_PIPELINE_STEPS } from '@/types/pipeline';

interface PipelineStore {
  steps: PipelineStep[];
  activePresetId: string | null;
  customPresets: Preset[];

  // Actions
  toggleStep: (stepId: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  updateStepSettings: (stepId: string, settings: Partial<PipelineStepSettings>) => void;
  setPreset: (presetId: string) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (presetId: string) => void;
  resetToDefaults: () => void;

  // Computed getters
  getEnabledSteps: () => PipelineStep[];
  getStepById: (stepId: string) => PipelineStep | undefined;
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set, get) => ({
      steps: [...DEFAULT_PIPELINE_STEPS],
      activePresetId: null,
      customPresets: [],

      toggleStep: (stepId: string) => {
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId ? { ...step, enabled: !step.enabled } : step
          ),
          activePresetId: null, // Clear preset when manually changing
        }));
      },

      reorderSteps: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newSteps = [...state.steps];
          const [removed] = newSteps.splice(fromIndex, 1);
          newSteps.splice(toIndex, 0, removed);

          // Update order numbers
          const reorderedSteps = newSteps.map((step, index) => ({
            ...step,
            order: index + 1,
          }));

          return {
            steps: reorderedSteps,
            activePresetId: null, // Clear preset when manually reordering
          };
        });
      },

      updateStepSettings: (stepId: string, settings: Partial<PipelineStepSettings>) => {
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId
              ? { ...step, settings: { ...step.settings, ...settings } }
              : step
          ),
        }));
      },

      setPreset: (presetId: string) => {
        const { customPresets } = get();
        const preset = [...DEFAULT_PRESETS, ...customPresets].find((p) => p.id === presetId);

        if (preset) {
          set({
            steps: [...preset.steps],
            activePresetId: presetId,
          });
        }
      },

      saveCustomPreset: (name: string) => {
        const { steps, customPresets } = get();
        const newPreset: Preset = {
          id: `custom-${Date.now()}`,
          name,
          description: 'Custom preset',
          steps: [...steps],
          isDefault: false,
          createdAt: new Date().toISOString(),
        };

        set({
          customPresets: [...customPresets, newPreset],
          activePresetId: newPreset.id,
        });
      },

      deleteCustomPreset: (presetId: string) => {
        set((state) => ({
          customPresets: state.customPresets.filter((p) => p.id !== presetId),
          activePresetId: state.activePresetId === presetId ? null : state.activePresetId,
        }));
      },

      resetToDefaults: () => {
        set({
          steps: [...DEFAULT_PIPELINE_STEPS],
          activePresetId: null,
        });
      },

      getEnabledSteps: () => {
        return get()
          .steps.filter((step) => step.enabled)
          .sort((a, b) => a.order - b.order);
      },

      getStepById: (stepId: string) => {
        return get().steps.find((step) => step.id === stepId);
      },
    }),
    {
      name: 'squeezepix-pipeline',
      version: 2, // Bump version when requiresPro changes
      partialize: (state) => ({
        steps: state.steps,
        activePresetId: state.activePresetId,
        customPresets: state.customPresets,
      }),
      // Migration function for version changes
      migrate: (persistedState, version) => {
        // For any old version, just return the state - merge will handle it
        return persistedState as PipelineStore;
      },
      // Merge persisted state with defaults, always using code's requiresPro value
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PipelineStore> | undefined;
        if (!persisted?.steps) {
          return currentState;
        }

        // Merge steps: use persisted enabled/settings but code's requiresPro
        const mergedSteps = DEFAULT_PIPELINE_STEPS.map((defaultStep) => {
          const persistedStep = persisted.steps?.find((s) => s.id === defaultStep.id);
          if (persistedStep) {
            // Special handling for Geo-Tag: Always disable on reload and clear location
            // This ensures users must explicitly enable and select a city each session
            if (defaultStep.type === 'geoTag') {
              return {
                ...defaultStep,
                enabled: false,
                settings: { ...defaultStep.settings, geoLocation: undefined },
              };
            }

            // Special handling for Compress: Clear maxSizeKB on reload
            // This ensures users start with a fresh/empty Max Size field each session
            if (defaultStep.type === 'compress') {
              return {
                ...defaultStep,
                enabled: persistedStep.enabled,
                settings: { ...persistedStep.settings, maxSizeKB: undefined },
              };
            }

            return {
              ...defaultStep,
              enabled: persistedStep.enabled,
              settings: persistedStep.settings,
              // Always use code's requiresPro (not persisted)
            };
          }
          return defaultStep;
        });

        return {
          ...currentState,
          steps: mergedSteps,
          activePresetId: persisted.activePresetId ?? null,
          customPresets: persisted.customPresets ?? [],
        };
      },
    }
  )
);

// Default presets
export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'quick-optimize',
    name: 'Quick Optimize',
    description: 'Fast compression and WebP conversion',
    isDefault: true,
    steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
      ...step,
      enabled: step.type === 'compress' || step.type === 'convertWebp',
    })),
  },
  {
    id: 'privacy-first',
    name: 'Privacy First',
    description: 'Remove EXIF, compress, and convert to WebP',
    isDefault: true,
    steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
      ...step,
      enabled: ['removeExif', 'compress', 'convertWebp'].includes(step.type),
    })),
  },
  {
    id: 'local-seo',
    name: 'Local SEO',
    description: 'Geo-tagged JPEG for local business SEO (no WebP)',
    isDefault: true,
    steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
      ...step,
      // Enable: removeExif, compress, geoTag | Disable: convertWebp, altText
      enabled: ['removeExif', 'compress', 'geoTag'].includes(step.type),
    })),
  },
  {
    id: 'web-performance',
    name: 'Web Performance',
    description: 'Maximum compression + WebP for fastest loading',
    isDefault: true,
    steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
      ...step,
      enabled: ['removeExif', 'compress', 'convertWebp'].includes(step.type),
      // Set lower quality for max compression
      settings: step.type === 'compress' ? { quality: 70 } : step.settings,
    })),
  },
];
