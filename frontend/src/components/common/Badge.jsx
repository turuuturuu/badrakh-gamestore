// Small badge used for "HOT", game tags, status chips (admin table) and
// seller-type chips (admin table). Every variant is a minimal pill —
// Apple-style: one flat tint, no heavy borders, just enough ring to
// separate it from whatever sits behind it.
export default function Badge({ children, variant = 'default', className = '' }) {
  // No shared text size here — hot/game need to run smaller than the rest
  // (see below) and mixing same-specificity text-[Npx] utilities across a
  // shared base + per-variant string is exactly the kind of "which one
  // wins" ambiguity that isn't worth relying on, so every variant just
  // states its own size once.
  const base = 'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide';

  const variants = {
    default: 'px-2.5 py-1 text-[11px] bg-base-600/80 text-gray-200 ring-1 ring-inset ring-white/5',
    success: 'px-2.5 py-1 text-[11px] bg-accent-green/15 text-accent-green ring-1 ring-inset ring-accent-green/20',
    danger: 'px-2.5 py-1 text-[11px] bg-accent-red/15 text-accent-red ring-1 ring-inset ring-accent-red/20',
    brand: 'px-2.5 py-1 text-[11px] bg-brand-gradient text-white',
    // Red→pink gradient, soft glow — the card's HOT tag. Deliberately
    // smaller than the variants above: it shares the top corner of a
    // ProductCard with the game-name tag, and on a narrow 2-per-row
    // mobile card the two at full badge size collide.
    hot: 'px-2 py-0.5 text-[10px] bg-gradient-to-r from-accent-red to-accent-pink text-white shadow-glow-hot ring-1 ring-white/20',
    // Dark glassmorphism — the card's game-name tag. Same sizing as `hot`
    // for the reason above.
    game: 'px-2 py-0.5 text-[10px] bg-black/50 text-white ring-1 ring-white/15 backdrop-blur-md shadow-glass',
  };

  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}
