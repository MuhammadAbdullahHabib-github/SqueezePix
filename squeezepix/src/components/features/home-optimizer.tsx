'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { DropZone } from '@/components/features/drop-zone';
import { ResultsList } from '@/components/features/results-list';
import { WorkflowPipeline } from '@/components/features/workflow-pipeline';
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useImageProcessor } from '@/hooks/use-image-processor';
import { useAnonymousUsage } from '@/hooks/use-anonymous-usage';
import { useImageStore } from '@/stores/image-store';
import { useUIStore } from '@/stores/ui-store';
import { usePipelineStore } from '@/stores/pipeline-store';
import { useSettingsStore } from '@/stores/settings-store';
import { generateZip, downloadZip } from '@/lib/export/zip';
import { downloadBlob } from '@/lib/image/utils';
import { formatBytes } from '@/lib/utils/format';
import { Download, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarLeft } from '@/components/features/sidebar-left';

export function HomeOptimizer() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptTrigger, setUpgradePromptTrigger] = useState<'limit_reached' | 'batch_complete'>('batch_complete');

  const { isProcessing, processAllImages, pendingCount, completedCount, totalCount } =
    useImageProcessor();
  const images = useImageStore((state) => state.images);
  const clearImages = useImageStore((state) => state.clearImages);
  const processingProgress = useUIStore((state) => state.processingProgress);

  // Anonymous usage tracking
  const { totalProcessed, incrementUsage, hasReachedLimit, shouldShowUpgradePrompt, freeLimit } =
    useAnonymousUsage();

  // Check if geo-tag is enabled but no location selected
  const steps = usePipelineStore((state) => state.steps);
  const includeMetadataJson = useSettingsStore((state) => state.includeMetadataJson);
  const includeMetadataCsv = useSettingsStore((state) => state.includeMetadataCsv);
  const geoTagStep = steps.find((s) => s.type === 'geoTag');
  const webpStep = steps.find((s) => s.type === 'convertWebp');
  const geoTagEnabled = geoTagStep?.enabled && !webpStep?.enabled;
  const hasGeoLocation = geoTagStep?.settings?.geoLocation;
  const geoTagMissingLocation = geoTagEnabled && !hasGeoLocation;

  const completedImages = images.filter((img) => img.status === 'complete' && img.result);
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Track completed images and increment anonymous usage
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);
  useEffect(() => {
    if (completedCount > prevCompletedCount && !isProcessing) {
      const newlyCompleted = completedCount - prevCompletedCount;
      incrementUsage(newlyCompleted);

      // Show upgrade prompt after batch completes if user has processed 10+ total
      if (totalProcessed + newlyCompleted >= freeLimit) {
        setUpgradePromptTrigger('batch_complete');
        setShowUpgradePrompt(true);
      }
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, prevCompletedCount, isProcessing, incrementUsage, totalProcessed, freeLimit]);

  // Handle limit reached when trying to add more images
  const handleLimitReached = useCallback(() => {
    setUpgradePromptTrigger('limit_reached');
    setShowUpgradePrompt(true);
  }, []);

  const handleDownload = async () => {
    if (completedImages.length === 0) return;

    // Single file - direct download
    if (completedImages.length === 1) {
      const img = completedImages[0];
      if (img.result) {
        downloadBlob(img.result.blob, img.result.name);
      }
      return;
    }

    // Multiple files - ZIP download
    setIsDownloading(true);
    try {
      const zipBlob = await generateZip(
        completedImages.map((img) => ({
          name: img.name,
          result: img.result!,
        })),
        {
          includeMetadataJson,
          includeMetadataCsv,
        }
      );
      downloadZip(zipBlob);
    } catch (error) {
      console.error('Failed to generate ZIP:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine main action button state
  const getMainButtonConfig = () => {
    if (isProcessing) {
      return {
        label: 'Optimizing...',
        action: () => {},
        disabled: true,
        showSpinner: true,
        icon: null,
        warning: null,
      };
    }

    if (allCompleted) {
      return {
        label: completedCount === 1 ? 'Download' : 'Download ZIP',
        action: handleDownload,
        disabled: isDownloading,
        showSpinner: isDownloading,
        icon: <Download className="h-3.5 w-3.5" />,
        warning: null,
      };
    }

    // Check if geo-tag needs a location
    if (geoTagMissingLocation) {
      return {
        label: pendingCount === 1 ? 'Optimize' : 'Optimize All',
        action: () => {},
        disabled: true,
        showSpinner: false,
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        warning: 'Select a city for Geo-Tag',
      };
    }

    return {
      label: pendingCount === 1 ? 'Optimize' : 'Optimize All',
      action: processAllImages,
      disabled: pendingCount === 0,
      showSpinner: false,
      icon: <span>▶</span>,
      warning: null,
    };
  };

  const mainButton = getMainButtonConfig();

  // Calculate totals for stats
  const totalOriginal = images.reduce(
    (acc, img) => acc + (img.result?.originalSize || img.file.size),
    0
  );
  const totalOptimized = images.reduce(
    (acc, img) => acc + (img.result?.compressedSize || 0),
    0
  );
  const totalOriginalCompleted = images
    .filter((img) => img.status === 'complete' && img.result)
    .reduce((acc, img) => acc + (img.result?.originalSize || 0), 0);
  const totalSaved = totalOriginalCompleted - totalOptimized;

  return (
    <div className="space-y-4">
      {/* Pipeline - Compact for homepage */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Processing Pipeline
          </h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Processing Options</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SidebarLeft />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <WorkflowPipeline />
      </div>

      {/* Drop Zone */}
      <DropZone onLimitReached={handleLimitReached} />

      {/* Results Section */}
      {totalCount > 0 && (
        <div className="space-y-3">
          {/* Queue Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">
              Processing Queue ({totalCount})
            </h2>
            <div className="flex items-center gap-2">
              {totalCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearImages}
                  disabled={isProcessing}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
              <Button
                size="sm"
                onClick={mainButton.action}
                disabled={mainButton.disabled}
                className="gap-2"
              >
                {mainButton.showSpinner ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  mainButton.icon
                )}
                {mainButton.label}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && totalCount > 1 && (
            <Progress value={processingProgress} className="h-1" />
          )}

          {/* Results List */}
          <ResultsList />

          {/* Stats Bar */}
          {completedCount > 0 && (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Original:</span> {formatBytes(totalOriginal)}
                </div>
                <div>
                  <span className="font-medium">Optimized:</span> {formatBytes(totalOptimized)}
                </div>
                <div className="text-emerald-500">
                  <span className="font-medium">Saved:</span> {formatBytes(totalSaved)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state CTA */}
      {totalCount === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Free: {freeLimit} images/day with all features.{' '}
            <Link href="/pricing" className="text-primary hover:underline">
              Upgrade to Pro
            </Link>{' '}
            for unlimited images.
          </p>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        totalProcessed={totalProcessed}
        trigger={upgradePromptTrigger}
      />
    </div>
  );
}
