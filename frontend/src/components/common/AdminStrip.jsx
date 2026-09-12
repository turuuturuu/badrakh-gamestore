import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import settingsService from '../../api/settingsService';

// Sits above the search bar, right under the hero heading: a static,
// centered row of pill chips for the admin names registered in
// Admin Panel → Settings — no other text, no scrolling. Renders nothing
// until at least one admin profile exists, so there's never an empty row.
function AdminChip({ name, profileUrl }) {
  return (
    <motion.a
      href={profileUrl}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -1, borderColor: '#3b82f6' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-1.5 rounded-full border border-base-500 px-3.5 py-1.5 text-xs font-semibold text-gray-300 transition-colors duration-300 ease-smooth hover:text-ink sm:text-sm"
    >
      <span className="flex text-brand-to">
        <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
      </span>
      {name}
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
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      {admins.map((admin) => (
        <AdminChip key={admin.id} name={admin.name} profileUrl={admin.profile_url} />
      ))}
    </div>
  );
}
