// HTTP layer for /api/products. Validates input, calls the model,
// shapes the response — never touches SQL directly.
const asyncHandler = require('../../utils/asyncHandler');
const { ApiError, ok } = require('../../utils/ApiResponse');
const productModel = require('./product.model');
const cloudinary = require('../../config/cloudinary');

const VALID_CATEGORIES = ['account', 'topup', 'rental'];
const VALID_SELLER_TYPES = ['admin', 'user'];
const VALID_STATUSES = ['available', 'sold', 'hidden'];
const VALID_WEAR_CONDITIONS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
const VALID_STATTRAK_TYPES = ['none', 'stattrak', 'souvenir'];
const VALID_CS2_ITEM_TYPES = ['knife_glove', 'rifle_pistol', 'agent_other'];

// Shared by createProduct/updateProduct: pulls the CS2 skin fields out of
// req.body and coerces the multipart string values into the right types.
// Empty string means "not set" (e.g. product isn't a CS2 skin) -> null.
function parseCS2Fields(body) {
  const { weaponName, skinName, wearCondition, floatValue, stattrakType, cs2ItemType } = body;

  if (wearCondition && !VALID_WEAR_CONDITIONS.includes(wearCondition)) {
    throw new ApiError(400, `Invalid wearCondition. Expected one of: ${VALID_WEAR_CONDITIONS.join(', ')}`);
  }
  if (stattrakType && !VALID_STATTRAK_TYPES.includes(stattrakType)) {
    throw new ApiError(400, `Invalid stattrakType. Expected one of: ${VALID_STATTRAK_TYPES.join(', ')}`);
  }
  if (cs2ItemType && !VALID_CS2_ITEM_TYPES.includes(cs2ItemType)) {
    throw new ApiError(400, `Invalid cs2ItemType. Expected one of: ${VALID_CS2_ITEM_TYPES.join(', ')}`);
  }

  return {
    weaponName: weaponName || null,
    skinName: skinName || null,
    wearCondition: wearCondition || null,
    floatValue: floatValue !== undefined && floatValue !== '' ? Number(floatValue) : null,
    stattrakType: stattrakType || 'none',
    cs2ItemType: cs2ItemType || null,
  };
}

// Shared by createProduct/updateProduct: PUBG Mobile / MLBB account fields.
// accountLevel is shared by both games; the rest are game-specific (the
// admin form only shows the relevant subset — see ProductForm.jsx), but
// nothing here enforces that server-side since a stray value in the
// "wrong" game's field is harmless (the modal only ever displays the
// fields relevant to that product's own game_slug).
function parseAccountFields(body) {
  const { accountLevel, gameAccountId, maxRank, royalePass, maxEmblem, skinCount } = body;
  return {
    accountLevel: accountLevel !== undefined && accountLevel !== '' ? Number(accountLevel) : null,
    gameAccountId: gameAccountId || null,
    maxRank: maxRank || null,
    royalePass: royalePass || null,
    maxEmblem: maxEmblem || null,
    skinCount: skinCount || null,
  };
}

// GET /api/products?game=cs2&category=account&seller_type=admin&status=available&cs2_item_type=knife_glove
// Public endpoint — powers the game tabs + admin/user sub-tabs on the storefront
// (and, for CS2, the knife/glove | rifle/pistol | agent/other sub-nav).
const listProducts = asyncHandler(async (req, res) => {
  const { game, category, seller_type: sellerType, status, cs2_item_type: cs2ItemType, exclude_cs2: excludeCs2 } = req.query;

  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Expected one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (sellerType && !VALID_SELLER_TYPES.includes(sellerType)) {
    throw new ApiError(400, `Invalid seller_type. Expected one of: ${VALID_SELLER_TYPES.join(', ')}`);
  }
  if (cs2ItemType && !VALID_CS2_ITEM_TYPES.includes(cs2ItemType)) {
    throw new ApiError(400, `Invalid cs2_item_type. Expected one of: ${VALID_CS2_ITEM_TYPES.join(', ')}`);
  }

  // Public storefront should never see hidden/admin-only drafts unless an
  // explicit status was requested by the (already-authenticated) admin UI.
  const products = await productModel.findAll({
    game,
    category,
    sellerType,
    status: status || undefined,
    cs2ItemType,
    excludeCs2: excludeCs2 === 'true',
  });

  ok(res, products);
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  ok(res, product);
});

// POST /api/admin/products  (multipart/form-data, images[] handled by multer upstream)
const createProduct = asyncHandler(async (req, res) => {
  const { gameSlug, category, sellerType, title, description, price, status, isHot, collectionCount, bindInfo, contactMessenger } = req.body;
  const cs2Fields = parseCS2Fields(req.body);
  const accountFields = parseAccountFields(req.body);

  if (!gameSlug || !category || !title || price === undefined) {
    throw new ApiError(400, 'gameSlug, category, title and price are required');
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Expected one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (sellerType && !VALID_SELLER_TYPES.includes(sellerType)) {
    throw new ApiError(400, `Invalid seller_type. Expected one of: ${VALID_SELLER_TYPES.join(', ')}`);
  }

  const game = await productModel.findGameBySlug(gameSlug);
  if (!game) throw new ApiError(400, `Unknown game: ${gameSlug}`);

  // variants may arrive as a JSON string (multipart form fields are all strings)
  let variants = [];
  if (req.body.variants) {
    try {
      variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    } catch {
      throw new ApiError(400, 'variants must be valid JSON');
    }
  }

  const productId = await productModel.create({
    gameId: game.id,
    category,
    sellerType: sellerType || 'admin',
    title,
    description,
    price: Number(price),
    status: status || 'available',
    isHot: isHot === 'true' || isHot === true,
    collectionCount: collectionCount ? Number(collectionCount) : null,
    bindInfo: bindInfo || null,
    ...accountFields,
    ...cs2Fields,
    contactMessenger,
    variants,
  });

  // req.files comes from multer-storage-cloudinary — already uploaded.
  if (req.files && req.files.length) {
    await productModel.addImages(
      productId,
      req.files.map((f) => ({ url: f.path, publicId: f.filename }))
    );
  }

  const created = await productModel.findById(productId);
  ok(res, created, 201);
});

// PUT /api/admin/products/:id  (multipart/form-data — new images optional)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await productModel.findById(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  const { category, sellerType, title, description, price, status, isHot, collectionCount, bindInfo, contactMessenger } = req.body;
  const cs2Fields = parseCS2Fields(req.body);
  const accountFields = parseAccountFields(req.body);

  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Expected one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (sellerType && !VALID_SELLER_TYPES.includes(sellerType)) {
    throw new ApiError(400, `Invalid seller_type. Expected one of: ${VALID_SELLER_TYPES.join(', ')}`);
  }
  if (status && !VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Expected one of: ${VALID_STATUSES.join(', ')}`);
  }

  const updated = await productModel.update(id, {
    category,
    sellerType,
    title,
    description,
    price: price !== undefined ? Number(price) : undefined,
    status,
    isHot: isHot !== undefined ? (isHot === 'true' || isHot === true) : undefined,
    collectionCount: collectionCount !== undefined ? Number(collectionCount) : undefined,
    bindInfo,
    ...accountFields,
    ...cs2Fields,
    contactMessenger,
  });

  if (req.body.variants) {
    let variants;
    try {
      variants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
    } catch {
      throw new ApiError(400, 'variants must be valid JSON');
    }
    await productModel.replaceVariants(id, variants);
  }

  if (req.files && req.files.length) {
    await productModel.addImages(
      id,
      req.files.map((f) => ({ url: f.path, publicId: f.filename }))
    );
  }

  const fresh = await productModel.findById(id);
  ok(res, fresh);
});

// PATCH /api/admin/products/:id/status  { status: 'sold' | 'available' | 'hidden' }
// Dedicated fast-path for the "toggle sold/available" action in the admin table.
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Expected one of: ${VALID_STATUSES.join(', ')}`);
  }
  const updated = await productModel.update(req.params.id, { status });
  if (!updated) throw new ApiError(404, 'Product not found');
  ok(res, updated);
});

// DELETE /api/admin/products/:id/images/:imageId
const deleteImage = asyncHandler(async (req, res) => {
  const removed = await productModel.removeImage(req.params.imageId);
  if (!removed) throw new ApiError(404, 'Image not found');
  if (removed.public_id) {
    await cloudinary.uploader.destroy(removed.public_id).catch(() => null);
  }
  ok(res, { deleted: true });
});

// DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  // best-effort Cloudinary cleanup — DB rows are removed regardless via ON DELETE CASCADE
  const images = await require('../../config/db').query(
    'SELECT public_id FROM product_images WHERE product_id = $1',
    [req.params.id]
  );
  await Promise.all(
    images.rows.filter((r) => r.public_id).map((r) => cloudinary.uploader.destroy(r.public_id).catch(() => null))
  );

  await productModel.remove(req.params.id);
  ok(res, { deleted: true });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateStatus,
  deleteImage,
  deleteProduct,
};
