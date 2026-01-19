'use client';

import { useRef, useState, useEffect } from 'react';
import { DropZone } from '@/components/features/drop-zone';
import { ResultsList } from '@/components/features/results-list';
import { SidebarLeft } from '@/components/features/sidebar-left';
import { SidebarRight } from '@/components/features/sidebar-right';
import { WorkflowPipeline } from '@/components/features/workflow-pipeline';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useImageProcessor } from '@/hooks/use-image-processor';
import { useImageStore } from '@/stores/image-store';
import { useUIStore } from '@/stores/ui-store';
import { usePipelineStore } from '@/stores/pipeline-store';
import { useSettingsStore } from '@/stores/settings-store';
import { generateZip, downloadZip } from '@/lib/export/zip';
import { downloadBlob } from '@/lib/image/utils';
import { formatBytes } from '@/lib/utils/format';
import { Download, AlertCircle, Settings, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function AppPage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const { isProcessing, processAllImages, pendingCount, completedCount, totalCount } =
    useImageProcessor();
  const images = useImageStore((state) => state.images);
  const clearImages = useImageStore((state) => state.clearImages);
  const processingProgress = useUIStore((state) => state.processingProgress);

  // Check if geo-tag is enabled but no location selected
  const steps = usePipelineStore((state) => state.steps);
  const includeMetadataCsv = useSettingsStore((state) => state.includeMetadataCsv);
  const geoTagStep = steps.find((s) => s.type === 'geoTag');
  const webpStep = steps.find((s) => s.type === 'convertWebp');
  const geoTagEnabled = geoTagStep?.enabled && !webpStep?.enabled; // Only matters if WebP is off
  const hasGeoLocation = geoTagStep?.settings?.geoLocation;
  const geoTagMissingLocation = geoTagEnabled && !hasGeoLocation;

  const completedImages = images.filter((img) => img.status === 'complete' && img.result);
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // T122: Warn user when closing tab during processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = 'Images are still being processed. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessing]);

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
        action: () => { },
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

    // Show warning if geo-tag is enabled but no location (but don't disable)
    return {
      label: pendingCount === 1 ? 'Optimize' : 'Optimize All',
      action: processAllImages,
      disabled: pendingCount === 0,
      showSpinner: false,
      icon: <span>▶</span>,
      warning: geoTagMissingLocation ? 'Geo-Tag enabled but no location set (will be skipped)' : null,
    };
  };

  const mainButton = getMainButtonConfig();

  // Calculate totals for footer
  const totalOriginal = images.reduce((acc, img) => acc + (img.result?.originalSize || img.file.size), 0);
  const totalOptimized = images.reduce((acc, img) => acc + (img.result?.compressedSize || 0), 0);

  // Only calculate savings for completed images
  const totalOriginalCompleted = images
    .filter(img => img.status === 'complete' && img.result)
    .reduce((acc, img) => acc + (img.result?.originalSize || 0), 0);

  const totalSaved = totalOriginalCompleted - totalOptimized;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background/50">
      {/* Skip Links for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <a
        href="#drop-zone"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to upload area
      </a>

      {/* T126: Responsive Layout */}

      {/* Left Sidebar - Hidden on mobile, shown on lg+ */}
      <aside
        className="hidden lg:block w-[280px] shrink-0 overflow-hidden border-r border-border bg-muted/10"
        aria-label="Processing options sidebar"
      >
        <SidebarLeft />
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex flex-1 flex-col overflow-hidden bg-background"
        aria-label="Image processing area"
      >
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">

            {/* Mobile Controls - Only visible on mobile */}
            <div className="flex gap-2 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Settings className="h-4 w-4" />
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

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <FileText className="h-4 w-4" />
                    Export
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Export Settings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <SidebarRight />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* T114: Visual Pipeline Indicator */}
            <div className="rounded-lg border border-border bg-card p-3 md:p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Processing Pipeline
                </h3>
              </div>
              <WorkflowPipeline />
            </div>

            {/* Drop Zone */}
            <div id="drop-zone">
              <DropZone />
            </div>

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
              <Progress
                value={processingProgress}
                className="h-1"
                aria-label={`Overall progress: ${Math.round(processingProgress)}% complete`}
              />
            )}

            {/* Results List */}
            <ResultsList />

          </div>
        </div>

        {/* Footer Stats Bar */}
        {totalCount > 0 && (
          <div className="border-t border-border bg-card p-3 md:p-4">
            <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3 md:gap-6 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Original:</span> {formatBytes(totalOriginal)}
                </div>
                {completedCount > 0 && (
                  <>
                    <div>
                      <span className="font-medium">Optimized:</span> {formatBytes(totalOptimized)}
                    </div>
                    <div className="text-emerald-500">
                      <span className="font-medium">Saved:</span> {formatBytes(totalSaved)}
                    </div>
                  </>
                )}
              </div>

              {/* Status indicator */}
              <div className="text-xs text-muted-foreground">
                {completedCount === 0 && pendingCount > 0 && (
                  <span>{pendingCount} {pendingCount === 1 ? 'image' : 'images'} ready</span>
                )}
                {completedCount > 0 && completedCount < totalCount && (
                  <span>{completedCount} of {totalCount} completed</span>
                )}
                {allCompleted && (
                  <span className="text-emerald-500 font-medium">✓ All optimized</span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Hidden on mobile, shown on lg+ */}
      <aside
        className="hidden lg:block w-[320px] shrink-0 overflow-hidden border-l border-border bg-muted/10 p-6"
        aria-label="Export options sidebar"
      >
        <SidebarRight />
      </aside>

    </div>
  );
}
