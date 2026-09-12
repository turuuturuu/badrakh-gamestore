import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// The search + sort row from the reference design: a text field for
// "Аккаунт, скин, тоглоом хайх..." plus a price-sort toggle button.
// Fully controlled — the parent owns `query` and `sortDesc` so it can
// combine them with the game/category/seller filters in one place.
export default function SearchBar({ query, onQueryChange, sortDesc, onToggleSort }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex gap-2 sm:gap-3">
      <motion.div
        animate={{
          scale: focused ? 1.015 : 1,
          boxShadow: focused
            ? '0 0 18px 1px rgba(99, 102, 241, 0.4)'
            : '0 0 0px 0px rgba(99, 102, 241, 0)',
        }}
        whileHover={
          !focused ? { boxShadow: '0 0 12px 0px rgba(99, 102, 241, 0.2)' } : undefined
        }
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-1 items-center gap-2.5 rounded-2xl border bg-base-800 px-3.5 transition-colors duration-300 ease-smooth ${
          focused ? 'border-brand-to' : 'border-base-500 hover:border-base-400'
        }`}
      >
        <motion.span
          className="flex text-gray-500"
          animate={
            focused
              ? { scale: [1, 1.22, 1], rotate: [0, -12, 10, 0], color: '#a5b4fc' }
              : { scale: [1, 1.08, 1], rotate: 0, color: '#6b7280' }
          }
          transition={
            focused
              ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
              : { duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }
          }
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </motion.span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Аккаунт, скин, тоглоом хайх..."
          className="h-12 w-full bg-transparent text-sm text-ink placeholder-gray-500 outline-none"
        />
      </motion.div>
      <button
        onClick={onToggleSort}
        className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl border border-base-500 bg-base-800 px-4 text-sm font-semibold text-gray-300 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-to hover:text-ink hover:shadow-glow"
      >
        Үнэ
        <span className={`inline-block transition-transform duration-200 ${sortDesc ? 'rotate-180' : ''}`}>⇅</span>
      </button>
    </div>
  );
}
