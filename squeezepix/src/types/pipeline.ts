/**
 * Pipeline types for customizable processing workflow
 */

export type PipelineStepType = 'removeExif' | 'compress' | 'geoTag' | 'convertWebp' | 'altText' | 'crop';

export interface PipelineStep {
  id: string;
  type: PipelineStepType;
  label: string;
  icon: string;
  enabled: boolean;
  order: number;
  requiresPro: boolean;
  settings?: PipelineStepSettings;
}

export interface GeoTagSettings {
  latitude: number;
  longitude: number;
  cityName?: string;
  adminName?: string;
  countryName?: string;
}

export interface CropSettings {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

export interface PipelineStepSettings {
  // Compression settings
  quality?: number;
  maxSizeKB?: number;

  // Geo-tag settings
  geoLocation?: GeoTagSettings;

  // Alt text settings
  keywords?: string[];

  // Crop settings
  cropWidth?: number;
  cropHeight?: number;
  maintainAspectRatio?: boolean;
}

export interface Pipeline {
  steps: PipelineStep[];
  activePresetId: string | null;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  isDefault: boolean;
  createdAt?: string;
}

export const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'step-exif',
    type: 'removeExif',
    label: 'Remove EXIF',
    icon: '⊟',
    enabled: true,
    order: 1,
    requiresPro: false,
  },
  {
    id: 'step-crop',
    type: 'crop',
    label: 'Crop/Resize',
    icon: '⬒',
    enabled: false,
    order: 2,
    requiresPro: false,
    settings: { cropWidth: undefined, cropHeight: undefined, maintainAspectRatio: true },
  },
  {
    id: 'step-compress',
    type: 'compress',
    label: 'Compress',
    icon: '◐',
    enabled: true,
    order: 3,
    requiresPro: false,
    settings: { quality: 80 },
  },
  {
    id: 'step-geotag',
    type: 'geoTag',
    label: 'Geo-Tag',
    icon: '📍',
    enabled: true,
    order: 4,
    requiresPro: false,
  },
  {
    id: 'step-webp',
    type: 'convertWebp',
    label: 'WebP',
    icon: '◲',
    enabled: true,
    order: 5,
    requiresPro: false,
  },
  {
    id: 'step-alttext',
    type: 'altText',
    label: 'AI Alt Text',
    icon: '✦',
    enabled: false,
    order: 6,
    requiresPro: false,
  },
];
