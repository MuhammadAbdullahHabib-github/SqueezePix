'use client';

import { create } from 'zustand';
import type { ImageFile, ImageStatus, ProcessingResult, CompressionStats, ExifMetadata } from '@/types/image';

interface ImageStore {
  images: ImageFile[];

  // Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  updateImageStatus: (id: string, status: ImageStatus, progress?: number) => void;
  setImageResult: (id: string, result: ProcessingResult) => void;
  setImageError: (id: string, error: string) => void;
  setImageExif: (id: string, exif: ExifMetadata | null) => void;

  // Computed getters
  getPendingImages: () => ImageFile[];
  getCompletedImages: () => ImageFile[];
  getStats: () => CompressionStats;
}

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],

  addImages: async (files: File[]) => {
    // Import dynamically to avoid circular dependency issues if any, or just use imported
    const { getImageDimensions } = await import('@/lib/image/utils');

    // Create temp placeholders first to show immediate UI feedback
    const tempImages: ImageFile[] = files.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      previewUrl: URL.createObjectURL(file),
    }));

    set((state) => ({ images: [...state.images, ...tempImages] }));

    // T123: Validate images and calculate dimensions in parallel
    // This also detects corrupt images that fail to load
    const dimensionPromises = tempImages.map(async (img) => {
      try {
        const dims = await getImageDimensions(img.file);
        return { id: img.id, ...dims, valid: true };
      } catch (e) {
        console.error(`Failed to load image ${img.name} - may be corrupt`, e);
        return { id: img.id, valid: false, error: 'Image appears to be corrupt or unreadable' };
      }
    });

    const results = await Promise.all(dimensionPromises);

    // Update state with dimensions for valid images and error status for corrupt images
    set((state) => ({
      images: state.images.map((img) => {
        const result = results.find((r) => r.id === img.id);
        if (!result) return img;

        if (result.valid && 'width' in result && 'height' in result) {
          return { ...img, width: result.width, height: result.height };
        } else if (!result.valid && 'error' in result) {
          // Mark corrupt images with error status
          return { ...img, status: 'error' as ImageStatus, error: result.error };
        }
        return img;
      }),
    }))
  },

  removeImage: (id: string) => {
    const images = get().images;
    const imgToRemove = images.find(img => img.id === id);
    if (imgToRemove?.previewUrl) {
      URL.revokeObjectURL(imgToRemove.previewUrl);
    }
    set((state) => ({ images: state.images.filter((img) => img.id !== id) }));
  },

  clearImages: () => {
    const images = get().images;
    images.forEach(img => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    set({ images: [] });
  },

  updateImageStatus: (id: string, status: ImageStatus, progress = 0) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status, progress } : img
      ),
    }));
  },

  setImageResult: (id: string, result: ProcessingResult) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'complete', progress: 100, result } : img
      ),
    }));
  },

  setImageError: (id: string, error: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'error', error } : img
      ),
    }));
  },

  setImageExif: (id: string, exif: ExifMetadata | null) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, originalExif: exif } : img
      ),
    }));
  },

  getPendingImages: () => {
    return get().images.filter((img) => img.status === 'pending');
  },

  getCompletedImages: () => {
    return get().images.filter((img) => img.status === 'complete');
  },

  getStats: () => {
    const completed = get().images.filter((img) => img.status === 'complete' && img.result);
    const totalOriginalSize = completed.reduce((acc, img) => acc + (img.result?.originalSize || 0), 0);
    const totalCompressedSize = completed.reduce((acc, img) => acc + (img.result?.compressedSize || 0), 0);
    const totalSaved = totalOriginalSize - totalCompressedSize;
    const percentageSaved = totalOriginalSize > 0 ? (totalSaved / totalOriginalSize) * 100 : 0;

    return {
      totalOriginalSize,
      totalCompressedSize,
      totalSaved,
      percentageSaved,
      imageCount: completed.length,
    };
  },
}));
