'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TIERS } from '@/lib/license/tiers';
import { Crown, CreditCard, Check, Loader2, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

type PlanType = 'pro-monthly' | 'pro-yearly' | 'lifetime';

const PLAN_DETAILS: Record<PlanType, { name: string; price: string; period: string; description: string }> = {
  'pro-monthly': {
    name: 'Pro Monthly',
    price: '$5',
    period: '/month',
    description: 'Billed monthly, cancel anytime',
  },
  'pro-yearly': {
    name: 'Pro Yearly',
    price: '$20',
    period: '/year',
    description: 'Save $40 per year',
  },
  'lifetime': {
    name: 'Lifetime',
    price: '$50',
    period: 'one-time',
    description: 'Pay once, use forever',
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const planParam = searchParams.get('plan') as PlanType | null;
  const plan = planParam && PLAN_DETAILS[planParam] ? planParam : 'pro-monthly';
  const planDetails = PLAN_DETAILS[plan];

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the simulate payment API
      const response = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user?.id,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      // Redirect to success page
      router.push('/upgrade/success?plan=' + plan);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      alert('Payment simulation failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-lg px-4">
        {/* Back link */}
        <Link
          href="/app"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
          <p className="mt-2 text-muted-foreground">
            Upgrade to {planDetails.name} - {planDetails.price}{planDetails.period !== 'one-time' ? planDetails.period : ''}
          </p>
        </div>

        {/* Dev Mode Banner */}
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Development Mode - Test Checkout
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                This is a simulated checkout for testing. No real payment will be processed.
                Use any card details to simulate a successful payment.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{planDetails.name}</h3>
              <p className="text-sm text-muted-foreground">{planDetails.description}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{planDetails.price}</span>
              {planDetails.period !== 'one-time' && (
                <span className="text-muted-foreground">{planDetails.period}</span>
              )}
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Includes:</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Unlimited images per day
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                All features included
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Priority support
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <div className="relative">
              <Input
                id="card"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="pl-10"
              />
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            size="lg"
            disabled={isProcessing || !isUserLoaded}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay {planDetails.price}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By completing this purchase, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </p>
        </form>

        {/* Change Plan */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Want a different plan?{' '}
            <Link href="/pricing" className="text-primary hover:underline">
              View all plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
