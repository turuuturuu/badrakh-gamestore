// Small badge used for "HOT", game tags, status chips (admin table) and
// seller-type chips (admin table). Every variant is a minimal pill —
// Apple-style: one flat tint, no heavy borders, just enough ring to
// separate it from whatever sits behind it.
export default function Badge({ children, variant = 'default', className = '' }) {
  const base = 'inline-flex items-center gap-1 rounded-full text-[11px] font-semibold uppercase tracking-wide';

  const variants = {
    default: 'px-2.5 py-1 bg-base-600/80 text-gray-200 ring-1 ring-inset ring-white/5',
    success: 'px-2.5 py-1 bg-accent-green/15 text-accent-green ring-1 ring-inset ring-accent-green/20',
    danger: 'px-2.5 py-1 bg-accent-red/15 text-accent-red ring-1 ring-inset ring-accent-red/20',
    brand: 'px-2.5 py-1 bg-brand-gradient text-white',
    // Red→pink gradient, soft glow — the card's HOT tag.
    hot: 'px-2.5 py-1 bg-gradient-to-r from-accent-red to-accent-pink text-white shadow-glow-hot ring-1 ring-white/20',
    // Dark glassmorphism — the card's game-name tag.
    game: 'px-2.5 py-1 bg-black/50 text-white ring-1 ring-white/15 backdrop-blur-md shadow-glass',
  };

  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}
