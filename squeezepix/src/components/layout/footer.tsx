import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between py-2 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">◆</span>
            <span className="text-base font-semibold">SqueezePix</span>
          </div>
          <p className="text-xs text-muted-foreground md:ml-4 md:border-l md:pl-4 md:border-border">
            &copy; {new Date().getFullYear()} SqueezePix. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
