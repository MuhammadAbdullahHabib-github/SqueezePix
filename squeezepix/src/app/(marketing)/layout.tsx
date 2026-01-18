import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Image as ImageIcon } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">
                <ImageIcon className="h-3 w-3" />
              </div>
              SqueezePix
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/app" className="hover:text-foreground">
                App
              </Link>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SqueezePix. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              100% browser-based. Your images stay private.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
