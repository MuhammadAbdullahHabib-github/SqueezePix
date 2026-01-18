import piexif from 'piexifjs';

export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  software?: string;
  orientation?: number;
  [key: string]: unknown;
}

/**
 * Read EXIF data from an image file
 * @param file - Image file to read EXIF from
 * @returns Parsed EXIF data or null if not found/unsupported
 */
export async function readExif(file: File): Promise<ExifData | null> {
  // Only JPEG/JPG files have EXIF data
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return null;
  }

  try {
    const dataUrl = await fileToDataUrl(file);
    const exifObj = piexif.load(dataUrl);

    if (!exifObj || Object.keys(exifObj).length === 0) {
      return null;
    }

    return parseExifObject(exifObj);
  } catch {
    // File doesn't have EXIF data or it's corrupted
    return null;
  }
}

/**
 * Strip all EXIF data from an image
 * @param file - Image file to strip EXIF from
 * @returns New File without EXIF data
 */
export async function stripExif(file: File): Promise<File> {
  // Only JPEG/JPG files have EXIF data to strip
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return file;
  }

  try {
    const dataUrl = await fileToDataUrl(file);

    // Remove all EXIF data
    const strippedDataUrl = piexif.remove(dataUrl);

    // Convert back to File
    const blob = dataUrlToBlob(strippedDataUrl);
    return new File([blob], file.name, { type: file.type });
  } catch {
    // If stripping fails, return original file
    return file;
  }
}

/**
 * Insert GPS coordinates into image EXIF data
 * @param file - Image file to add GPS to
 * @param latitude - GPS latitude
 * @param longitude - GPS longitude
 * @returns New File with GPS data
 */
export async function insertGpsCoordinates(
  file: File,
  latitude: number,
  longitude: number
): Promise<File> {
  // Only JPEG/JPG files support EXIF
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return file;
  }

  try {
    const dataUrl = await fileToDataUrl(file);

    // Load existing EXIF or create new
    let exifObj: Record<string, Record<number, unknown>>;
    try {
      exifObj = piexif.load(dataUrl) as Record<string, Record<number, unknown>>;
    } catch {
      exifObj = { '0th': {}, Exif: {}, GPS: {}, '1st': {} };
    }

    // Convert decimal coordinates to degrees/minutes/seconds
    const latRef = latitude >= 0 ? 'N' : 'S';
    const lngRef = longitude >= 0 ? 'E' : 'W';

    const latDMS = decimalToDMS(Math.abs(latitude));
    const lngDMS = decimalToDMS(Math.abs(longitude));

    // Set GPS tags
    if (!exifObj.GPS) exifObj.GPS = {};
    exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = latRef;
    exifObj.GPS[piexif.GPSIFD.GPSLatitude] = latDMS;
    exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = lngRef;
    exifObj.GPS[piexif.GPSIFD.GPSLongitude] = lngDMS;

    // Insert EXIF back into image
    const exifBytes = piexif.dump(exifObj);
    const newDataUrl = piexif.insert(exifBytes, dataUrl);

    // Convert back to File
    const blob = dataUrlToBlob(newDataUrl);
    return new File([blob], file.name, { type: file.type });
  } catch {
    // If insertion fails, return original file
    return file;
  }
}

/**
 * Check if a file has EXIF data
 */
export async function hasExif(file: File): Promise<boolean> {
  const exif = await readExif(file);
  return exif !== null && Object.keys(exif).length > 0;
}

/**
 * Get a human-readable summary of EXIF data
 */
export function getExifSummary(exif: ExifData | null): string[] {
  if (!exif) return [];

  const summary: string[] = [];

  if (exif.make || exif.model) {
    summary.push(`Camera: ${[exif.make, exif.model].filter(Boolean).join(' ')}`);
  }
  if (exif.dateTime) {
    summary.push(`Date: ${exif.dateTime}`);
  }
  if (exif.gpsLatitude !== undefined && exif.gpsLongitude !== undefined) {
    summary.push(`GPS: ${exif.gpsLatitude.toFixed(6)}, ${exif.gpsLongitude.toFixed(6)}`);
  }
  if (exif.software) {
    summary.push(`Software: ${exif.software}`);
  }

  return summary;
}

// Helper functions

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function parseExifObject(exifObj: Record<string, unknown>): ExifData {
  const data: ExifData = {};

  // Parse 0th IFD (main image tags)
  const zeroth = exifObj['0th'] as Record<number, unknown> | undefined;
  if (zeroth) {
    if (zeroth[piexif.ImageIFD.Make]) {
      data.make = String(zeroth[piexif.ImageIFD.Make]);
    }
    if (zeroth[piexif.ImageIFD.Model]) {
      data.model = String(zeroth[piexif.ImageIFD.Model]);
    }
    if (zeroth[piexif.ImageIFD.Software]) {
      data.software = String(zeroth[piexif.ImageIFD.Software]);
    }
    if (zeroth[piexif.ImageIFD.Orientation]) {
      data.orientation = Number(zeroth[piexif.ImageIFD.Orientation]);
    }
  }

  // Parse Exif IFD
  const exif = exifObj['Exif'] as Record<number, unknown> | undefined;
  if (exif) {
    if (exif[piexif.ExifIFD.DateTimeOriginal]) {
      data.dateTime = String(exif[piexif.ExifIFD.DateTimeOriginal]);
    }
  }

  // Parse GPS IFD
  const gps = exifObj['GPS'] as Record<number, unknown> | undefined;
  if (gps) {
    const latRef = gps[piexif.GPSIFD.GPSLatitudeRef] as string | undefined;
    const lat = gps[piexif.GPSIFD.GPSLatitude] as number[][] | undefined;
    const lngRef = gps[piexif.GPSIFD.GPSLongitudeRef] as string | undefined;
    const lng = gps[piexif.GPSIFD.GPSLongitude] as number[][] | undefined;

    if (lat && latRef) {
      data.gpsLatitude = dmsToDecimal(lat, latRef);
    }
    if (lng && lngRef) {
      data.gpsLongitude = dmsToDecimal(lng, lngRef);
    }
  }

  return data;
}

function dmsToDecimal(dms: number[][], ref: string): number {
  const degrees = dms[0][0] / dms[0][1];
  const minutes = dms[1][0] / dms[1][1];
  const seconds = dms[2][0] / dms[2][1];

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (ref === 'S' || ref === 'W') {
    decimal = -decimal;
  }

  return decimal;
}

function decimalToDMS(decimal: number): number[][] {
  const degrees = Math.floor(decimal);
  const minutesFloat = (decimal - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100);

  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ];
}
