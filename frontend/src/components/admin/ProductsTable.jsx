import Badge from '../common/Badge';
import { formatMNT, CATEGORY_LABELS } from '../../utils/format';

/**
 * Manage-products table. Renders as a real <table> on sm+ screens and
 * collapses to a stacked card list on phones, since a wide table is
 * unusable on a small viewport — matches the mobile-first requirement
 * even for the admin surface.
 */
export default function ProductsTable({ products, onEdit, onDelete, onToggleStatus, busyId }) {
  if (!products.length) {
    return <p className="py-10 text-center text-sm text-gray-500">Бараа алга байна.</p>;
  }

  // Rentals use the same 'sold' status internally (unavailable — someone
  // has it), but reads as "Rented" rather than "Sold" since nobody bought
  // a rental outright.
  const statusBadge = (status, category) =>
    status === 'available' ? (
      <Badge variant="success">Available</Badge>
    ) : status === 'sold' ? (
      <Badge variant="danger">{category === 'rental' ? 'Rented' : 'Sold'}</Badge>
    ) : (
      <Badge>Hidden</Badge>
    );

  // Every non-first / non-last cell shares this vertical rhythm; the first
  // and last cells add the container's own left/right padding so content
  // never touches the table's rounded edge (previously that padding lived
  // on <tbody>/<tr>, which CSS's table layout simply ignores — the real
  // bug behind the row looking flush against the container).
  const cellClass = 'py-3.5 pr-4';

  const Row = ({ p }) => (
    <>
      <td className={`${cellClass} pl-4`}>
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]?.url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg bg-base-800 object-cover"
          />
          <div className="min-w-0">
            <p className="max-w-[220px] truncate text-sm font-medium text-white">{p.title}</p>
            <p className="text-xs text-gray-500">{p.game_name}</p>
          </div>
        </div>
      </td>
      <td className={`${cellClass} text-sm text-gray-300`}>{CATEGORY_LABELS[p.category]}</td>
      <td className={cellClass}>
        <Badge variant={p.seller_type === 'admin' ? 'brand' : 'default'} className="capitalize">
          {p.seller_type}
        </Badge>
      </td>
      <td className={`${cellClass} text-sm font-semibold text-white`}>{formatMNT(p.price)}</td>
      <td className={cellClass}>{statusBadge(p.status, p.category)}</td>
      <td className="py-3.5 pl-4 pr-4 text-right">
        <div className="flex justify-end gap-1">
          <button
            disabled={busyId === p.id}
            onClick={() => onToggleStatus(p)}
            className="whitespace-nowrap rounded-lg border border-base-500 px-2 py-1.5 text-xs font-medium text-gray-300 transition-colors duration-300 ease-smooth hover:border-brand-to hover:text-white disabled:opacity-40"
          >
            {p.status === 'sold' ? 'Available' : p.category === 'rental' ? 'Түрээслэгдсэн' : 'Sold'}
          </button>
          <button
            onClick={() => onEdit(p)}
            className="whitespace-nowrap rounded-lg border border-base-500 px-2 py-1.5 text-xs font-medium text-gray-300 transition-colors duration-300 ease-smooth hover:border-brand-to hover:text-white"
          >
            Засах
          </button>
          <button
            onClick={() => onDelete(p)}
            className="whitespace-nowrap rounded-lg border border-accent-red/40 px-2 py-1.5 text-xs font-medium text-accent-red transition-colors duration-300 ease-smooth hover:bg-accent-red/10"
          >
            Устгах
          </button>
        </div>
      </td>
    </>
  );

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-base-600 bg-base-700 sm:block">
        <table className="w-full table-fixed text-left">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-base-600 text-xs uppercase tracking-wide text-gray-500">
              <th className="py-3 pl-4 pr-4 font-medium">Бараа</th>
              <th className="py-3 pr-4 font-medium">Ангилал</th>
              <th className="py-3 pr-4 font-medium">Seller</th>
              <th className="py-3 pr-4 font-medium">Үнэ</th>
              <th className="py-3 pr-4 font-medium">Төлөв</th>
              <th className="py-3 pl-4 pr-4 text-right font-medium">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-600">
            {products.map((p) => (
              <tr key={p.id} className="align-middle transition-colors duration-300 ease-smooth hover:bg-base-600/40">
                <Row p={p} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border border-base-600 bg-base-700 p-3">
            <div className="flex items-center gap-3">
              <img src={p.images?.[0]?.url} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-base-800 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{p.title}</p>
                <p className="text-xs text-gray-500">
                  {p.game_name} · {CATEGORY_LABELS[p.category]}
                </p>
              </div>
              {statusBadge(p.status, p.category)}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{formatMNT(p.price)}</span>
              <Badge variant={p.seller_type === 'admin' ? 'brand' : 'default'} className="capitalize">
                {p.seller_type}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <button
                disabled={busyId === p.id}
                onClick={() => onToggleStatus(p)}
                className="rounded-lg border border-base-500 py-1.5 text-xs text-gray-300 transition-colors duration-300 ease-smooth active:bg-base-600 disabled:opacity-40"
              >
                {p.status === 'sold' ? 'Available' : p.category === 'rental' ? 'Түрээслэгдсэн' : 'Sold'}
              </button>
              <button
                onClick={() => onEdit(p)}
                className="rounded-lg border border-base-500 py-1.5 text-xs text-gray-300 transition-colors duration-300 ease-smooth active:bg-base-600"
              >
                Засах
              </button>
              <button
                onClick={() => onDelete(p)}
                className="rounded-lg border border-accent-red/40 py-1.5 text-xs text-accent-red transition-colors duration-300 ease-smooth active:bg-accent-red/10"
              >
                Устгах
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
