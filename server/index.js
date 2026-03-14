import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import { paypalClient } from './paypalClient.js';

const app = express();
const PORT = process.env.PORT || 4242;

// Stripe requires the secret key. Use STRIPE_SECRET_KEY (sk_test_... or sk_live_...).
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' }) : null;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

/**
 * Create a Stripe Checkout Session for a single booking (one-time payment).
 * Body: { listingId, title, amountCents, seller, appointmentTime }
 */
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in server/.env',
      });
    }
    const { listingId, title, amountCents, seller, appointmentTime } = req.body;

    if (!title || amountCents == null || amountCents < 50) {
      return res.status(400).json({
        error: 'Invalid request. title and amountCents (min 50) are required.',
      });
    }

    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: seller
                ? `Booking with ${seller}${appointmentTime ? ` • ${new Date(appointmentTime).toLocaleString()}` : ''}`
                : undefined,
              images: undefined,
            },
            unit_amount: Math.round(Number(amountCents)),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout-cancel`,
      client_reference_id: String(listingId || ''),
      metadata: {
        listingId: String(listingId || ''),
        seller: String(seller || ''),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({
      error: err.message || 'Failed to create checkout session',
    });
  }
});

/**
 * PayPal: create order. Body: { amount, currency, description }
 */
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const client = paypalClient();
    if (!client) {
      return res.status(503).json({
        error: 'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in server/.env',
      });
    }
    const { amount = 0, currency = 'USD', description } = req.body;
    const value = Number(amount).toFixed(2);
    if (Number(value) < 0.01) {
      return res.status(400).json({ error: 'Amount must be at least 0.01' });
    }
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: currency, value },
          description: description || 'Booking payment',
        },
      ],
    });
    const response = await client.execute(request);
    const orderId = response.result.id;
    res.json({ orderId });
  } catch (err) {
    console.error('PayPal create order error:', err);
    res.status(500).json({ error: err.message || 'Failed to create PayPal order' });
  }
});

/**
 * PayPal: capture order. Body: { orderId }
 */
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const client = paypalClient();
    if (!client) {
      return res.status(503).json({ error: 'PayPal is not configured.' });
    }
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    await client.execute(request);
    res.json({ success: true });
  } catch (err) {
    console.error('PayPal capture error:', err);
    res.status(500).json({ error: err.message || 'Failed to capture order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
