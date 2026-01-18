'use client';

import { useCallback, useState } from 'react';
import { useImageStore } from '@/stores/image-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useUIStore } from '@/stores/ui-store';
import { usePipelineStore } from '@/stores/pipeline-store';
import { compressImage } from '@/lib/image/compress';
import { stripExif, readExif } from '@/lib/image/exif';
import { convertToWebp } from '@/lib/image/webp';
import { convertToJpeg } from '@/lib/image/convert-to-jpeg';
import { geoTagImage } from '@/lib/image/geo-tag';
import { generateAltText } from '@/lib/ai/generate-alt-text';
import type { ImageFile, ExifMetadata, StepResult, ProcessingResult } from '@/types/image';
import { MAX_BATCH_SIZE_FREE, MAX_BATCH_SIZE_PRO } from '@/types/image';

export function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const images = useImageStore((state) => state.images);
  const updateImageStatus = useImageStore((state) => state.updateImageStatus);
  const setImageResult = useImageStore((state) => state.setImageResult);
  const setImageError = useImageStore((state) => state.setImageError);
  const setImageExif = useImageStore((state) => state.setImageExif);
  const getCompletedImages = useImageStore((state) => state.getCompletedImages);

  const defaultQuality = useSettingsStore((state) => state.defaultQuality);

  const setUIProcessing = useUIStore((state) => state.setProcessing);

  const getEnabledSteps = usePipelineStore((state) => state.getEnabledSteps);

  /**
   * Process a single image through the enabled pipeline steps
   */
  const processImage = useCallback(
    async (image: ImageFile) => {
      let currentProgress = 0;
      let intervalId: NodeJS.Timeout | null = null;

      try {
        updateImageStatus(image.id, 'processing', 0);

        // Simulate gradual progress since processing doesn't report granular progress
        intervalId = setInterval(() => {
          if (currentProgress < 90) {
            const increment = Math.max(1, Math.floor((90 - currentProgress) / 10));
            currentProgress = Math.min(90, currentProgress + increment);
            updateImageStatus(image.id, 'processing', currentProgress);
          }
        }, 100);

        // Read and store original EXIF data before processing
        const originalExif = await readExif(image.file);
        setImageExif(image.id, originalExif as ExifMetadata | null);

        // Get enabled pipeline steps
        const enabledSteps = getEnabledSteps();
        let processedFile: File = image.file;
        const originalSize = image.file.size;
        const originalIsJpeg = image.file.type.includes('jpeg') || image.file.type.includes('jpg');

        // Check what's enabled
        const webpEnabled = enabledSteps.some(s => s.type === 'convertWebp');
        const geoTagEnabled = enabledSteps.some(s => s.type === 'geoTag');
        const geoTagStep = enabledSteps.find(s => s.type === 'geoTag');
        const hasGeoLocation = geoTagStep?.settings?.geoLocation;

        // Track which steps were actually applied
        const stepsApplied: Record<string, StepResult> = {};

        // SMART LOGIC: If geo-tag is ON and WebP is OFF, convert to JPEG first
        let currentIsJpeg = originalIsJpeg;
        if (geoTagEnabled && hasGeoLocation && !webpEnabled && !originalIsJpeg) {
          // Convert PNG/GIF/WebP to JPEG for geo-tagging
          processedFile = await convertToJpeg(processedFile, { quality: 95 });
          currentIsJpeg = true;
          stepsApplied.formatConversion = {
            applied: true,
            reason: `Converted from ${image.file.type.split('/')[1].toUpperCase()} to JPEG for GPS support`
          };
        }

        // Execute pipeline steps in order
        for (const step of enabledSteps) {
          switch (step.type) {
            case 'removeExif': {
              if (currentIsJpeg) {
                processedFile = await stripExif(processedFile);
                stepsApplied.removeExif = { applied: true };
              } else {
                stepsApplied.removeExif = { applied: false, skipped: true, reason: 'Only JPEG files have EXIF data' };
              }
              break;
            }
            case 'geoTag': {
              // RULE: If WebP is enabled, skip geo-tagging entirely
              if (webpEnabled) {
                stepsApplied.geoTag = {
                  applied: false,
                  skipped: true,
                  reason: 'WebP does not support GPS'
                };
              } else if (!hasGeoLocation) {
                stepsApplied.geoTag = { applied: false, skipped: true, reason: 'No location selected' };
              } else {
                // At this point, file is JPEG (either original or converted)
                const { latitude, longitude, cityName, adminName, countryName } = step.settings!.geoLocation!;
                processedFile = await geoTagImage(processedFile, {
                  location: { latitude, longitude, cityName, adminName, countryName },
                });
                // Success - no reason needed (shows green checkmark)
                stepsApplied.geoTag = { applied: true };
              }
              break;
            }
            case 'convertWebp': {
              const webpBlob = await convertToWebp(processedFile);
              const webpName = processedFile.name.replace(/\.[^/.]+$/, '.webp');
              processedFile = new File([webpBlob], webpName, { type: 'image/webp' });
              stepsApplied.convertWebp = { applied: true };
              break;
            }
            case 'compress': {
              // Run compression with configured quality
              const quality = step.settings?.quality ?? defaultQuality;
              const maxSizeMB = step.settings?.maxSizeKB ? step.settings.maxSizeKB / 1024 : undefined;

              const compressResult = await compressImage(processedFile, {
                quality,
                maxSizeMB,
                convertToWebp: false, // WebP conversion handled separately
              });
              processedFile = new File([compressResult.blob], compressResult.name, {
                type: compressResult.blob.type,
              });
              stepsApplied.compress = { applied: true };
              break;
            }
            case 'altText': {
              // Generate AI alt text
              try {
                const altTextKeywords = step.settings?.keywords || [];
                const geoLocation = geoTagStep?.settings?.geoLocation;

                const altTextResult = await generateAltText(processedFile, {
                  keywords: altTextKeywords,
                  location: geoLocation ? {
                    cityName: geoLocation.cityName,
                    adminName: geoLocation.adminName,
                    countryName: geoLocation.countryName,
                  } : undefined,
                });

                // Store the alt text - we'll add it to the result later
                stepsApplied.altText = {
                  applied: true,
                  reason: altTextResult.altText, // Store the generated alt text in reason for now
                };
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                stepsApplied.altText = {
                  applied: false,
                  skipped: true,
                  reason: `AI error: ${errorMsg}`,
                };
              }
              break;
            }
          }
        }

        // FINAL EXIF SAFETY CHECK: Strip EXIF again if removeExif was applied and geoTag was not
        // This catches any EXIF that might have been re-added by compression or other steps
        const removeExifApplied = stepsApplied.removeExif?.applied;
        const geoTagApplied = stepsApplied.geoTag?.applied;
        const isJpegOutput = processedFile.type.includes('jpeg') || processedFile.type.includes('jpg');

        if (removeExifApplied && !geoTagApplied && isJpegOutput) {
          processedFile = await stripExif(processedFile);
        }

        // Clear interval and set to 100%
        if (intervalId) {
          clearInterval(intervalId);
        }
        updateImageStatus(image.id, 'processing', 100);

        // Build the final result with stats
        const compressedSize = processedFile.size;

        // Extract alt text if it was generated
        const generatedAltText = stepsApplied.altText?.applied && stepsApplied.altText?.reason
          ? stepsApplied.altText.reason
          : undefined;

        const baseName = processedFile.name.replace(/\.[^/.]+$/, '');
        const newName = baseName.endsWith('_optimized') ? baseName : baseName + '_optimized';

        const result: ProcessingResult = {
          blob: processedFile,
          name: newName + getExtension(processedFile.type),
          originalSize,
          compressedSize,
          compressionRatio: ((originalSize - compressedSize) / originalSize) * 100,
          format: getFormatFromMime(processedFile.type),
          width: image.width,
          height: image.height,
          altText: generatedAltText,
          stepsApplied,
        };

        setImageResult(image.id, result);

        return result;
      } catch (error) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setImageError(image.id, errorMessage);
        throw error;
      }
    },
    [defaultQuality, updateImageStatus, setImageResult, setImageError, setImageExif, getEnabledSteps]
  );

  // Helper functions
  function getExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      default:
        return '.jpg';
    }
  }

  function getFormatFromMime(mimeType: string): 'jpeg' | 'png' | 'webp' | 'gif' {
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
   * Process all pending images
   */
  const processAllImages = useCallback(async () => {
    const pendingImages = images.filter((img) => img.status === 'pending');

    if (pendingImages.length === 0) {
      return;
    }

    setIsProcessing(true);
    setUIProcessing(true, 0);

    let completed = 0;
    const total = pendingImages.length;

    // Process images sequentially for now (Web Worker version will be parallel)
    for (const image of pendingImages) {
      try {
        await processImage(image);
        completed++;
        setUIProcessing(true, Math.round((completed / total) * 100));
      } catch (error) {
        // Error already handled in processImage
        completed++;
        setUIProcessing(true, Math.round((completed / total) * 100));
      }
    }

    setIsProcessing(false);
    setUIProcessing(false, 100);
  }, [images, processImage, setUIProcessing]);

  /**
   * Process a specific image by ID
   */
  const processImageById = useCallback(
    async (imageId: string) => {
      const image = images.find((img) => img.id === imageId);
      if (image && image.status === 'pending') {
        await processImage(image);
      }
    },
    [images, processImage]
  );

  /**
   * Check if adding more images would exceed batch limit
   * @param additionalCount - Number of images to add
   * @param isPro - Whether user has Pro tier
   * @returns Object with allowed status and reason if not allowed
   */
  const checkBatchLimit = useCallback(
    (additionalCount: number, isPro: boolean = false): { allowed: boolean; reason?: string; limit: number } => {
      const limit = isPro ? MAX_BATCH_SIZE_PRO : MAX_BATCH_SIZE_FREE;
      const currentCount = images.length;
      const newTotal = currentCount + additionalCount;

      if (newTotal > limit) {
        return {
          allowed: false,
          reason: `Free tier is limited to ${MAX_BATCH_SIZE_FREE} images per batch. Upgrade to Pro for up to ${MAX_BATCH_SIZE_PRO} images.`,
          limit,
        };
      }

      return { allowed: true, limit };
    },
    [images.length]
  );

  return {
    isProcessing,
    processAllImages,
    processImageById,
    checkBatchLimit,
    completedImages: getCompletedImages(),
    pendingCount: images.filter((img) => img.status === 'pending').length,
    processingCount: images.filter((img) => img.status === 'processing').length,
    completedCount: images.filter((img) => img.status === 'complete').length,
    errorCount: images.filter((img) => img.status === 'error').length,
    totalCount: images.length,
    maxBatchSize: MAX_BATCH_SIZE_FREE, // Expose for UI
  };
}
