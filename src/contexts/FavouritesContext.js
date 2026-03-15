import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getFavouriteIds, addFavourite, removeFavourite } from '../services/api';

const FavouritesContext = createContext(null);

export const useFavourites = () => {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
};

export function FavouritesProvider({ children }) {
  const { user, isBusiness } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  const loadFavourites = useCallback(async () => {
    if (!user?.id || isBusiness) {
      setFavouriteIds(new Set());
      return;
    }
    const ids = await getFavouriteIds(user.id);
    setFavouriteIds(ids);
  }, [user?.id, isBusiness]);

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  const toggleFavourite = useCallback(
    async (listingId) => {
      if (!user?.id || isBusiness) return;
      const isFav = favouriteIds.has(listingId);
      if (isFav) {
        await removeFavourite(user.id, listingId);
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        await addFavourite(user.id, listingId);
        setFavouriteIds((prev) => new Set(prev).add(listingId));
      }
    },
    [user?.id, isBusiness, favouriteIds]
  );

  const value = {
    favouriteIds,
    isFavourited: (listingId) => favouriteIds.has(listingId),
    toggleFavourite,
    refreshFavourites: loadFavourites,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}
