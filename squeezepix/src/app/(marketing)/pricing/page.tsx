import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Pricing - SqueezePix',
  description: 'Simple, transparent pricing for SqueezePix image optimization.',
};

export default function PricingPage() {
  return (
    <div className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {/* Free Tier */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Free</h2>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Perfect for occasional use and trying out the tool.
            </p>

            <ul className="mt-8 space-y-4">
              <Feature text="10 images per day (no account)" />
              <Feature text="20 images per day (with account)" />
              <Feature text="Image compression" />
              <Feature text="WebP conversion" />
              <Feature text="EXIF removal" />
              <Feature text="Geo-tagging" />
              <Feature text="ZIP download" />
            </ul>

            <Link href="/app" className="mt-8 block">
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-8 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Pro</h2>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold">$5</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For power users and professionals.
            </p>

            <ul className="mt-8 space-y-4">
              <Feature text="Unlimited images" highlight />
              <Feature text="AI alt text generation" highlight />
              <Feature text="Priority support" highlight />
              <Feature text="All Free features" />
              <Feature text="Early access to new features" />
            </ul>

            <Link href="/app" className="mt-8 block">
              <Button className="w-full gap-2">
                Upgrade to Pro <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cancel anytime.
            </p>
          </div>

          {/* Lifetime Tier */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Lifetime</h2>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold">$50</span>
              <span className="text-muted-foreground"> one-time</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay once, use forever. Best value.
            </p>

            <ul className="mt-8 space-y-4">
              <Feature text="All Pro features" />
              <Feature text="Unlimited images forever" />
              <Feature text="Lifetime updates" />
              <Feature text="No subscription" />
              <Feature text="Support indie development" />
            </ul>

            <Link href="/app" className="mt-8 block">
              <Button variant="outline" className="w-full">
                Buy Lifetime Access
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="mt-12 space-y-8">
            <FAQ
              question="Do I need an account to use SqueezePix?"
              answer="No! You can use the free tier without creating an account. Your images are processed entirely in your browser and never uploaded to our servers."
            />
            <FAQ
              question="What happens to my images?"
              answer="Your images never leave your device. All processing happens locally in your browser using WebAssembly and JavaScript. We don't see, store, or have access to your images."
            />
            <FAQ
              question="Can I cancel my Pro subscription?"
              answer="Yes, you can cancel anytime. Your Pro features will remain active until the end of your billing period."
            />
            <FAQ
              question="What's the difference between Pro and Lifetime?"
              answer="Both have the same features. Pro is a monthly/yearly subscription, while Lifetime is a one-time payment that gives you permanent access to all Pro features."
            />
            <FAQ
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee for both Pro subscriptions and Lifetime purchases. No questions asked."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold">Ready to optimize?</h2>
          <p className="mt-2 text-muted-foreground">
            Start with the free tier. No credit card required.
          </p>
          <Link href="/app" className="mt-6 inline-block">
            <Button size="lg" className="gap-2">
              Launch SqueezePix <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({
  text,
  highlight = false,
  muted = false,
}: {
  text: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <Check
        className={`h-5 w-5 ${
          highlight
            ? 'text-primary'
            : muted
            ? 'text-muted-foreground/50'
            : 'text-emerald-500'
        }`}
      />
      <span className={muted ? 'text-muted-foreground' : ''}>{text}</span>
    </li>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-muted-foreground">{answer}</p>
    </div>
  );
}
