// Shared Framer Motion easing/variants so every dialog (ProductModal,
// CompareModal) opens/closes with the same soft, Apple-style feel instead
// of each component hand-rolling its own timing.
export const EASE_SMOOTH = [0.22, 1, 0.36, 1];

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: EASE_SMOOTH } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: EASE_SMOOTH } },
};

export const modalPanelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE_SMOOTH } },
  exit: { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.22, ease: EASE_SMOOTH } },
};
