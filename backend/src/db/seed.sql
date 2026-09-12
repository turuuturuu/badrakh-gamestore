-- =====================================================================
-- Sample data — mirrors the reference UI (PUBG ready accounts, UC
-- top-up, hourly rental) so the frontend has something to render out
-- of the box. Safe to run multiple times (guards on title+game).
-- =====================================================================

-- --- PUBG ready accounts (admin-owned, "HOT") -------------------------
INSERT INTO products (game_id, category, seller_type, title, description, price, status, is_hot, collection_count, bind_info, contact_messenger, contact_telegram)
SELECT g.id, 'account', 'admin', 'PUBG Mobile — Бэлэн аккаунт (Pro Collector)',
       'Retina, Glacier зэрэг rare skin-үүдтэй бэлэн аккаунт.', 4000000, 'available', true, 78, 'elink numb',
       'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
FROM games g WHERE g.slug = 'pubg'
ON CONFLICT DO NOTHING;

INSERT INTO products (game_id, category, seller_type, title, description, price, status, is_hot, collection_count, bind_info, contact_messenger, contact_telegram)
SELECT g.id, 'account', 'admin', 'PUBG Mobile — Бэлэн аккаунт (Mythic Set)',
       'Олон tier-ийн mythic outfit болон машинтай.', 3200000, 'available', true, 64, 'facebook',
       'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
FROM games g WHERE g.slug = 'pubg'
ON CONFLICT DO NOTHING;

INSERT INTO products (game_id, category, seller_type, title, description, price, status, is_hot, collection_count, bind_info, contact_messenger, contact_telegram)
SELECT g.id, 'account', 'user', 'PUBG Mobile — Хэрэглэгчийн аккаунт',
       'Хэрэглэгчээс шууд зарж буй аккаунт.', 900000, 'available', false, 22, 'twitter',
       'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
FROM games g WHERE g.slug = 'pubg'
ON CONFLICT DO NOTHING;

-- --- PUBG UC top-up (single product + package variants) --------------
WITH new_product AS (
  INSERT INTO products (game_id, category, seller_type, title, description, price, status, contact_messenger, contact_telegram)
  SELECT g.id, 'topup', 'admin', 'PUBG Mobile — UC цэнэглэлт', 'Тоглоомын дансанд шууд UC цэнэглэнэ.', 2500, 'available',
         'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
  FROM games g WHERE g.slug = 'pubg'
  RETURNING id
)
INSERT INTO product_variants (product_id, label, price, sort_order)
SELECT id, v.label, v.price, v.sort_order FROM new_product,
  (VALUES ('60 UC', 2500, 1), ('325 UC', 12000, 2), ('660 UC', 23000, 3), ('1800 UC', 58000, 4)) AS v(label, price, sort_order);

-- --- PUBG hourly rental (single product + duration variants) ---------
WITH new_product AS (
  INSERT INTO products (game_id, category, seller_type, title, description, price, status, contact_messenger, contact_telegram)
  SELECT g.id, 'rental', 'admin', 'PUBG Mobile — Түрээс', 'Rare skin-тэй аккаунтыг цагаар түрээслэнэ.', 2500, 'available',
         'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
  FROM games g WHERE g.slug = 'pubg'
  RETURNING id
)
INSERT INTO product_variants (product_id, label, price, duration_hours, sort_order)
SELECT id, v.label, v.price, v.hours, v.sort_order FROM new_product,
  (VALUES ('1 цаг', 2500, 1, 1), ('12 цаг', 12000, 12, 2), ('24 цаг', 20000, 24, 3)) AS v(label, price, hours, sort_order);

-- --- MLBB sample account + diamond top-up -----------------------------
INSERT INTO products (game_id, category, seller_type, title, description, price, status, is_hot, collection_count, bind_info, contact_messenger, contact_telegram)
SELECT g.id, 'account', 'admin', 'MLBB — Бэлэн аккаунт (Mythic Glory)',
       'Mythic rank, олон skin-тэй.', 1500000, 'available', true, 45, 'moonton',
       'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
FROM games g WHERE g.slug = 'mlbb'
ON CONFLICT DO NOTHING;

WITH new_product AS (
  INSERT INTO products (game_id, category, seller_type, title, description, price, status, contact_messenger, contact_telegram)
  SELECT g.id, 'topup', 'admin', 'MLBB — Diamond цэнэглэлт', 'Тоглоомын дансанд шууд Diamond цэнэглэнэ.', 3000, 'available',
         'https://m.me/badrakhgamestore', 'https://t.me/badrakhgamestore'
  FROM games g WHERE g.slug = 'mlbb'
  RETURNING id
)
INSERT INTO product_variants (product_id, label, price, sort_order)
SELECT id, v.label, v.price, v.sort_order FROM new_product,
  (VALUES ('86 Diamond', 3000, 1), ('172 Diamond', 6000, 2), ('706 Diamond', 24000, 3)) AS v(label, price, sort_order);
