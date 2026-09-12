import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useProductModal } from '../../context/ProductModalContext';
import { formatMNT } from '../../utils/format';
import { FACEBOOK_PAGE_URL } from '../../config/site';

/**
 * Sticky top bar. Per the reference design the header carries only the
 * logo on the left and three icons on the right — Facebook, saved
 * ("хадгалсан") accounts, and a day/night toggle. Game browsing
 * (PUBG/MLBB/...) now lives as filter chips in the page body
 * (GameFilterTabs) instead of header nav links.
 */
export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const { openProduct } = useProductModal();
  const [savedOpen, setSavedOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSavedOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-base-700 bg-base-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-logo-gradient text-lg font-extrabold text-white shadow-glow transition-transform duration-300 ease-smooth animate-glow-pulse group-hover:scale-105">
            B
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink transition-colors duration-300 ease-smooth sm:text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-brand-gradient">
              Badrakh Gamestore
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent-green">
              Verified Store
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook хуудас"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-base-500 bg-base-800 text-gray-300 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-to hover:text-ink hover:shadow-glow active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
            </svg>
          </a>

          {/* Saved / хадгалсан аккаунтууд */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSavedOpen((v) => !v)}
              aria-label="Хадгалсан бараа"
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border bg-base-800 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 ${
                favorites.length ? 'border-accent-pink text-accent-pink' : 'border-base-500 text-gray-300 hover:border-brand-to hover:text-ink'
              }`}
            >
              <svg viewBox="0 0 24 24" fill={favorites.length ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M12 21s-7-4.6-9.5-8.8C.6 8.8 2 5 5.6 4.3 8 3.8 10 5 12 7c2-2 4-3.2 6.4-2.7C22 5 23.4 8.8 21.5 12.2 19 16.4 12 21 12 21z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] animate-pop-in items-center justify-center rounded-full bg-accent-pink px-1 text-[9px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </button>

            <div
              className={`absolute right-0 top-11 w-64 origin-top-right rounded-2xl border border-base-600 bg-base-800 p-2 shadow-card transition-all duration-300 ease-smooth ${
                savedOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Хадгалсан бараа
              </p>
              {favorites.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-gray-500">Одоогоор хоосон байна</p>
              ) : (
                <div className="max-h-64 space-y-0.5 overflow-y-auto">
                  {favorites.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        openProduct(f.id);
                        setSavedOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors duration-300 ease-smooth hover:bg-base-700"
                    >
                      <img src={f.image} alt="" className="h-8 w-8 rounded-lg bg-base-700 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-ink">{f.title}</p>
                        <p className="text-[11px] text-brand-to">{formatMNT(f.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Day / night toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Өдөр/шөнийн горим сэлгэх"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-base-500 bg-base-800 text-gray-300 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-to hover:text-ink hover:shadow-glow active:translate-y-0"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <circle cx="12" cy="12" r="4.2" />
                <path
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
