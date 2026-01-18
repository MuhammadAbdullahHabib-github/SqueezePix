import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
          SqueezePix
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Your images never leave your browser.{' '}
        <Link href="/" className="underline hover:text-foreground">
          Learn more
        </Link>
      </p>
    </div>
  );
}
