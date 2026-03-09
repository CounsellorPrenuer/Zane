import Razorpay from 'razorpay';

// Initialize Razorpay with API keys
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface RazorpayOrderOptions {
  amount: number; // Amount in paise (multiply by 100)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (options: RazorpayOrderOptions) => {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
    });
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create payment order');
  }
};

export const verifyRazorpayPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const crypto = require('crypto');
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === razorpaySignature;
};