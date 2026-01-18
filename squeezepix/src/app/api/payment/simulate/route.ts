import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { type TierType } from '@/lib/license/tiers';

type PlanType = 'pro-monthly' | 'pro-yearly' | 'lifetime';

/**
 * POST /api/payment/simulate
 *
 * Development-only endpoint to simulate LemonSqueezy payments.
 * Updates user's Clerk metadata to reflect the purchased plan.
 *
 * In production, this would be handled by the LemonSqueezy webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId: requestUserId, email } = body as {
      plan: PlanType;
      userId?: string;
      email?: string;
    };

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      );
    }

    // Get the user ID from auth or request body
    const { userId: authUserId } = await auth();
    const userId = authUserId || requestUserId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Determine tier based on plan
    const tier: TierType = plan === 'lifetime' ? 'lifetime' : 'pro';

    // Calculate subscription end date (1 month or 1 year from now)
    let subscriptionEndsAt: string | undefined;
    if (plan === 'pro-monthly') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      subscriptionEndsAt = endDate.toISOString();
    } else if (plan === 'pro-yearly') {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      subscriptionEndsAt = endDate.toISOString();
    }
    // Lifetime has no end date

    // Check if Clerk is configured
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!clerkSecretKey) {
      console.warn('Clerk is not configured. Simulating payment without updating user metadata.');
      return NextResponse.json({
        success: true,
        simulated: true,
        tier,
        message: 'Payment simulated (Clerk not configured)',
      });
    }

    // Update user metadata in Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier,
        subscriptionId: `sim_${Date.now()}`, // Simulated subscription ID
        variantId: plan === 'lifetime' ? 'lifetime' : plan === 'pro-yearly' ? 'yearly' : 'monthly',
        subscribedAt: new Date().toISOString(),
        ...(subscriptionEndsAt && { subscriptionEndsAt }),
        plan,
      },
    });

    console.log(`[Simulate Payment] User ${userId} upgraded to ${tier} (${plan})`);

    return NextResponse.json({
      success: true,
      simulated: true,
      tier,
      plan,
      subscriptionEndsAt,
      message: `Successfully simulated ${plan} purchase`,
    });
  } catch (error) {
    console.error('Payment simulation error:', error);
    return NextResponse.json(
      { error: 'Payment simulation failed', details: String(error) },
      { status: 500 }
    );
  }
}
