// Light/dark toggle for the storefront header + hero (the "moon icon" in
// the top-right of the reference design). Persists to localStorage and
// stamps `data-theme` on <html> so CSS in index.css can key off it.
//
// NOTE: today the light palette is wired up for the public storefront
// shell (Navbar + hero/marquee/search area in index.css's [data-theme]
// overrides). Deeper pages (admin panel) are intentionally left dark-only
// for now — extending the token overrides there is a follow-up, not a bug.
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('badrakh_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('badrakh_theme', theme);
    } catch {
      // ignore (private browsing / storage disabled)
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
