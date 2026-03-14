import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
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
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <header className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-visible">
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
          <h1 className="font-sans text-4xl md:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight">
            Look Great, For Less.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/90 mb-8 font-light">
            Grab last-minute beauty deals near you and save up to 50%.
          </p>
          <form
            className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto relative"
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          >
            <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100 min-w-0">
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
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-brand-primary text-white px-8 py-3 rounded-xl md:rounded-full font-semibold hover:bg-opacity-90 transition-all disabled:opacity-70"
            >
              {searchLoading ? 'Searching…' : 'Search'}
            </button>
          </form>
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
      <main ref={resultsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="font-sans text-3xl font-semibold text-brand-secondary tracking-tight">Live Deals Near You</h2>
            <p className="font-sans text-brand-muted mt-2">
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
