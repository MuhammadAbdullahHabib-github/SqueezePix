'use client';

import { usePipelineStore } from '@/stores/pipeline-store';
import { cn } from '@/lib/utils';
import { formatCompressionStats, truncateFilename, formatBytes } from '@/lib/utils/format';
import { downloadBlob } from '@/lib/image/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import type { ImageFile } from '@/types/image';
import {
  CheckCircle,
  X,
  Download,
  Loader2,
  Shrink,
  Shield,
  FileImage,
  Sparkles,
  MapPin,
  MessageSquare,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface ResultItemProps {
  image: ImageFile;
  onPreview?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function ResultItem({ image, onPreview, onRemove }: ResultItemProps) {
  const steps = usePipelineStore((state) => state.steps);
  const activeSteps = steps.filter(s => s.enabled);

  const handleDownload = () => {
    if (image.result) {
      downloadBlob(image.result.blob, image.result.name);
    }
  };

  const stats = image.result
    ? formatCompressionStats(image.result.originalSize, image.result.compressedSize)
    : null;

  // Helper to get step icon
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'compress': return Shrink;
      case 'removeExif': return Shield;
      case 'convertWebp': return FileImage;
      case 'geoTag': return MapPin;
      case 'altText': return Sparkles;
      default: return CheckCircle;
    }
  };

  const getStepLabel = (type: string) => {
    switch (type) {
      case 'compress': return 'Compress';
      case 'removeExif': return 'Remove EXIF';
      case 'convertWebp': return 'WebP';
      case 'geoTag': return 'Geo-Tag';
      case 'altText': return 'AI Alt Text';
      default: return type;
    }
  };

  return (
    <Card
      className="relative overflow-hidden border border-border bg-card p-4 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      role="article"
      aria-label={`Image: ${image.name}, Status: ${image.status === 'complete' ? 'Complete' : image.status === 'processing' ? 'Processing' : 'Ready'}`}
    >
      {/* Main Row */}
      <div className="flex items-start gap-4">
        {/* Thumbnail Placeholder */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-medium text-muted-foreground">
          {image.previewUrl ? (
            <img
              src={image.previewUrl}
              alt={image.name}
              className="h-full w-full object-cover"
              decoding="async"
            />
          ) : (
            <span>{image.file.type.split('/')[1]?.toUpperCase() || 'IMG'} Image</span>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold leading-none truncate" title={image.name}>
                {truncateFilename(image.name, 40)}
              </h4>
              <p className="text-sm text-muted-foreground">
                {image.status === 'complete' && stats ? (
                  <span className="flex items-center gap-2">
                    <span>{formatBytes(image.result!.originalSize)}</span>
                    <span>→</span>
                    <span>{formatBytes(image.result!.compressedSize)}</span>
                    <span className={cn(
                      "font-medium",
                      stats.status === 'reduced' ? "text-emerald-500" :
                        stats.status === 'increased' ? "text-amber-500" :
                          "text-muted-foreground"
                    )}>
                      ({stats.percentage})
                    </span>
                  </span>
                ) : (
                  <span>
                    {formatBytes(image.file.size)} • {image.width} x {image.height} px
                  </span>
                )}
              </p>
            </div>

            {/* Top Right Actions/Status */}
            <div className="flex items-center gap-2">
              {image.status === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}

              {image.status === 'complete' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    <span aria-label="Status: Complete">Complete</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={handleDownload}
                    aria-label={`Download ${image.result?.name || image.name}`}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              )}

              {image.status === 'pending' && (
                <span className="text-sm font-medium text-muted-foreground">Ready</span>
              )}

              {/* Close Button (Generic for all except processing usually, keeping visible for now) */}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground/50 hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                  onClick={() => onRemove(image.id)}
                  aria-label={`Remove ${image.name} from queue`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          {/* Contextual Bottom Row */}
          <div className="mt-2">
            {image.status === 'processing' ? (
              <Progress
                value={image.progress}
                className="h-1.5 w-full"
                aria-label={`Processing ${image.name}: ${image.progress}% complete`}
              />
            ) : image.status === 'complete' ? (
              <div className="space-y-3">
                {/* Alt Text Box - Shows generated alt text */}
                {activeSteps.some(s => s.type === 'altText') && (
                  <div className="rounded-md bg-muted/30 p-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="space-y-1 w-full">
                        {image.result?.altText ? (
                          <>
                            <p className="text-foreground">
                              "{image.result.altText}"
                            </p>
                            <button
                              className="text-xs font-medium text-primary hover:underline"
                              onClick={() => {
                                navigator.clipboard.writeText(image.result?.altText || '');
                              }}
                            >
                              Copy alt text
                            </button>
                          </>
                        ) : image.result?.stepsApplied?.altText?.skipped ? (
                          <p className="italic text-muted-foreground">
                            {image.result.stepsApplied.altText.reason || 'Alt text generation skipped'}
                          </p>
                        ) : (
                          <p className="italic text-muted-foreground">
                            Alt text not generated
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Steps Icons - Show actual results */}
                <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                  {activeSteps.map(step => {
                    const stepResult = image.result?.stepsApplied?.[step.type];
                    const applied = stepResult?.applied;
                    const skipped = stepResult?.skipped;
                    const reason = stepResult?.reason;

                    // For altText, applied with reason means success (reason contains the alt text)
                    const isAltTextSuccess = step.type === 'altText' && applied && reason;

                    // Determine display state
                    if (applied && !reason || isAltTextSuccess) {
                      // Successfully applied
                      return (
                        <div key={step.id} className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>
                            {step.type === 'compress' ? 'Compressed' :
                              step.type === 'removeExif' ? 'EXIF Removed' :
                                step.type === 'altText' ? 'Alt Text' :
                                  step.label}
                          </span>
                        </div>
                      );
                    } else if (applied && reason) {
                      // Applied with warning (not altText)
                      return (
                        <div key={step.id} className="flex items-center gap-1.5 text-amber-500" title={reason}>
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{step.label}</span>
                        </div>
                      );
                    } else if (skipped) {
                      // Skipped
                      return (
                        <div key={step.id} className="flex items-center gap-1.5 text-muted-foreground/50" title={reason}>
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="line-through">{step.label}</span>
                        </div>
                      );
                    } else {
                      // Default - show as applied (fallback for steps not tracked)
                      return (
                        <div key={step.id} className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>{step.label}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ) : ( /* Ready/Pending State */
              <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                {activeSteps.map(step => {
                  const Icon = getStepIcon(step.type);
                  return (
                    <div key={step.id} className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 opacity-30" />
                      <div className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        <span>{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
