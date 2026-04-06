// ============================================================
//  Vercel Serverless Function — Stripe Checkout Session
//
//  Required environment variables (set in Vercel dashboard):
//    STRIPE_SECRET_KEY   — your Stripe secret key (sk_live_... or sk_test_...)
//    NEXT_PUBLIC_URL     — your site URL, e.g. https://revivalthegame.vercel.app
//
//  After you have a Stripe account:
//    1. Create a Product + Price in the Stripe dashboard
//    2. Copy the Price ID (price_xxxxxxxx) into STRIPE_PRICE_ID below
//       OR set it as an environment variable.
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ── Config ──────────────────────────────────────────────────
// Replace this with your actual Stripe Price ID once created,
// or set STRIPE_PRICE_ID as a Vercel environment variable.
const PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_REPLACE_ME';

const SITE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// ── Handler ─────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Guard: reject placeholder price ID in production
  if (PRICE_ID === 'price_REPLACE_ME' && process.env.NODE_ENV === 'production') {
    console.error('Stripe Price ID not configured.');
    return res.status(500).json({ error: 'Store is not configured yet. Please check back soon.' });
  }

  const { quantity = 1 } = req.body || {};

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID,
          quantity: Math.max(1, Math.min(10, parseInt(quantity, 10) || 1)),
        },
      ],
      // Collect shipping address for physical product
      shipping_address_collection: {
        allowed_countries: ['CA', 'US'],
      },
      // Optional: collect phone number for shipping updates
      phone_number_collection: { enabled: true },
      success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cancel.html`,
      metadata: {
        product: 'Revival: The Great Commission',
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: 'Unable to create checkout session. Please try again.' });
  }
};
