import { useEffect, useState } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import Loader from '../../components/common/Loader';
import adminService from '../../api/adminService';
import { CATEGORY_LABELS, GAME_LABELS } from '../../utils/format';

// Top-level stats: total products, sold, active, admin vs user
// breakdown — exactly what the spec's "clean top-level stats" asks for.
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-base-950">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 text-xl font-extrabold text-white">Хяналтын самбар</h1>

        {error && <p className="text-sm text-accent-red">{error}</p>}
        {!stats && !error && <Loader />}

        {stats && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Нийт бараа" value={stats.totals.total} />
              <StatCard label="Идэвхтэй" value={stats.totals.active} accent="text-accent-green" />
              <StatCard label="Зарагдсан" value={stats.totals.sold} accent="text-accent-red" />
              <StatCard label="Хэрэглэгчийн" value={stats.totals.userListings} accent="text-brand-to" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-base-700 p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-300">Тоглоомоор</h2>
                <div className="space-y-2">
                  {stats.byGame.map((row) => (
                    <div key={row.game} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{GAME_LABELS[row.game] || row.game}</span>
                      <span className="font-semibold text-white">{row.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-base-700 p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-300">Ангилал × Seller type</h2>
                <div className="space-y-2">
                  {stats.breakdown.map((row) => (
                    <div key={`${row.category}-${row.sellerType}`} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {CATEGORY_LABELS[row.category]} · {row.sellerType}
                      </span>
                      <span className="font-semibold text-white">{row.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
