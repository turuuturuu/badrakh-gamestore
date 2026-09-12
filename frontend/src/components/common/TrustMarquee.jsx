import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Users, BadgeCheck, Zap } from 'lucide-react';

// The "24/7  Найдвартай наймаа  10K+ Үйлчлүүлэгч  Verified Page  Шуурхай
// үйлчилгээ" strip from the reference design, animated: an infinite
// left-scrolling marquee instead of a static row. The track renders the
// item list TWICE back-to-back and the CSS animation translates exactly
// -50%, so the loop has no seam. Pauses on hover/focus so the text stays
// readable if someone wants to actually read one item.
const ITEMS = [
  { icon: Clock, label: '24/7' },
  { icon: ShieldCheck, label: 'Найдвартай наймаа' },
  { icon: Users, label: '10K+ Үйлчлүүлэгч' },
  { icon: BadgeCheck, label: 'Verified Page' },
  { icon: Zap, label: 'Шуурхай үйлчилгээ' },
];

function TrustItem({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-semibold text-gray-400 sm:text-sm">
      <motion.span
        aria-hidden
        className="flex text-brand-to"
        whileHover={{ scale: 1.2, rotate: 8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
      </motion.span>
      {label}
    </span>
  );
}

export default function TrustMarquee() {
  return (
    <div
      className="group relative mt-4 overflow-hidden"
      style={{ maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}
    >
      <div className="flex w-max animate-marquee-left gap-2 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <TrustItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
