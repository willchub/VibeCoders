import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BusinessHomePage from './BusinessHomePage';
import MarketplacePage from './MarketplacePage';

/**
 * For logged-in business users: show business home (their listing tiles + Marketplace button).
 * For everyone else: show the public marketplace.
 */
const HomePage = () => {
  const { isAuthenticated, isBusiness, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (isAuthenticated && isBusiness) {
    return <BusinessHomePage />;
  }

  return <MarketplacePage />;
};

export default HomePage;
