import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Shield,
  Zap,
  ImageIcon,
  FileType2,
  MapPin,
  MessageSquareText,
  Download,
  Lock,
} from 'lucide-react';

export const metadata = {
  title: 'SqueezePix - Browser-Based Image Optimization',
  description:
    'The only all-in-one image optimizer that runs 100% in your browser. No uploads. No limits. No monthly fees.',
};

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Lock className="h-3.5 w-3.5" />
              100% Browser-Based - Your images never leave your device
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Squeeze more from your{' '}
              <span className="text-primary">images</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Compress, convert to WebP, remove EXIF data, add geo-tags, and
              generate AI alt text. All in one tool that runs entirely in your
              browser.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/app">
                <Button size="lg" className="gap-2">
                  Start Optimizing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No account required. Free to start.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for web-ready images
            </h2>
            <p className="mt-4 text-muted-foreground">
              Professional image optimization without the complexity or privacy
              concerns.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Smart Compression"
              description="Reduce file sizes by up to 80% while maintaining visual quality. Perfect for websites and apps."
            />
            <FeatureCard
              icon={<FileType2 className="h-6 w-6" />}
              title="WebP Conversion"
              description="Convert JPEG, PNG, and other formats to modern WebP for better compression and faster loading."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="EXIF Removal"
              description="Strip sensitive metadata like GPS coordinates, camera info, and timestamps from your photos."
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Geo-Tagging"
              description="Add location data to images for local SEO. Search by city name with autocomplete."
            />
            <FeatureCard
              icon={<MessageSquareText className="h-6 w-6" />}
              title="AI Alt Text"
              description="Generate SEO-friendly alt text descriptions using AI. Boost accessibility and search rankings."
            />
            <FeatureCard
              icon={<Download className="h-6 w-6" />}
              title="Batch Processing"
              description="Process up to 50 images at once. Download individually or as a ZIP archive."
            />
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                <Lock className="h-3.5 w-3.5" />
                Privacy First
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Your images stay on your device
              </h2>
              <p className="mt-4 text-muted-foreground">
                Unlike cloud-based tools, SqueezePix processes everything
                locally in your browser using WebAssembly. Your photos are never
                uploaded to any server. No data collection. No tracking. Just
                fast, private image optimization.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  No server uploads
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Works offline
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  GDPR compliant by design
                </li>
              </ul>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-primary/10">
                <ImageIcon className="h-24 w-24 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to optimize your images?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start with the free tier. No account or credit card required.
          </p>
          <Link href="/app" className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Launch SqueezePix <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
