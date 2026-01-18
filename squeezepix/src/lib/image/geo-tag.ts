/**
 * Geo-tagging utility for adding GPS coordinates to images
 */

import { insertGpsCoordinates } from './exif';
import type { GeoLocation } from '@/lib/geo/types';

export interface GeoTagOptions {
  location: GeoLocation;
}

/**
 * Add GPS coordinates to an image file
 * @param file - Image file to geo-tag
 * @param options - Geo-tagging options with location
 * @returns New File with GPS coordinates in EXIF
 */
export async function geoTagImage(
  file: File,
  options: GeoTagOptions
): Promise<File> {
  const { location } = options;

  if (!location.latitude || !location.longitude) {
    throw new Error('Invalid location: latitude and longitude are required');
  }

  return insertGpsCoordinates(file, location.latitude, location.longitude);
}

/**
 * Check if an image can be geo-tagged (only JPEGs support EXIF)
 */
export function canGeoTag(file: File): boolean {
  return file.type.includes('jpeg') || file.type.includes('jpg');
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}
