import crypto from 'crypto';

export interface PaymentDetails {
  paymentMethod: string;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

/**
 * Mock Payment Service
 *
 * Simulates a payment gateway. In production, replace with
 * Stripe SDK (stripe.paymentIntents.create) or PayPal Orders API.
 *
 * Stripe skeleton:
 *   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *   const intent = await stripe.paymentIntents.create({
 *     amount: Math.round(amount * 100), // in cents
 *     currency: 'usd',
 *     payment_method: paymentMethodId,
 *     confirm: true,
 *   });
 *   return { success: intent.status === 'succeeded', transactionId: intent.id };
 */
export const processPayment = async (
  amount: number,
  details: PaymentDetails
): Promise<PaymentResult> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Configurable failure rate for testing (default 10%)
  const failureRate = parseFloat(process.env.PAYMENT_FAILURE_RATE || '0.1');
  const shouldFail = Math.random() < failureRate;

  if (shouldFail) {
    return {
      success: false,
      errorMessage: 'Payment declined. Please check your payment details and try again.',
    };
  }

  // Validate mock card (test card: 4242 4242 4242 4242)
  if (details.cardDetails) {
    const { cardNumber, expiryYear, expiryMonth } = details.cardDetails;
    const now = new Date();
    const isExpired =
      expiryYear < now.getFullYear() ||
      (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1);

    if (isExpired) {
      return { success: false, errorMessage: 'Card has expired.' };
    }

    // Block obvious test failure card
    if (cardNumber === '4000000000000002') {
      return { success: false, errorMessage: 'Card declined.' };
    }
  }

  const transactionId = `txn_${crypto.randomBytes(12).toString('hex')}`;

  console.log(`💳 Payment processed: $${amount.toFixed(2)} via ${details.paymentMethod} → ${transactionId}`);

  return { success: true, transactionId };
};