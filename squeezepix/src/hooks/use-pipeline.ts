'use client';

import { useCallback, useMemo } from 'react';
import { usePipelineStore, DEFAULT_PRESETS } from '@/stores/pipeline-store';
import type { PipelineStep, Preset } from '@/types/pipeline';

interface UsePipelineReturn {
  // State
  steps: PipelineStep[];
  activePresetId: string | null;
  customPresets: Preset[];

  // Computed
  enabledSteps: PipelineStep[];
  sortedSteps: PipelineStep[];
  activePreset: Preset | null;
  allPresets: Preset[];
  isWebpEnabled: boolean;
  isGeoTagEnabled: boolean;

  // Actions
  toggleStep: (stepId: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  updateStepSettings: (stepId: string, settings: Record<string, unknown>) => void;
  setPreset: (presetId: string) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (presetId: string) => void;
  resetToDefaults: () => void;

  // Utilities
  getStepById: (stepId: string) => PipelineStep | undefined;
  isStepEnabled: (stepType: string) => boolean;
  getExpectedOutputFormat: () => 'WebP' | 'JPEG' | 'Original';
}

/**
 * Hook for managing the processing pipeline state
 *
 * Usage:
 * const {
 *   steps,
 *   enabledSteps,
 *   toggleStep,
 *   reorderSteps,
 *   setPreset,
 *   getExpectedOutputFormat,
 * } = usePipeline();
 */
export function usePipeline(): UsePipelineReturn {
  const steps = usePipelineStore((state) => state.steps);
  const activePresetId = usePipelineStore((state) => state.activePresetId);
  const customPresets = usePipelineStore((state) => state.customPresets);

  const toggleStep = usePipelineStore((state) => state.toggleStep);
  const reorderSteps = usePipelineStore((state) => state.reorderSteps);
  const updateStepSettings = usePipelineStore((state) => state.updateStepSettings);
  const setPreset = usePipelineStore((state) => state.setPreset);
  const saveCustomPreset = usePipelineStore((state) => state.saveCustomPreset);
  const deleteCustomPreset = usePipelineStore((state) => state.deleteCustomPreset);
  const resetToDefaults = usePipelineStore((state) => state.resetToDefaults);
  const getStepById = usePipelineStore((state) => state.getStepById);
  const getEnabledSteps = usePipelineStore((state) => state.getEnabledSteps);

  // Computed values
  const enabledSteps = useMemo(() => getEnabledSteps(), [steps]);
  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps]
  );

  const allPresets = useMemo(
    () => [...DEFAULT_PRESETS, ...customPresets],
    [customPresets]
  );

  const activePreset = useMemo(
    () => allPresets.find((p) => p.id === activePresetId) || null,
    [allPresets, activePresetId]
  );

  const isWebpEnabled = useMemo(
    () => enabledSteps.some((s) => s.type === 'convertWebp'),
    [enabledSteps]
  );

  const isGeoTagEnabled = useMemo(
    () => enabledSteps.some((s) => s.type === 'geoTag'),
    [enabledSteps]
  );

  // Utility functions
  const isStepEnabled = useCallback(
    (stepType: string) => enabledSteps.some((s) => s.type === stepType),
    [enabledSteps]
  );

  const getExpectedOutputFormat = useCallback((): 'WebP' | 'JPEG' | 'Original' => {
    if (isWebpEnabled) {
      return 'WebP';
    }
    if (isGeoTagEnabled) {
      return 'JPEG'; // Geo-tagging requires JPEG
    }
    return 'Original';
  }, [isWebpEnabled, isGeoTagEnabled]);

  return {
    // State
    steps,
    activePresetId,
    customPresets,

    // Computed
    enabledSteps,
    sortedSteps,
    activePreset,
    allPresets,
    isWebpEnabled,
    isGeoTagEnabled,

    // Actions
    toggleStep,
    reorderSteps,
    updateStepSettings,
    setPreset,
    saveCustomPreset,
    deleteCustomPreset,
    resetToDefaults,

    // Utilities
    getStepById,
    isStepEnabled,
    getExpectedOutputFormat,
  };
}
