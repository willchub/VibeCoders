import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const CheckoutCancelPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
            <XCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-brand-secondary mb-2">
            Payment cancelled
          </h1>
          <p className="text-brand-muted mb-6">
            Your payment was cancelled. No charge was made. You can try again when you’re ready.
          </p>
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

export default CheckoutCancelPage;
