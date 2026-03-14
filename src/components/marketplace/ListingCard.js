import React from 'react';
import { Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';

const ListingCard = ({ listing, index = 0, onBook }) => {
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
  } = listing;

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
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer"
      onClick={() => onBook(listing)}
      onKeyDown={(e) => e.key === 'Enter' && onBook(listing)}
      role="button"
      tabIndex={0}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          {discountLabel}
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

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
              {type}
            </p>
            <h3 className="text-lg font-bold text-brand-secondary leading-tight">{seller}</h3>
          </div>
          <div className="flex items-center text-xs font-medium">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            {rating}{' '}
            <span className="text-brand-muted ml-1">({reviews})</span>
          </div>
        </div>
        <p className="text-sm text-brand-muted mb-4">{title}</p>
        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-brand-muted line-through">${originalPrice}</span>
            <span className="text-xl font-bold text-brand-secondary">${discountedPrice}</span>
          </div>
          <div className="text-right">
            <span className="block text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
              {formatTime(appointmentTime)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ListingCard;
