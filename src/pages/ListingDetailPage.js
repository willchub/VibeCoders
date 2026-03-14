import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { getListingById } from '../services/api';

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const ImageCarousel = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const imgs = Array.isArray(images) && images.length > 0 ? images : []; // parent always passes array

  if (!imgs.length) return null;

  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((i) => (i + 1) % imgs.length);

  return (
    <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden rounded-2xl bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={imgs[idx]}
          alt=""
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
      {imgs.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-brand-secondary hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-brand-secondary hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imgs.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListingById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    navigate('/marketplace', { state: { openBooking: listing } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 flex-grow text-center text-brand-muted">
          Loading...
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 flex-grow text-center">
          <p className="text-brand-muted mb-4">Listing not found.</p>
          <Link to="/marketplace" className="text-brand-primary font-medium hover:underline">
            Back to marketplace
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const discount =
    listing.originalPrice > 0
      ? Math.round(((listing.originalPrice - listing.discountedPrice) / listing.originalPrice) * 100)
      : 0;
  const images =
    listing.imageUrls ||
    (listing.imageUrl ? [listing.imageUrl] : ['https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop']);
  const suburb = listing.suburb || (listing.location?.address || '').split(',')[0] || '—';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-grow">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary mb-8 font-sans text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>

        <ImageCarousel images={images} />

        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-1">
                {listing.type}
              </p>
              <h1 className="font-sans text-2xl md:text-3xl font-semibold text-brand-secondary">
                {listing.seller}
              </h1>
              <p className="font-sans text-lg text-brand-muted mt-1">{listing.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-sans font-medium text-brand-secondary">
                {listing.rating ?? 4.5} ({listing.reviews ?? 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center text-brand-muted font-sans text-sm mb-6">
            {listing.location?.address && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {suburb} · {listing.location.address}
              </span>
            )}
          </div>

          {listing.description && (
            <p className="font-sans text-brand-muted leading-relaxed mb-8">
              {listing.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              {discount > 0 && (
                <span className="text-brand-muted line-through font-sans">${listing.originalPrice}</span>
              )}
              <span className="font-sans text-2xl font-bold text-brand-secondary">
                ${listing.discountedPrice}
              </span>
              {discount > 0 && (
                <span className="bg-brand-primary/10 text-brand-primary text-sm font-semibold px-2 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>
            <span className="text-brand-muted font-sans text-sm">
              Available {formatTime(listing.appointmentTime)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              type="button"
              onClick={handleBook}
              className="px-8 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition-colors font-sans"
            >
              Book now
            </button>
            {listing.instagramUrl && (
              <a
                href={listing.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-brand-secondary font-medium hover:border-brand-primary hover:text-brand-primary transition-colors font-sans"
              >
                <Instagram className="w-5 h-5" /> Instagram
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetailPage;
