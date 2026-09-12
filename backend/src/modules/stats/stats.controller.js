// Dashboard statistics — one round trip, aggregated in SQL rather than
// pulling every row into Node and counting in JS.
const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/ApiResponse');
const { query } = require('../../config/db');

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [totals, byGame, bySeller] = await Promise.all([
    query(`
      SELECT
        COUNT(*)                                   AS total,
        COUNT(*) FILTER (WHERE status = 'available') AS active,
        COUNT(*) FILTER (WHERE status = 'sold')       AS sold,
        COUNT(*) FILTER (WHERE seller_type = 'admin')  AS admin_listings,
        COUNT(*) FILTER (WHERE seller_type = 'user')   AS user_listings
      FROM products
    `),
    query(`
      SELECT g.slug AS game, COUNT(*) AS total
      FROM products p JOIN games g ON g.id = p.game_id
      GROUP BY g.slug
    `),
    query(`
      SELECT category, seller_type, COUNT(*) AS total
      FROM products
      GROUP BY category, seller_type
      ORDER BY category
    `),
  ]);

  ok(res, {
    totals: {
      total: Number(totals.rows[0].total),
      active: Number(totals.rows[0].active),
      sold: Number(totals.rows[0].sold),
      adminListings: Number(totals.rows[0].admin_listings),
      userListings: Number(totals.rows[0].user_listings),
    },
    byGame: byGame.rows.map((r) => ({ game: r.game, total: Number(r.total) })),
    breakdown: bySeller.rows.map((r) => ({
      category: r.category,
      sellerType: r.seller_type,
      total: Number(r.total),
    })),
  });
});

module.exports = { getStats };
