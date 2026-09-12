export default function Loader({ label = 'Ачааллаж байна...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-base-500 border-t-brand-to" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
