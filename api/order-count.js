// ============================================================
//  Vercel Serverless Function — Stripe Order Count
//
//  Returns the number of completed Stripe Checkout Sessions
//  against a manufacturing goal of 135 units.
//
//  Required env var: STRIPE_SECRET_KEY
// ============================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const GOAL = 135;
const BASE_COUNT = 5; // orders placed before the tracker was added

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    let stripeCount = 0;
    let hasMore = true;
    let startingAfter;

    while (hasMore) {
      const params = { status: 'complete', limit: 100 };
      if (startingAfter) params.starting_after = startingAfter;

      const sessions = await stripe.checkout.sessions.list(params);
      stripeCount += sessions.data.length;
      hasMore = sessions.has_more;
      if (hasMore) startingAfter = sessions.data[sessions.data.length - 1].id;
    }

    const count = BASE_COUNT + stripeCount;
    const remaining = Math.max(0, GOAL - count);
    const percent = Math.min(100, Math.round((count / GOAL) * 100));

    return res.status(200).json({ count, goal: GOAL, remaining, percent });
  } catch (err) {
    console.error('order-count error:', err.message);
    return res.status(500).json({ error: 'Unable to fetch order count.' });
  }
};
