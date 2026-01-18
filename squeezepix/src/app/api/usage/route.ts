import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ANON_DAILY_LIMIT = 10;
const SIGNED_IN_DAILY_LIMIT = 20;

// In-memory storage for anonymous users (resets on server restart)
// In production, replace with Redis/Vercel KV/database
const anonymousUsage = new Map<string, { date: string; count: number }>();

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * GET /api/usage
 * Get current usage for the user/device
 */
export async function GET(request: NextRequest) {
  const fingerprint = request.headers.get('x-device-fingerprint') || '';
  const { userId } = await auth();
  const today = getTodayDateString();

  // For signed-in users, check Clerk metadata
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const metadata = user.publicMetadata as {
        tier?: string;
        dailyUsage?: { date: string; count: number };
      };

      // Pro/Lifetime users have unlimited
      if (metadata.tier === 'pro' || metadata.tier === 'lifetime') {
        return NextResponse.json({
          count: 0,
          limit: Infinity,
          remaining: Infinity,
          isUnlimited: true,
        });
      }

      const usage = metadata.dailyUsage;
      const count = usage?.date === today ? usage.count : 0;

      return NextResponse.json({
        count,
        limit: SIGNED_IN_DAILY_LIMIT,
        remaining: Math.max(0, SIGNED_IN_DAILY_LIMIT - count),
        isUnlimited: false,
      });
    } catch (error) {
      console.error('Failed to get user usage:', error);
    }
  }

  // For anonymous users, use fingerprint
  if (fingerprint) {
    const usage = anonymousUsage.get(fingerprint);
    const count = usage?.date === today ? usage.count : 0;

    return NextResponse.json({
      count,
      limit: ANON_DAILY_LIMIT,
      remaining: Math.max(0, ANON_DAILY_LIMIT - count),
      isUnlimited: false,
    });
  }

  // No fingerprint, return default
  return NextResponse.json({
    count: 0,
    limit: ANON_DAILY_LIMIT,
    remaining: ANON_DAILY_LIMIT,
    isUnlimited: false,
  });
}

/**
 * POST /api/usage
 * Increment usage count
 */
export async function POST(request: NextRequest) {
  const fingerprint = request.headers.get('x-device-fingerprint') || '';
  const { userId } = await auth();
  const today = getTodayDateString();

  let body: { count?: number } = {};
  try {
    body = await request.json();
  } catch {
    // Default to 1
  }
  const incrementBy = body.count || 1;

  // For signed-in users, update Clerk metadata
  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const metadata = user.publicMetadata as {
        tier?: string;
        dailyUsage?: { date: string; count: number };
      };

      // Pro/Lifetime users don't need tracking
      if (metadata.tier === 'pro' || metadata.tier === 'lifetime') {
        return NextResponse.json({
          count: 0,
          limit: Infinity,
          remaining: Infinity,
          isUnlimited: true,
        });
      }

      const currentUsage = metadata.dailyUsage;
      const currentCount = currentUsage?.date === today ? currentUsage.count : 0;
      const newCount = currentCount + incrementBy;

      // Update metadata
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...metadata,
          dailyUsage: { date: today, count: newCount },
        },
      });

      return NextResponse.json({
        count: newCount,
        limit: SIGNED_IN_DAILY_LIMIT,
        remaining: Math.max(0, SIGNED_IN_DAILY_LIMIT - newCount),
        isUnlimited: false,
      });
    } catch (error) {
      console.error('Failed to update user usage:', error);
      return NextResponse.json(
        { error: 'Failed to update usage' },
        { status: 500 }
      );
    }
  }

  // For anonymous users, use fingerprint
  if (fingerprint) {
    const usage = anonymousUsage.get(fingerprint);
    const currentCount = usage?.date === today ? usage.count : 0;
    const newCount = currentCount + incrementBy;

    anonymousUsage.set(fingerprint, { date: today, count: newCount });

    return NextResponse.json({
      count: newCount,
      limit: ANON_DAILY_LIMIT,
      remaining: Math.max(0, ANON_DAILY_LIMIT - newCount),
      isUnlimited: false,
    });
  }

  // No fingerprint
  return NextResponse.json({
    count: incrementBy,
    limit: ANON_DAILY_LIMIT,
    remaining: Math.max(0, ANON_DAILY_LIMIT - incrementBy),
    isUnlimited: false,
  });
}
