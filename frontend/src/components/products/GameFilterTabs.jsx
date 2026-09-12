import { motion } from 'framer-motion';
import { Gamepad2, Crosshair, Swords, Bomb } from 'lucide-react';

// The "Бүгд / PUBG Mobile / MLBB / CS2" row from the reference design.
// This used to live as separate /pubg and /mlbb nav links in the header —
// per feedback it's now a filter chip row in the main content area
// instead, and the header only carries the logo + account/theme icons.
const OPTIONS = [
  { value: undefined, label: 'Бүгд', icon: Gamepad2 },
  { value: 'pubg', label: 'PUBG Mobile', icon: Crosshair },
  { value: 'mlbb', label: 'MLBB', icon: Swords },
  { value: 'cs2', label: 'CS2', icon: Bomb },
];

export default function GameFilterTabs({ value, onChange }) {
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
            {/* Active background lives on its own layer so switching tabs
                cross-fades (old tab fades out, new tab fades in) instead of
                the gradient snapping between buttons. */}
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
