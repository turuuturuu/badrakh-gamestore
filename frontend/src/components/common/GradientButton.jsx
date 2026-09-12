import { motion } from 'framer-motion';
import { EASE_SMOOTH } from '../../utils/motion';

// The single shared "primary action" button style (buy / rent / submit),
// so the same gradient + hover/press state is used everywhere instead of
// each page hand-rolling its own button classes. Framer Motion drives the
// hover lift + glow instead of Tailwind's :hover so it stays perfectly
// smooth even when the button is also mid-transition (e.g. right after a
// click triggers a re-render).
const MOTION_TAGS = { button: motion.button, a: motion.a };

export default function GradientButton({
  children,
  as = 'button',
  className = '',
  variant = 'solid',
  ...props
}) {
  const MotionTag = MOTION_TAGS[as] || motion.button;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    solid: 'bg-brand-gradient text-white',
    outline: 'border border-base-500 text-gray-200',
    ghost: 'text-gray-300',
  };

  const hoverByVariant = {
    solid: { y: -2, boxShadow: '0 0 40px 4px rgba(99, 102, 241, 0.45)', filter: 'brightness(1.1)' },
    outline: { y: -2, borderColor: '#3b82f6', color: '#ffffff', boxShadow: '0 0 24px 0 rgba(99, 102, 241, 0.35)' },
    ghost: { backgroundColor: '#151b2a' },
  };

  return (
    <MotionTag
      whileHover={props.disabled ? undefined : hoverByVariant[variant]}
      whileTap={props.disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.3, ease: EASE_SMOOTH }}
      className={`${base} ${variants[variant]} ${variant === 'solid' ? 'shadow-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
