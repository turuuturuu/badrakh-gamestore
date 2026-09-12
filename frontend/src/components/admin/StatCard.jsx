export default function StatCard({ label, value, accent = 'text-white' }) {
  return (
    <div className="rounded-2xl bg-base-700 p-4 ring-1 ring-base-600">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}
