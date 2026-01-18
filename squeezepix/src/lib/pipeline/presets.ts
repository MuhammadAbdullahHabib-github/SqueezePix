/**
 * Default preset definitions for SqueezePix
 * Users can select these presets for quick workflow configuration
 */

import { DEFAULT_PIPELINE_STEPS, type Preset } from '@/types/pipeline';

/**
 * Quick Optimize preset
 * Best for: General web use, fast processing
 * Steps: Compress + WebP
 */
export const QUICK_OPTIMIZE: Preset = {
  id: 'quick-optimize',
  name: 'Quick Optimize',
  description: 'Fast compression and WebP conversion for web use',
  isDefault: true,
  steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
    ...step,
    enabled: step.type === 'compress' || step.type === 'convertWebp',
  })),
};

/**
 * Privacy First preset
 * Best for: Removing sensitive metadata before sharing
 * Steps: Remove EXIF + Compress + WebP
 */
export const PRIVACY_FIRST: Preset = {
  id: 'privacy-first',
  name: 'Privacy First',
  description: 'Remove all metadata for privacy before sharing',
  isDefault: true,
  steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
    ...step,
    enabled: ['removeExif', 'compress', 'convertWebp'].includes(step.type),
  })),
};

/**
 * Full SEO preset
 * Best for: E-commerce, content marketing, local business
 * Steps: Remove EXIF + Compress + Geo-Tag + AI Alt Text (no WebP for EXIF support)
 */
export const FULL_SEO: Preset = {
  id: 'full-seo',
  name: 'Full SEO',
  description: 'Geo-tagging and AI alt text for maximum SEO impact',
  isDefault: true,
  steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
    ...step,
    // Enable: removeExif, compress, geoTag, altText | Disable: convertWebp
    enabled: ['removeExif', 'compress', 'geoTag', 'altText'].includes(step.type),
  })),
};

/**
 * Local Business preset
 * Best for: Local SEO, location-based businesses
 * Steps: Remove EXIF + Compress + Geo-Tag (no WebP for EXIF support)
 */
export const LOCAL_BUSINESS: Preset = {
  id: 'local-business',
  name: 'Local Business',
  description: 'Geo-tagged JPEG for local business SEO',
  isDefault: true,
  steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
    ...step,
    // Enable: removeExif, compress, geoTag | Disable: convertWebp, altText
    enabled: ['removeExif', 'compress', 'geoTag'].includes(step.type),
  })),
};

/**
 * Web Performance preset
 * Best for: Maximum loading speed, performance optimization
 * Steps: Remove EXIF + Compress (low quality) + WebP
 */
export const WEB_PERFORMANCE: Preset = {
  id: 'web-performance',
  name: 'Web Performance',
  description: 'Maximum compression for fastest loading',
  isDefault: true,
  steps: DEFAULT_PIPELINE_STEPS.map((step) => ({
    ...step,
    enabled: ['removeExif', 'compress', 'convertWebp'].includes(step.type),
    // Set lower quality for max compression
    settings: step.type === 'compress' ? { quality: 70 } : step.settings,
  })),
};

/**
 * All default presets
 */
export const DEFAULT_PRESETS: Preset[] = [
  QUICK_OPTIMIZE,
  PRIVACY_FIRST,
  FULL_SEO,
  LOCAL_BUSINESS,
  WEB_PERFORMANCE,
];

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): Preset | undefined {
  return DEFAULT_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get all default presets
 */
export function getDefaultPresets(): Preset[] {
  return DEFAULT_PRESETS;
}
