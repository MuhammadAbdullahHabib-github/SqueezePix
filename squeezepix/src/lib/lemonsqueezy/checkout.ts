/**
 * LemonSqueezy Checkout URL Generator
 *
 * Generates checkout URLs for different subscription plans.
 * Uses environment variables for store and variant IDs.
 *
 * @see https://docs.lemonsqueezy.com/help/checkout/passing-custom-data
 */

export type PlanType = 'pro-monthly' | 'pro-yearly' | 'lifetime';

interface CheckoutConfig {
  variantId: string;
  userId?: string;
  userEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface LemonSqueezyConfig {
  storeId: string;
  variants: {
    proMonthly: string;
    proYearly: string;
    lifetime: string;
  };
  isConfigured: boolean;
}

/**
 * Get LemonSqueezy configuration from environment variables
 */
export function getLemonSqueezyConfig(): LemonSqueezyConfig {
  const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID || '';
  const proMonthly = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT || '';
  const proYearly = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT || '';
  const lifetime = process.env.NEXT_PUBLIC_LEMONSQUEEZY_LIFETIME_VARIANT || '';

  // Check if properly configured (not using placeholder values)
  const isConfigured =
    storeId !== '' &&
    storeId !== 'your-store-slug' &&
    proMonthly !== '' &&
    proMonthly !== '000000';

  return {
    storeId,
    variants: {
      proMonthly,
      proYearly,
      lifetime,
    },
    isConfigured,
  };
}

/**
 * Get variant ID for a specific plan type
 */
export function getVariantId(planType: PlanType): string {
  const config = getLemonSqueezyConfig();

  switch (planType) {
    case 'pro-monthly':
      return config.variants.proMonthly;
    case 'pro-yearly':
      return config.variants.proYearly;
    case 'lifetime':
      return config.variants.lifetime;
    default:
      throw new Error(`Unknown plan type: ${planType}`);
  }
}

/**
 * Generate a LemonSqueezy checkout URL
 *
 * @param config - Checkout configuration
 * @returns Full checkout URL or null if not configured
 *
 * @example
 * ```ts
 * const url = generateCheckoutUrl({
 *   variantId: '123456',
 *   userId: 'user_abc123',
 *   userEmail: 'user@example.com',
 * });
 * // Returns: https://your-store.lemonsqueezy.com/checkout/buy/123456?checkout[custom][user_id]=user_abc123&checkout[email]=user@example.com
 * ```
 */
export function generateCheckoutUrl(config: CheckoutConfig): string | null {
  const lsConfig = getLemonSqueezyConfig();

  if (!lsConfig.isConfigured) {
    console.warn('LemonSqueezy is not configured. Checkout URLs will not work.');
    return null;
  }

  const { variantId, userId, userEmail, successUrl, cancelUrl } = config;

  // Base checkout URL
  // Format: https://[store].lemonsqueezy.com/checkout/buy/[variant_id]
  const baseUrl = `https://${lsConfig.storeId}.lemonsqueezy.com/checkout/buy/${variantId}`;

  // Build query parameters
  const params = new URLSearchParams();

  // Pass user ID as custom data (will be available in webhook)
  if (userId) {
    params.set('checkout[custom][user_id]', userId);
  }

  // Pre-fill email
  if (userEmail) {
    params.set('checkout[email]', userEmail);
  }

  // Custom success/cancel URLs
  if (successUrl) {
    params.set('checkout[success_url]', successUrl);
  }

  if (cancelUrl) {
    params.set('checkout[cancel_url]', cancelUrl);
  }

  // Add dark mode support (optional)
  params.set('checkout[dark]', 'true');

  // Embed mode for potential modal usage
  // params.set('embed', '1');

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate checkout URL for a specific plan
 *
 * @param planType - The plan to generate checkout for
 * @param userContext - Optional user context for pre-filling
 * @returns Checkout URL or null if not configured
 */
export function generatePlanCheckoutUrl(
  planType: PlanType,
  userContext?: {
    userId?: string;
    email?: string;
  }
): string | null {
  const variantId = getVariantId(planType);

  if (!variantId || variantId === '000000') {
    return null;
  }

  // Get success URL based on current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = origin ? `${origin}/upgrade/success` : undefined;

  return generateCheckoutUrl({
    variantId,
    userId: userContext?.userId,
    userEmail: userContext?.email,
    successUrl,
  });
}

/**
 * Check if LemonSqueezy checkout is available
 */
export function isCheckoutAvailable(): boolean {
  return getLemonSqueezyConfig().isConfigured;
}

/**
 * Get customer portal URL for managing subscription
 * Note: This requires LemonSqueezy customer portal to be enabled
 */
export function getCustomerPortalUrl(): string | null {
  const config = getLemonSqueezyConfig();

  if (!config.isConfigured) {
    return null;
  }

  // LemonSqueezy customer portal URL pattern
  return `https://${config.storeId}.lemonsqueezy.com/billing`;
}
