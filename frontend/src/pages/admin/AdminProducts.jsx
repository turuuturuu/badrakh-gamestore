import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import ProductsTable from '../../components/admin/ProductsTable';
import ProductForm from '../../components/admin/ProductForm';
import AdminFilterTabs, { matchesAdminFilter } from '../../components/admin/AdminFilterTabs';
import GradientButton from '../../components/common/GradientButton';
import Loader from '../../components/common/Loader';
import productService from '../../api/productService';

// Full CRUD screen: list (via ProductsTable) + a slide-in panel that
// hosts ProductForm for both "add" and "edit" (same component, decided
// by whether `editing` is set).
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited, or null for "add"
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState(undefined); // undefined = "Бүгд"

  const filteredProducts = useMemo(
    () => products.filter((p) => matchesAdminFilter(p, filter)),
    [products, filter]
  );

  const load = () => {
    setLoading(true);
    productService
      .adminList()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setPanelOpen(true);
  };
  const openEdit = (product) => {
    setEditing(product);
    setPanelOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editing) {
        await productService.update(editing.id, formData);
      } else {
        await productService.create(formData);
      }
      setPanelOpen(false);
      load();
    } catch (e) {
      alert(e.message); // simple, visible failure — this is an internal admin tool
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    setBusyId(product.id);
    try {
      const next = product.status === 'sold' ? 'available' : 'sold';
      await productService.updateStatus(product.id, next);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`"${product.title}" барааг устгах уу?`)) return;
    try {
      await productService.remove(product.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-base-950">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-white">Бараа удирдах</h1>
          <GradientButton onClick={openAdd}>+ Бараа нэмэх</GradientButton>
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <AdminFilterTabs value={filter} onChange={setFilter} />
          <p className="text-xs text-gray-500">Нийт {filteredProducts.length} бараа</p>
        </div>

        {loading && <Loader />}
        {error && <p className="text-sm text-accent-red">{error}</p>}
        {!loading && !error && (
          <ProductsTable
            products={filteredProducts}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            busyId={busyId}
          />
        )}
      </main>

      {/* Slide-in add/edit panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setPanelOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-lg overflow-y-auto bg-base-800 p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editing ? 'Бараа засах' : 'Шинэ бараа'}</h2>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-gray-400 transition-all duration-300 ease-smooth hover:rotate-90 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
            <ProductForm
              initial={editing}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => setPanelOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
