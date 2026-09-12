// Shares "which product's detail card is open" between Navbar (Facebook/
// saved-items icons live there) and Storefront (which actually renders
// <ProductModal>) — they're siblings under the same route in App.jsx, so
// a click in the header's "Хадгалсан бараа" dropdown can't reach
// Storefront's own state directly without this.
import { createContext, useCallback, useContext, useState } from 'react';
import productService from '../api/productService';

const ProductModalContext = createContext(null);

export function ProductModalProvider({ children }) {
  const [product, setProduct] = useState(null);

  // Accepts either a full product object (card click — no extra fetch
  // needed) or a bare id (favorites dropdown only stores a snapshot, so
  // it needs the full record fetched before the modal can render it).
  const openProduct = useCallback((productOrId) => {
    if (productOrId && typeof productOrId === 'object') {
      setProduct(productOrId);
      return;
    }
    productService.getById(productOrId).then(setProduct).catch(() => {});
  }, []);

  const closeProduct = useCallback(() => setProduct(null), []);

  return (
    <ProductModalContext.Provider value={{ product, openProduct, closeProduct }}>
      {children}
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error('useProductModal must be used within ProductModalProvider');
  return ctx;
}
