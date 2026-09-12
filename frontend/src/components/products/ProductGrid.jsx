import ProductCard from './ProductCard';
import Loader from '../common/Loader';

// Responsive grid: 2 columns on phones (the primary audience per spec),
// scaling up on larger screens. Handles loading / empty / error states
// once so every page that lists products doesn't repeat this logic.
export default function ProductGrid({ products, loading, error, onOpen }) {
  if (loading) return <Loader label="Бараа ачааллаж байна..." />;

  if (error) {
    return (
      <div className="rounded-2xl border border-accent-red/30 bg-accent-red/10 p-6 text-center text-sm text-accent-red">
        {error}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-base-500 p-10 text-center text-sm text-gray-500">
        Одоогоор бараа алга байна.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} onOpen={onOpen} index={index} />
      ))}
    </div>
  );
}
