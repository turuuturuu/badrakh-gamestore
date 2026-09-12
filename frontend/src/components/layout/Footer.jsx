import { FACEBOOK_PAGE_URL, OFFICIAL_MESSENGER_URL } from '../../config/site';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-base-700 bg-base-900/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
        <div className="flex gap-3">
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-base-700 text-gray-300 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-brand-gradient hover:text-white hover:shadow-glow"
            aria-label="Facebook"
          >
            f
          </a>
          <a
            href={OFFICIAL_MESSENGER_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-base-700 text-gray-300 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-brand-gradient hover:text-white hover:shadow-glow"
            aria-label="Messenger"
          >
            m
          </a>
        </div>
        <p className="text-sm font-semibold text-ink">
          Badrakh Gamestore — Баталгаат аккаунт, түрээс & цэнэглэлт
        </p>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Badrakh Gamestore. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
}
