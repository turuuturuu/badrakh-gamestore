import { motion } from 'framer-motion';
import { LayoutGrid, Slice, Target, User } from 'lucide-react';
import { CS2_ITEM_TYPE_LABELS } from '../../utils/format';

// Replaces CategoryTabs (Аккаунт/Цэнэглэлт/Түрээс) + SellerTypeTabs when
// the CS2 game filter is active — CS2 listings are grouped by item type
// instead of by account/topup/rental, so the same row of the layout gets
// a completely different filter set (see Storefront.jsx's AnimatePresence
// swap between the two filter blocks).
const OPTIONS = [
  { value: undefined, label: 'Бүгд', icon: LayoutGrid },
  { value: 'knife_glove', label: CS2_ITEM_TYPE_LABELS.knife_glove, icon: Slice },
  { value: 'rifle_pistol', label: CS2_ITEM_TYPE_LABELS.rifle_pistol, icon: Target },
  { value: 'agent_other', label: CS2_ITEM_TYPE_LABELS.agent_other, icon: User },
];

export default function CS2FilterTabs({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.value)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ease-smooth outline-none focus-visible:ring-2 focus-visible:ring-brand-to/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-900 ${
              isActive
                ? 'border-transparent text-white'
                : 'border-base-500 text-gray-400 hover:-translate-y-0.5 hover:border-brand-to hover:text-ink hover:shadow-glow'
            }`}
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="relative z-10 flex items-center gap-1.5">
              <motion.span
                aria-hidden
                className="flex"
                whileHover={{ rotate: 14, scale: 1.15 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </motion.span>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
