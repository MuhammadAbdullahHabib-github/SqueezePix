/**
 * Convert any image format to JPEG using Canvas API
 * Used when geo-tagging is needed (only JPEG supports EXIF GPS)
 */

export interface JpegConversionOptions {
  quality: number; // 0-100
}

/**
 * Convert an image file to JPEG format
 * @param file - Source image file (PNG, GIF, WebP, etc.)
 * @param options - Conversion options
 * @returns JPEG file
 */
export async function convertToJpeg(
  file: File | Blob,
  options: JpegConversionOptions = { quality: 92 }
): Promise<File> {
  // If already JPEG, return as-is
  if (file.type === 'image/jpeg') {
    if (file instanceof File) {
      return file;
    }
    return new File([file], 'image.jpg', { type: 'image/jpeg' });
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

        // Fill with white background (for PNG transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image on top
        ctx.drawImage(img, 0, 0);

        // Convert to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Generate filename
              const originalName = file instanceof File ? file.name : 'image';
              const baseName = originalName.replace(/\.[^/.]+$/, '');
              const newFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
              resolve(newFile);
            } else {
              reject(new Error('Failed to convert to JPEG'));
            }
          },
          'image/jpeg',
          options.quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for JPEG conversion'));
    };

    img.src = url;
  });
}

/**
 * Check if a file needs conversion to JPEG for geo-tagging
 */
export function needsJpegConversion(file: File): boolean {
  return !file.type.includes('jpeg') && !file.type.includes('jpg');
}
