/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // `base` and `ink` are CSS-variable-backed (defined in index.css,
        // redefined under [data-theme="light"]) instead of static hex, so
        // the light/dark toggle works correctly for EVERY Tailwind
        // opacity variant (bg-base-700/60, bg-base-800/90, ...) with no
        // per-shade override needed — the previous static-hex palette
        // required manually overriding each exact class in index.css,
        // which silently missed every opacity variant actually used in
        // the app (product cards, modals, toasts) and left them stuck
        // dark-on-light. See index.css for the actual color values.
        base: {
          950: 'rgb(var(--color-base-950) / <alpha-value>)', // page background
          900: 'rgb(var(--color-base-900) / <alpha-value>)',
          800: 'rgb(var(--color-base-800) / <alpha-value>)',
          700: 'rgb(var(--color-base-700) / <alpha-value>)', // card surface
          600: 'rgb(var(--color-base-600) / <alpha-value>)', // card surface, hover / raised
          500: 'rgb(var(--color-base-500) / <alpha-value>)', // borders / dividers
        },
        // Adaptive foreground text: white on the dark theme, near-black on
        // the light theme. Use this (never `text-white`) for text sitting
        // directly on one of the `base` surfaces above — headings, titles,
        // input text, hover states on neutral chips. Keep `text-white`
        // literal for text that sits on a permanently-colored/dark surface
        // regardless of theme (gradient buttons, badges, image overlays).
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        brand: {
          // violet -> blue gradient used for active tabs, price text, primary CTAs
          from: '#7c5cff',
          via: '#6366f1',
          to: '#3b82f6',
        },
        accent: {
          pink: '#ff3f8e', // logo mark / highlights
          green: '#22c55e', // verified / success
          red: '#ff4d4f', // HOT badge
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c5cff 0%, #6366f1 45%, #3b82f6 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(59,130,246,0.15) 100%)',
        'logo-gradient': 'linear-gradient(135deg, #ff3f8e 0%, #7c5cff 100%)',
      },
      boxShadow: {
        glow: '0 0 24px 0 rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 40px 4px rgba(99, 102, 241, 0.28)',
        'glow-pubg': '0 12px 36px -8px rgba(249, 115, 22, 0.45)',
        'glow-mlbb': '0 12px 36px -8px rgba(56, 189, 248, 0.45)',
        'glow-hot': '0 4px 16px -2px rgba(255, 63, 113, 0.55)',
        card: '0 4px 20px 0 rgba(0,0,0,0.35)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.28)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        // Apple/iOS-style soft ease used for hover + scroll-reveal motion
        // throughout the app instead of the default linear/ease curves.
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        // Infinite left-scrolling trust-badge strip. The track's content is
        // rendered twice back to back (see TrustMarquee.jsx) so translating
        // exactly -50% loops seamlessly with no visible seam or gap.
        'marquee-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Small entrance used by product cards / panels as they mount.
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Gentle fade-up used by the scroll-reveal wrapper (see
        // hooks/useReveal.js + components/common/Reveal.jsx).
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Soft alternating neon glow for the header logo mark.
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 16px 2px rgba(124, 92, 255, 0.55)' },
          '50%': { boxShadow: '0 0 22px 4px rgba(59, 130, 246, 0.55)' },
        },
      },
      animation: {
        'marquee-left': 'marquee-left 22s linear infinite',
        'rise-in': 'rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pop-in': 'pop-in 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
