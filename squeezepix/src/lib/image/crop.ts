/**
 * Crop/resize images using Canvas API
 */

export interface CropOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

export interface CropResult {
  file: File;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
}

/**
 * Crop/resize an image to specified dimensions
 * @param file - Source image file
 * @param options - Crop options (width, height, maintainAspectRatio)
 * @returns Cropped/resized file with dimensions info
 */
export async function cropImage(
  file: File | Blob,
  options: CropOptions
): Promise<CropResult> {
  const { width: targetWidth, height: targetHeight, maintainAspectRatio = true } = options;

  // If no dimensions specified, return original
  if (!targetWidth && !targetHeight) {
    const originalFile = file instanceof File ? file : new File([file], 'image.jpg', { type: file.type });
    return {
      file: originalFile,
      originalWidth: 0,
      originalHeight: 0,
      newWidth: 0,
      newHeight: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      try {
        const originalWidth = img.width;
        const originalHeight = img.height;

        let newWidth: number;
        let newHeight: number;

        if (maintainAspectRatio) {
          // Calculate dimensions maintaining aspect ratio
          const aspectRatio = originalWidth / originalHeight;

          if (targetWidth && targetHeight) {
            // Both specified - fit within bounds while maintaining ratio
            const widthRatio = targetWidth / originalWidth;
            const heightRatio = targetHeight / originalHeight;
            const scale = Math.min(widthRatio, heightRatio);
            newWidth = Math.round(originalWidth * scale);
            newHeight = Math.round(originalHeight * scale);
          } else if (targetWidth) {
            // Only width specified
            newWidth = targetWidth;
            newHeight = Math.round(targetWidth / aspectRatio);
          } else {
            // Only height specified
            newHeight = targetHeight!;
            newWidth = Math.round(targetHeight! * aspectRatio);
          }
        } else {
          // Don't maintain aspect ratio - use target dimensions or original
          newWidth = targetWidth || originalWidth;
          newHeight = targetHeight || originalHeight;
        }

        // Create canvas with new dimensions
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Determine output format
        const mimeType = file.type || 'image/jpeg';
        const quality = mimeType === 'image/png' ? undefined : 0.92;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalName = file instanceof File ? file.name : 'image';
              const newFile = new File([blob], originalName, { type: mimeType });
              resolve({
                file: newFile,
                originalWidth,
                originalHeight,
                newWidth,
                newHeight,
              });
            } else {
              reject(new Error('Failed to crop/resize image'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for cropping'));
    };

    img.src = url;
  });
}

/**
 * Check if crop settings will actually modify the image
 */
export function hasCropSettings(options: CropOptions): boolean {
  return !!(options.width || options.height);
}
