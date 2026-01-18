/**
 * License validation client utility
 * Checks user's tier status (local check + optional server validation)
 */

import { getTierLimits, type TierType, type TierLimits } from './tiers';

export interface LicenseStatus {
  tier: TierType;
  limits: TierLimits;
  isValid: boolean;
  expiresAt?: string;
}

/**
 * Get the current license status
 * In development, defaults to 'free' tier
 * In production, checks Clerk user metadata
 */
export async function getLicenseStatus(userId?: string): Promise<LicenseStatus> {
  // If no userId, return free tier
  if (!userId) {
    return {
      tier: 'free',
      limits: getTierLimits('free'),
      isValid: true,
    };
  }

  try {
    // Call the license check API
    const response = await fetch('/api/license/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      // Fall back to free tier on error
      return {
        tier: 'free',
        limits: getTierLimits('free'),
        isValid: true,
      };
    }

    const data = await response.json();

    return {
      tier: data.tier || 'free',
      limits: getTierLimits(data.tier || 'free'),
      isValid: true,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error('License check failed:', error);
    // Fall back to free tier on error
    return {
      tier: 'free',
      limits: getTierLimits('free'),
      isValid: true,
    };
  }
}

/**
 * Check if the user can perform an action based on their tier
 */
export function canPerformAction(
  licenseStatus: LicenseStatus,
  action: 'batch' | 'ai' | 'geoTag' | 'customPresets',
  context?: { batchSize?: number }
): { allowed: boolean; reason?: string } {
  const { limits } = licenseStatus;

  switch (action) {
    case 'batch':
      if (context?.batchSize && context.batchSize > limits.maxBatchSize) {
        return {
          allowed: false,
          reason: `Free tier is limited to ${limits.maxBatchSize} images. Upgrade to Pro for up to 50 images.`,
        };
      }
      return { allowed: true };

    case 'ai':
      if (!limits.aiEnabled) {
        return {
          allowed: false,
          reason: 'AI alt text generation is a Pro feature. Upgrade to unlock.',
        };
      }
      return { allowed: true };

    case 'geoTag':
      if (!limits.geoTagEnabled) {
        return {
          allowed: false,
          reason: 'Geo-tagging is not available on your current plan.',
        };
      }
      return { allowed: true };

    case 'customPresets':
      if (!limits.customPresetsEnabled) {
        return {
          allowed: false,
          reason: 'Custom presets are a Pro feature. Upgrade to save your own presets.',
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}
