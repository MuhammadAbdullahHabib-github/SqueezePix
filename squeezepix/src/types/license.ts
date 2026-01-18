/**
 * License and tier types for subscription management
 */

export type Tier = 'free' | 'pro' | 'lifetime';

export interface LicenseStatus {
  tier: Tier;
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  expiresAt?: string;
}

export interface TierLimits {
  maxBatchSize: number;
  aiEnabled: boolean;
  geoTagEnabled: boolean;
  csvExportEnabled: boolean;
  jsonExportEnabled: boolean;
  customPresetsEnabled: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxBatchSize: 10,
    aiEnabled: false,
    geoTagEnabled: false,
    csvExportEnabled: false,
    jsonExportEnabled: false,
    customPresetsEnabled: false,
  },
  pro: {
    maxBatchSize: 50,
    aiEnabled: true,
    geoTagEnabled: true,
    csvExportEnabled: true,
    jsonExportEnabled: true,
    customPresetsEnabled: true,
  },
  lifetime: {
    maxBatchSize: 50,
    aiEnabled: true,
    geoTagEnabled: true,
    csvExportEnabled: true,
    jsonExportEnabled: true,
    customPresetsEnabled: true,
  },
};

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  checkoutUrl?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: [
      '10 images/batch',
      'Compression & WebP',
      'EXIF removal',
      'ZIP download',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: '$9',
    period: '/month',
    highlighted: true,
    features: [
      'Unlimited batch size',
      'AI alt text generation',
      'Geo-tagging',
      'JSON/CSV export',
      'Custom presets',
      'Priority support',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    price: '$49',
    period: '/year',
    features: [
      'Everything in Pro',
      'Save ~55%',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99',
    period: 'once',
    features: [
      'Everything in Pro',
      'Forever access',
      'No recurring fees',
    ],
  },
];
