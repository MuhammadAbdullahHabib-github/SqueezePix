import { SUPPORTED_FORMATS, MAX_FILE_SIZE, type SupportedFormat } from '@/types/image';

/**
 * Validate if a file is a supported image format
 */
export function isValidImageFormat(file: File): boolean {
  return SUPPORTED_FORMATS.includes(file.type as SupportedFormat);
}

/**
 * Validate if a file is within the size limit
 */
export function isWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Validate a file and return validation result
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!isValidImageFormat(file)) {
    return {
      valid: false,
      error: `Unsupported format: ${file.type || 'unknown'}. Supported formats: JPG, PNG, GIF, WebP`,
    };
  }

  if (!isWithinSizeLimit(file)) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large: ${sizeMB}MB. Maximum size is 50MB`,
    };
  }

  return { valid: true };
}

/**
 * Convert a Blob to a File
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Convert a File to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
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

/**
 * Create an object URL for a blob/file
 */
export function createObjectUrl(blob: Blob | File): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke an object URL
 */
export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Download a blob as a file
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  // Convert blob to data URL - this is more reliable for downloads
  // as data URLs cannot be revoked and always work with download attribute
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const dataUrl = reader.result as string;

      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      // Small delay before cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        resolve();
      }, 1000);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read blob for download'));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a unique ID for an image
 */
export function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image to calculate dimensions'));
    };
    img.src = url;
  });
}
