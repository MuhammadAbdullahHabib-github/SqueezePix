import imageCompression from 'browser-image-compression';
import type { ProcessingResult } from '@/types/image';

export interface CompressionOptions {
  quality: number; // 1-100, will be converted to 0-1
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  convertToWebp?: boolean;
  onProgress?: (progress: number) => void;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  quality: 80,
  maxSizeMB: 10,
  maxWidth: 4096,
  maxHeight: 4096,
  convertToWebp: false,
};

/**
 * Compress an image file using browser-image-compression
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns ProcessingResult with compressed blob and stats
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<ProcessingResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  const baseCompressionOptions = {
    maxSizeMB: opts.maxSizeMB || 10, // Max output size in MB
    maxWidthOrHeight: Math.max(opts.maxWidth || 4096, opts.maxHeight || 4096),
    initialQuality: opts.quality / 100,
    fileType: opts.convertToWebp ? ('image/webp' as const) : undefined,
    preserveExif: false, // Always strip EXIF during compression
    onProgress: opts.onProgress ? (progress: number) => opts.onProgress!(Math.round(progress)) : undefined,
  };

  // Try with web worker first, fallback to main thread if it fails
  let compressedFile: File;

  try {
    // First try with web worker
    compressedFile = await imageCompression(file, {
      ...baseCompressionOptions,
      useWebWorker: true,
    });
  } catch (webWorkerError) {
    console.warn('Web worker compression failed, falling back to main thread:', webWorkerError);
    try {
      // Fallback to main thread
      compressedFile = await imageCompression(file, {
        ...baseCompressionOptions,
        useWebWorker: false,
      });
    } catch (mainThreadError) {
      throw new Error(`Failed to compress image: ${(mainThreadError as Error).message}`);
    }
  }

  try {
    // Get image dimensions
    const dimensions = await getImageDimensions(compressedFile);

    // Determine output format
    const format = getImageFormat(compressedFile.type);

    // Generate output filename
    const outputName = generateOutputFilename(file.name, format);

    return {
      blob: compressedFile,
      name: outputName,
      originalSize,
      compressedSize: compressedFile.size,
      compressionRatio: ((originalSize - compressedFile.size) / originalSize) * 100,
      format,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    throw new Error(`Failed to process compressed image: ${(error as Error).message}`);
  }
}

/**
 * Get image dimensions from a file
 */
async function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for dimension calculation'));
    };

    img.src = url;
  });
}

/**
 * Get format from MIME type
 */
function getImageFormat(mimeType: string): 'jpeg' | 'png' | 'webp' | 'gif' {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpeg';
  }
}

/**
 * Generate output filename with correct extension
 */
function generateOutputFilename(
  originalName: string,
  format: 'jpeg' | 'png' | 'webp' | 'gif'
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const extension = format === 'jpeg' ? 'jpg' : format;
  return `${baseName}_optimized.${extension}`;
}

/**
 * Check if browser supports WebP encoding
 */
export function supportsWebpEncoding(): boolean {
  if (typeof document === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}
