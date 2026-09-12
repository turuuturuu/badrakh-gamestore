import { motion } from 'framer-motion';
import { CATEGORY_LABELS } from '../../utils/format';

const CATEGORIES = ['account', 'topup', 'rental'];

// The three top-level pills on every game page: Аккаунт / Цэнэглэлт / Түрээс.
// Compact, content-width, centered pill group (not a full-width flex-1 bar)
// so it stays small like the reference design. The active pill's gradient
// background is one shared `layoutId` element — Framer Motion slides it
// from tab to tab with underdamped spring physics (stiffness 300 / damping
// 25) so it overshoots slightly and settles like a soft rubber band,
// instead of a stiff, critically-damped snap.
const PILL_SPRING = { type: 'spring', stiffness: 300, damping: 25 };

export default function CategoryTabs({ active, onChange }) {
  return (
    <div className="mx-auto flex w-fit items-center gap-1 overflow-x-auto scrollbar-none rounded-2xl bg-base-800/70 p-1 backdrop-blur-sm">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`relative whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ease-smooth ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="category-tab-pill"
                transition={PILL_SPRING}
                className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
              />
            )}
            <span className="relative z-10">{CATEGORY_LABELS[cat]}</span>
          </button>
        );
      })}
    </div>
  );
}
