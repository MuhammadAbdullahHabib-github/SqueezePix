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
      <footer className="border-t border-border py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs">
              <ImageIcon className="h-3 w-3" />
            </div>
            SqueezePix
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/app" className="hover:text-foreground">
              App
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            100% browser-based. Your images stay private.
          </p>
        </div>
      </footer>
    </div>
  );
}
