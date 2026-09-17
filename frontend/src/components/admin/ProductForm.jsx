import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import GradientButton from '../common/GradientButton';
import { CATEGORY_LABELS, WEAR_CONDITIONS, CS2_ITEM_TYPE_LABELS } from '../../utils/format';
import { EASE_SMOOTH } from '../../utils/motion';
import productService from '../../api/productService';

const GAMES = [
  { slug: 'pubg', name: 'PUBG Mobile' },
  { slug: 'mlbb', name: 'Mobile Legends: Bang Bang' },
  { slug: 'cs2', name: 'Counter-Strike 2' },
];

// Title placeholder mirrors whatever game is selected so a CS2 listing
// doesn't show a leftover "PUBG Mobile" example while the admin types.
const TITLE_PLACEHOLDERS = {
  pubg: 'PUBG Mobile — Бэлэн аккаунт',
  mlbb: 'MLBB — Бэлэн аккаунт (Mythic Set)',
  cs2: 'AK-47 | Asiimov (Field-Tested)',
};

const emptyVariant = () => ({ label: '', price: '', durationHours: '' });

// CS2 listings have no manual title field (see below) — the title is
// built from the skin fields instead, e.g. "StatTrak™ AK-47 | Asiimov
// (Field-Tested)", so the catalog title always matches what was entered.
function buildCS2Title({ weaponName, skinName, wearCondition, stattrakType }) {
  const parts = [];
  if (stattrakType === 'stattrak') parts.push('StatTrak™');
  else if (stattrakType === 'souvenir') parts.push('Souvenir');
  const core = [weaponName, skinName].filter(Boolean).join(' | ');
  if (core) parts.push(core);
  if (wearCondition) parts.push(`(${wearCondition})`);
  return parts.join(' ');
}

/**
 * Shared Add/Edit product form. `initial` (when present) pre-fills the
 * form for editing; the parent (AdminProducts) decides whether to POST
 * or PUT based on whether `initial.id` exists.
 */
export default function ProductForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    gameSlug: initial?.game_slug || 'pubg',
    category: initial?.category || 'account',
    sellerType: initial?.seller_type || 'admin',
    title: initial?.title || '',
    description: initial?.description || '',
    price: initial?.price ?? '',
    status: initial?.status || 'available',
    isHot: initial?.is_hot || false,
    collectionCount: initial?.collection_count ?? '',
    bindInfo: initial?.bind_info || '',
    accountLevel: initial?.account_level ?? '',
    gameAccountId: initial?.game_account_id || '',
    maxRank: initial?.max_rank || '',
    royalePass: initial?.royale_pass || '',
    maxEmblem: initial?.max_emblem || '',
    skinCount: initial?.skin_count || '',
    weaponName: initial?.weapon_name || '',
    skinName: initial?.skin_name || '',
    wearCondition: initial?.wear_condition || '',
    floatValue: initial?.float_value ?? '',
    stattrakType: initial?.stattrak_type || 'none',
    cs2ItemType: initial?.cs2_item_type || '',
    contactMessenger: initial?.contact_messenger || '',
  });
  const [variants, setVariants] = useState(
    initial?.variants?.length ? initial.variants.map((v) => ({ ...v, price: v.price })) : []
  );
  // Already-uploaded images (only present when editing) — removable
  // straight away via productService.deleteImage, independent of the
  // form's own save/cancel.
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Newly-picked files awaiting upload on submit. Each carries its own
  // object-URL preview (created once, at selection time) so removing one
  // wrongly-added photo doesn't require re-deriving every other preview.
  const [images, setImages] = useState([]); // [{ id, file, previewUrl }]
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Revoke whatever object URLs are still outstanding when the form
  // unmounts (panel closed) — reads the ref so it sees the latest list
  // rather than the empty array captured at mount.
  useEffect(() => () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl)), []);

  const handleFilesChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) {
      setImages((prev) => [
        ...prev,
        ...picked.map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    }
    e.target.value = ''; // let picking the same file(s) again still fire onChange
  };

  const removeNewImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const removeExistingImage = async (image) => {
    if (!confirm('Энэ зургийг устгах уу?')) return;
    setDeletingImageId(image.id);
    try {
      await productService.deleteImage(initial.id, image.id);
      setExistingImages((imgs) => imgs.filter((img) => img.id !== image.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingImageId(null);
    }
  };

  const needsVariants = form.category === 'topup' || form.category === 'rental';
  const isCS2 = form.gameSlug === 'cs2';

  // CS2 skins are always single-item "account" listings sold by the store
  // itself, so category/sellerType are locked (not user-editable — see the
  // disabled selects below) and the title is generated from the skin
  // fields instead of typed by hand.
  useEffect(() => {
    if (!isCS2) return;
    setForm((f) => {
      const nextTitle = buildCS2Title(f);
      if (f.category === 'account' && f.sellerType === 'admin' && f.title === nextTitle) return f;
      return { ...f, category: 'account', sellerType: 'admin', title: nextTitle };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCS2, form.weaponName, form.skinName, form.wearCondition, form.stattrakType]);

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateVariant = (idx, key) => (e) => {
    const value = e.target.value;
    setVariants((vs) => vs.map((v, i) => (i === idx ? { ...v, [key]: value } : v)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    if (needsVariants) {
      fd.append(
        'variants',
        JSON.stringify(variants.filter((v) => v.label && v.price).map((v) => ({
          label: v.label,
          price: Number(v.price),
          durationHours: v.durationHours ? Number(v.durationHours) : null,
        })))
      );
    }
    images.forEach(({ file }) => fd.append('images', file));

    onSubmit(fd);
  };

  const inputClass =
    'w-full rounded-xl border border-base-500 bg-base-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-to';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Тоглоом</label>
          <select value={form.gameSlug} onChange={update('gameSlug')} className={inputClass}>
            {GAMES.map((g) => (
              <option key={g.slug} value={g.slug}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ангилал</label>
          <select
            value={form.category}
            onChange={update('category')}
            disabled={isCS2}
            className={`${inputClass} ${isCS2 ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CS2 has no manual title/description — the title is auto-built
          from the skin fields (see buildCS2Title) and a skin listing
          doesn't need free-text description. */}
      <AnimatePresence initial={false}>
        {!isCS2 && (
          <motion.div
            key="title-description"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
            className="space-y-5 overflow-hidden"
          >
            <div>
              <label className={labelClass}>Гарчиг</label>
              <input required value={form.title} onChange={update('title')} className={inputClass} placeholder={TITLE_PLACEHOLDERS[form.gameSlug]} />
            </div>

            <div>
              <label className={labelClass}>Тайлбар</label>
              <textarea rows={3} value={form.description} onChange={update('description')} className={inputClass} placeholder="Дэлгэрэнгүй мэдээлэл..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{needsVariants ? 'Эхлэх үнэ (₮)' : 'Үнэ (₮)'}</label>
          <input required type="number" min="0" value={form.price} onChange={update('price')} className={inputClass} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Төлөв</label>
          <select value={form.status} onChange={update('status')} className={inputClass}>
            <option value="available">Available</option>
            <option value="sold">{form.category === 'rental' ? 'Түрээслэгдсэн' : 'Sold'}</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Seller Type *</label>
          <select
            value={form.sellerType}
            onChange={update('sellerType')}
            disabled={isCS2}
            className={`${inputClass} ${isCS2 ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm text-gray-300">
          <input type="checkbox" checked={form.isHot} onChange={update('isHot')} className="h-4 w-4 rounded border-base-500 bg-base-800 accent-brand-to" />
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-accent-red" strokeWidth={2.2} />
            HOT шошго
          </span>
        </label>
      </div>

      {/* CS2 skins and PUBG/MLBB accounts need completely different extra
          fields, so only one of these two blocks is ever mounted — they
          cross-fade instead of both existing hidden in the DOM. */}
      <AnimatePresence mode="wait" initial={false}>
        {isCS2 ? (
          <motion.div
            key="cs2-fields"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
            className="space-y-4 rounded-2xl border border-base-600 bg-base-800/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-to">CS2 Skin мэдээлэл</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Зэвсгийн нэр</label>
                <input value={form.weaponName} onChange={update('weaponName')} className={inputClass} placeholder="AK-47, AWP, Karambit..." />
              </div>
              <div>
                <label className={labelClass}>Skin-ий нэр</label>
                <input value={form.skinName} onChange={update('skinName')} className={inputClass} placeholder="Asiimov, Fade..." />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Элэгдэл (Wear)</label>
                <select value={form.wearCondition} onChange={update('wearCondition')} className={inputClass}>
                  <option value="">Сонгоогүй</option>
                  {WEAR_CONDITIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Float утга</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.000001"
                  value={form.floatValue}
                  onChange={update('floatValue')}
                  className={inputClass}
                  placeholder="0.035000"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>StatTrak / Souvenir</label>
                <select value={form.stattrakType} onChange={update('stattrakType')} className={inputClass}>
                  <option value="none">Энгийн (none)</option>
                  <option value="stattrak">StatTrak™</option>
                  <option value="souvenir">Souvenir</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Зэвсгийн төрөл (sub-nav)</label>
                <select value={form.cs2ItemType} onChange={update('cs2ItemType')} className={inputClass}>
                  <option value="">Сонгоогүй</option>
                  {Object.entries(CS2_ITEM_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        ) : (
          form.category === 'account' && (
            <motion.div
              key="account-fields"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease: EASE_SMOOTH }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Collection тоо</label>
                  <input type="number" min="0" value={form.collectionCount} onChange={update('collectionCount')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bind мэдээлэл</label>
                  <input value={form.bindInfo} onChange={update('bindInfo')} className={inputClass} placeholder="elink numb / facebook / ..." />
                </div>
                <div>
                  {/* Shown copyable right alongside Collection on the
                      product card — see ProductModal.jsx. */}
                  <label className={labelClass}>Аккаунтын ID</label>
                  <input
                    value={form.gameAccountId}
                    onChange={update('gameAccountId')}
                    className={inputClass}
                    placeholder="Жишээ: 5123456789"
                  />
                </div>
              </div>

              {/* PUBG/MLBB-only account stats — Account Level is shared by
                  both games, the rest are game-specific (see PUBG_FIELDS /
                  MLBB_FIELDS split below and ProductModal's display side). */}
              {(form.gameSlug === 'pubg' || form.gameSlug === 'mlbb') && (
                <div className="space-y-4 rounded-2xl border border-base-600 bg-base-800/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-to">
                    {form.gameSlug === 'pubg' ? 'PUBG Mobile дэлгэрэнгүй' : 'MLBB дэлгэрэнгүй'}
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>Account Level</label>
                      <input
                        type="number"
                        min="0"
                        value={form.accountLevel}
                        onChange={update('accountLevel')}
                        className={inputClass}
                        placeholder="Жишээ: 75"
                      />
                    </div>
                    {form.gameSlug === 'pubg' ? (
                      <>
                        <div>
                          <label className={labelClass}>Max Rank</label>
                          <input
                            value={form.maxRank}
                            onChange={update('maxRank')}
                            className={inputClass}
                            placeholder="Ace, Conqueror..."
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Royale Pass</label>
                          <input
                            value={form.royalePass}
                            onChange={update('royalePass')}
                            className={inputClass}
                            placeholder="RP төлөв..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className={labelClass}>Max Emblem</label>
                          <input
                            value={form.maxEmblem}
                            onChange={update('maxEmblem')}
                            className={inputClass}
                            placeholder="Mythic, Legend V..."
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Skin Count</label>
                          <input
                            value={form.skinCount}
                            onChange={update('skinCount')}
                            className={inputClass}
                            placeholder="Тоо / гол скиндүүд..."
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>

      {needsVariants && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass}>
              {form.category === 'rental' ? 'Түрээсийн хугацааны багц' : 'Цэнэглэлтийн багц'}
            </label>
            <button
              type="button"
              onClick={() => setVariants((v) => [...v, emptyVariant()])}
              className="text-xs font-semibold text-brand-to hover:underline"
            >
              + Багц нэмэх
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  placeholder={form.category === 'rental' ? '1 цаг' : '60 UC'}
                  value={v.label}
                  onChange={updateVariant(idx, 'label')}
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Үнэ"
                  value={v.price}
                  onChange={updateVariant(idx, 'price')}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setVariants((vs) => vs.filter((_, i) => i !== idx))}
                  className="flex items-center justify-center rounded-xl border border-base-500 px-3 text-accent-red transition-all duration-300 ease-smooth hover:rotate-90 hover:border-accent-red"
                >
                  <X className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            ))}
            {!variants.length && <p className="text-xs text-gray-500">Одоогоор багц алга.</p>}
          </div>
        </div>
      )}

      {/* Only "account" listings have an individual owner to contact —
          CS2 skins and topup/rental (delivered by the store itself) have
          no such person, so this field only makes sense for accounts. */}
      <AnimatePresence initial={false}>
        {!isCS2 && form.category === 'account' && (
          <motion.div
            key="contact-messenger"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
            className="overflow-hidden"
          >
            <label className={labelClass}>Эзэмшигчийн профайл холбоос</label>
            <input value={form.contactMessenger} onChange={update('contactMessenger')} className={inputClass} placeholder="https://facebook.com/... эсвэл https://m.me/..." />
            <p className="mt-1 text-[11px] text-gray-500">
              Худалдаж авах товч байнга дэлгүүрийн албан ёсны Messenger рүү үсэрдэг тул энд зөвхөн барааны эзний (хэрэглэгчийн) хувийн профайл/чат холбоосыг оруулна.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className={labelClass}>Зураг (Cloudinary руу upload хийнэ, нэг дор олон зураг сонгож болно)</label>

        {existingImages.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {existingImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-base-600">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img)}
                  disabled={deletingImageId === img.id}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-smooth hover:bg-accent-red/80 group-hover:opacity-100 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFilesChange}
          className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-base-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-base-500">
                <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(img.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-smooth hover:bg-accent-red/80 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <GradientButton type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Хадгалж байна...' : initial ? 'Хадгалах' : 'Нэмэх'}
        </GradientButton>
        <GradientButton type="button" variant="outline" onClick={onCancel}>
          Цуцлах
        </GradientButton>
      </div>
    </form>
  );
}
