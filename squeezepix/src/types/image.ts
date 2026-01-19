/**
 * Image processing types for SqueezePix
 */

export type ImageStatus = 'pending' | 'processing' | 'complete' | 'error';

export interface ExifMetadata {
  make?: string;
  model?: string;
  dateTime?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  software?: string;
  [key: string]: unknown;
}

export interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: ImageStatus;
  progress: number;
  result?: ProcessingResult;
  error?: string;
  originalExif?: ExifMetadata | null;
  width?: number;
  height?: number;
  previewUrl?: string; // For immediate Thumbnail display
}

export interface StepResult {
  applied: boolean;
  skipped?: boolean;
  reason?: string;
}

export interface ProcessingResult {
  blob: Blob;
  name: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  altText?: string;
  format: 'jpeg' | 'png' | 'webp' | 'gif';
  width?: number;
  height?: number;
  // Track which steps were actually applied
  stepsApplied?: {
    removeExif?: StepResult;
    crop?: StepResult;
    compress?: StepResult;
    geoTag?: StepResult;
    convertWebp?: StepResult;
    altText?: StepResult;
    formatConversion?: StepResult;
  };
}

export interface ProcessingOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  convertToWebp: boolean;
  removeExif: boolean;
  geoTag?: GeoTagOptions;
  generateAltText: boolean;
  keywords?: string[];
}

export interface GeoTagOptions {
  enabled: boolean;
  latitude: number;
  longitude: number;
  cityName?: string;
}

export interface CompressionStats {
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSaved: number;
  percentageSaved: number;
  imageCount: number;
}

export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_BATCH_SIZE_FREE = 10;
export const MAX_BATCH_SIZE_PRO = 50;
