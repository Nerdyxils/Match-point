// Stripe service for premium subscriptions
import { loadStripe } from '@stripe/stripe-js';

// TODO: Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_demo-key-replace-with-actual';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const createCheckoutSession = async (userId, userEmail) => {
  try {
    // In a real app, this would call your backend API
    // For demo purposes, we'll simulate the response
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        priceId: 'price_demo_premium_monthly', // Your Stripe price ID
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error('Stripe error:', error);
    return { success: false, error: error.message };
  }
};

export const redirectToCheckout = async (userId, userEmail) => {
  try {
    const stripe = await getStripe();
    const { sessionId } = await createCheckoutSession(userId, userEmail);
    
    if (sessionId) {
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};

// Demo function for testing without actual Stripe integration
export const simulatePremiumUpgrade = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Premium upgrade successful!' });
    }, 2000);
  });
}; 