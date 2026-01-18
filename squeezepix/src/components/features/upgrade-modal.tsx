'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TIERS } from '@/lib/license/tiers';
import {
  generatePlanCheckoutUrl,
  isCheckoutAvailable,
  type PlanType,
} from '@/lib/lemonsqueezy/checkout';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Zap, Crown, ExternalLink, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: 'ai' | 'batch' | 'presets';
  batchLimit?: number;
}

type PlanOption = {
  id: PlanType;
  name: string;
  description: string;
  price: string;
  period?: string;
  badge?: string;
  savings?: string;
};

export function UpgradeModal({
  open,
  onOpenChange,
  feature = 'ai',
  batchLimit,
}: UpgradeModalProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro-yearly');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const proTier = TIERS.pro;
  const lifetimeTier = TIERS.lifetime;
  const checkoutAvailable = isCheckoutAvailable();


  const getFeatureMessage = () => {
    switch (feature) {
      case 'ai':
        return 'AI-powered alt text generation is a Pro feature.';
      case 'batch':
        return `Free tier is limited to ${batchLimit ?? 10} images at a time.`;
      case 'presets':
        return 'Custom presets are a Pro feature.';
      default:
        return 'This feature requires a Pro subscription.';
    }
  };

  const features = [
    { icon: Sparkles, text: 'AI Alt Text Generation' },
    { icon: Zap, text: 'Up to 50 images per batch' },
    { icon: Crown, text: 'Custom presets' },
    { icon: Check, text: 'Priority support' },
  ];

  const plans: PlanOption[] = [
    {
      id: 'pro-monthly',
      name: 'Monthly',
      description: 'Billed monthly',
      price: `$${proTier.price?.monthly}`,
      period: '/mo',
    },
    {
      id: 'pro-yearly',
      name: 'Yearly',
      description: 'Billed annually',
      price: `$${proTier.price?.yearly}`,
      period: '/yr',
      badge: 'BEST VALUE',
      savings: `Save $${(proTier.price!.monthly! * 12 - proTier.price!.yearly!).toFixed(0)}/year`,
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      description: 'One-time payment',
      price: `$${lifetimeTier.price?.lifetime}`,
    },
  ];

  const handleUpgrade = () => {
    if (!checkoutAvailable) {
      // Show a message or redirect to a pricing page
      alert('Checkout is not yet configured. Please check back soon!');
      return;
    }

    setIsRedirecting(true);

    const checkoutUrl = generatePlanCheckoutUrl(selectedPlan, {
      userId: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
    });

    if (checkoutUrl) {
      // Open checkout in new tab
      window.open(checkoutUrl, '_blank');
      setIsRedirecting(false);
      onOpenChange(false);
    } else {
      setIsRedirecting(false);
      alert('Unable to generate checkout URL. Please try again later.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>{getFeatureMessage()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature List */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Pro includes:</p>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <f.icon className="h-4 w-4 text-primary" />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Options */}
          <div className="grid gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  'relative flex items-center justify-between rounded-lg border p-3 text-left transition-all',
                  selectedPlan === plan.id
                    ? 'border-2 border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-2 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.savings || plan.description}
                  </p>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleUpgrade}
            disabled={isRedirecting || !isUserLoaded}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening checkout...
              </>
            ) : (
              <>
                Upgrade Now
                <ExternalLink className="h-4 w-4" />
              </>
            )}
          </Button>

          {!checkoutAvailable && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400">
              Payment system is being set up. Check back soon!
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Secure payment via LemonSqueezy. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
