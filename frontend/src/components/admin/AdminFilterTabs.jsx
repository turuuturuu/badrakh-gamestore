import { motion } from 'framer-motion';

// Same sliding-pill pattern as the storefront's CategoryTabs (shared
// layoutId + underdamped spring) so the admin table filter feels like
// the same premium nav, not a cheaper admin-only widget.
const OPTIONS = [
  { value: undefined, label: 'Бүгд' },
  { value: 'account', label: 'Аккаунт' },
  { value: 'cs2', label: 'CS2 Скин' },
  { value: 'topup', label: 'Цэнэглэлт' },
  { value: 'rental', label: 'Түрээс' },
];

const PILL_SPRING = { type: 'spring', stiffness: 300, damping: 25 };

// Accounts and CS2 skins share `category === 'account'` in the DB, so the
// two tabs are told apart by game_slug instead of a second category value.
export function matchesAdminFilter(product, filter) {
  if (!filter) return true;
  if (filter === 'cs2') return product.game_slug === 'cs2';
  if (filter === 'account') return product.category === 'account' && product.game_slug !== 'cs2';
  return product.category === filter;
}

export default function AdminFilterTabs({ value, onChange }) {
  return (
    <div className="flex w-fit items-center gap-1 overflow-x-auto scrollbar-none rounded-2xl bg-base-800/70 p-1 backdrop-blur-sm">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.value)}
            className={`relative whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ease-smooth ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="admin-filter-tab-pill"
                transition={PILL_SPRING}
                className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
