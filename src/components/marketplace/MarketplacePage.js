import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ListingCard from '../components/marketplace/ListingCard';
import Filters from '../components/marketplace/Filters';
import BookingModal from '../components/marketplace/BookingModal';
import { getListings } from '../services/api';

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100);
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
        <h1>Available Now</h1>
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
              filteredListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onBook={handleBookClick} 
                />
              ))
            )}
          </section>
        </div>
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
