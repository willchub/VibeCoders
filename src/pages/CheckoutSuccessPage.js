import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-brand-secondary mb-2">
            Payment successful
          </h1>
          <p className="text-brand-muted mb-6">
            Thank you for your purchase. Your booking is confirmed. You will receive an email receipt from Stripe.
          </p>
          {sessionId && (
            <p className="text-xs text-gray-400 mb-6 font-mono truncate" title={sessionId}>
              Session: {sessionId}
            </p>
          )}
          <Link
            to="/marketplace"
            className="inline-block px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            Back to Marketplace
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccessPage;
