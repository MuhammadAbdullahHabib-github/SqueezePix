import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Server, Cookie, Eye, Mail, Globe, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'SqueezePix Privacy Policy - Learn how we protect your data and privacy with 100% browser-based image processing.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
            <Shield className="h-3.5 w-3.5" />
            Privacy First
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 18, 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="lead text-lg text-muted-foreground">
            At SqueezePix, privacy isn&apos;t just a feature—it&apos;s our core
            principle. Unlike traditional image optimization services, SqueezePix
            processes your images entirely in your browser. Your photos never
            leave your device, and we never see, store, or have access to them.
          </p>
        </section>

        {/* Key Privacy Points */}
        <div className="my-12 grid gap-6 sm:grid-cols-2">
          <PrivacyCard
            icon={<Server className="h-5 w-5" />}
            title="No Server Uploads"
            description="Your images are processed 100% locally using WebAssembly and JavaScript in your browser."
          />
          <PrivacyCard
            icon={<Eye className="h-5 w-5" />}
            title="No Image Access"
            description="We cannot see, access, or analyze your images. They exist only in your browser's memory."
          />
          <PrivacyCard
            icon={<Lock className="h-5 w-5" />}
            title="No Storage"
            description="Images are never stored on our servers. Once you close the tab, processed images exist only on your device."
          />
          <PrivacyCard
            icon={<Globe className="h-5 w-5" />}
            title="Works Offline"
            description="After initial load, SqueezePix works without an internet connection, proving no data leaves your device."
          />
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          <PolicySection title="1. Information We Collect">
            <h4 className="font-semibold">1.1 Information You Provide</h4>
            <p>
              When you create an account or upgrade to a paid plan, we collect:
            </p>
            <ul>
              <li>
                <strong>Account Information:</strong> Email address and name
                (provided through Clerk authentication)
              </li>
              <li>
                <strong>Payment Information:</strong> Processed securely by
                LemonSqueezy. We do not store credit card numbers or payment
                details on our servers.
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">
              1.2 Information We Do NOT Collect
            </h4>
            <ul>
              <li>Your images or photos (processed locally in your browser)</li>
              <li>Image metadata or EXIF data</li>
              <li>Image content or visual information</li>
              <li>Generated alt text descriptions</li>
              <li>Geo-location data you add to images</li>
            </ul>

            <h4 className="mt-6 font-semibold">
              1.3 Automatically Collected Information
            </h4>
            <p>We may collect limited technical information:</p>
            <ul>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>General location (country/region, not precise location)</li>
              <li>Usage statistics (number of images processed, features used)</li>
              <li>Error logs for debugging purposes</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain the SqueezePix service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important service updates and notifications</li>
              <li>Respond to customer support requests</li>
              <li>Improve and optimize our service</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-4">
              We will <strong>never</strong> sell your personal information to
              third parties or use your data for advertising purposes.
            </p>
          </PolicySection>

          <PolicySection title="3. Image Processing - How It Works">
            <p>
              Understanding how SqueezePix processes images is key to
              understanding our privacy commitment:
            </p>

            <h4 className="mt-6 font-semibold">3.1 Local Processing</h4>
            <p>
              When you upload images to SqueezePix, they are loaded directly into
              your browser&apos;s memory. All processing operations—compression,
              format conversion, EXIF removal, and geo-tagging—are performed
              using JavaScript and WebAssembly running locally on your device.
            </p>

            <h4 className="mt-6 font-semibold">3.2 AI Alt Text Generation</h4>
            <p>
              For AI-powered alt text generation (Pro feature), image data is
              sent to a third-party AI service (OpenRouter) for processing. This
              is the <strong>only</strong> feature that transmits image data
              externally. You can:
            </p>
            <ul>
              <li>Choose not to use this feature</li>
              <li>Review and edit generated alt text before use</li>
              <li>
                Be assured that AI providers do not retain your images after
                processing
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">3.3 Geo-Location Services</h4>
            <p>
              When using the geo-tagging feature to search for cities, we query
              the GeoNames API with city names only. No image data or personal
              information is transmitted during this process.
            </p>
          </PolicySection>

          <PolicySection title="4. Data Storage and Security">
            <h4 className="font-semibold">4.1 Where Data is Stored</h4>
            <ul>
              <li>
                <strong>Account Data:</strong> Stored securely by Clerk
                (authentication provider) with industry-standard encryption
              </li>
              <li>
                <strong>Payment Data:</strong> Stored and processed by
                LemonSqueezy, a PCI-compliant payment processor
              </li>
              <li>
                <strong>Application Settings:</strong> Stored locally in your
                browser&apos;s localStorage
              </li>
              <li>
                <strong>Images:</strong> Never stored on our servers—exist only
                in your browser during processing
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">4.2 Security Measures</h4>
            <ul>
              <li>HTTPS encryption for all data in transit</li>
              <li>Secure authentication through Clerk</li>
              <li>Regular security audits and updates</li>
              <li>No server-side image storage eliminates data breach risks</li>
            </ul>
          </PolicySection>

          <PolicySection title="5. Cookies and Tracking">
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Cookie className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Minimal Cookie Usage</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We use only essential cookies required for authentication and
                  basic functionality. No tracking or advertising cookies.
                </p>
              </div>
            </div>

            <h4 className="font-semibold">5.1 Essential Cookies</h4>
            <ul>
              <li>
                <strong>Authentication cookies:</strong> Required to keep you
                logged in
              </li>
              <li>
                <strong>Session cookies:</strong> Maintain your session state
              </li>
              <li>
                <strong>Preference cookies:</strong> Remember your settings
              </li>
            </ul>

            <h4 className="mt-6 font-semibold">5.2 What We Don&apos;t Use</h4>
            <ul>
              <li>No advertising or marketing cookies</li>
              <li>No third-party tracking pixels</li>
              <li>No cross-site tracking</li>
              <li>No selling of cookie data</li>
            </ul>
          </PolicySection>

          <PolicySection title="6. Third-Party Services">
            <p>We use the following third-party services:</p>
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-semibold">Service</th>
                  <th className="py-2 text-left font-semibold">Purpose</th>
                  <th className="py-2 text-left font-semibold">Data Shared</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2">Clerk</td>
                  <td className="py-2">Authentication</td>
                  <td className="py-2">Email, name</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">LemonSqueezy</td>
                  <td className="py-2">Payments</td>
                  <td className="py-2">Payment info, email</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">OpenRouter</td>
                  <td className="py-2">AI Alt Text</td>
                  <td className="py-2">Image data (opt-in only)</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">GeoNames</td>
                  <td className="py-2">City Search</td>
                  <td className="py-2">Search queries only</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">Vercel</td>
                  <td className="py-2">Hosting</td>
                  <td className="py-2">Standard web logs</td>
                </tr>
              </tbody>
            </table>
          </PolicySection>

          <PolicySection title="7. Your Rights and Choices">
            <p>You have the right to:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Update or correct your information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                data
              </li>
              <li>
                <strong>Portability:</strong> Export your data in a standard
                format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Revoke consent for data
                processing
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{' '}
              <a
                href="mailto:privacy@squeezepix.com"
                className="text-primary hover:underline"
              >
                privacy@squeezepix.com
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection title="8. Data Retention">
            <ul>
              <li>
                <strong>Account data:</strong> Retained while your account is
                active, deleted within 30 days of account deletion
              </li>
              <li>
                <strong>Payment records:</strong> Retained for 7 years for tax
                and legal compliance
              </li>
              <li>
                <strong>Support tickets:</strong> Retained for 2 years after
                resolution
              </li>
              <li>
                <strong>Images:</strong> Never retained—processed only in your
                browser
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="9. Children's Privacy">
            <p>
              SqueezePix is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you believe we have collected information from a child under
              13, please contact us immediately at{' '}
              <a
                href="mailto:privacy@squeezepix.com"
                className="text-primary hover:underline"
              >
                privacy@squeezepix.com
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection title="10. International Data Transfers">
            <p>
              SqueezePix is operated from the United States. If you access our
              service from outside the US, your information may be transferred
              to, stored, and processed in the US where our servers are located.
              By using SqueezePix, you consent to this transfer.
            </p>
            <p className="mt-4">
              For EU/EEA users: We comply with GDPR requirements and ensure
              appropriate safeguards for international data transfers.
            </p>
          </PolicySection>

          <PolicySection title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any material changes by:
            </p>
            <ul>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the &quot;Last updated&quot; date</li>
              <li>
                Sending an email notification for significant changes (if you
                have an account)
              </li>
            </ul>
            <p className="mt-4">
              We encourage you to review this Privacy Policy periodically.
            </p>
          </PolicySection>

          <PolicySection title="12. Contact Us">
            <p>
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">SqueezePix Privacy Team</p>
                <p className="text-sm text-muted-foreground">
                  Email:{' '}
                  <a
                    href="mailto:privacy@squeezepix.com"
                    className="text-primary hover:underline"
                  >
                    privacy@squeezepix.com
                  </a>
                </p>
              </div>
            </div>
          </PolicySection>
        </div>

        {/* Footer Links */}
        <div className="mt-16 flex flex-wrap gap-4 border-t border-border pt-8 text-sm">
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/app" className="text-muted-foreground hover:text-foreground">
            Launch App
          </Link>
        </div>
      </div>
    </div>
  );
}

function PrivacyCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PolicySection({
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
