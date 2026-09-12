-- =====================================================================
-- Badrakh Gamestore — relational schema
-- Run with: psql "$DATABASE_URL" -f schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid(), not strictly required but handy

-- ---------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('account', 'topup', 'rental');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('available', 'sold', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE seller_type AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CS2 skin condition + StatTrak/Souvenir classification (only meaningful
-- for products under the 'cs2' game — NULL/'none' for everything else).
DO $$ BEGIN
  CREATE TYPE cs2_wear_condition AS ENUM ('Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cs2_stattrak_type AS ENUM ('none', 'stattrak', 'souvenir');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CS2 storefront sub-nav grouping — powers the "Хутга & Бээлий / Буунууд /
-- Агент & Бусад" filter tabs that replace the account/topup/rental
-- category tabs when the CS2 game filter is active.
DO $$ BEGIN
  CREATE TYPE cs2_item_type AS ENUM ('knife_glove', 'rifle_pistol', 'agent_other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- games — the two supported titles. Kept as a table (not a hardcoded
-- enum) so a third game can be added later with zero migrations.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS games (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(32) UNIQUE NOT NULL,   -- 'pubg' | 'mlbb'
  name        VARCHAR(64) NOT NULL,          -- 'PUBG Mobile' | 'Mobile Legends: Bang Bang'
  icon_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- admins — the only authenticated users on the platform.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(64) UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- products — the single listing table for accounts, top-ups and
-- rentals. `category` decides which extra widgets the frontend shows
-- (collection/bind info for accounts, duration/package variants for
-- top-ups & rentals — see product_variants below).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                 SERIAL PRIMARY KEY,
  game_id            INTEGER NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  category           product_category NOT NULL,
  seller_type        seller_type NOT NULL DEFAULT 'admin',
  title              VARCHAR(160) NOT NULL,
  description        TEXT,
  price              NUMERIC(12, 2) NOT NULL DEFAULT 0,     -- base / "from" price
  status             product_status NOT NULL DEFAULT 'available',
  is_hot             BOOLEAN NOT NULL DEFAULT false,

  -- account-specific optional metadata (NULL for topup/rental rows)
  collection_count   INTEGER,        -- e.g. skin "Collection" count shown on the card
  bind_info          VARCHAR(64),    -- e.g. "elink numb" — what the account is bound to

  -- PUBG Mobile / MLBB account-specific optional metadata (NULL for every
  -- other game and for topup/rental rows). account_level is shared by
  -- both games; the rest are game-specific (see ProductForm's PUBG_FIELDS
  -- / MLBB_FIELDS split).
  account_level      INTEGER,        -- in-game account level, both games
  max_rank           VARCHAR(32),    -- PUBG only — "Ace", "Conqueror" ...
  royale_pass        VARCHAR(64),    -- PUBG only — Royale Pass status, free text
  max_emblem         VARCHAR(32),    -- MLBB only — "Mythic", "Legend V" ...
  skin_count         VARCHAR(120),   -- MLBB only — skin count and/or headline skins, free text

  -- CS2-specific optional metadata (NULL for every other game)
  weapon_name        VARCHAR(64),                          -- "AK-47", "AWP", "Karambit" ...
  skin_name          VARCHAR(64),                          -- "Asiimov", "Fade" ...
  wear_condition     cs2_wear_condition,                   -- Factory New ... Battle-Scarred
  float_value        NUMERIC(7, 6),                        -- e.g. 0.035000
  stattrak_type      cs2_stattrak_type NOT NULL DEFAULT 'none',
  cs2_item_type      cs2_item_type,                        -- knife_glove | rifle_pistol | agent_other

  -- buyer contact — buyers never register, they message the seller directly
  contact_messenger  TEXT,
  contact_telegram   TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ADD COLUMN IF NOT EXISTS guards so re-running this file against a
-- database created before the CS2 fields existed also picks them up
-- (the CREATE TABLE above only fires on a brand-new database).
ALTER TABLE products ADD COLUMN IF NOT EXISTS weapon_name    VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_name      VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS wear_condition cs2_wear_condition;
ALTER TABLE products ADD COLUMN IF NOT EXISTS float_value    NUMERIC(7, 6);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stattrak_type  cs2_stattrak_type NOT NULL DEFAULT 'none';
ALTER TABLE products ADD COLUMN IF NOT EXISTS cs2_item_type  cs2_item_type;
ALTER TABLE products ADD COLUMN IF NOT EXISTS account_level  INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_rank       VARCHAR(32);
ALTER TABLE products ADD COLUMN IF NOT EXISTS royale_pass    VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_emblem     VARCHAR(32);
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_count     VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_products_game_category ON products (game_id, category);
CREATE INDEX IF NOT EXISTS idx_products_seller_type   ON products (seller_type);
CREATE INDEX IF NOT EXISTS idx_products_status        ON products (status);

-- keep updated_at fresh on every UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- product_images — 1:N, Cloudinary URLs only (no binary in Postgres).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url    TEXT NOT NULL,
  public_id    TEXT,                 -- Cloudinary public_id, needed to delete the asset later
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id);

-- ---------------------------------------------------------------------
-- product_variants — priced sub-options for a product:
--   * rentals   -> "1 цаг / 12 цаг / 24 цаг" style duration tiers
--   * top-ups   -> "60 UC / 325 UC / ..." package tiers
-- Plain accounts simply have zero rows here and use products.price.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label          VARCHAR(64) NOT NULL,   -- "1 цаг", "12 цаг", "325 UC" ...
  price          NUMERIC(12, 2) NOT NULL,
  duration_hours INTEGER,                -- only meaningful for rentals
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants (product_id);

-- ---------------------------------------------------------------------
-- Seed the two games (idempotent)
-- ---------------------------------------------------------------------
INSERT INTO games (slug, name)
VALUES ('pubg', 'PUBG Mobile'), ('mlbb', 'Mobile Legends: Bang Bang'), ('cs2', 'Counter-Strike 2')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------
-- admin_profiles — Admin Panel → Settings. Each row is one admin's
-- display name + their own Facebook/Messenger profile link, used only to
-- feed the public hero marquee (see GET /api/settings/admin-profiles).
-- Unrelated to the `admins` login table above.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_profiles (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(80) NOT NULL,
  profile_url  TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_sort ON admin_profiles (sort_order);

-- ---------------------------------------------------------------------
-- site_settings — singleton row (id is always 1, enforced by the CHECK
-- below) holding the two admin-managed site images: the page-wide
-- background photo and the hero banner photo. Either can be NULL
-- ("no image set"), in which case the frontend falls back to its own
-- built-in ambient glow / glassmorphism styling — see index.css's
-- `.has-bg-image` rule and Storefront.jsx's hero section.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id                          SMALLINT PRIMARY KEY DEFAULT 1,
  background_image_url        TEXT,
  background_image_public_id  TEXT,
  hero_image_url              TEXT,
  hero_image_public_id        TEXT,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- faqs — Admin Panel → Settings → FAQ. Powers the "Түгээмэл асуултууд"
-- accordion above the storefront footer. Empty table -> the frontend
-- falls back to its own built-in default questions (see FaqAccordion.jsx)
-- rather than rendering nothing.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs (sort_order);

-- ---------------------------------------------------------------------
-- NOTE on the admin account: it is intentionally NOT seeded here.
--
-- A bcrypt hash is salted and different every time it's generated, so
-- there's no way to hand-write a "password: admin123" literal into this
-- file that can be eyeballed as correct — the only trustworthy way to
-- get one is to actually run bcrypt. Create the first admin with:
--
--   cd backend
--   npm run create-admin                       # admin / admin123
--   npm run create-admin -- myname myPassword1  # custom username/password
--
-- (see src/db/createAdmin.js — it hashes with the project's own
-- bcryptjs dependency and upserts the row, so re-running it also works
-- as a password reset).
-- ---------------------------------------------------------------------
