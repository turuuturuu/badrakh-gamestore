import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ArrowLeftRight, Share2, User, MessageCircle, Copy } from 'lucide-react';
import GradientButton from '../common/GradientButton';
import { formatMNT, CATEGORY_LABELS, STATTRAK_LABELS, STATTRAK_STYLES, formatFloat } from '../../utils/format';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../context/ToastContext';
import { OFFICIAL_MESSENGER_URL } from '../../config/site';
import { EASE_SMOOTH, backdropVariants, modalPanelVariants } from '../../utils/motion';

const PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%230f1420"/%3E%3C/svg%3E';

/**
 * Full-screen-on-mobile / centered-on-desktop product detail dialog.
 * Buyers never create an account. The bottom "Худалдаж авах" button routes
 * per `routesToOwnerProfile` (see below): an 'account' listing with an
 * owner link set always opens that link (product.contact_messenger),
 * regardless of admin/user seller_type; a 'topup'/'rental' listing only
 * does that for a 'user' seller_type, and otherwise opens the store's own
 * Messenger chat (OFFICIAL_MESSENGER_URL). The top "Эзэнтэй холбогдох"
 * button — shown only when the admin set an owner link for this listing —
 * mirrors that same link. Mount/unmount is animated by the parent
 * wrapping this component in <AnimatePresence> (see Storefront.jsx) — the
 * exit variants below only run because of that wrapper.
 */
export default function ProductModal({ product, onClose }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();
  const { show } = useToast();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const images = product.images?.length ? product.images : [{ url: PLACEHOLDER }];
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const liked = isFavorite(product.id);
  const comparing = isComparing(product.id);

  const nextImg = () => setImgIndex((i) => (i + 1) % images.length);
  const prevImg = () => setImgIndex((i) => (i - 1 + images.length) % images.length);

  const handleToggleFavorite = () => {
    const added = toggleFavorite(product);
    show(added ? 'Хадгалсанд нэмэгдлээ' : 'Хадгалснаас хаслаа');
  };

  const handleToggleCompare = () => {
    const { added, limitReached } = toggleCompare(product);
    if (limitReached) {
      show('Дээд тал нь 4 барааг зэрэг харьцуулах боломжтой');
      return;
    }
    show(added ? 'Харьцуулах жагсаалтад нэмэгдлээ' : 'Харьцуулах жагсаалтаас хасагдлаа');
  };

  // Which listings route the buyer straight to the owner's own profile
  // link instead of the store's official Messenger:
  //  - 'account' listings: ANY seller_type, as long as an owner link was
  //    entered for this listing — an admin-owned account can still have
  //    its own dedicated contact (e.g. a middleman), same as a user one.
  //  - 'topup'/'rental' listings: only 'user' sellers — these are always
  //    fulfilled by the store itself otherwise, so an 'admin' listing
  //    here keeps going to OFFICIAL_MESSENGER_URL as before.
  const routesToOwnerProfile =
    Boolean(product.contact_messenger) &&
    (product.category === 'account' || product.seller_type === 'user');

  // Pre-fills the Messenger composer with a ready-to-send message built
  // from this exact product/variant, via m.me's `?text=` param — the
  // buyer lands in Messenger with the message already written, not just
  // an empty chat with the seller. The `?text=` prefill only works on
  // m.me/messenger.com links — a plain facebook.com profile URL doesn't
  // support it, so it's appended only when applicable.
  const buyUrl = (() => {
    let text;
    if (product.category === 'topup') {
      const amount = selectedVariant?.label || formatMNT(displayPrice);
      text = `Сайн байна уу? Би ${amount}-ийн цэнэглэлт хийлгэмээр байна. (Бараа ID: #${product.id})`;
    } else {
      const verb = product.category === 'rental' ? 'түрээслэмээр' : 'худалдаж авмаар';
      text = `Сайн байна уу? Би ${product.title} (ID: #${product.id}, Үнэ: ${formatMNT(displayPrice)})-ийг ${verb} байна.`;
    }

    const targetUrl = routesToOwnerProfile ? product.contact_messenger : OFFICIAL_MESSENGER_URL;

    const supportsPrefill = /(^|\.)(m\.me|messenger\.com)/.test(
      (() => {
        try {
          return new URL(targetUrl).hostname;
        } catch {
          return '';
        }
      })()
    );

    return supportsPrefill ? `${targetUrl}?text=${encodeURIComponent(text)}` : targetUrl;
  })();

  // A manual fallback for the Messenger auto-prefill above — that only
  // fires reliably when Messenger opens a brand-new conversation; if the
  // app was already open on the same thread, it just resumes as-is with
  // no way for us to inject text into an already-open composer. Showing
  // the ID (copyable) plus a reminder near the buy button means the
  // buyer can still paste it in manually when the auto-fill doesn't land.
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(String(product.id));
      show('ID хуулагдлаа');
    } catch {
      // clipboard permission denied or unsupported — nothing to do
    }
  };

  // Same copy-to-clipboard as the barааны ID pill above, but for the
  // account's own in-game ID/UID (product.game_account_id) — the buyer
  // needs this to actually verify/receive the account, so it should be
  // just as easy to copy as the listing ID.
  const handleCopyAccountId = async () => {
    try {
      await navigator.clipboard.writeText(String(product.game_account_id));
      show('Аккаунтын ID хуулагдлаа');
    } catch {
      // clipboard permission denied or unsupported — nothing to do
    }
  };

  const chatPartner = routesToOwnerProfile ? 'зарагчтай' : 'админтай';

  const buyReminder =
    product.category === 'topup'
      ? `Худалдаж авах дээр дарж ${chatPartner} чатлахдаа хүссэн цэнэглэх хэмжээгээ (жишээ: 660 UC) болон энэ барааны ID-г (#${product.id}) заавал бичиж илгээгээрэй.`
      : product.category === 'rental'
      ? `Худалдаж авах дээр дарж ${chatPartner} чатлахдаа хүссэн түрээсийн хугацаагаа болон энэ барааны ID-г (#${product.id}) заавал бичиж илгээгээрэй.`
      : `Худалдаж авах дээр дарж ${chatPartner} чатлахдаа энэ барааны ID-г (#${product.id}) заавал бичиж илгээгээрэй.`;

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const shareData = { title: product.title, text: `${product.title} — ${formatMNT(displayPrice)}`, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      show('Холбоос хуулагдлаа');
    } catch {
      // user cancelled the native share sheet — nothing to do
    }
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      {/* Wrapper (not the card itself) carries the slide/scale entrance
          animation, so the close button can float just outside the card's
          own rounded/overflow-hidden box instead of sitting inside it on
          top of the heart/compare/share row (they used to collide there). */}
      <motion.div
        variants={modalPanelVariants}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-3xl"
      >
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(0,0,0,0.7)' }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
          className="absolute -top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white sm:-right-3 sm:-top-3"
          aria-label="Хаах"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </motion.button>

        <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-base-800/95 shadow-glass backdrop-blur-xl sm:h-auto sm:max-h-[90vh] sm:flex-row sm:rounded-3xl">
        {/* Image gallery: fixed landscape frame (never square, never
            cropped) — the photo sits centered on a neutral dark backdrop
            (object-contain, not cover) so portrait or oddly-proportioned
            source images letterbox cleanly instead of losing their edges.
            The aspect ratio stays the same at every breakpoint (including
            the sm:w-1/2 desktop column) so the box never changes shape
            depending on which photo was uploaded. Crossfade + arrow/dot
            nav between slides. */}
        <div className="relative aspect-[4/3] w-full shrink-0 touch-pan-y bg-base-950 sm:w-1/2">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIndex}
              src={images[imgIndex].url}
              alt={product.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_SMOOTH }}
              // Finger-swipe nav on mobile: drag snaps straight back to
              // center (dragConstraints 0/0) while the fade/imgIndex swap
              // does the actual sliding — this is just what reads the
              // gesture. touch-pan-y above keeps vertical page scroll
              // working through the image while x-drag is captured here.
              drag={images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) nextImg();
                else if (info.offset.x > 50) prevImg();
              }}
              className="h-full w-full object-contain"
            />
          </AnimatePresence>
          {images.length > 1 && (
            <>
              <motion.button
                onClick={prevImg}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
              >
                ‹
              </motion.button>
              <motion.button
                onClick={nextImg}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
              >
                ›
              </motion.button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    aria-label={`Зураг ${i + 1}`}
                    className="p-0.5"
                  >
                    <motion.span
                      animate={{
                        backgroundColor: i === imgIndex ? '#3b82f6' : 'rgba(255,255,255,0.4)',
                        scale: i === imgIndex ? 1.3 : 1,
                      }}
                      transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                      className="block h-1.5 w-1.5 rounded-full"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-to">
              {product.game_name} · {product.game_slug === 'cs2' ? 'Скин' : CATEGORY_LABELS[product.category]}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <motion.button
                onClick={handleToggleFavorite}
                aria-label="Хадгалах"
                animate={{
                  backgroundColor: liked ? 'rgba(255,63,142,0.15)' : 'rgba(0,0,0,0)',
                  borderColor: liked ? '#ff3f8e' : '#2a3348',
                  color: liked ? '#ff3f8e' : '#9ca3af',
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                className="flex h-8 w-8 items-center justify-center rounded-full border"
              >
                <Heart className="h-4 w-4" strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                onClick={handleToggleCompare}
                aria-label="Харьцуулах"
                animate={{
                  backgroundColor: comparing ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0)',
                  borderColor: comparing ? '#3b82f6' : '#2a3348',
                  color: comparing ? '#3b82f6' : '#9ca3af',
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-sm"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
              </motion.button>
              <motion.button
                onClick={handleShare}
                aria-label="Хуваалцах"
                whileHover={{ scale: 1.1, rotate: -10, borderColor: '#3b82f6' }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-base-500 text-gray-400 transition-colors duration-300 ease-smooth hover:text-ink"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
              </motion.button>
            </div>
          </div>

          <h2 className="mt-1 text-xl font-extrabold text-ink">{product.title}</h2>

          <motion.button
            onClick={handleCopyId}
            whileHover={{ borderColor: '#3b82f6' }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE_SMOOTH }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-base-500 px-2.5 py-1 text-xs font-semibold text-gray-300 transition-colors duration-300 ease-smooth hover:text-ink"
          >
            ID: #{product.id}
            <Copy className="h-3 w-3" strokeWidth={2} />
          </motion.button>

          <p className="mt-2 text-3xl font-extrabold text-gradient">{formatMNT(displayPrice)}</p>

          {product.stattrak_type && product.stattrak_type !== 'none' && (
            <span
              className={`mt-2 inline-flex rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${STATTRAK_STYLES[product.stattrak_type]}`}
            >
              {STATTRAK_LABELS[product.stattrak_type]}
            </span>
          )}

          {product.category === 'account' && product.contact_messenger && (
            <motion.a
              href={product.contact_messenger}
              target="_blank"
              rel="noreferrer"
              whileHover={{ y: -1, borderColor: '#3b82f6' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE_SMOOTH }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-base-500 px-3.5 py-1.5 text-xs font-semibold text-gray-200 transition-colors duration-300 ease-smooth hover:text-ink"
            >
              <User className="h-3.5 w-3.5" strokeWidth={2} />
              Эзэнтэй холбогдох
            </motion.a>
          )}

          {/* Same small pill + click-to-copy design as the barааны ID pill
              near the title — this is the account's own in-game ID/UID
              though, so it gets its own pill rather than a big stat box. */}
          {product.category === 'account' && product.game_slug !== 'cs2' && product.game_account_id && (
            <motion.button
              type="button"
              onClick={handleCopyAccountId}
              whileHover={{ borderColor: '#3b82f6' }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE_SMOOTH }}
              className="mt-3 flex items-center gap-1.5 rounded-full border border-base-500 px-2.5 py-1 text-xs font-semibold text-gray-300 transition-colors duration-300 ease-smooth hover:text-ink"
            >
              Account ID: {product.game_account_id}
              <Copy className="h-3 w-3" strokeWidth={2} />
            </motion.button>
          )}

          {((product.category === 'account' && product.game_slug !== 'cs2' && (
              product.collection_count != null ||
              product.bind_info ||
              product.account_level != null ||
              product.max_rank ||
              product.royale_pass ||
              product.max_emblem ||
              product.skin_count
            )) ||
            product.weapon_name ||
            product.skin_name ||
            product.wear_condition ||
            product.float_value != null) && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* Collection/Bind are PUBG/MLBB account-only concepts —
                  never relevant for a CS2 skin, and never relevant for a
                  topup/rental listing even if the row happens to hold a
                  stray 0/null value from before its category changed. */}
              {product.category === 'account' && product.game_slug !== 'cs2' && product.collection_count != null && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Collection</p>
                  <p className="font-bold text-ink">{product.collection_count}</p>
                </div>
              )}
              {product.category === 'account' && product.game_slug !== 'cs2' && product.bind_info && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Bind</p>
                  <p className="font-bold text-ink">{product.bind_info}</p>
                </div>
              )}

              {/* PUBG Mobile / MLBB account stats — Level is shared by both
                  games, the rest are game-specific (set in the admin form's
                  PUBG/MLBB-only block). */}
              {product.category === 'account' && (product.game_slug === 'pubg' || product.game_slug === 'mlbb') && product.account_level != null && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Level</p>
                  <p className="font-bold text-ink">{product.account_level}</p>
                </div>
              )}
              {product.category === 'account' && product.game_slug === 'pubg' && product.max_rank && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Max Rank</p>
                  <p className="font-bold text-ink">{product.max_rank}</p>
                </div>
              )}
              {product.category === 'account' && product.game_slug === 'pubg' && product.royale_pass && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Royale Pass</p>
                  <p className="font-bold text-ink">{product.royale_pass}</p>
                </div>
              )}
              {product.category === 'account' && product.game_slug === 'mlbb' && product.max_emblem && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Max Emblem</p>
                  <p className="font-bold text-ink">{product.max_emblem}</p>
                </div>
              )}
              {product.category === 'account' && product.game_slug === 'mlbb' && product.skin_count && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Skin Count</p>
                  <p className="font-bold text-ink">{product.skin_count}</p>
                </div>
              )}
              {product.weapon_name && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Зэвсэг</p>
                  <p className="font-bold text-ink">{product.weapon_name}</p>
                </div>
              )}
              {product.skin_name && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Skin</p>
                  <p className="font-bold text-ink">{product.skin_name}</p>
                </div>
              )}
              {product.wear_condition && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Элэгдэл</p>
                  <p className="font-bold text-ink">{product.wear_condition}</p>
                </div>
              )}
              {product.float_value != null && (
                <div className="rounded-xl bg-base-700 p-3 text-center">
                  <p className="text-[11px] uppercase text-gray-500">Float</p>
                  <p className="font-mono font-bold text-ink">{formatFloat(product.float_value)}</p>
                </div>
              )}
            </div>
          )}

          {product.variants?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {product.category === 'rental' ? 'Түрээсийн хугацаа сонгох' : 'Багц сонгох'}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {product.variants.map((v) => (
                  <motion.button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{
                      borderColor: selectedVariant?.id === v.id ? '#3b82f6' : '#2a3348',
                      backgroundColor: selectedVariant?.id === v.id ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0)',
                    }}
                    transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                    className={`rounded-xl border px-3 py-2.5 text-center ${
                      selectedVariant?.id === v.id ? 'text-ink shadow-glow' : 'text-gray-300'
                    }`}
                  >
                    <p className="text-sm font-semibold">{v.label}</p>
                    <p className="text-xs text-brand-to">{formatMNT(v.price)}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Дэлгэрэнгүй мэдээлэл
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              {product.description || 'Дэлгэрэнгүй мэдээлэл оруулаагүй байна.'}
            </p>
          </div>

          <div className="sticky bottom-0 mt-6 space-y-2 bg-base-800 pb-1 pt-2">
            {!routesToOwnerProfile && (
              <p className="text-center text-[11px] leading-relaxed text-gray-500">{buyReminder}</p>
            )}
            <GradientButton
              as="a"
              href={buyUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              {product.category === 'rental' ? 'Аккаунт түрээслэх' : 'Худалдаж авах'}
            </GradientButton>
          </div>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
