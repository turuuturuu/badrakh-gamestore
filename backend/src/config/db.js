// Central PostgreSQL connection pool.
// Every module imports `query` (or `pool` for transactions) from here —
// never creates its own `new Pool()`.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // small, sane defaults; tune via env vars if the deployment needs more
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  // a background/idle client crashed — log, don't crash the whole API
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Run a parameterized query.
 * @param {string} text - SQL with $1, $2... placeholders
 * @param {Array} params
 */
function query(text, params) {
  return pool.query(text, params);
}

/**
 * Get a single client for multi-statement transactions.
 * Caller MUST release() it when done.
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { pool, query, getClient };
