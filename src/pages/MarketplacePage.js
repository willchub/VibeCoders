import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import MarketplaceHero from '../components/ui/MarketplaceHero';
import GradualBlur from '../components/ui/GradualBlur';
import ListingCard from '../components/marketplace/ListingCard';
import StoresMapView from '../components/map/StoresMapView';
import BookingModal from './BookingModal';
import SearchAutocomplete from '../components/common/SearchAutocomplete';
import { getListings, searchListings } from '../services/api';
import { searchAddressSuggestions } from '../services/geocode';

const CATEGORIES = ['All Services', 'Barbershop', 'Gym Class', 'Salon', 'Physio'];
const VIEW_LIST = 'list';
const VIEW_MAP = 'map';

const MarketplacePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [listingsError, setListingsError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Services');
  const [viewMode, setViewMode] = useState(VIEW_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const resultsSectionRef = useRef(null);

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

  // Open booking modal when navigating from detail page with "Book now"
  useEffect(() => {
    const toBook = location.state?.openBooking;
    if (toBook) {
      setSelectedListing(toBook);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} }); // clear state
    }
  }, [location.state, location.pathname, navigate]);

  const handleSearch = useCallback(async () => {
    setSearchLoading(true);
    setSearchResults(null);
    try {
      const results = await searchListings(searchService, searchLocation);
      setSearchResults(results);
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchService, searchLocation]);

  const baseList = searchResults !== null ? searchResults : listings;
  const filteredListings =
    activeCategory === 'All Services'
      ? baseList
      : baseList.filter((listing) => listing.type === activeCategory);

  // Autocomplete suggestions from listings
  const serviceSuggestions = useMemo(() => {
    const seen = new Set();
    const out = [];
    listings.forEach((l) => {
      [l.title, l.type, l.seller].forEach((s) => {
        if (s && !seen.has(s)) { seen.add(s); out.push(s); }
      });
    });
    return out;
  }, [listings]);


  const handleBookClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const handleConfirmBooking = () => {
    // Modal now redirects to Stripe; close is handled after session is created
    handleCloseModal();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Header variant="light" />

      <MarketplaceHero>
        <form
          className="bg-white backdrop-blur-sm p-2 rounded-2xl md:rounded-full shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl border border-gray-200"
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        >
          <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 min-w-0">
            <SearchAutocomplete
              id="service"
              value={searchService}
              onChange={setSearchService}
              suggestions={serviceSuggestions}
              placeholder="Service (e.g. Balayage)"
              icon={Search}
              onSubmit={handleSearch}
              aria-label="Service search"
              minChars={1}
              maxSuggestions={8}
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-2 min-w-0">
            <SearchAutocomplete
              id="location"
              value={searchLocation}
              onChange={setSearchLocation}
              fetchSuggestions={searchAddressSuggestions}
              placeholder="Location (e.g. Melbourne, Los Angeles)"
              icon={MapPin}
              onSubmit={handleSearch}
              aria-label="Location search"
              minChars={2}
              maxSuggestions={8}
            />
          </div>
          <motion.button
            type="submit"
            disabled={searchLoading}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="bg-white text-zinc-900 px-8 py-3 rounded-xl md:rounded-full font-semibold hover:bg-zinc-100 transition-all disabled:opacity-70 shadow-md hover:shadow-lg border border-gray-200"
          >
            {searchLoading ? 'Searching…' : 'Search'}
          </motion.button>
        </form>
      </MarketplaceHero>

      {/* Category Filters */}
      <section className="py-6 border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 justify-start md:justify-center">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'border-brand-secondary bg-brand-secondary text-white shadow-md'
                    : 'border-gray-300 bg-gray-50 text-zinc-600 hover:bg-gray-100 hover:text-zinc-900 hover:border-gray-400'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace: List vs Map */}
      <main ref={resultsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="font-sans text-3xl font-semibold text-zinc-900 tracking-tight">Live Deals Near You</h2>
            <p className="font-sans text-zinc-600 mt-2">
              {searchResults !== null ? (
                <>
                  Showing {filteredListings.length} result{filteredListings.length !== 1 ? 's' : ''} for your search.
                  {' '}
                  <button
                    type="button"
                    onClick={() => { setSearchResults(null); setSearchService(''); setSearchLocation(''); }}
                    className="text-brand-primary font-medium hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                'Book within the next 2 hours for maximum savings.'
              )}
            </p>
          </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-full border border-gray-300 overflow-hidden bg-gray-50">
                <motion.button
                  type="button"
                  onClick={() => setViewMode(VIEW_LIST)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className={`px-5 py-2 text-sm font-medium transition-all ${
                    viewMode === VIEW_LIST ? 'bg-white text-zinc-900 shadow-inner border border-gray-200' : 'text-zinc-600 hover:text-zinc-900 hover:bg-gray-100'
                  }`}
                >
                  List
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setViewMode(VIEW_MAP)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  className={`px-5 py-2 text-sm font-medium transition-all ${
                    viewMode === VIEW_MAP ? 'bg-white text-zinc-900 shadow-inner border border-gray-200' : 'text-zinc-600 hover:text-zinc-900 hover:bg-gray-100'
                  }`}
                >
                  Map / Near me
                </motion.button>
              </div>
              <select className="hidden sm:block rounded-full border border-gray-300 bg-gray-50 text-zinc-900 text-sm focus:ring-2 focus:ring-brand-primary/30 px-4 py-2 outline-none">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Highest Discount</option>
              </select>
            </div>
        </div>

        {listingsError && (
          <p className="text-red-700 text-center py-4 bg-red-50 rounded-xl mb-6 border border-red-200" role="alert">
            {listingsError}
          </p>
        )}
        {viewMode === VIEW_MAP ? (
          <StoresMapView listings={filteredListings} onBook={handleBookClick} />
        ) : (
          <>
            {loading ? (
              <p className="text-zinc-500 text-center py-12">Loading listings...</p>
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
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="px-10 py-4 bg-gray-100 border border-gray-200 rounded-full font-semibold text-zinc-900 hover:bg-gray-200 transition-colors"
              >
                View All Local Deals
              </motion.button>
            </div>
          </>
        )}
      </main>

      <GradualBlur
        target="page"
        position="bottom"
        height="4rem"
        strength={1}
        divCount={4}
        curve="ease-out"
        opacity={0.9}
      />

      <Footer variant="light" />

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
