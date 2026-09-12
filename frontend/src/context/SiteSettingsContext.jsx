// Holds the two admin-managed site images (page background + Hero
// banner) fetched once on mount, and — for the background image only —
// applies the actual visual effect itself by toggling a class + CSS
// variable on <html> (see index.css's `.has-bg-image` rule). Storefront
// reads `hero_image_url` directly to decide the Hero section's own
// background, since that one has to live inside a specific component's
// markup rather than as a body-level effect.
//
// Both fields stay null until the fetch resolves (or forever, if no
// admin image was ever set) — every consumer treats null as "use the
// existing built-in ambient glow / glassmorphism styling", so there is
// no separate loading state to plumb through: the fallback IS the
// initial state.
import { createContext, useContext, useEffect, useState } from 'react';
import settingsService from '../api/settingsService';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({ background_image_url: null, hero_image_url: null });

  useEffect(() => {
    settingsService.getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const url = settings.background_image_url;
    if (url) {
      root.style.setProperty('--site-bg-image', `url("${url}")`);
      root.classList.add('has-bg-image');
    } else {
      root.classList.remove('has-bg-image');
      root.style.removeProperty('--site-bg-image');
    }
  }, [settings.background_image_url]);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
