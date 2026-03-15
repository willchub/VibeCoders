import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ListingCard from '../components/marketplace/ListingCard';
import BookingModal from './BookingModal';
import { useAuth } from '../contexts/AuthContext';
import { useFavourites } from '../contexts/FavouritesContext';
import { getFavouriteListings, getBusinessProfile } from '../services/api';

const FavouritesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isBusiness } = useAuth();
  const { refreshFavourites } = useFavourites();
  const [listings, setListings] = useState([]);
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/favourites', { replace: true });
      return;
    }
    if (isBusiness) {
      navigate('/marketplace', { replace: true });
      return;
    }
  }, [isAuthenticated, isBusiness, navigate]);

  useEffect(() => {
    if (!user?.id || isBusiness) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFavouriteListings(user.id);
        setListings(data);
        refreshFavourites();
        const ids = [...new Set(data.map((l) => l.sellerId).filter(Boolean))];
        const profiles = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              profiles[id] = await getBusinessProfile(id);
            } catch (_) {
              profiles[id] = { logoUrl: '', instagramUrl: '', photoUrls: [] };
            }
          })
        );
        setSellerProfiles(profiles);
      } catch (_) {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, isBusiness]);

  const handleBook = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated || isBusiness) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Header variant="light" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <h1 className="font-sans text-3xl font-semibold text-zinc-900 tracking-tight mb-2">
          Favourites
        </h1>
        <p className="text-zinc-600 mb-8">
          Listings you saved to book later. Expired deals are removed automatically.
        </p>
        {loading ? (
          <p className="text-zinc-500 py-12">Loading your favourites…</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-zinc-600 mb-4">You haven’t favourited any listings yet.</p>
            <a
              href="/marketplace"
              className="inline-block px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors"
            >
              Browse marketplace
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map((listing, idx) => {
              const profile = listing.sellerId ? sellerProfiles[listing.sellerId] : null;
              return (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={idx}
                  onBook={handleBook}
                  businessLogoUrl={profile?.logoUrl || undefined}
                  instagramUrl={profile?.instagramUrl || undefined}
                />
              );
            })}
          </div>
        )}
      </main>
      <Footer variant="light" />
      <BookingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedListing(null); }}
        onConfirm={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FavouritesPage;
