'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useLicense } from '@/hooks/use-license';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ArrowRight, Sparkles, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Zap, text: 'Unlimited images per day' },
  { icon: Sparkles, text: 'All features included' },
  { icon: Crown, text: 'Priority support' },
];

/**
 * Inner component that uses license hook
 */
function UpgradeSuccessContent() {
  const router = useRouter();
  const { isPro, isLoading, refresh } = useLicense();

  const [isRefreshing, setIsRefreshing] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Refresh license status on mount
  useEffect(() => {
    const checkLicense = async () => {
      setIsRefreshing(true);

      // Wait a moment for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh the license
      await refresh();

      setIsRefreshing(false);
      setHasChecked(true);
    };

    if (!isLoading) {
      checkLicense();
    }
  }, [isLoading, refresh]);

  // Auto-redirect after successful upgrade confirmation
  useEffect(() => {
    if (hasChecked && isPro) {
      const timeout = setTimeout(() => {
        router.push('/app');
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [hasChecked, isPro, router]);

  if (isLoading || isRefreshing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Confirming your upgrade...</p>
        </div>
      </div>
    );
  }

  if (hasChecked && !isPro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold">Processing your upgrade...</h1>

          <p className="mt-2 text-muted-foreground">
            Your payment was received. It may take a moment for your Pro features to activate.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={() => refresh()} className="gap-2">
              <Loader2 className="h-4 w-4" />
              Check Status
            </Button>

            <Button variant="outline" asChild>
              <Link href="/app">
                Return to App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            If your upgrade doesn't appear within a few minutes, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold">
          Welcome to Pro!
        </h1>

        <p className="mt-2 text-muted-foreground">
          Thank you for upgrading. Your Pro features are now active.
        </p>

        {/* Features unlocked */}
        <div className="mt-6 rounded-lg border bg-muted/30 p-4">
          <p className="mb-3 text-sm font-medium">You now have access to:</p>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <feature.icon className="h-4 w-4 text-primary" />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button asChild className="w-full gap-2">
            <Link href="/app">
              Start Using Pro Features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Redirecting to app in 5 seconds...
        </p>
      </div>
    </div>
  );
}

/**
 * Loading fallback
 */
function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Post-purchase success page
 * Confirms the upgrade and redirects user back to the app
 */
export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
