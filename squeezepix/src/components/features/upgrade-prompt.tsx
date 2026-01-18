'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Crown, Zap, Check, X } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalProcessed: number;
  trigger?: 'limit_reached' | 'batch_complete';
}

export function UpgradePrompt({
  open,
  onOpenChange,
  totalProcessed,
  trigger = 'batch_complete',
}: UpgradePromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {trigger === 'limit_reached'
              ? "You've Reached the Free Limit"
              : "You're Loving SqueezePix!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {trigger === 'limit_reached' ? (
              <>
                You've optimized <span className="font-semibold text-foreground">{totalProcessed} images</span> for free.
                Upgrade to continue optimizing without limits.
              </>
            ) : (
              <>
                You've already optimized <span className="font-semibold text-foreground">{totalProcessed} images</span>!
                Unlock more power with Pro.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-semibold">
              <Zap className="h-4 w-4 text-primary" />
              Pro Benefits
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                50 images per batch (5x more)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                AI-powered alt text generation
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Custom presets for workflows
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Priority support
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full gap-2">
              <Link href="/pricing">
                <Crown className="h-4 w-4" />
                View Pricing Plans
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
