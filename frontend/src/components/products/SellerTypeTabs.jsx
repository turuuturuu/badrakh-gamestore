// The crucial sub-filter required by the spec: All / Admin Accounts / User
// Accounts. `value` is one of undefined (= all), 'admin', 'user'.
const OPTIONS = [
  { value: undefined, label: 'Бүгд' },
  { value: 'admin', label: 'Admin Accounts' },
  { value: 'user', label: 'Account Post' },
];

// `disabled` — the Admin/User split only means anything for "account"
// listings (topup/rental are always store-fulfilled), so the parent
// dims and locks this row whenever the topup/rental category tab is
// active instead of leaving a filter visible that can never do anything.
export default function SellerTypeTabs({ value, onChange, disabled = false }) {
  return (
    <div className={`flex flex-wrap gap-2 transition-opacity duration-300 ease-smooth ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-smooth ${
              isActive
                ? 'border-transparent bg-base-600 text-ink'
                : 'border-base-500 text-gray-400 hover:border-brand-to hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
