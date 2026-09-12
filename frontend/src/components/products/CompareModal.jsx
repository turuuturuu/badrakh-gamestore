import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { formatMNT, GAME_LABELS, CATEGORY_LABELS, SELLER_TYPE_LABELS } from '../../utils/format';
import { EASE_SMOOTH, backdropVariants, modalPanelVariants } from '../../utils/motion';

const PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%230f1420"/%3E%3C/svg%3E';

// Side-by-side comparison table opened from <CompareBar>. Each product the
// buyer added (via the "Харьцуулах" icon in ProductModal) becomes a column;
// each product attribute becomes a row, so differences are easy to scan.
export default function CompareModal({ onClose }) {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        variants={modalPanelVariants}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-base-800/95 shadow-glass backdrop-blur-xl sm:h-auto sm:max-h-[85vh] sm:max-w-4xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-base-600 px-5 py-4">
          <h2 className="text-lg font-extrabold text-ink">
            Харьцуулах <span className="text-gray-500">({compareList.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={clearCompare}
              whileHover={{ color: '#ff4d4f' }}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-400"
            >
              Цэвэрлэх
            </motion.button>
            <motion.button
              onClick={onClose}
              aria-label="Хаах"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.25, ease: EASE_SMOOTH }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-base-700 text-ink transition-colors duration-300 ease-smooth hover:bg-base-600"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <div className="grid min-w-[560px] gap-3" style={{ gridTemplateColumns: `120px repeat(${compareList.length}, minmax(150px, 1fr))` }}>
            {/* Header row: cover image + remove */}
            <div />
            {compareList.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-base-700/60 backdrop-blur-md">
                <button
                  onClick={() => removeFromCompare(p.id)}
                  aria-label="Устгах"
                  className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-all duration-300 ease-smooth hover:scale-110 hover:rotate-90 hover:bg-black/80"
                >
                  <X className="h-3 w-3" strokeWidth={2.2} />
                </button>
                <img src={p.image || PLACEHOLDER} alt={p.title} className="aspect-square w-full object-cover" />
                <p className="line-clamp-2 p-2 text-xs font-semibold text-ink">{p.title}</p>
              </div>
            ))}

            <CompareRow label="Үнэ" items={compareList} render={(p) => (
              <span className="text-base font-extrabold text-gradient">
                {p.hasVariants ? `${formatMNT(p.price)}-с` : formatMNT(p.price)}
              </span>
            )} />
            <CompareRow label="Тоглоом" items={compareList} render={(p) => GAME_LABELS[p.gameSlug] || p.gameName || '—'} />
            <CompareRow label="Ангилал" items={compareList} render={(p) => CATEGORY_LABELS[p.category] || '—'} />
            <CompareRow label="Худалдагч" items={compareList} render={(p) => SELLER_TYPE_LABELS[p.sellerType] || '—'} />
            <CompareRow label="Collection" items={compareList} render={(p) => p.collectionCount ?? '—'} />
            <CompareRow label="Bind" items={compareList} render={(p) => p.bindInfo || '—'} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Renders one label cell + one value cell per compared product. Returns a
// Fragment (not a wrapping element) so every cell lands as a direct child
// of the parent CSS grid, keeping columns aligned across rows.
function CompareRow({ label, items, render }) {
  return (
    <>
      <div className="flex items-center border-t border-base-600 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      {items.map((p) => (
        <div key={p.id} className="flex items-center border-t border-base-600 py-2.5 text-sm text-gray-200">
          {render(p)}
        </div>
      ))}
    </>
  );
}
