'use client';
import { useMemo, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useImageStore } from '@/stores/image-store';
import { useUIStore } from '@/stores/ui-store';
import { ResultItem } from './result-item';
import { formatBytes } from '@/lib/utils/format';

interface ResultsListProps {
  onPreview?: (id: string) => void;
}

// Threshold for enabling virtualization
const VIRTUALIZATION_THRESHOLD = 20;
// Estimated row height for virtualization
const ESTIMATED_ROW_HEIGHT = 180;

export function ResultsList({ onPreview }: ResultsListProps) {
  const images = useImageStore((state) => state.images);
  const removeImage = useImageStore((state) => state.removeImage);
  const parentRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const completed = images.filter((img) => img.status === 'complete' && img.result);
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
  }, [images]);
  const openPreviewModal = useUIStore((state) => state.openPreviewModal);

  const handlePreview = useCallback((id: string) => {
    openPreviewModal(id);
    onPreview?.(id);
  }, [openPreviewModal, onPreview]);

  const handleRemove = useCallback((id: string) => {
    removeImage(id);
  }, [removeImage]);

  // Use virtualization for large lists
  const useVirtualization = images.length > VIRTUALIZATION_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 5,
    enabled: useVirtualization,
  });

  if (images.length === 0) {
    return null;
  }

  // For small lists, render without virtualization
  if (!useVirtualization) {
    return (
      <div className="flex flex-col gap-3 pb-8">
        {images.map((image) => (
          <ResultItem
            key={image.id}
            image={image}
            onPreview={handlePreview}
            onRemove={handleRemove}
          />
        ))}
      </div>
    );
  }

  // For large lists, use virtualization
  return (
    <div
      ref={parentRef}
      className="max-h-[600px] overflow-auto pb-8"
      style={{ contain: 'strict' }}
    >
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const image = images[virtualItem.index];
          return (
            <div
              key={image.id}
              className="absolute left-0 top-0 w-full px-0.5"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="pb-3">
                <ResultItem
                  image={image}
                  onPreview={handlePreview}
                  onRemove={handleRemove}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
