/**
 * Pipeline executor - runs processing steps in user-defined order
 */

import type { PipelineStep, PipelineStepSettings } from '@/types/pipeline';

export interface ExecutionContext {
  file: File;
  originalSize: number;
  originalIsJpeg: boolean;
  currentIsJpeg: boolean;
  geoLocation?: PipelineStepSettings['geoLocation'];
  keywords?: string[];
}

export interface StepExecutionResult {
  applied: boolean;
  skipped?: boolean;
  reason?: string;
  file?: File;
}

export type StepExecutor = (
  context: ExecutionContext,
  settings?: PipelineStepSettings
) => Promise<StepExecutionResult>;

/**
 * Create a pipeline executor that runs steps in order
 * This is used by the useImageProcessor hook
 */
export function createPipelineExecutor(
  steps: PipelineStep[],
  executors: Record<string, StepExecutor>
) {
  return async function executePipeline(
    initialContext: ExecutionContext
  ): Promise<{
    file: File;
    stepsApplied: Record<string, StepExecutionResult>;
  }> {
    let context = { ...initialContext };
    const stepsApplied: Record<string, StepExecutionResult> = {};

    // Execute each enabled step in order
    for (const step of steps.filter((s) => s.enabled).sort((a, b) => a.order - b.order)) {
      const executor = executors[step.type];

      if (!executor) {
        console.warn(`No executor found for step type: ${step.type}`);
        stepsApplied[step.type] = {
          applied: false,
          skipped: true,
          reason: 'Executor not found',
        };
        continue;
      }

      try {
        const result = await executor(context, step.settings);
        stepsApplied[step.type] = result;

        // Update context if step returned a new file
        if (result.file) {
          context = {
            ...context,
            file: result.file,
            currentIsJpeg:
              result.file.type.includes('jpeg') || result.file.type.includes('jpg'),
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        stepsApplied[step.type] = {
          applied: false,
          skipped: true,
          reason: `Error: ${errorMessage}`,
        };
      }
    }

    return {
      file: context.file,
      stepsApplied,
    };
  };
}

/**
 * Validate pipeline configuration
 * Returns warnings for incompatible step combinations
 */
export function validatePipeline(
  steps: PipelineStep[]
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const enabledSteps = steps.filter((s) => s.enabled);

  // Check for incompatible combinations
  const hasWebP = enabledSteps.some((s) => s.type === 'convertWebp');
  const hasGeoTag = enabledSteps.some((s) => s.type === 'geoTag');

  if (hasWebP && hasGeoTag) {
    warnings.push(
      'WebP conversion is enabled but Geo-Tag requires JPEG. Geo-tagging will be skipped for WebP output.'
    );
  }

  // Check for AI alt text without proper setup
  const hasAltText = enabledSteps.some((s) => s.type === 'altText');
  if (hasAltText) {
    warnings.push(
      'AI Alt Text requires API key configuration. Check your environment setup.'
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Get the expected output format based on pipeline configuration
 */
export function getExpectedOutputFormat(steps: PipelineStep[]): string {
  const enabledSteps = steps.filter((s) => s.enabled);
  const hasWebP = enabledSteps.some((s) => s.type === 'convertWebp');
  const hasGeoTag = enabledSteps.some((s) => s.type === 'geoTag');

  if (hasWebP) {
    return 'WebP';
  }

  if (hasGeoTag) {
    return 'JPEG'; // Geo-tagging requires JPEG
  }

  return 'Original'; // Preserves input format
}
