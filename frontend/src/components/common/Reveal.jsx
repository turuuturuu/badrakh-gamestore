import useReveal from '../../hooks/useReveal';

// Thin wrapper that fades + rises its children in once they scroll into
// view (see .reveal / .reveal-visible in index.css). `delay` (ms) lets
// sibling sections stagger slightly instead of all popping in at once.
export default function Reveal({ children, as: Component = 'div', className = '', delay = 0, style }) {
  const [ref, visible] = useReveal();
  const mergedStyle = delay || style ? { ...(delay ? { transitionDelay: `${delay}ms` } : null), ...style } : undefined;

  return (
    <Component
      ref={ref}
      style={mergedStyle}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
