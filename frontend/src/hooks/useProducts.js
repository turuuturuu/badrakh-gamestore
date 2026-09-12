// Fetches products for a given filter set and re-fetches whenever the
// filters change. Centralizing this means every page that lists
// products (public catalog, admin table) shares the same loading /
// error handling shape instead of re-implementing it.
import { useEffect, useState, useCallback } from 'react';
import productService from '../api/productService';

export default function useProducts(filters) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    productService
      .list(filters)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}
