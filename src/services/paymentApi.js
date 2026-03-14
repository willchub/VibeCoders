/**
 * Payment API - creates checkout sessions via backend.
 * In dev, use relative URL so Create React App proxy (→ localhost:4242) is used.
 * Set REACT_APP_API_URL in .env for production or a different backend.
 */
const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * Create a Stripe Checkout session for a booking.
 * @param {{ listingId: string|number, title: string, amountCents: number, seller?: string, appointmentTime?: string }} payload
 * @returns {Promise<{ url: string, sessionId: string }>}
 */
export const createCheckoutSession = async (payload) => {
  const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to create checkout session');
  }

  return res.json();
};

/**
 * PayPal: create order. Returns { orderId }.
 */
export const paypalCreateOrder = async (amount, currency = 'USD', description) => {
  const res = await fetch(`${API_BASE}/api/paypal/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, description }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to create order');
  }
  const { orderId } = await res.json();
  return orderId;
};

/**
 * PayPal: capture order after approval.
 */
export const paypalCaptureOrder = async (orderId) => {
  const res = await fetch(`${API_BASE}/api/paypal/capture-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to capture payment');
  }
  return res.json();
};
