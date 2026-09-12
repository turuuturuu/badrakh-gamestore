// Buyer-side "saved / хадгалсан" list — the heart icon in the header and
// on every ProductCard. No backend endpoint needed for this per the
// spec (buyers never register), so it lives entirely in localStorage,
// keyed by product id. We store a small snapshot (title/price/image) of
// each favorited product too, so the header dropdown can render the list
// without an extra network round trip.
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'badrakh_favorites';
const FavoritesContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const isFavorite = (id) => Boolean(favorites[id]);

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0]?.url || null,
        };
      }
      return next;
    });
    return !favorites[product.id]; // true if it was just added
  };

  const list = Object.values(favorites);

  return (
    <FavoritesContext.Provider value={{ favorites: list, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
