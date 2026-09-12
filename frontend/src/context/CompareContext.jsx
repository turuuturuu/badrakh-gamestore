// "Харьцуулах" list — up to MAX_COMPARE products the buyer picked (from
// ProductModal) to view side-by-side in <CompareModal>. Mirrors
// FavoritesContext: no backend endpoint, just a small localStorage-backed
// snapshot per product so the compare bar/table can render without an
// extra network round trip.
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'badrakh_compare';
export const MAX_COMPARE = 4;
const CompareContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function CompareProvider({ children }) {
  const [compareMap, setCompareMap] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareMap));
    } catch {
      // ignore
    }
  }, [compareMap]);

  const isComparing = (id) => Boolean(compareMap[id]);

  // Returns { added, limitReached } so callers can toast the right message.
  const toggleCompare = (product) => {
    let result = { added: false, limitReached: false };
    setCompareMap((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
        result = { added: false, limitReached: false };
        return next;
      }
      if (Object.keys(prev).length >= MAX_COMPARE) {
        result = { added: false, limitReached: true };
        return prev;
      }
      next[product.id] = {
        id: product.id,
        title: product.title,
        price: product.variants?.[0]?.price ?? product.price,
        hasVariants: Boolean(product.variants?.length),
        image: product.images?.[0]?.url || null,
        gameSlug: product.game_slug,
        gameName: product.game_name,
        category: product.category,
        sellerType: product.seller_type,
        collectionCount: product.collection_count,
        bindInfo: product.bind_info,
      };
      result = { added: true, limitReached: false };
      return next;
    });
    return result;
  };

  const removeFromCompare = (id) => {
    setCompareMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCompare = () => setCompareMap({});

  const list = Object.values(compareMap);

  return (
    <CompareContext.Provider value={{ compareList: list, isComparing, toggleCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
