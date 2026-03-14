import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ListingCard from '../components/marketplace/ListingCard';
import StoresMapView from '../components/map/StoresMapView';
import BookingModal from './BookingModal';
import { getListings } from '../services/api';

const CATEGORIES = ['All Services', 'Barbershop', 'Gym Class', 'Salon', 'Physio'];
const VIEW_LIST = 'list';
const VIEW_MAP = 'map';

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsError, setListingsError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Services');
  const [viewMode, setViewMode] = useState(VIEW_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setListingsError(null);
      try {
        const data = await getListings();
        setListings(data);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setListingsError(error?.message || 'Failed to load listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings =
    activeCategory === 'All Services'
      ? listings
      : listings.filter((listing) => listing.type === activeCategory);

  const handleBookClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const handleConfirmBooking = () => {
    alert(`Booking confirmed for ${selectedListing.title}!`);
    handleCloseModal();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <header className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2940&auto=format&fit=crop"
          alt="Modern salon interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-secondary/40 backdrop-brightness-75" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4 max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Look Great, For Less.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light">
            Grab last-minute beauty deals near you and save up to 50%.
          </p>
          <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
              <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Service (e.g. Balayage)"
                className="w-full border-none focus:ring-0 text-sm outline-none"
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Los Angeles, CA"
                className="w-full border-none focus:ring-0 text-sm outline-none"
              />
            </div>
            <button
              type="button"
              className="bg-brand-primary text-white px-8 py-3 rounded-xl md:rounded-full font-semibold hover:bg-opacity-90 transition-all"
            >
              Search
            </button>
          </div>
        </motion.div>
      </header>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b border-gray-100 overflow-x-auto hide-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 justify-start md:justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full border text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'border-brand-secondary bg-brand-secondary text-white'
                    : 'border-gray-200 hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace: List vs Map */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-brand-secondary">Live Deals Near You</h2>
            <p className="text-brand-muted mt-2">Book within the next 2 hours for maximum savings.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode(VIEW_LIST)}
                className={`px-5 py-2 text-sm font-medium ${
                  viewMode === VIEW_LIST
                    ? 'bg-brand-secondary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode(VIEW_MAP)}
                className={`px-5 py-2 text-sm font-medium ${
                  viewMode === VIEW_MAP
                    ? 'bg-brand-secondary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Map / Near me
              </button>
            </div>
            <select className="hidden sm:block rounded-full border border-gray-200 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary px-4 py-2 outline-none">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Highest Discount</option>
            </select>
          </div>
        </div>

        {listingsError && (
          <p className="text-red-500 text-center py-4 bg-red-50 rounded-xl mb-6" role="alert">
            {listingsError}
          </p>
        )}
        {viewMode === VIEW_MAP ? (
          <StoresMapView listings={filteredListings} onBook={handleBookClick} />
        ) : (
          <>
            {loading ? (
              <p className="text-brand-muted text-center py-12">Loading listings...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredListings.map((listing, idx) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    index={idx}
                    onBook={handleBookClick}
                  />
                ))}
              </div>
            )}

            <div className="mt-16 text-center">
              <button
                type="button"
                className="px-10 py-4 bg-white border border-gray-200 rounded-full font-semibold hover:bg-brand-secondary hover:text-white transition-all"
              >
                View All Local Deals
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />

      <BookingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default MarketplacePage;
