'use client';

import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePipelineStore } from '@/stores/pipeline-store';
import { CitySelector } from './city-selector';
import type { GeoLocation } from '@/lib/geo/types';

export function WorkflowOptions() {
  const steps = usePipelineStore((state) => state.steps);
  const toggleStep = usePipelineStore((state) => state.toggleStep);
  const updateStepSettings = usePipelineStore((state) => state.updateStepSettings);
  const resetToDefaults = usePipelineStore((state) => state.resetToDefaults);

  const geoTagStep = steps.find((s) => s.type === 'geoTag');
  const geoLocation = geoTagStep?.settings?.geoLocation;

  const handleGeoLocationChange = (location: GeoLocation | null) => {
    if (geoTagStep) {
      updateStepSettings(geoTagStep.id, {
        geoLocation: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              cityName: location.cityName,
              adminName: location.adminName,
              countryName: location.countryName,
            }
          : undefined,
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Optimization Options</h3>
        <button
          type="button"
          onClick={resetToDefaults}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <TooltipProvider>
          {steps.map((step) => (
            <Tooltip key={step.id}>
              <TooltipTrigger asChild>
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    step.enabled
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  } ${step.requiresPro ? 'opacity-60' : ''}`}
                >
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                  <Switch
                    checked={step.enabled}
                    onCheckedChange={() => toggleStep(step.id)}
                    disabled={step.requiresPro}
                    className="scale-75"
                  />
                  {step.requiresPro && (
                    <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-600">
                      PRO
                    </span>
                  )}
                </label>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getStepDescription(step.type)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Geo-Tag City Selector */}
      {geoTagStep?.enabled && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="mb-2 text-sm font-medium">Select Location for Geo-Tagging</h4>
          <CitySelector
            value={
              geoLocation
                ? {
                    latitude: geoLocation.latitude,
                    longitude: geoLocation.longitude,
                    cityName: geoLocation.cityName,
                    adminName: geoLocation.adminName,
                    countryName: geoLocation.countryName,
                  }
                : null
            }
            onChange={handleGeoLocationChange}
          />
        </div>
      )}
    </div>
  );
}

function getStepDescription(type: string): string {
  switch (type) {
    case 'removeExif':
      return 'Strip metadata (camera info, GPS, date) for privacy';
    case 'compress':
      return 'Reduce file size while maintaining quality';
    case 'geoTag':
      return 'Add GPS coordinates for local SEO';
    case 'convertWebp':
      return 'Convert to WebP format for better web performance';
    case 'altText':
      return 'Generate AI-powered alt text for accessibility & SEO';
    default:
      return '';
  }
}
