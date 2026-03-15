import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <GlassPageLayout>
      <div className="flex flex-col items-center justify-center">
        <GlassCard className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment successful</h1>
          <p className="text-zinc-600 mb-6">
            Thank you for your purchase. Your booking is confirmed. You will receive an email receipt from Stripe.
          </p>
          {sessionId && (
            <p className="text-xs text-zinc-500 mb-6 font-mono truncate" title={sessionId}>Session: {sessionId}</p>
          )}
          <Link to="/marketplace" className="inline-block px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-colors">
            Back to Marketplace
          </Link>
        </GlassCard>
      </div>
    </GlassPageLayout>
  );
};

export default CheckoutSuccessPage;
