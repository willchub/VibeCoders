import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, PlusCircle, LayoutGrid } from 'lucide-react';
import GlassPageLayout, { GlassCard } from '../components/ui/GlassPageLayout';
import ListingCard from '../components/marketplace/ListingCard';
import { useAuth } from '../contexts/AuthContext';
import { getMyListings, getBusinessProfile } from '../services/api';

const BusinessHomePage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ logoUrl: '', instagramUrl: '', photoUrls: [] });

  useEffect(() => {
    if (!user?.id) return;
    getMyListings(user.id).then((data) => {
      setListings(data);
      setLoading(false);
    });
    getBusinessProfile(user.id).then(setProfile);
  }, [user?.id]);

  const businessName = user?.user_metadata?.full_name || 'My business';

  const activeListings = listings.filter(
    (l) => (l.status === 'available' || !l.status) && !l.isExpired
  );
  const soldListings = listings.filter((l) => l.status === 'sold');
  const expiredListings = listings.filter(
    (l) => l.status === 'expired' || l.isExpired
  );

  const renderListingGrid = (items, emptyMessage) =>
    items.length === 0 ? (
      <p className="text-brand-muted text-sm">{emptyMessage}</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((listing, idx) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            index={idx}
            editHref={`/seller-dashboard?edit=${listing.id}`}
          />
        ))}
      </div>
    );

  return (
    <GlassPageLayout title={businessName} maxWidth="max-w-7xl">
      <GlassCard className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt="Business logo"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Store className="h-8 w-8 text-brand-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">{businessName}</h1>
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl.startsWith('http') ? profile.instagramUrl : `https://instagram.com/${profile.instagramUrl.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-zinc-900 font-medium hover:bg-gray-50 transition-colors">
              <LayoutGrid className="h-5 w-5" />
              Marketplace
            </Link>
            <Link to="/seller-dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-100 transition-colors">
              <PlusCircle className="h-5 w-5" />
              Add listing
            </Link>
          </div>
        </div>
      </GlassCard>

      {profile.photoUrls && profile.photoUrls.length > 0 && (
        <GlassCard className="mb-8">
          <h2 className="text-sm font-medium text-zinc-600 mb-3">Business photos</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {profile.photoUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Business ${i + 1}`}
                  className="h-32 w-48 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                />
              ))}
            </div>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Your listings</h2>
        {loading ? (
          <p className="text-zinc-600">Loading your listings…</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-8">
              <p className="text-zinc-600 mb-4">You don’t have any listings yet.</p>
            <Link to="/seller-dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-100">
              <PlusCircle className="h-5 w-5" />
              Add your first listing
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Active listings</h2>
              <p className="text-sm text-zinc-600 mb-4">Live on the marketplace; appointment time is in the future.</p>
              {renderListingGrid(activeListings, 'No active listings.')}
            </section>
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Sold</h2>
              <p className="text-sm text-zinc-600 mb-4">Listings that have been booked.</p>
              {renderListingGrid(soldListings, 'No sold listings.')}
            </section>
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Expired</h2>
              <p className="text-sm text-zinc-600 mb-4">Appointment time has passed; no longer shown on the marketplace.</p>
              {renderListingGrid(expiredListings, 'No expired listings.')}
            </section>
          </>
        )}
      </GlassCard>

    </GlassPageLayout>
  );
};

export default BusinessHomePage;
