'use client';

import { Button } from '@/components/ui/button';

interface ScrollToTopButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

export function ScrollToTopButton({ children, variant = 'outline', className }: ScrollToTopButtonProps) {
  return (
    <Button
      className={className}
      variant={variant}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      {children}
    </Button>
  );
}
