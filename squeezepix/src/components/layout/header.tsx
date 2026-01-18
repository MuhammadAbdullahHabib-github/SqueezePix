'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

export function Header() {
  // Use mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine auth state only after mounted and loaded
  const showSignedIn = mounted && isLoaded && isSignedIn;
  const showSignedOut = mounted && isLoaded && !isSignedIn;
  const showLoading = !mounted || !isLoaded;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">◆</span>
          <span className="text-lg font-semibold">SqueezePix</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/app"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              App
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {/* Loading/SSR state - show Sign In + Upgrade as default */}
            {showLoading && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" className="gap-1.5" asChild>
                  <Link href="/pricing">
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </Link>
                </Button>
              </>
            )}

            {/* Signed OUT state */}
            {showSignedOut && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" className="gap-1.5" asChild>
                  <Link href="/pricing">
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </Link>
                </Button>
              </>
            )}

            {/* Signed IN state */}
            {showSignedIn && (
              <>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link href="/pricing">
                    <Crown className="h-3.5 w-3.5" />
                    Upgrade
                  </Link>
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
