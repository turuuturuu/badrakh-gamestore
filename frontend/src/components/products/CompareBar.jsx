import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import CompareModal from './CompareModal';
import { EASE_SMOOTH } from '../../utils/motion';

const PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%230f1420"/%3E%3C/svg%3E';

// Persistent floating bar that appears once the buyer has added at least
// one product to compare (via the icon in ProductModal). Lives at the app
// layout level so it survives navigating between "/" and "/:game".
export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: EASE_SMOOTH }}
            className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-3 sm:px-6"
          >
            <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-base-800/90 p-2.5 shadow-glass backdrop-blur-xl">
              <div className="flex flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none">
                <AnimatePresence initial={false}>
                  {compareList.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                      className="relative shrink-0"
                    >
                      <img
                        src={p.image || PLACEHOLDER}
                        alt={p.title}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-base-600"
                      />
                      <motion.button
                        onClick={() => removeFromCompare(p.id)}
                        aria-label="Устгах"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-white"
                      >
                        <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={clearCompare}
                whileHover={{ color: '#ff4d4f' }}
                className="hidden shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-400 sm:block"
              >
                Цэвэрлэх
              </motion.button>
              <motion.button
                onClick={() => setOpen(true)}
                whileHover={{ y: -2, boxShadow: '0 0 40px 4px rgba(99, 102, 241, 0.45)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                className="shrink-0 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                Харьцуулах ({compareList.length})
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && compareList.length > 0 && <CompareModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
