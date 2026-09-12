# Badrakh Gamestore — PUBG / MLBB Marketplace

Production-ready gaming marketplace: game accounts, top-ups (UC / Diamond), and rentals
for PUBG Mobile and MLBB. Dark, gradient "gaming" UI, mobile-first.

## Stack

| Layer     | Choice                                            |
|-----------|----------------------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS + React Router      |
| Backend   | Node.js + Express.js (modular routes/controllers) |
| Database  | PostgreSQL                                         |
| Images    | Cloudinary (URL stored in DB, upload via Multer)   |
| Auth      | JWT (admin only — buyers need no account)          |

## Folder structure

```
pubg-mlbb-marketplace/
├── backend/
│   ├── src/
│   │   ├── server.js              # entrypoint (loads env, starts http server)
│   │   ├── app.js                 # express app, middleware, route mounting
│   │   ├── config/
│   │   │   ├── db.js              # pg Pool
│   │   │   └── cloudinary.js      # cloudinary SDK config
│   │   ├── db/
│   │   │   ├── schema.sql         # full relational schema
│   │   │   └── seed.sql           # sample data (matches the reference UI)
│   │   ├── middleware/
│   │   │   ├── auth.js            # requireAdmin JWT guard
│   │   │   ├── upload.js          # multer -> cloudinary streaming upload
│   │   │   └── errorHandler.js    # centralized error handler
│   │   ├── modules/
│   │   │   ├── products/          # public + admin product endpoints
│   │   │   ├── admin/             # admin login/auth
│   │   │   └── stats/             # dashboard statistics
│   │   └── utils/
│   │       ├── asyncHandler.js
│   │       └── ApiResponse.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                   # axios client + service wrappers per resource
    │   ├── context/
    │   │   ├── AdminAuthContext.jsx    # admin JWT session
    │   │   ├── ThemeContext.jsx        # day/night toggle (header moon icon)
    │   │   ├── FavoritesContext.jsx    # buyer "saved" list (header heart icon)
    │   │   └── ToastContext.jsx        # bottom-of-screen notifications
    │   ├── components/
    │   │   ├── layout/            # Navbar (logo + FB/saved/theme icons), Footer
    │   │   ├── common/            # Badge, Loader, GradientButton, TrustMarquee
    │   │   ├── products/          # ProductCard, ProductGrid, SearchBar, GameFilterTabs,
    │   │   │                      # CategoryTabs, SellerTypeTabs, ProductModal
    │   │   └── admin/             # StatCard, ProductForm, ProductsTable, ProtectedRoute
    │   ├── pages/                 # Storefront ("/" and "/:game"), admin/*
    │   ├── hooks/useProducts.js
    │   └── utils/format.js
    ├── package.json
    ├── tailwind.config.js
    └── .env.example
```

## Why this structure

- **Modular backend** — each domain (`products`, `admin`, `stats`) owns its
  routes/controller/model, so a new developer can add a new domain by copying a folder
  without touching unrelated code.
- **Thin routes, fat controllers, isolated SQL** — routes only wire HTTP verbs to
  controller functions; controllers hold request/response + validation logic; `*.model.js`
  files are the only place raw SQL lives, so the query layer can be swapped (e.g. to an ORM)
  without touching controllers.
- **Frontend split by responsibility, not by page** — `components/products` is reused on
  both the public catalog and (partially) the admin table; `api/` centralizes all HTTP calls
  so components never call `axios` directly.

## Getting started

### 1. Database

```bash
createdb badrakh_gamestore
psql badrakh_gamestore -f backend/src/db/schema.sql
psql badrakh_gamestore -f backend/src/db/seed.sql   # optional sample data
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_*
npm install
npm run dev                # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

### 4. Admin access

`schema.sql` does **not** seed an admin row — a bcrypt hash is salted and different
every time it's generated, so there's no trustworthy way to hand-write one into a SQL
file. Create the first admin with the project's own hashing dependency instead:

```bash
cd backend
npm run create-admin                        # username: admin, password: admin123
npm run create-admin -- myname myPassword1  # or a custom username/password
```

Re-running `create-admin` for the same username also works as a password reset. Admin
panel lives at `/admin/login` (no link from the public site — "hidden URL" per spec).

## Filtering logic (core requirement)

The whole storefront is one page (`pages/Storefront.jsx`, mounted at both `/` and
`/:game` for deep links). It stacks four independent filters, top to bottom:

1. **GameFilterTabs** — Бүгд / PUBG Mobile / MLBB / Бусад (`game` — replaces what used
   to be separate header nav links; game selection is now a body filter, not a route change)
2. **CategoryTabs** — Аккаунт / Цэнэглэлт / Түрээс (`category` → `account` / `topup` / `rental`)
3. **SellerTypeTabs** — the required admin/user sub-filter:
   - **Бүгд (All)** — no `seller_type` filter
   - **Admin Accounts** — `seller_type = 'admin'`
   - **User Accounts** — `seller_type = 'user'`
4. **SearchBar** — free-text title match + price sort, applied client-side over the
   already-fetched slice (no dedicated search endpoint needed at this scale)

The first three are plain query params on `GET /api/products`
(`?game=pubg&category=account&seller_type=admin`), resolved server-side in
`product.model.js` with parameterized SQL — never string-concatenated.

## Header, theme & favorites (design pass)

- **Navbar** carries only the logo/verified badge (left) and three icons (right):
  Facebook page link, a "хадгалсан" (saved) heart with a live count + dropdown, and a
  day/night toggle — no PUBG/MLBB links, per the reference design.
- **`TrustMarquee`** renders the 🔔24/7 / 🤝Найдвартай наймаа / 👍10K+ / ✅Verified /
  ⚡Шуурхай badges as a seamless, infinitely left-scrolling strip (pure CSS animation,
  pauses on hover, respects `prefers-reduced-motion`) instead of a static row.
- **`ThemeContext`** toggles `data-theme` on `<html>` (persisted to localStorage); the
  light palette is implemented in `index.css` as global overrides of the dark utility
  classes, so the toggle works across the whole app without hand-editing every
  component's Tailwind classes.
- **`FavoritesContext`** + **`ToastContext`** back the heart button on every
  `ProductCard` and in the header — no backend endpoint, since buyers never register;
  it's plain localStorage with a toast confirmation on add/remove.
