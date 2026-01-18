import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  AlertTriangle,
  CreditCard,
  Scale,
  RefreshCw,
  Ban,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'SqueezePix Terms of Service - Read our terms and conditions for using the browser-based image optimization service.',
};

export default function TermsOfServicePage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <FileText className="h-3.5 w-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 18, 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg text-muted-foreground">
            Welcome to SqueezePix! These Terms of Service (&quot;Terms&quot;)
            govern your use of the SqueezePix website and service (the
            &quot;Service&quot;) operated by SqueezePix (&quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;). By accessing or using the
            Service, you agree to be bound by these Terms. If you disagree with
            any part of the Terms, you may not access the Service.
          </p>
        </section>

        {/* Quick Summary */}
        <div className="mb-12 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Scale className="h-5 w-5 text-primary" />
            Quick Summary (Plain English)
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Your images are yours:</strong>{' '}
              We don&apos;t own, see, or store your images.
            </li>
            <li>
              <strong className="text-foreground">Use it legally:</strong>{' '}
              Don&apos;t use SqueezePix for illegal content or purposes.
            </li>
            <li>
              <strong className="text-foreground">Subscriptions:</strong> Cancel
              anytime, but no partial refunds for unused time.
            </li>
            <li>
              <strong className="text-foreground">30-day guarantee:</strong> Full
              refund within 30 days if you&apos;re not satisfied.
            </li>
            <li>
              <strong className="text-foreground">We can change things:</strong>{' '}
              We may update features, pricing, or terms with notice.
            </li>
          </ul>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          <TermsSection title="1. Description of Service">
            <p>
              SqueezePix is a browser-based image optimization tool that allows
              you to compress, convert, and enhance images. The Service includes:
            </p>
            <ul>
              <li>Image compression and optimization</li>
              <li>Format conversion (JPEG, PNG, WebP)</li>
              <li>EXIF metadata removal</li>
              <li>Geo-location tagging</li>
              <li>AI-powered alt text generation (Pro feature)</li>
              <li>Batch processing capabilities</li>
            </ul>
            <p className="mt-4">
              All image processing occurs locally in your web browser. Your
              images are not uploaded to our servers except when using the AI alt
              text feature, which requires sending image data to third-party AI
              services.
            </p>
          </TermsSection>

          <TermsSection title="2. Account Registration">
            <h4 className="font-semibold">2.1 Account Creation</h4>
            <p>
              While basic features are available without an account, certain
              features require you to create an account. When registering, you
              agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>
                Notify us immediately of any unauthorized access to your account
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">2.2 Account Responsibility</h4>
            <p>
              You are responsible for all activities that occur under your
              account. We are not liable for any loss or damage arising from your
              failure to protect your account credentials.
            </p>

            <h4 className="mt-6 font-semibold">2.3 Age Requirements</h4>
            <p>
              You must be at least 13 years old to use the Service. If you are
              under 18, you must have parental or guardian consent to use the
              Service.
            </p>
          </TermsSection>

          <TermsSection title="3. Subscription Plans and Pricing">
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Transparent Pricing</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  All prices are displayed in USD. View our current pricing at{' '}
                  <Link href="/pricing" className="text-primary hover:underline">
                    squeezepix.com/pricing
                  </Link>
                </p>
              </div>
            </div>

            <h4 className="font-semibold">3.1 Free Tier</h4>
            <ul>
              <li>Available to all users without payment</li>
              <li>Limited to 10 images per batch</li>
              <li>Includes core optimization features</li>
              <li>No account required for basic use</li>
            </ul>

            <h4 className="mt-6 font-semibold">3.2 Pro Subscription</h4>
            <ul>
              <li>Monthly ($9/month) or annual ($49/year) billing</li>
              <li>50 images per batch</li>
              <li>AI alt text generation</li>
              <li>Custom presets</li>
              <li>Priority support</li>
              <li>7-day free trial for new subscribers</li>
            </ul>

            <h4 className="mt-6 font-semibold">3.3 Lifetime License</h4>
            <ul>
              <li>One-time payment of $99</li>
              <li>All Pro features included</li>
              <li>Lifetime access to current and future features</li>
              <li>No recurring payments</li>
            </ul>

            <h4 className="mt-6 font-semibold">3.4 Price Changes</h4>
            <p>
              We reserve the right to modify pricing at any time. Price changes
              will not affect existing subscriptions until renewal. We will
              provide at least 30 days notice before any price increase takes
              effect.
            </p>
          </TermsSection>

          <TermsSection title="4. Payment Terms">
            <h4 className="font-semibold">4.1 Billing</h4>
            <ul>
              <li>
                Payments are processed securely through LemonSqueezy, our payment
                provider
              </li>
              <li>
                Subscriptions are billed in advance on a recurring basis
                (monthly or annually)
              </li>
              <li>
                You authorize us to charge your payment method for all fees
                incurred
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">4.2 Failed Payments</h4>
            <p>
              If a payment fails, we will attempt to charge your payment method
              again. After multiple failed attempts, your subscription may be
              downgraded to the Free tier until payment is resolved.
            </p>

            <h4 className="mt-6 font-semibold">4.3 Taxes</h4>
            <p>
              Prices may be exclusive of applicable taxes (VAT, sales tax, etc.).
              You are responsible for paying any taxes associated with your
              purchase, which will be calculated at checkout based on your
              location.
            </p>
          </TermsSection>

          <TermsSection title="5. Refunds and Cancellations">
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <RefreshCw className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-600">
                  30-Day Money-Back Guarantee
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If you&apos;re not satisfied with SqueezePix, request a full
                  refund within 30 days of purchase. No questions asked.
                </p>
              </div>
            </div>

            <h4 className="font-semibold">5.1 Subscription Cancellation</h4>
            <ul>
              <li>You may cancel your subscription at any time</li>
              <li>
                Cancellation takes effect at the end of your current billing
                period
              </li>
              <li>
                You retain access to Pro features until your subscription expires
              </li>
              <li>No partial refunds for unused subscription time</li>
            </ul>

            <h4 className="mt-6 font-semibold">5.2 Refund Policy</h4>
            <ul>
              <li>
                <strong>Pro Subscriptions:</strong> Full refund available within
                30 days of initial purchase or renewal
              </li>
              <li>
                <strong>Lifetime License:</strong> Full refund available within
                30 days of purchase
              </li>
              <li>
                <strong>After 30 days:</strong> Refunds may be granted at our
                discretion for exceptional circumstances
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">5.3 How to Request a Refund</h4>
            <p>
              To request a refund, contact us at{' '}
              <a
                href="mailto:support@squeezepix.com"
                className="text-primary hover:underline"
              >
                support@squeezepix.com
              </a>{' '}
              with your account email and reason for the refund. Refunds are
              typically processed within 5-10 business days.
            </p>
          </TermsSection>

          <TermsSection title="6. Acceptable Use Policy">
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-600">Important</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Violation of these policies may result in immediate termination
                  of your account without refund.
                </p>
              </div>
            </div>

            <h4 className="font-semibold">6.1 You Agree NOT To:</h4>
            <ul>
              <li>
                Use the Service for any illegal purpose or in violation of any
                laws
              </li>
              <li>
                Process images containing child sexual abuse material (CSAM)
              </li>
              <li>Process images that violate others&apos; intellectual property rights</li>
              <li>
                Attempt to reverse engineer, decompile, or hack the Service
              </li>
              <li>
                Use automated systems or bots to access the Service without
                permission
              </li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Share your account credentials with others</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>
                Use the Service to generate spam, malware, or malicious content
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">6.2 Content Responsibility</h4>
            <p>
              You are solely responsible for the images you process using
              SqueezePix. We do not monitor, review, or store your images, but we
              reserve the right to terminate accounts that violate these Terms.
            </p>
          </TermsSection>

          <TermsSection title="7. Intellectual Property">
            <h4 className="font-semibold">7.1 Your Content</h4>
            <p>
              You retain all ownership rights to your images. By using
              SqueezePix, you grant us no rights to your content beyond what is
              necessary to provide the Service. Since images are processed
              locally, we never have possession of your content.
            </p>

            <h4 className="mt-6 font-semibold">7.2 Our Intellectual Property</h4>
            <p>
              The Service, including its design, features, code, and content
              (excluding your images), is owned by SqueezePix and protected by
              intellectual property laws. You may not:
            </p>
            <ul>
              <li>Copy, modify, or distribute our software</li>
              <li>Use our branding, logos, or trademarks without permission</li>
              <li>Create derivative works based on the Service</li>
            </ul>
          </TermsSection>

          <TermsSection title="8. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT</li>
              <li>ACCURACY or RELIABILITY of results</li>
              <li>UNINTERRUPTED or ERROR-FREE operation</li>
            </ul>
            <p className="mt-4">
              We do not guarantee that the Service will meet your specific
              requirements or that image optimization results will be suitable
              for your intended use.
            </p>
          </TermsSection>

          <TermsSection title="9. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SQUEEZEPIX SHALL NOT BE
              LIABLE FOR:
            </p>
            <ul>
              <li>
                Any indirect, incidental, special, consequential, or punitive
                damages
              </li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damage to your images or files</li>
              <li>Service interruptions or downtime</li>
              <li>Third-party actions or content</li>
            </ul>
            <p className="mt-4">
              Our total liability for any claims under these Terms shall not
              exceed the amount you paid us in the 12 months preceding the claim,
              or $100, whichever is greater.
            </p>
          </TermsSection>

          <TermsSection title="10. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless SqueezePix, its
              officers, directors, employees, and agents from any claims,
              damages, losses, or expenses (including reasonable attorneys&apos;
              fees) arising from:
            </p>
            <ul>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you process through the Service</li>
            </ul>
          </TermsSection>

          <TermsSection title="11. Service Modifications">
            <p>We reserve the right to:</p>
            <ul>
              <li>
                Modify, suspend, or discontinue any part of the Service at any
                time
              </li>
              <li>Add or remove features from any subscription tier</li>
              <li>Update usage limits or processing capabilities</li>
              <li>Change third-party service providers</li>
            </ul>
            <p className="mt-4">
              We will provide reasonable notice of significant changes that
              materially affect your use of the Service. Continued use after
              changes constitutes acceptance of the modified Terms.
            </p>
          </TermsSection>

          <TermsSection title="12. Termination">
            <h4 className="font-semibold">12.1 Termination by You</h4>
            <p>
              You may terminate your account at any time by canceling your
              subscription and deleting your account through your account
              settings, or by contacting us.
            </p>

            <h4 className="mt-6 font-semibold">12.2 Termination by Us</h4>
            <p>We may terminate or suspend your account immediately if you:</p>
            <ul>
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Fail to pay fees when due</li>
              <li>Abuse the Service or other users</li>
            </ul>

            <h4 className="mt-6 font-semibold">12.3 Effect of Termination</h4>
            <ul>
              <li>Access to the Service will be immediately revoked</li>
              <li>
                No refund will be provided for termination due to violation of
                Terms
              </li>
              <li>
                Your locally stored settings and preferences will remain on your
                device
              </li>
              <li>
                We will delete your account data in accordance with our Privacy
                Policy
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="13. Dispute Resolution">
            <h4 className="font-semibold">13.1 Informal Resolution</h4>
            <p>
              Before filing any formal dispute, you agree to contact us at{' '}
              <a
                href="mailto:legal@squeezepix.com"
                className="text-primary hover:underline"
              >
                legal@squeezepix.com
              </a>{' '}
              and attempt to resolve the dispute informally for at least 30 days.
            </p>

            <h4 className="mt-6 font-semibold">13.2 Governing Law</h4>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Delaware, United States, without regard to
              its conflict of law provisions.
            </p>

            <h4 className="mt-6 font-semibold">13.3 Arbitration</h4>
            <p>
              Any disputes that cannot be resolved informally shall be settled by
              binding arbitration in accordance with the rules of the American
              Arbitration Association. You agree to waive your right to a jury
              trial and to participate in class actions.
            </p>
          </TermsSection>

          <TermsSection title="14. General Provisions">
            <h4 className="font-semibold">14.1 Entire Agreement</h4>
            <p>
              These Terms, together with our Privacy Policy, constitute the
              entire agreement between you and SqueezePix regarding the Service.
            </p>

            <h4 className="mt-6 font-semibold">14.2 Severability</h4>
            <p>
              If any provision of these Terms is found to be unenforceable, the
              remaining provisions will continue in full force and effect.
            </p>

            <h4 className="mt-6 font-semibold">14.3 Waiver</h4>
            <p>
              Our failure to enforce any right or provision of these Terms will
              not be considered a waiver of those rights.
            </p>

            <h4 className="mt-6 font-semibold">14.4 Assignment</h4>
            <p>
              You may not assign or transfer these Terms without our prior
              written consent. We may assign our rights and obligations without
              restriction.
            </p>
          </TermsSection>

          <TermsSection title="15. Changes to Terms">
            <p>
              We may revise these Terms at any time by posting an updated version
              on our website. Changes are effective immediately upon posting
              unless otherwise stated. We will notify users of material changes
              via email or prominent notice on the Service.
            </p>
            <p className="mt-4">
              Your continued use of the Service after any changes indicates your
              acceptance of the new Terms. If you do not agree to the changes,
              you must stop using the Service.
            </p>
          </TermsSection>

          <TermsSection title="16. Contact Information">
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">General Inquiries</p>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href="mailto:hello@squeezepix.com"
                      className="text-primary hover:underline"
                    >
                      hello@squeezepix.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                <Ban className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Legal & Compliance</p>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href="mailto:legal@squeezepix.com"
                      className="text-primary hover:underline"
                    >
                      legal@squeezepix.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </TermsSection>
        </div>

        {/* Footer Links */}
        <div className="mt-16 flex flex-wrap gap-4 border-t border-border pt-8 text-sm">
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link
            href="/app"
            className="text-muted-foreground hover:text-foreground"
          >
            Launch App
          </Link>
        </div>
      </div>
    </div>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="space-y-4 text-muted-foreground [&_a]:text-primary [&_a]:hover:underline [&_h4]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
