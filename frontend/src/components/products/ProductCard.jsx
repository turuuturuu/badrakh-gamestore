import { motion } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';
import Badge from '../common/Badge';
import { formatMNT, WEAR_SHORT_LABELS, STATTRAK_LABELS, STATTRAK_STYLES, formatFloat } from '../../utils/format';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { EASE_SMOOTH } from '../../utils/motion';

const PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%230f1420"/%3E%3C/svg%3E';

// Per-game hover accent so a PUBG card glows warm orange and an MLBB card
// glows cool blue on hover, instead of every card sharing the same
// generic brand-purple ring/glow.
const GAME_HOVER_ACCENT = {
  pubg: 'hover:shadow-glow-pubg hover:ring-orange-400/50',
  mlbb: 'hover:shadow-glow-mlbb hover:ring-sky-400/50',
  cs2: 'hover:shadow-glow-lg hover:ring-amber-400/50',
};
const DEFAULT_HOVER_ACCENT = 'hover:shadow-glow-lg hover:ring-brand-to/50';

// Short form used only for the card's corner badge — "PUBG Mobile" at the
// shared badge size collides with the HOT badge on a narrow 2-per-row
// mobile card (~170px wide); everywhere else (title, modal) still shows
// the full game name.
const GAME_BADGE_LABELS = { pubg: 'PUBG', mlbb: 'MLBB', cs2: 'CS2' };

/**
 * One catalog tile. Shows the cover image, HOT/game badges, a title,
 * the "from" price (or variant count for topup/rental), and a heart
 * that saves the product into the shared FavoritesContext (surfaced in
 * the header's "хадгалсан" dropdown) with a toast confirmation.
 * Clicking anywhere else opens the detail modal via onOpen(product).
 * `index` staggers the mount-in animation across a grid.
 */
export default function ProductCard({ product, onOpen, index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { show } = useToast();
  const liked = isFavorite(product.id);
  const isSold = product.status === 'sold';
  const cover = product.images?.[0]?.url || PLACEHOLDER;
  const hasVariants = product.variants && product.variants.length > 0;
  const hoverAccent = GAME_HOVER_ACCENT[product.game_slug] || DEFAULT_HOVER_ACCENT;
  const hasSkinInfo =
    product.game_slug === 'cs2' &&
    (product.wear_condition || product.float_value != null || (product.stattrak_type && product.stattrak_type !== 'none'));

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    const added = toggleFavorite(product);
    show(added ? 'Хадгалсанд нэмэгдлээ' : 'Хадгалснаас хаслаа');
  };

  return (
    <motion.div
      onClick={() => {
        if (!isSold) onOpen(product);
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 12) * 0.03, ease: EASE_SMOOTH }}
      whileHover={isSold ? undefined : { scale: 1.02, y: -4 }}
      whileTap={isSold ? undefined : { scale: 0.98 }}
      className={`group overflow-hidden rounded-2xl border border-white/10 bg-base-700/60 shadow-glass ring-1 ring-base-600 backdrop-blur-md transition-shadow duration-300 ease-smooth ${
        isSold ? 'cursor-default' : `cursor-pointer ${hoverAccent}`
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-base-800">
        <img
          src={cover}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
        />

        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
          {product.is_hot ? (
            <Badge variant="hot" className="shrink-0">
              <Flame className="h-2.5 w-2.5" strokeWidth={2.2} fill="currentColor" />
              HOT
            </Badge>
          ) : (
            <span />
          )}
          <Badge variant="game" className="shrink-0">
            {GAME_BADGE_LABELS[product.game_slug] || product.game_slug}
          </Badge>
        </div>

        <motion.button
          onClick={handleToggleFavorite}
          aria-label="Хадгалах"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
          className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors duration-300 ease-smooth ${
            liked ? 'bg-accent-pink text-white' : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Heart className="h-4 w-4" strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
        </motion.button>

        {product.status === 'sold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded-lg bg-accent-red px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {product.category === 'rental' ? 'Түрээслэгдсэн' : 'Зарагдсан'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-ink">{product.title}</p>
        {product.category === 'account' && product.game_slug !== 'cs2' && product.collection_count != null && (
          <p className="text-xs text-gray-500">Collection: {product.collection_count}</p>
        )}
        {hasSkinInfo && (
          <div className="flex flex-wrap items-center gap-1">
            {product.stattrak_type && product.stattrak_type !== 'none' && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATTRAK_STYLES[product.stattrak_type]}`}
              >
                {STATTRAK_LABELS[product.stattrak_type]}
              </span>
            )}
            {product.wear_condition && (
              <span
                className="rounded-md bg-base-600 px-1.5 py-0.5 text-[10px] font-semibold text-gray-300"
                title={product.wear_condition}
              >
                {WEAR_SHORT_LABELS[product.wear_condition]}
              </span>
            )}
            {product.float_value != null && (
              <span className="font-mono text-[10px] text-gray-500">{formatFloat(product.float_value)}</span>
            )}
          </div>
        )}
        <div className="pt-1">
          <span className="text-base font-extrabold text-gradient">
            {hasVariants ? `${formatMNT(product.variants[0].price)}-с` : formatMNT(product.price)}
          </span>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (!isSold) onOpen(product);
          }}
          disabled={isSold}
          whileHover={isSold ? undefined : 'hover'}
          whileTap={isSold ? undefined : { scale: 0.97 }}
          initial="rest"
          animate="rest"
          className="relative mt-1.5 w-full overflow-hidden rounded-xl bg-brand-gradient py-2 text-xs font-bold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* Warm accent layer melts in over the brand gradient on hover */}
          <motion.span
            variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.35, ease: EASE_SMOOTH }}
            className="absolute inset-0 bg-gradient-to-r from-accent-pink to-brand-to"
          />
          <span className="relative">{isSold ? (product.category === 'rental' ? 'Түрээслэгдсэн' : 'Зарагдсан') : 'Дэлгэрэнгүй'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
