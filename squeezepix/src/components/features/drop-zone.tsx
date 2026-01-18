'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { validateImageFile } from '@/lib/image/utils';
import { useImageStore } from '@/stores/image-store';
import { MAX_BATCH_SIZE_FREE } from '@/types/image';

interface DropZoneProps {
  maxFiles?: number;
  className?: string;
  onFilesAdded?: (files: File[]) => void;
  onLimitReached?: () => void;
}

export function DropZone({
  maxFiles = MAX_BATCH_SIZE_FREE,
  className,
  onFilesAdded,
  onLimitReached,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const addImages = useImageStore((state) => state.addImages);
  const currentImages = useImageStore((state) => state.images);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      setWarning(null);
      const fileArray = Array.from(files);

      // Check batch limit
      const remainingSlots = maxFiles - currentImages.length;
      if (remainingSlots <= 0) {
        setError(`You've reached the limit of ${maxFiles} images. Please remove some to add more.`);
        onLimitReached?.();
        return;
      }

      // Limit files to remaining slots
      const filesToProcess = fileArray.slice(0, remainingSlots);

      // Validate each file
      const validFiles: File[] = [];
      const errors: string[] = [];

      filesToProcess.forEach((file) => {
        const validation = validateImageFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
      }

      if (validFiles.length > 0) {
        addImages(validFiles);
        onFilesAdded?.(validFiles);
      }

      if (fileArray.length > remainingSlots) {
        const skipped = fileArray.length - remainingSlots;
        setWarning(
          `✓ Added ${remainingSlots} image${remainingSlots > 1 ? 's' : ''}. ${skipped} image${skipped > 1 ? 's were' : ' was'} skipped (limit: ${maxFiles}).`
        );
      }
    },
    [addImages, currentImages.length, maxFiles, onFilesAdded, onLimitReached]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const { files } = e.dataTransfer;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFiles]
  );

  return (
    <div className={cn('w-full', className)}>
      <label
        className={cn(
          'flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label="Image upload drop zone"
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleInputChange}
          className="sr-only"
          aria-label={`Upload images, maximum ${maxFiles} files`}
        />

        <div className="flex flex-col items-center gap-1.5">
          <div className="rounded-full bg-muted p-2">
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Drop images here' : 'Drop images here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse (max {maxFiles})
            </p>
          </div>

          <p className="text-[10px] text-muted-foreground">
            JPG, PNG, GIF, WebP up to 50MB each
          </p>
        </div>
      </label>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          <span className="shrink-0" aria-hidden="true">✕</span>
          <span>{error}</span>
        </div>
      )}

      {warning && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400"
        >
          <span className="shrink-0" aria-hidden="true">⚠</span>
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}
