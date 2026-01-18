'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PipelineStep } from '@/types/pipeline';
import {
  Shrink,
  FileImage,
  Shield,
  MapPin,
  Sparkles,
  ChevronRight,
  Lock,
  Ban,
  GripVertical,
} from 'lucide-react';

interface WorkflowChipProps {
  step: PipelineStep;
  isDisabled?: boolean;
  isProLocked?: boolean;
  stepNumber?: number;
  onToggle: (stepId: string) => void;
  onClick?: (stepId: string) => void;
}

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  compress: Shrink,
  convertWebp: FileImage,
  removeExif: Shield,
  geoTag: MapPin,
  altText: Sparkles,
};

const stepDescriptions: Record<string, string> = {
  compress: 'Reduce file size while maintaining quality',
  convertWebp: 'Convert to WebP format for better compression',
  removeExif: 'Remove metadata for privacy and smaller files',
  geoTag: 'Add location data for local SEO',
  altText: 'Generate AI-powered image descriptions',
};

export function WorkflowChip({
  step,
  isDisabled = false,
  isProLocked = false,
  stepNumber,
  onToggle,
  onClick,
}: WorkflowChipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = stepIcons[step.type] || ChevronRight;
  const isEffectivelyDisabled = isDisabled || isProLocked;

  const chipContent = (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-1 rounded-full border px-1.5 py-1 transition-all',
        step.enabled && !isEffectivelyDisabled
          ? 'border-primary/50 bg-primary/10 text-foreground'
          : 'border-border bg-muted/30 text-muted-foreground',
        isEffectivelyDisabled && 'opacity-50',
        isDragging && 'shadow-lg scale-105 z-50 ring-2 ring-primary',
        !isDragging && !isEffectivelyDisabled && 'hover:bg-primary/20 hover:border-primary/50'
      )}
    >
      <span id={`${step.id}-description`} className="sr-only">
        {step.label} - {step.enabled ? 'enabled' : 'disabled'}. Drag to reorder, click to toggle.
      </span>

      {/* Drag Handle - only this element triggers drag */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors',
          isDragging && 'cursor-grabbing',
          isEffectivelyDisabled && 'cursor-not-allowed opacity-50'
        )}
        aria-label={`Drag to reorder ${step.label}`}
        role="button"
        tabIndex={isEffectivelyDisabled ? -1 : 0}
      >
        <GripVertical className="h-3 w-3" />
      </div>

      {/* Clickable area for toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isEffectivelyDisabled) onToggle(step.id);
        }}
        disabled={isEffectivelyDisabled}
        className={cn(
          'flex items-center gap-1 cursor-pointer',
          isEffectivelyDisabled && 'cursor-not-allowed'
        )}
      >
        {/* Step Number */}
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
            step.enabled && !isEffectivelyDisabled
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted-foreground/20 text-muted-foreground'
          )}
        >
          {stepNumber}
        </span>

        {/* Icon */}
        <Icon
          className={cn(
            'h-3 w-3',
            step.enabled && !isEffectivelyDisabled ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-hidden="true"
        />

        {/* Label */}
        <span
          className={cn(
            'text-[11px] font-medium whitespace-nowrap',
            step.enabled && !isEffectivelyDisabled ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {step.label}
        </span>
      </button>

      {/* Pro Badge */}
      {step.requiresPro && (
        <span
          className={cn(
            'rounded px-1 py-0.5 text-[7px] font-bold',
            isProLocked
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-primary/20 text-primary'
          )}
        >
          PRO
        </span>
      )}

      {/* Lock/Disabled indicator */}
      {isProLocked && <Lock className="h-2.5 w-2.5 text-amber-500" />}
      {isDisabled && !isProLocked && <Ban className="h-2.5 w-2.5 text-muted-foreground" />}
    </div>
  );

  // Wrap in tooltip for description
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>{chipContent}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="text-xs">
          {isProLocked
            ? 'Upgrade to Pro to use this feature'
            : isDisabled
              ? 'Disabled when WebP is enabled'
              : stepDescriptions[step.type] || step.label}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
