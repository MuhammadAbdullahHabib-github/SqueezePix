'use client';

import { useLicense } from '@/hooks/use-license';
import { getCustomerPortalUrl } from '@/lib/lemonsqueezy/checkout';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink, Infinity, CalendarDays, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Displays current subscription status for Pro/Lifetime users
 * Shows plan type, renewal date, and link to manage subscription
 */
export function SubscriptionStatus() {
  const { tier, isLifetime, expiresAt, isLoading } = useLicense();
  const portalUrl = getCustomerPortalUrl();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-2 h-3 w-32 rounded bg-muted" />
      </div>
    );
  }

  // Format expiration date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const renewalDate = formatDate(expiresAt);

  const handleManageSubscription = () => {
    if (portalUrl) {
      window.open(portalUrl, '_blank');
    }
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      {/* Plan badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">
                {isLifetime ? 'Lifetime' : 'Pro'} Plan
              </span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription details */}
      <div className="mt-3 space-y-2">
        {isLifetime ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Infinity className="h-3.5 w-3.5 text-primary" />
            <span>Lifetime access - never expires</span>
          </div>
        ) : renewalDate ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Renews on {renewalDate}</span>
          </div>
        ) : null}
      </div>

      {/* Manage subscription button */}
      {portalUrl && !isLifetime && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full gap-2"
          onClick={handleManageSubscription}
        >
          <Settings className="h-3.5 w-3.5" />
          Manage Subscription
          <ExternalLink className="h-3 w-3 opacity-50" />
        </Button>
      )}

      {/* Features reminder */}
      <div className="mt-3 border-t border-primary/10 pt-3">
        <p className="text-[10px] text-muted-foreground">
          You have unlimited images per day with all features included.
        </p>
      </div>
    </div>
  );
}
