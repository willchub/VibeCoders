import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Pencil, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import TiltCard from '../ui/TiltCard';
import { useAuth } from '../../contexts/AuthContext';
import { useFavourites } from '../../contexts/FavouritesContext';

// Slight gradients per listing type — warm palette to match theme (coral/blush/brown)
const TYPE_GRADIENTS = {
  Salon: 'bg-gradient-to-br from-rose-50 to-white',
  Barbershop: 'bg-gradient-to-br from-amber-50 to-white',
  'Gym Class': 'bg-gradient-to-br from-orange-50 to-white',
  'Nail Salon': 'bg-gradient-to-br from-stone-100 to-white',
  default: 'bg-gradient-to-br from-rose-50/80 to-white', // soft blush fallback
};

const getCardGradient = (type) => TYPE_GRADIENTS[type] || TYPE_GRADIENTS.default;

// Default logo when no business logo is set — barber/salon themed for a coherent look
const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop';
// Fallback Instagram so test/demo listings always show the icon
const FALLBACK_INSTAGRAM = 'https://instagram.com';

const ListingCard = ({ listing, index = 0, onBook, editHref, businessLogoUrl, instagramUrl }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isBusiness } = useAuth();
  const { isFavourited, toggleFavourite } = useFavourites();
  const isCustomer = !isBusiness;
  const showFavouriteButton = isCustomer; // show heart for all customers (logged-in or guest)
  const favourited = isAuthenticated && isCustomer && isFavourited(listing.id);
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
  const logoUrl = businessLogoUrl || DEFAULT_LOGO;
  const instagramToUse = instagramUrl || FALLBACK_INSTAGRAM;
  const instagramHref = instagramToUse.startsWith('http')
    ? instagramToUse
    : `https://instagram.com/${(instagramToUse || '').replace('@', '')}`;
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
    <TiltCard>
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
        {showFavouriteButton && (
          <button
            type="button"
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              favourited
                ? 'bg-brand-primary/90 text-white hover:bg-brand-primary'
                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-brand-primary'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (isAuthenticated) {
                toggleFavourite(listing.id);
              } else {
                navigate('/login?redirect=/marketplace');
              }
            }}
            aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart className={`h-5 w-5 ${favourited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="p-5 border-t border-white/40">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
              onError={(e) => { e.target.src = DEFAULT_LOGO; }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                {type}
              </p>
              <h3 className="font-sans text-lg font-semibold text-brand-secondary leading-tight truncate">{seller}</h3>
            </div>
          </div>
          <div className="flex items-center text-xs font-medium flex-shrink-0">
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
          {/* Standard order: Instagram → Edit (if any) → Time/status */}
          <div className="text-right flex items-center gap-2 flex-nowrap justify-end">
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary transition-colors flex-shrink-0"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            {editHref && (
              <Link
                to={editHref}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-brand-secondary text-sm font-medium hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-colors flex-shrink-0"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            )}
            <span className="inline-flex text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded flex-shrink-0">
              {isSold ? 'Sold' : isExpired ? 'Expired' : formatTime(appointmentTime)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
    </TiltCard>
  );
};

export default ListingCard;
