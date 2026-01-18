'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { useImageStore } from '@/stores/image-store';
import { usePipelineStore } from '@/stores/pipeline-store';
import { formatBytes } from '@/lib/utils/format';
import { downloadBlob } from '@/lib/image/utils';
import { getExifSummary } from '@/lib/image/exif';
import type { ExifMetadata } from '@/types/image';

export function PreviewModal() {
  const isOpen = useUIStore((state) => state.isPreviewModalOpen);
  const previewImageId = useUIStore((state) => state.previewImageId);
  const closePreviewModal = useUIStore((state) => state.closePreviewModal);
  const images = useImageStore((state) => state.images);
  const steps = usePipelineStore((state) => state.steps);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);

  const image = useMemo(() => {
    if (!previewImageId) return null;
    return images.find((img) => img.id === previewImageId) || null;
  }, [images, previewImageId]);

  const exifWasRemoved = useMemo(() => {
    return steps.find((s) => s.type === 'removeExif')?.enabled ?? false;
  }, [steps]);

  // Create object URL for preview
  useEffect(() => {
    if (image?.result?.blob) {
      const url = URL.createObjectURL(image.result.blob);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
    return undefined;
  }, [image?.result?.blob]);

  const handleDownload = () => {
    if (image?.result) {
      downloadBlob(image.result.blob, image.result.name);
    }
  };

  if (!image || !image.result) {
    return null;
  }

  const { result } = image;
  const savings = result.originalSize - result.compressedSize;
  const savingsPercent = ((savings / result.originalSize) * 100).toFixed(0);

  const originalExifSummary = useMemo(() => {
    if (!image?.originalExif) return [];
    return getExifSummary(image.originalExif as ExifMetadata);
  }, [image?.originalExif]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePreviewModal()}>
      <DialogContent className="w-auto min-w-[500px] max-w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-[95vw] [&>button]:hidden">
        {/* Image Preview */}
        <div className="flex max-h-[85vh] flex-col overflow-hidden">
          {/* Image */}
          <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/10 p-6">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={image.name}
                className="max-h-full w-auto max-w-full rounded-t-md rounded-b-md object-contain shadow-sm"
              />
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Loading preview...
              </div>
            )}
          </div>

          {/* Metadata Comparison */}
          {showMetadata && (
            <div className="border-t border-border bg-muted/30 px-5 py-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Original Metadata */}
                <div>
                  <h4 className="mb-2 font-medium text-foreground">Original Metadata</h4>
                  {originalExifSummary.length > 0 ? (
                    <ul className="space-y-1 text-muted-foreground">
                      {originalExifSummary.map((item, i) => (
                        <li key={i} className="truncate">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No metadata found</p>
                  )}
                </div>

                {/* Processed Metadata */}
                <div>
                  <h4 className="mb-2 font-medium text-foreground">After Processing</h4>
                  {exifWasRemoved ? (
                    <p className="text-emerald-600">Metadata removed for privacy</p>
                  ) : originalExifSummary.length > 0 ? (
                    <p className="text-muted-foreground">Metadata preserved</p>
                  ) : (
                    <p className="text-muted-foreground">No metadata</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3">
          {/* File name and size comparison */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{image.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatBytes(result.originalSize)}
              <span className="mx-2">→</span>
              <span className="font-medium text-foreground">{formatBytes(result.compressedSize)}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="ml-4 flex items-center gap-2">
            {originalExifSummary.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMetadata(!showMetadata)}
                className="text-xs"
              >
                {showMetadata ? 'Hide' : 'Show'} Metadata
              </Button>
            )}
            <Button variant="outline" onClick={closePreviewModal}>
              Close
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
