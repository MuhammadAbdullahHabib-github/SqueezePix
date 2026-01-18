'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getLicenseStatus, canPerformAction, type LicenseStatus } from '@/lib/license/check';
import { getTierLimits, type TierType } from '@/lib/license/tiers';

interface UseLicenseReturn {
  tier: TierType;
  limits: LicenseStatus['limits'];
  isLoading: boolean;
  isPro: boolean;
  isLifetime: boolean;
  canUseAI: boolean;
  canUseGeoTag: boolean;
  maxBatchSize: number;
  checkBatchLimit: (count: number) => { allowed: boolean; reason?: string };
  refresh: () => Promise<void>;
  expiresAt?: string;
  subscriptionId?: string;
}

/**
 * Hook to access the current user's license status and tier limits
 *
 * Automatically uses Clerk user context when available.
 * Falls back to free tier when user is not authenticated.
 *
 * Usage:
 * const { tier, isPro, canUseAI, maxBatchSize, checkBatchLimit } = useLicense();
 *
 * if (!isPro && enabledSteps.includes('altText')) {
 *   showUpgradeModal();
 * }
 */
export function useLicense(): UseLicenseReturn {
  const { user, isLoaded: isUserLoaded } = useUser();

  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    tier: 'free',
    limits: getTierLimits('free'),
    isValid: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | undefined>();
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>();

  const fetchLicense = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use Clerk user ID if available
      const userId = user?.id;
      const status = await getLicenseStatus(userId);
      setLicenseStatus(status);
      setExpiresAt(status.expiresAt);
    } catch (error) {
      console.error('Failed to fetch license:', error);
      // Keep current status on error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch license when user context changes
  useEffect(() => {
    if (isUserLoaded) {
      fetchLicense();
    }
  }, [fetchLicense, isUserLoaded]);

  // Also check public metadata directly for faster updates
  useEffect(() => {
    if (user?.publicMetadata) {
      const metadata = user.publicMetadata as {
        tier?: TierType;
        subscriptionEndsAt?: string;
        subscriptionId?: string;
      };

      if (metadata.tier) {
        setLicenseStatus({
          tier: metadata.tier,
          limits: getTierLimits(metadata.tier),
          isValid: true,
          expiresAt: metadata.subscriptionEndsAt,
        });
        setExpiresAt(metadata.subscriptionEndsAt);
        setSubscriptionId(metadata.subscriptionId);
      }
    }
  }, [user?.publicMetadata]);

  const checkBatchLimit = useCallback(
    (count: number) => canPerformAction(licenseStatus, 'batch', { batchSize: count }),
    [licenseStatus]
  );

  const tier = licenseStatus.tier;

  return {
    tier,
    limits: licenseStatus.limits,
    isLoading: !isUserLoaded || isLoading,
    isPro: tier === 'pro' || tier === 'lifetime',
    isLifetime: tier === 'lifetime',
    canUseAI: licenseStatus.limits.aiEnabled,
    canUseGeoTag: licenseStatus.limits.geoTagEnabled,
    maxBatchSize: licenseStatus.limits.maxBatchSize,
    checkBatchLimit,
    refresh: fetchLicense,
    expiresAt,
    subscriptionId,
  };
}
