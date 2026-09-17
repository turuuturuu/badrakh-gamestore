import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import settingsService from '../../api/settingsService';

// Sits inside the hero, right under the heading — a small "Админтай шууд
// холбогдох" label plus a static vertical list of chat chips for the
// admins registered in Admin Panel → Settings. The chat-bubble icon +
// label make it obvious at a glance that tapping a row opens a direct
// chat with that admin, rather than reading as a plain name tag. Renders
// nothing until at least one admin profile exists, so there's never an
// empty row.
function AdminChip({ name, profileUrl }) {
  return (
    <motion.a
      href={profileUrl}
      target="_blank"
      rel="noreferrer"
      whileHover={{ x: 2, borderColor: '#3b82f6' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      // A springy, tactile press: scales down further than a typical
      // hover-lift button and flashes brand-blue (border + tint + glow)
      // for an instant so tapping genuinely feels "pressed" rather than
      // just a flat opacity change.
      whileTap={{
        scale: 0.96,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.45)',
        transition: { type: 'spring', stiffness: 500, damping: 18 },
      }}
      className="flex w-full shrink-0 items-center gap-1.5 rounded-full border border-base-500 bg-base-950/40 px-3.5 py-1.5 text-xs font-semibold text-gray-200 backdrop-blur-sm transition-colors duration-300 ease-smooth hover:text-ink sm:text-sm"
    >
      <motion.span
        aria-hidden
        className="relative flex shrink-0 text-brand-to"
        whileTap={{ scale: 1.2, rotate: -8 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
        {/* Messenger-style "online" dot — signals this admin is reachable
            right now, not just a static contact link. */}
        <span className="absolute -right-px -top-px h-1.5 w-1.5 rounded-full bg-accent-green ring-2 ring-base-950" />
      </motion.span>
      <span className="truncate">{name}</span>
    </motion.a>
  );
}

export default function AdminStrip() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    settingsService
      .listAdminProfiles()
      .then(setAdmins)
      .catch(() => {});
  }, []);

  if (!admins.length) return null;

  return (
    <div className="mx-auto mt-4 flex w-full max-w-[15rem] flex-col items-center gap-2 sm:max-w-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Админтай шууд холбогдох</p>
      <div className="flex w-full flex-col items-stretch gap-2">
        {admins.map((admin) => (
          <AdminChip key={admin.id} name={admin.name} profileUrl={admin.profile_url} />
        ))}
      </div>
    </div>
  );
}
