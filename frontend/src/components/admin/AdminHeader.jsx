import { Link, NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminHeader() {
  const { admin, logout } = useAdminAuth();

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ease-smooth ${
      isActive ? 'bg-base-700 text-white' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-base-700 bg-base-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/admin" className="text-sm font-bold text-white">
          Badrakh Admin
        </Link>
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            <NavLink to="/admin" end className={linkClass}>
              Хяналтын самбар
            </NavLink>
            <NavLink to="/admin/products" className={linkClass}>
              Бараа
            </NavLink>
            <NavLink to="/admin/settings" className={linkClass}>
              Тохиргоо
            </NavLink>
          </nav>

          {/* Account cluster — set apart from the nav links with a divider
              so the username reads as "who's logged in" instead of a
              stray, unlabeled bit of text sitting inline among the tabs. */}
          <div className="ml-2 flex items-center gap-2 border-l border-base-700 pl-3">
            {admin?.username && (
              <span className="hidden items-center gap-1.5 rounded-full border border-base-600 bg-base-800 py-1 pl-1 pr-2.5 text-xs font-medium text-gray-300 sm:flex">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold uppercase text-white">
                  {admin.username[0]}
                </span>
                {admin.username}
              </span>
            )}
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-accent-red transition-colors duration-300 ease-smooth hover:bg-accent-red/10"
            >
              Гарах
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
