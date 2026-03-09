// Shared Mentoria pricing configuration
// This is the single source of truth for pricing across frontend and backend

export interface MentoriaPricing {
  standard: number;
  premium: number;
}

// Prices in rupees (will be converted to paise for Razorpay)
export const MENTORIA_PRICES: Record<string, MentoriaPricing> = {
  '8-9': {
    standard: 5500,
    premium: 15000,
  },
  '10-12': {
    standard: 10000,
    premium: 25000,
  },
  'graduates': {
    standard: 15000,
    premium: 35000,
  },
  'professionals': {
    standard: 25000,
    premium: 50000,
  },
};

// Helper to get price for display
export const formatPrice = (price: number): string => {
  return `₹ ${price.toLocaleString('en-IN')}`;
};

// Helper to get price from category and tier
export const getMentoriaPrice = (category: string, tier: 'standard' | 'premium'): number | null => {
  const categoryPrices = MENTORIA_PRICES[category];
  if (!categoryPrices) return null;
  return categoryPrices[tier];
};

/**
 * Calculates the discount amount based on original price and coupon details
 */
export const calculateDiscount = (
  originalPrice: number,
  discountType: string,
  discountValue: string | number,
  maxDiscount?: string | number
): number => {
  const val = typeof discountValue === 'string' ? parseFloat(discountValue) : discountValue;
  const max = maxDiscount ? (typeof maxDiscount === 'string' ? parseFloat(maxDiscount) : maxDiscount) : null;

  if (discountType === 'percentage') {
    let discount = (originalPrice * val) / 100;
    if (max !== null && discount > max) {
      discount = max;
    }
    return Math.floor(discount);
  } else if (discountType === 'fixed') {
    return Math.min(originalPrice, Math.floor(val));
  }

  return 0;
};

/**
 * Calculates the final price after applying a discount
 */
export const calculateFinalPrice = (originalPrice: number, discountAmount: number): number => {
  return Math.max(0, originalPrice - discountAmount);
};
