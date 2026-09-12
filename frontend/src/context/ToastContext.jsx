// Tiny toast/notification system — used for "saved to favorites",
// "removed", copy-link confirmations, etc. One <Toast/> is mounted once
// near the root; any component calls `useToast().show(message)`.
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Check } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { id, message }
  const timerRef = useRef(null);

  const show = useCallback((message) => {
    const id = Date.now();
    setToast({ id, message });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 1800);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {toast && (
          <div className="flex items-center gap-2 rounded-full bg-base-700 px-5 py-2.5 text-sm font-semibold text-ink shadow-card ring-1 ring-base-500">
            <Check className="h-4 w-4 shrink-0 text-accent-green" strokeWidth={2.5} />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
