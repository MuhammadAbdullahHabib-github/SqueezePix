/**
 * Tier definitions and limits for SqueezePix
 */

export type TierType = 'free' | 'pro' | 'lifetime';

export interface TierLimits {
  maxBatchSize: number;
  aiEnabled: boolean;
  geoTagEnabled: boolean;
  customPresetsEnabled: boolean;
  prioritySupport: boolean;
}

export interface Tier {
  id: TierType;
  name: string;
  description: string;
  limits: TierLimits;
  price?: {
    monthly?: number;
    yearly?: number;
    lifetime?: number;
  };
}

/**
 * Tier definitions with their respective limits
 */
export const TIERS: Record<TierType, Tier> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic image optimization',
    limits: {
      maxBatchSize: 10,
      aiEnabled: false,
      geoTagEnabled: true,
      customPresetsEnabled: false,
      prioritySupport: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Full access to all features',
    limits: {
      maxBatchSize: 50,
      aiEnabled: true,
      geoTagEnabled: true,
      customPresetsEnabled: true,
      prioritySupport: true,
    },
    price: {
      monthly: 9,
      yearly: 49,
    },
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    description: 'One-time purchase, lifetime access',
    limits: {
      maxBatchSize: 50,
      aiEnabled: true,
      geoTagEnabled: true,
      customPresetsEnabled: true,
      prioritySupport: true,
    },
    price: {
      lifetime: 99,
    },
  },
};

/**
 * Get tier limits for a given tier type
 */
export function getTierLimits(tier: TierType): TierLimits {
  return TIERS[tier].limits;
}

/**
 * Get tier info by type
 */
export function getTier(tier: TierType): Tier {
  return TIERS[tier];
}

/**
 * Check if a feature is available for a given tier
 */
export function isFeatureAvailable(
  tier: TierType,
  feature: keyof TierLimits
): boolean {
  const limits = getTierLimits(tier);
  return Boolean(limits[feature]);
}

/**
 * Get the maximum batch size for a tier
 */
export function getMaxBatchSize(tier: TierType): number {
  return getTierLimits(tier).maxBatchSize;
}

/**
 * Check if AI is available for a tier
 */
export function isAIEnabled(tier: TierType): boolean {
  return getTierLimits(tier).aiEnabled;
}
