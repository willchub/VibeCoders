import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Pencil } from 'lucide-react';
import { motion } from 'motion/react';

// Slight gradients per listing type — warm palette to match theme (coral/blush/brown)
const TYPE_GRADIENTS = {
  Salon: 'bg-gradient-to-br from-rose-50 to-white',
  Barbershop: 'bg-gradient-to-br from-amber-50 to-white',
  'Gym Class': 'bg-gradient-to-br from-orange-50 to-white',
  'Nail Salon': 'bg-gradient-to-br from-stone-100 to-white',
  default: 'bg-gradient-to-br from-rose-50/80 to-white', // soft blush fallback
};

const getCardGradient = (type) => TYPE_GRADIENTS[type] || TYPE_GRADIENTS.default;

const ListingCard = ({ listing, index = 0, onBook, editHref }) => {
  const navigate = useNavigate();
  const {
    title,
    seller,
    type,
    originalPrice,
    discountedPrice,
    imageUrl,
    appointmentTime,
    rating = 4.5,
    reviews = 0,
    isExpired,
    status,
  } = listing;
  const isSold = status === 'sold';

  const cardGradient = getCardGradient(type);

  const discount =
    originalPrice > 0
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;
  const discountLabel = discount ? `${discount}% OFF` : 'Deal';

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return isToday ? `Today at ${timeStr}` : timeStr;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      className={`${cardGradient} rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group cursor-pointer`}
      onClick={() => navigate(`/listing/${listing.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/listing/${listing.id}`)}
      role="button"
      tabIndex={0}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
            {discountLabel}
          </span>
          {isSold && (
            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Sold
            </span>
          )}
          {!isSold && isExpired && (
            <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Expired
            </span>
          )}
        </div>
        <button
          type="button"
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-brand-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: toggle wishlist
          }}
          aria-label="Save to wishlist"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5 border-t border-white/40">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
              {type}
            </p>
            <h3 className="font-sans text-lg font-semibold text-brand-secondary leading-tight">{seller}</h3>
          </div>
          <div className="flex items-center text-xs font-medium">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            {rating}{' '}
            <span className="text-brand-muted ml-1">({reviews})</span>
          </div>
        </div>
        <p className="font-sans text-sm text-brand-muted mb-4">{title}</p>
        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-brand-muted line-through">${originalPrice}</span>
            <span className="text-xl font-bold text-brand-secondary">${discountedPrice}</span>
          </div>
          <div className="text-right flex items-center gap-2">
            {editHref && (
              <Link
                to={editHref}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-brand-secondary text-sm font-medium hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            )}
            <span className="block text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
              {isSold ? 'Sold' : isExpired ? 'Expired' : formatTime(appointmentTime)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ListingCard;
