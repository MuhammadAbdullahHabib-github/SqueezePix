import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';

/**
 * POST /api/webhooks/lemonsqueezy
 * Handles LemonSqueezy payment webhooks
 *
 * Events handled:
 * - order_created: New purchase (set user tier to pro/lifetime)
 * - subscription_cancelled: Cancel subscription (set tier to free)
 * - subscription_resumed: Resume subscription (set tier to pro)
 * - subscription_payment_success: Recurring payment success
 */

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      order_id?: number;
      product_id?: number;
      variant_id?: number;
      user_email?: string;
      status?: string;
      created_at?: string;
      ends_at?: string;
    };
  };
}

/**
 * Verify the webhook signature from LemonSqueezy
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Determine tier from variant ID
 */
function getTierFromVariant(variantId: number | undefined): 'pro' | 'lifetime' {
  const lifetimeVariantId = parseInt(
    process.env.NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_VARIANT || '0'
  );

  if (variantId === lifetimeVariantId) {
    return 'lifetime';
  }

  return 'pro';
}

/**
 * Update Clerk user metadata with subscription info
 */
async function updateUserTier(
  userId: string,
  tier: 'free' | 'pro' | 'lifetime',
  subscriptionData?: {
    subscriptionId?: string;
    variantId?: number;
    endsAt?: string;
  }
) {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    console.warn('Clerk is not configured. Skipping user metadata update.');
    return false;
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier,
        ...(tier !== 'free' && subscriptionData
          ? {
              subscriptionId: subscriptionData.subscriptionId,
              variantId: subscriptionData.variantId,
              subscribedAt: new Date().toISOString(),
              ...(subscriptionData.endsAt && { subscriptionEndsAt: subscriptionData.endsAt }),
            }
          : {
              subscriptionCancelledAt: new Date().toISOString(),
            }),
      },
    });

    console.log(`Updated user ${userId} to tier: ${tier}`);
    return true;
  } catch (error) {
    console.error(`Failed to update user ${userId} metadata:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const userId = payload.meta.custom_data?.user_id;

    console.log(`LemonSqueezy webhook: ${eventName}`, {
      userId,
      orderId: payload.data.attributes.order_id,
      variantId: payload.data.attributes.variant_id,
    });

    // Handle different event types
    switch (eventName) {
      case 'order_created': {
        const variantId = payload.data.attributes.variant_id;
        const newTier = getTierFromVariant(variantId);

        if (userId) {
          await updateUserTier(userId, newTier, {
            subscriptionId: payload.data.id,
            variantId,
            endsAt: payload.data.attributes.ends_at,
          });
        } else {
          console.warn('order_created: No user_id in custom_data');
        }

        break;
      }

      case 'subscription_cancelled': {
        if (userId) {
          await updateUserTier(userId, 'free');
        } else {
          console.warn('subscription_cancelled: No user_id in custom_data');
        }
        break;
      }

      case 'subscription_resumed': {
        if (userId) {
          const variantId = payload.data.attributes.variant_id;
          const tier = getTierFromVariant(variantId);
          await updateUserTier(userId, tier, {
            subscriptionId: payload.data.id,
            variantId,
            endsAt: payload.data.attributes.ends_at,
          });
        } else {
          console.warn('subscription_resumed: No user_id in custom_data');
        }
        break;
      }

      case 'subscription_payment_success': {
        // Recurring payment successful - optionally extend subscription end date
        console.log('Subscription payment successful', {
          userId,
          subscriptionId: payload.data.id,
        });
        break;
      }

      case 'subscription_updated': {
        // Handle plan changes (upgrade/downgrade)
        if (userId) {
          const variantId = payload.data.attributes.variant_id;
          const tier = getTierFromVariant(variantId);
          await updateUserTier(userId, tier, {
            subscriptionId: payload.data.id,
            variantId,
            endsAt: payload.data.attributes.ends_at,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
