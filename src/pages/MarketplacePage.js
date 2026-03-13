import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ListingCard from '../components/marketplace/ListingCard';
import Filters from '../components/marketplace/Filters';
import { getListings } from '../services/api';

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Available Now</h1>
        <div className="marketplace-layout">
          <aside className="filters-sidebar">
            <Filters />
          </aside>
          <section className="listings-grid">
            {loading ? (
              <p>Loading listings...</p>
            ) : (
              listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage;
