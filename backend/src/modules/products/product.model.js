// All raw SQL for the `products` domain lives here and ONLY here.
// Controllers never write SQL directly — this keeps the query layer
// swappable and makes it obvious where to look when data looks wrong.
const { query, getClient } = require('../../config/db');

// Shared SELECT that folds images + variants into JSON arrays so the
// frontend gets one object per product instead of duplicated rows.
const BASE_SELECT = `
  SELECT
    p.id, p.category, p.seller_type, p.title, p.description, p.price,
    p.status, p.is_hot, p.collection_count, p.bind_info,
    p.account_level, p.max_rank, p.royale_pass, p.max_emblem, p.skin_count,
    p.weapon_name, p.skin_name, p.wear_condition, p.float_value, p.stattrak_type, p.cs2_item_type,
    p.contact_messenger, p.created_at, p.updated_at,
    g.id   AS game_id, g.slug AS game_slug, g.name AS game_name,
    COALESCE(img.images, '[]')     AS images,
    COALESCE(var.variants, '[]')   AS variants
  FROM products p
  JOIN games g ON g.id = p.game_id
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object('id', pi.id, 'url', pi.image_url) ORDER BY pi.sort_order) AS images
    FROM product_images pi WHERE pi.product_id = p.id
  ) img ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(
             json_build_object('id', pv.id, 'label', pv.label, 'price', pv.price, 'durationHours', pv.duration_hours)
             ORDER BY pv.sort_order
           ) AS variants
    FROM product_variants pv WHERE pv.product_id = p.id
  ) var ON true
`;

/**
 * List products with optional filters. This is what powers the public
 * catalog's game tabs + seller-type sub-tabs:
 *   GET /api/products?game=pubg&category=account&seller_type=admin
 */
async function findAll({ game, category, sellerType, status, cs2ItemType, excludeCs2 } = {}) {
  const clauses = [];
  const params = [];

  if (game) {
    params.push(game);
    clauses.push(`g.slug = $${params.length}`);
  }
  if (category) {
    params.push(category);
    clauses.push(`p.category = $${params.length}`);
  }
  if (sellerType) {
    params.push(sellerType);
    clauses.push(`p.seller_type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    clauses.push(`p.status = $${params.length}`);
  }
  // The storefront's account/topup/rental + seller-type tabs (Admin/User
  // Accounts) are PUBG/MLBB-only — CS2 skins also use category='account'
  // under the hood, so without this they'd leak into those tabs whenever
  // no specific `game` is picked ("Бүгд"). CS2 has its own filter row.
  if (excludeCs2) {
    clauses.push(`g.slug <> 'cs2'`);
  }
  if (cs2ItemType) {
    params.push(cs2ItemType);
    clauses.push(`p.cs2_item_type = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(`${BASE_SELECT} ${where} ORDER BY p.is_hot DESC, p.created_at DESC`, params);
  return rows;
}

async function findById(id) {
  const { rows } = await query(`${BASE_SELECT} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

async function findGameBySlug(slug) {
  const { rows } = await query('SELECT id, slug, name FROM games WHERE slug = $1', [slug]);
  return rows[0] || null;
}

/**
 * Create a product plus its variants in one transaction. Images are
 * attached separately (see addImages) once Multer/Cloudinary has
 * finished uploading them.
 */
async function create({
  gameId, category, sellerType, title, description, price, status, isHot,
  collectionCount, bindInfo,
  accountLevel, maxRank, royalePass, maxEmblem, skinCount,
  weaponName, skinName, wearCondition, floatValue, stattrakType, cs2ItemType,
  contactMessenger, variants = [],
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO products
        (game_id, category, seller_type, title, description, price, status, is_hot, collection_count, bind_info,
         account_level, max_rank, royale_pass, max_emblem, skin_count,
         weapon_name, skin_name, wear_condition, float_value, stattrak_type, cs2_item_type, contact_messenger)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING id`,
      [gameId, category, sellerType, title, description, price, status, isHot, collectionCount, bindInfo,
       accountLevel, maxRank, royalePass, maxEmblem, skinCount,
       weaponName, skinName, wearCondition, floatValue, stattrakType || 'none', cs2ItemType, contactMessenger]
    );
    const productId = rows[0].id;

    for (let i = 0; i < variants.length; i += 1) {
      const v = variants[i];
      await client.query(
        `INSERT INTO product_variants (product_id, label, price, duration_hours, sort_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [productId, v.label, v.price, v.durationHours || null, i]
      );
    }

    await client.query('COMMIT');
    return productId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, fields) {
  // Build a dynamic SET clause from whatever fields were actually passed,
  // so PATCH-style partial updates don't require sending the whole row.
  const columnMap = {
    category: 'category',
    sellerType: 'seller_type',
    title: 'title',
    description: 'description',
    price: 'price',
    status: 'status',
    isHot: 'is_hot',
    collectionCount: 'collection_count',
    bindInfo: 'bind_info',
    accountLevel: 'account_level',
    maxRank: 'max_rank',
    royalePass: 'royale_pass',
    maxEmblem: 'max_emblem',
    skinCount: 'skin_count',
    weaponName: 'weapon_name',
    skinName: 'skin_name',
    wearCondition: 'wear_condition',
    floatValue: 'float_value',
    stattrakType: 'stattrak_type',
    cs2ItemType: 'cs2_item_type',
    contactMessenger: 'contact_messenger',
  };

  const sets = [];
  const params = [];
  Object.entries(fields).forEach(([key, value]) => {
    if (columnMap[key] !== undefined && value !== undefined) {
      params.push(value);
      sets.push(`${columnMap[key]} = $${params.length}`);
    }
  });

  if (!sets.length) return findById(id);

  params.push(id);
  await query(`UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  return findById(id);
}

async function replaceVariants(productId, variants = []) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    for (let i = 0; i < variants.length; i += 1) {
      const v = variants[i];
      await client.query(
        `INSERT INTO product_variants (product_id, label, price, duration_hours, sort_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [productId, v.label, v.price, v.durationHours || null, i]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function addImages(productId, images = []) {
  // images: [{ url, publicId }]
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows: existing } = await client.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM product_images WHERE product_id = $1',
      [productId]
    );
    let sort = existing[0].max_sort + 1;
    for (const img of images) {
      await client.query(
        'INSERT INTO product_images (product_id, image_url, public_id, sort_order) VALUES ($1,$2,$3,$4)',
        [productId, img.url, img.publicId || null, sort]
      );
      sort += 1;
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function removeImage(imageId) {
  const { rows } = await query('DELETE FROM product_images WHERE id = $1 RETURNING public_id', [imageId]);
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findGameBySlug,
  create,
  update,
  replaceVariants,
  addImages,
  removeImage,
  remove,
};
