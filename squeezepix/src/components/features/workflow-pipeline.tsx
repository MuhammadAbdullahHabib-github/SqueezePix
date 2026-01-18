'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { WorkflowChip } from './workflow-chip';
import { usePipelineStore } from '@/stores/pipeline-store';
import { useLicense } from '@/hooks/use-license';
import { cn } from '@/lib/utils';
import { ChevronRight, AlertTriangle, GripVertical, MousePointerClick } from 'lucide-react';
import type { PipelineStep } from '@/types/pipeline';

interface WorkflowPipelineProps {
  onStepClick?: (stepId: string) => void;
}

// Flow arrow component between steps
function FlowArrow({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex shrink-0 items-center px-0.5">
      <ChevronRight
        className={cn(
          'h-3 w-3 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground/30'
        )}
      />
    </div>
  );
}

export function WorkflowPipeline({ onStepClick }: WorkflowPipelineProps) {
  const steps = usePipelineStore((state) => state.steps);
  const toggleStep = usePipelineStore((state) => state.toggleStep);
  const reorderSteps = usePipelineStore((state) => state.reorderSteps);
  const { isPro } = useLicense();

  // Check if WebP is enabled to disable geo-tag
  const webpStep = steps.find((s) => s.type === 'convertWebp');
  const geoTagStep = steps.find((s) => s.type === 'geoTag');
  const isWebpEnabled = webpStep?.enabled;
  const isGeoTagEnabled = geoTagStep?.enabled;

  // Show conflict warning
  const hasConflict = isWebpEnabled && isGeoTagEnabled;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSteps(oldIndex, newIndex);
      }
    }
  };

  // Sort steps by order for display
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  // Filter to only show enabled steps for the active pipeline visualization
  const enabledSteps = sortedSteps.filter((s) => s.enabled);

  return (
    <div className="space-y-1.5">
      {/* Header with drag hint */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground">Processing Pipeline</span>
          {enabledSteps.length > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              {enabledSteps.length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5" /> Drag to reorder
          </span>
          <span className="flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5" /> Click to toggle
          </span>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div
        className="w-full overflow-x-auto rounded-md border bg-muted/20 p-2 scrollbar-thin"
        role="region"
        aria-label="Image processing workflow pipeline"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSteps.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div
              className="flex items-center gap-0"
              role="list"
              aria-label="Processing steps - drag to reorder"
            >
              {sortedSteps.map((step, index) => {
                // Geo-tag is disabled when WebP is enabled
                const isDisabled = step.type === 'geoTag' && isWebpEnabled;
                const isProLocked = step.requiresPro && !isPro;

                // Determine if we should show an arrow after this step
                const showArrow = index < sortedSteps.length - 1;
                // Arrow is "active" if current step is enabled and next enabled step exists
                const nextStepIndex = sortedSteps.findIndex(
                  (s, i) => i > index && s.enabled && !(s.type === 'geoTag' && isWebpEnabled)
                );
                const isArrowActive =
                  step.enabled && !isDisabled && nextStepIndex !== -1;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      role="listitem"
                      aria-label={`Step ${index + 1}: ${step.label}${step.enabled ? ' (enabled)' : ' (disabled)'}${isDisabled ? ' - unavailable with WebP' : ''}`}
                    >
                      <WorkflowChip
                        step={step}
                        isDisabled={isDisabled}
                        isProLocked={isProLocked}
                        stepNumber={index + 1}
                        onToggle={toggleStep}
                        onClick={onStepClick}
                      />
                    </div>
                    {showArrow && <FlowArrow isActive={isArrowActive} />}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Conflict warning */}
      {hasConflict && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-medium">Geo-Tag disabled:</span> WebP format doesn't support EXIF
            geo-location data. Disable WebP to use Geo-Tag.
          </p>
        </div>
      )}
    </div>
  );
}
