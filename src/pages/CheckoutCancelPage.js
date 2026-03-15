import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';

const CheckoutCancelPage = () => {
  return (
    <GlassPageLayout>
      <main className="flex flex-col items-center justify-center py-8">
        <GlassCard className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mb-6">
            <XCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment cancelled</h1>
          <p className="text-zinc-600 mb-6">
            Your payment was cancelled. No charge was made. You can try again when you're ready.
          </p>
          <Link to="/marketplace" className="inline-block px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-colors">
            Back to Marketplace
          </Link>
        </GlassCard>
      </main>
    </GlassPageLayout>
  );
};

export default CheckoutCancelPage;
