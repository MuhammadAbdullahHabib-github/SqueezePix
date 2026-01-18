'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePipelineStore, DEFAULT_PRESETS } from '@/stores/pipeline-store';
import { ChevronDown, Check, Zap, Shield, Search, MapPin, Gauge } from 'lucide-react';

const presetIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'quick-optimize': Zap,
  'privacy-first': Shield,
  'full-seo': Search,
  'local-business': MapPin,
  'web-performance': Gauge,
};

export function PresetSelector() {
  const activePresetId = usePipelineStore((state) => state.activePresetId);
  const customPresets = usePipelineStore((state) => state.customPresets);
  const setPreset = usePipelineStore((state) => state.setPreset);
  const resetToDefaults = usePipelineStore((state) => state.resetToDefaults);

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];
  const activePreset = allPresets.find((p) => p.id === activePresetId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {activePreset ? (
            <>
              {presetIcons[activePreset.id] &&
                (() => {
                  const Icon = presetIcons[activePreset.id];
                  return <Icon className="h-4 w-4" />;
                })()}
              {activePreset.name}
            </>
          ) : (
            'Custom'
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {DEFAULT_PRESETS.map((preset) => {
          const Icon = presetIcons[preset.id] || Zap;
          return (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => setPreset(preset.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <p className="font-medium">{preset.name}</p>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
              </div>
              {activePresetId === preset.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}

        {customPresets.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Custom Presets</DropdownMenuLabel>
            {customPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => setPreset(preset.id)}
                className="flex items-center gap-2"
              >
                <div className="flex-1">
                  <p className="font-medium">{preset.name}</p>
                </div>
                {activePresetId === preset.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={resetToDefaults} className="text-muted-foreground">
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
