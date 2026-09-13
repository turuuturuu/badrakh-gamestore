import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import TrustMarquee from '../components/common/TrustMarquee';
import AdminStrip from '../components/common/AdminStrip';
import Reveal from '../components/common/Reveal';
import SearchBar from '../components/products/SearchBar';
import GameFilterTabs from '../components/products/GameFilterTabs';
import CategoryTabs from '../components/products/CategoryTabs';
import SellerTypeTabs from '../components/products/SellerTypeTabs';
import CS2FilterTabs from '../components/products/CS2FilterTabs';
import CS2AttributeFilters from '../components/products/CS2AttributeFilters';
import ProductGrid from '../components/products/ProductGrid';
import ProductModal from '../components/products/ProductModal';
import useProducts from '../hooks/useProducts';
import { useProductModal } from '../context/ProductModalContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { EASE_SMOOTH } from '../utils/motion';

/**
 * The single public storefront page — serves both "/" (browse
 * everything) and "/:game" (deep link into one game, e.g. shared from
 * a Messenger chat). All browsing state (game / category / seller type
 * / search / sort) lives here; GameFilterTabs replaced the old header
 * nav links per the redesign, so game selection is a filter chip row in
 * the body instead of a route change on every click.
 */
export default function Storefront() {
  const { game: gameFromRoute } = useParams(); // present only on /:game
  const [game, setGame] = useState(gameFromRoute); // undefined = "Бүгд"
  const [category, setCategory] = useState('account');
  const [sellerType, setSellerType] = useState(undefined); // undefined = "Бүгд"
  // CS2-only sub-filters — replace category/sellerType while game === 'cs2'
  // (see the AnimatePresence swap below and useProducts filters).
  const [cs2ItemType, setCs2ItemType] = useState(undefined);
  const [wearFilter, setWearFilter] = useState(undefined);
  const [stattrakFilter, setStattrakFilter] = useState(undefined);
  const [query, setQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const { product: selectedProduct, openProduct, closeProduct } = useProductModal();
  const { hero_image_url: heroImageUrl } = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const isCS2 = game === 'cs2';

  // Admin/User Accounts only means anything for "account" listings —
  // topup/rental are always store-fulfilled, so the filter is ignored
  // (and its row disabled below) once the category tab moves off "account".
  const sellerTypeApplies = !isCS2 && category === 'account';

  const { products, loading, error } = useProducts({
    game,
    category: isCS2 ? undefined : category,
    sellerType: sellerTypeApplies ? sellerType : undefined,
    cs2ItemType: isCS2 ? cs2ItemType : undefined,
    // Admin/User Accounts (and "Бүгд" with no game picked) must only ever
    // surface PUBG/MLBB-style accounts — CS2 skins also live under
    // category='account' so without this they'd leak into those tabs.
    excludeCs2: !isCS2,
  });

  // Reset the seller-type filter whenever it stops applying, so it
  // doesn't silently linger and surprise the buyer if they switch back
  // to "Аккаунт" later.
  useEffect(() => {
    if (!sellerTypeApplies) setSellerType(undefined);
  }, [sellerTypeApplies]);

  // Deep-link support for ProductModal's "Хуваалцах" (share) button:
  // a shared /?product=<id> URL fetches and opens that product directly,
  // independent of whatever game/category filters happen to be active.
  useEffect(() => {
    const sharedId = searchParams.get('product');
    if (!sharedId) return;
    openProduct(sharedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => {
    closeProduct();
    if (searchParams.get('product')) {
      const next = new URLSearchParams(searchParams);
      next.delete('product');
      setSearchParams(next, { replace: true });
    }
  };

  // Search + sort are cheap enough to do client-side over the already
  // fetched category/game slice, so we don't need a dedicated backend
  // search endpoint for this.
  const visibleProducts = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (isCS2 && wearFilter) {
      list = list.filter((p) => p.wear_condition === wearFilter);
    }
    if (isCS2 && stattrakFilter) {
      list = list.filter((p) =>
        stattrakFilter === 'none' ? !p.stattrak_type || p.stattrak_type === 'none' : p.stattrak_type === stattrakFilter
      );
    }
    return [...list].sort((a, b) => (sortDesc ? b.price - a.price : a.price - b.price));
  }, [products, query, sortDesc, isCS2, wearFilter, stattrakFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* ---- Hero ---- */}
      {/* An admin-uploaded banner photo (Settings → Hero Banner Image)
          replaces the flat bg-base-800 surface + glow accents with the
          photo itself plus a dark scrim for text contrast; with no image
          set (the default) this renders exactly as before — glow accents
          included — so there's no visual regression for stores that
          never touch that setting. */}
      <Reveal
        as="section"
        className={`relative overflow-hidden rounded-3xl p-4 text-center sm:p-6 ${heroImageUrl ? 'bg-base-900 bg-cover bg-center' : 'bg-base-800'}`}
        style={
          heroImageUrl
            ? { backgroundImage: `linear-gradient(rgba(5,7,13,0.55), rgba(5,7,13,0.72)), url("${heroImageUrl}")` }
            : undefined
        }
      >
        {!heroImageUrl && (
          <>
            {/* Soft ambient glow accents behind the hero content, purely
                decorative — coordinated with the page-wide ambient glow in
                index.css (same indigo/blue family) so the banner's lighting
                reads as one continuous light source instead of a separate
                effect bolted on top of it. */}
            <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-brand-from/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-brand-to/25 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-via/15 blur-3xl" />
          </>
        )}

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/15 px-3 py-1 text-xs font-semibold text-accent-green">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
            Монголын баталгаат тоглоомын дэлгүүр
          </span>
          <h1 className="mt-3 text-xl font-extrabold leading-tight text-ink sm:text-3xl">
            Тоглоомын <span className="text-gradient">аккаунт, түрээс, цэнэглэлт</span>
          </h1>
          {/* Admin names registered in Admin Panel → Settings, right
              under the heading. Renders nothing on its own when no admin
              profile exists yet. */}
          <AdminStrip />
          <TrustMarquee />
        </div>
      </Reveal>

      {/* ---- Search + filters ---- */}
      <Reveal delay={80} className="mt-4">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          sortDesc={sortDesc}
          onToggleSort={() => setSortDesc((v) => !v)}
        />
        {/* Extra top margin here (independent of the space-y-3 below) keeps
            the search bar's focus/hover glow from visually overlapping the
            game filter chips right underneath it. */}
        <motion.div layout transition={{ duration: 0.3, ease: EASE_SMOOTH }} className="mt-4 space-y-3">
          <GameFilterTabs value={game} onChange={setGame} />

          {/* CS2 swaps in its own item-type + wear/StatTrak sub-nav here;
              every other game keeps the account/topup/rental + seller-type
              tabs. AnimatePresence cross-fades between the two blocks
              instead of the row snapping when `game` changes. */}
          <AnimatePresence mode="wait" initial={false}>
            {isCS2 ? (
              <motion.div
                key="cs2-filters"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                className="space-y-3"
              >
                <CS2FilterTabs value={cs2ItemType} onChange={setCs2ItemType} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CS2AttributeFilters
                    wear={wearFilter}
                    onWearChange={setWearFilter}
                    stattrak={stattrakFilter}
                    onStattrakChange={setStattrakFilter}
                  />
                  <p className="shrink-0 text-xs text-gray-500">Нийт {visibleProducts.length} үр дүн</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="default-filters"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                className="space-y-3"
              >
                <CategoryTabs active={category} onChange={setCategory} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SellerTypeTabs value={sellerType} onChange={setSellerType} disabled={!sellerTypeApplies} />
                  <p className="text-xs text-gray-500">Нийт {visibleProducts.length} үр дүн</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Reveal>

      <div className="mt-4">
        <ProductGrid products={visibleProducts} loading={loading} error={error} onOpen={openProduct} />
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal key={selectedProduct.id} product={selectedProduct} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}
