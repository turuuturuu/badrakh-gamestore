import { WEAR_CONDITIONS, WEAR_SHORT_LABELS } from '../../utils/format';

// Secondary refinement filters shown only for CS2 — sit where
// SellerTypeTabs normally would (see Storefront.jsx). Both are optional
// narrowings on top of the CS2FilterTabs item-type tab, applied
// client-side over the already-fetched CS2 slice.
const selectClass =
  'h-9 shrink-0 rounded-lg border border-base-500 bg-base-800 px-2.5 text-xs font-semibold text-gray-300 outline-none transition-colors duration-300 ease-smooth hover:border-brand-to focus:border-brand-to';

export default function CS2AttributeFilters({ wear, onWearChange, stattrak, onStattrakChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={wear || ''}
        onChange={(e) => onWearChange(e.target.value || undefined)}
        aria-label="Wear шүүлтүүр"
        className={selectClass}
      >
        <option value="">Бүх Wear</option>
        {WEAR_CONDITIONS.map((w) => (
          <option key={w} value={w}>
            {WEAR_SHORT_LABELS[w]} · {w}
          </option>
        ))}
      </select>

      <select
        value={stattrak || ''}
        onChange={(e) => onStattrakChange(e.target.value || undefined)}
        aria-label="StatTrak / Souvenir шүүлтүүр"
        className={selectClass}
      >
        <option value="">StatTrak/Souvenir — Бүгд</option>
        <option value="stattrak">Зөвхөн StatTrak™</option>
        <option value="souvenir">Зөвхөн Souvenir</option>
        <option value="none">Зөвхөн энгийн</option>
      </select>
    </div>
  );
}
