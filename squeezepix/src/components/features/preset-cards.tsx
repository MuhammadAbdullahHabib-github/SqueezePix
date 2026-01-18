'use client';

import { usePipelineStore, DEFAULT_PRESETS } from '@/stores/pipeline-store';
import { useLicense } from '@/hooks/use-license';
import { cn } from '@/lib/utils';
import { Zap, Shield, MapPin, Gauge, Sparkles, Check, Lock, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { UpgradeModal } from './upgrade-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PresetCardProps {
  preset: (typeof DEFAULT_PRESETS)[0];
  isActive: boolean;
  isLocked?: boolean;
  onSelect: () => void;
  onUpgradeClick: () => void;
}

const presetConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    shortDescription: string;
    gradient: string;
  }
> = {
  'quick-optimize': {
    icon: Zap,
    shortDescription: 'Compress + WebP',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  'privacy-first': {
    icon: Shield,
    shortDescription: 'Remove EXIF + compress',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  'local-seo': {
    icon: MapPin,
    shortDescription: 'Geo-tag for local business',
    gradient: 'from-emerald-500/20 to-green-500/20',
  },
  'web-performance': {
    icon: Gauge,
    shortDescription: 'Max compress + WebP',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  'full-seo': {
    icon: Sparkles,
    shortDescription: 'All features',
    gradient: 'from-yellow-500/20 to-amber-500/20',
  },
};

function PresetCard({
  preset,
  isActive,
  isLocked = false,
  onSelect,
  onUpgradeClick,
}: PresetCardProps) {
  const config = presetConfig[preset.id] || {
    icon: Zap,
    shortDescription: preset.description,
    gradient: 'from-gray-500/20 to-gray-600/20',
  };
  const Icon = config.icon;

  const handleClick = () => {
    if (isLocked) {
      onUpgradeClick();
    } else {
      onSelect();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group relative flex w-full flex-col items-center justify-center gap-1 rounded-md border p-2 transition-all',
        isActive
          ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/50'
          : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50',
        isLocked && 'opacity-70 hover:opacity-100'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-2 w-2" />
        </div>
      )}

      {/* Lock indicator for Pro presets */}
      {isLocked && (
        <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white">
          <Lock className="h-2 w-2" />
        </div>
      )}

      {/* Icon with gradient background */}
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br',
          config.gradient,
          isActive && 'scale-110'
        )}
      >
        <Icon
          className={cn(
            'h-3.5 w-3.5 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
      </div>

      {/* Preset name */}
      <span
        className={cn(
          'text-center text-xs font-semibold leading-tight',
          isActive ? 'text-primary' : 'text-foreground'
        )}
      >
        {preset.name}
      </span>

      {/* Short description */}
      <span className="text-center text-[11px] leading-tight text-muted-foreground">
        {config.shortDescription}
      </span>

      {/* Pro badge */}
      {isLocked && (
        <span className="absolute bottom-1 rounded bg-black px-1 py-0.5 text-[8px] font-bold text-white dark:bg-white dark:text-black">
          PRO
        </span>
      )}
    </button>
  );
}

// Number of presets to show in the main view
const VISIBLE_PRESET_COUNT = 2;

export function PresetCards() {
  const activePresetId = usePipelineStore((state) => state.activePresetId);
  const customPresets = usePipelineStore((state) => state.customPresets);
  const setPreset = usePipelineStore((state) => state.setPreset);
  const resetToDefaults = usePipelineStore((state) => state.resetToDefaults);
  const { isPro } = useLicense();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAllPresetsModal, setShowAllPresetsModal] = useState(false);
  const [presetOrder, setPresetOrder] = useState<string[]>(() =>
    DEFAULT_PRESETS.map((p) => p.id)
  );

  // Determine which presets require Pro (currently none, but extensible)
  const proPresetIds: string[] = []; // e.g., ['full-seo'] if you want to lock certain presets

  // Ordered presets based on presetOrder state
  const orderedPresets = useMemo(() => {
    const orderedDefaults = presetOrder
      .map((id) => DEFAULT_PRESETS.find((p) => p.id === id))
      .filter(Boolean) as typeof DEFAULT_PRESETS;

    // Add any new default presets not in the order
    DEFAULT_PRESETS.forEach((p) => {
      if (!presetOrder.includes(p.id)) {
        orderedDefaults.push(p);
      }
    });

    return [...orderedDefaults, ...customPresets];
  }, [presetOrder, customPresets]);

  // Visible presets (first 2)
  const visiblePresets = useMemo(() => {
    // If there's an active preset, make sure it's visible
    if (activePresetId) {
      const activeIndex = orderedPresets.findIndex((p) => p.id === activePresetId);
      if (activeIndex >= VISIBLE_PRESET_COUNT) {
        // Move active preset to the front
        const reordered = [...orderedPresets];
        const [active] = reordered.splice(activeIndex, 1);
        reordered.unshift(active);
        return reordered.slice(0, VISIBLE_PRESET_COUNT);
      }
    }
    return orderedPresets.slice(0, VISIBLE_PRESET_COUNT);
  }, [orderedPresets, activePresetId]);

  // Handle preset selection from modal
  const handleSelectFromModal = useCallback(
    (presetId: string) => {
      // Move selected preset to the front of the order
      setPresetOrder((prev) => {
        const filtered = prev.filter((id) => id !== presetId);
        return [presetId, ...filtered];
      });
      setPreset(presetId);
      setShowAllPresetsModal(false);
    },
    [setPreset]
  );

  // Handle clearing preset from modal
  const handleClearPreset = useCallback(() => {
    resetToDefaults();
    setShowAllPresetsModal(false);
  }, [resetToDefaults]);

  // Count of hidden presets
  const hiddenCount = orderedPresets.length - VISIBLE_PRESET_COUNT;

  return (
    <div className="space-y-1.5">
      {/* Fixed 2-column grid for visible preset cards */}
      <div className="grid grid-cols-2 gap-1.5">
        {visiblePresets.map((preset) => {
          const isLocked = proPresetIds.includes(preset.id) && !isPro;
          return (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={activePresetId === preset.id}
              isLocked={isLocked}
              onSelect={() => setPreset(preset.id)}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          );
        })}
      </div>

      {/* More button */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAllPresetsModal(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-border py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
          <span>More presets ({hiddenCount})</span>
        </button>
      )}

      {/* Reset link */}
      {activePresetId && (
        <button
          onClick={resetToDefaults}
          className="text-xs text-muted-foreground hover:text-red-500 hover:underline"
        >
          Clear preset
        </button>
      )}

      {/* All Presets Modal */}
      <Dialog open={showAllPresetsModal} onOpenChange={setShowAllPresetsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>All Presets</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {/* Custom/None option */}
            <button
              onClick={handleClearPreset}
              className={cn(
                'group relative flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
                !activePresetId
                  ? 'border-primary bg-primary/10 ring-1 ring-primary/50'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              {/* Active indicator */}
              {!activePresetId && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}

              {/* Icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-500/20 to-slate-500/20">
                <SlidersHorizontal
                  className={cn(
                    'h-4 w-4 transition-colors',
                    !activePresetId
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
              </div>

              {/* Name */}
              <span
                className={cn(
                  'text-center text-xs font-semibold leading-tight',
                  !activePresetId ? 'text-primary' : 'text-foreground'
                )}
              >
                Custom
              </span>

              {/* Description */}
              <span className="text-center text-[10px] leading-tight text-muted-foreground">
                Manual configuration
              </span>
            </button>

            {orderedPresets.map((preset) => {
              const isLocked = proPresetIds.includes(preset.id) && !isPro;
              const config = presetConfig[preset.id] || {
                icon: Zap,
                shortDescription: preset.description,
                gradient: 'from-gray-500/20 to-gray-600/20',
              };
              const Icon = config.icon;
              const isActive = activePresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (isLocked) {
                      setShowAllPresetsModal(false);
                      setShowUpgradeModal(true);
                    } else {
                      handleSelectFromModal(preset.id);
                    }
                  }}
                  className={cn(
                    'group relative flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all',
                    isActive
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/50'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50',
                    isLocked && 'opacity-70 hover:opacity-100'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}

                  {/* Lock indicator for Pro presets */}
                  {isLocked && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white">
                      <Lock className="h-2.5 w-2.5" />
                    </div>
                  )}

                  {/* Icon with gradient background */}
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br',
                      config.gradient
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                  </div>

                  {/* Preset name */}
                  <span
                    className={cn(
                      'text-center text-xs font-semibold leading-tight',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {preset.name}
                  </span>

                  {/* Short description */}
                  <span className="text-center text-[10px] leading-tight text-muted-foreground">
                    {config.shortDescription}
                  </span>

                  {/* Pro badge */}
                  {isLocked && (
                    <span className="rounded bg-black px-1 py-0.5 text-[8px] font-bold text-white dark:bg-white dark:text-black">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="presets"
      />
    </div>
  );
}
