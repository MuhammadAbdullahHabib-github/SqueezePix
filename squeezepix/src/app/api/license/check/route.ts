import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getTierLimits, type TierType } from '@/lib/license/tiers';

/**
 * POST /api/license/check
 * Validates user's license tier and returns limits
 *
 * Uses Clerk user metadata to determine subscription tier.
 * Falls back to 'free' tier when Clerk is not configured or user is not authenticated.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId: requestUserId } = body as { userId?: string };

    // Default to free tier
    let tier: TierType = 'free';
    let expiresAt: string | undefined;
    let subscriptionId: string | undefined;

    // Check if Clerk is configured
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (clerkSecretKey) {
      try {
        // Try to get authenticated user from request
        const { userId: authUserId } = await auth();
        const userId = authUserId || requestUserId;

        if (userId) {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);

          // Read tier from public metadata (set by webhook)
          const metadata = user.publicMetadata as {
            tier?: TierType;
            subscriptionEndsAt?: string;
            subscriptionId?: string;
          };

          if (metadata.tier) {
            tier = metadata.tier;
            expiresAt = metadata.subscriptionEndsAt;
            subscriptionId = metadata.subscriptionId;
          }
        }
      } catch (clerkError) {
        // Clerk API error - log but don't fail
        console.warn('Failed to fetch user from Clerk:', clerkError);
      }
    } else {
      // Clerk not configured - use free tier
      console.debug('Clerk not configured. Using free tier.');
    }

    const limits = getTierLimits(tier);

    return NextResponse.json({
      tier,
      limits,
      expiresAt,
      subscriptionId,
      isAuthenticated: !!clerkSecretKey,
    });
  } catch (error) {
    console.error('License check error:', error);

    // Return free tier on error
    return NextResponse.json({
      tier: 'free',
      limits: getTierLimits('free'),
      isAuthenticated: false,
    });
  }
}
