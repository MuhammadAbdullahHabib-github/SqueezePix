/**
 * WebP conversion utilities using Canvas API
 */

export interface WebpConversionOptions {
  quality: number; // 0-100
}

/**
 * Check if the browser supports WebP encoding
 */
export function supportsWebpEncoding(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Convert an image file to WebP format using Canvas API
 * @param file - Source image file
 * @param options - Conversion options
 * @returns WebP blob
 */
export async function convertToWebp(
  file: File | Blob,
  options: WebpConversionOptions = { quality: 80 }
): Promise<Blob> {
  if (!supportsWebpEncoding()) {
    throw new Error('WebP encoding is not supported in this browser');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          options.quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for WebP conversion'));
    };

    img.src = url;
  });
}

/**
 * Get WebP file extension for a given filename
 */
export function getWebpFilename(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}.webp`;
}

/**
 * Check if a file is already WebP
 */
export function isWebpFormat(file: File | Blob): boolean {
  return file.type === 'image/webp';
}
