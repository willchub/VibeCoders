import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ListingCard from '../components/marketplace/ListingCard';
import Filters from '../components/marketplace/Filters';
import StoresMapView from '../components/map/StoresMapView';
import BookingModal from './BookingModal';
import { getListings } from '../services/api';

const VIEW_LIST = 'list';
const VIEW_MAP = 'map';

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(VIEW_LIST);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(200);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListings();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  const handleFilterChange = (category) => {
    setSelectedCategory(category);
  };

  const handlePriceChange = (price) => {
    setMaxPrice(price);
  };

  const filteredListings = listings.filter(listing => {
    const categoryMatch = selectedCategory === 'All' || listing.type === selectedCategory;
    const priceMatch = listing.discountedPrice <= maxPrice;
    return categoryMatch && priceMatch;
  });

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
    <div>
      <Header />
      <main className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>Available Now</h1>
          <div className="view-toggle" style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`filter-btn ${viewMode === VIEW_LIST ? 'active' : ''}`}
              onClick={() => setViewMode(VIEW_LIST)}
            >
              List
            </button>
            <button
              type="button"
              className={`filter-btn ${viewMode === VIEW_MAP ? 'active' : ''}`}
              onClick={() => setViewMode(VIEW_MAP)}
            >
              Map / Near me
            </button>
          </div>
        </div>

        {viewMode === VIEW_MAP ? (
          <StoresMapView
            listings={filteredListings}
            onBook={handleBookClick}
          />
        ) : (
          <div className="marketplace-layout">
            <aside className="filters-sidebar">
              <Filters
                onFilterChange={handleFilterChange}
                onPriceChange={handlePriceChange}
                maxPrice={maxPrice}
                selectedCategory={selectedCategory}
              />
            </aside>
            <section className="listings-grid">
              {loading ? (
                <p>Loading listings...</p>
              ) : (
                filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onBook={handleBookClick}
                  />
                ))
              )}
            </section>
          </div>
        )}

        <BookingModal
          listing={selectedListing}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBooking}
        />
      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage;
