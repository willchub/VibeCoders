import checkoutSdk from '@paypal/checkout-server-sdk';

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return process.env.NODE_ENV === 'production'
    ? new checkoutSdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutSdk.core.SandboxEnvironment(clientId, clientSecret);
}

export function paypalClient() {
  const env = environment();
  return env ? new checkoutSdk.core.PayPalHttpClient(env) : null;
}
