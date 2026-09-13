// Central PostgreSQL connection pool.
// Every module imports `query` (or `pool` for transactions) from here —
// never creates its own `new Pool()`.
const { Pool } = require('pg');

// Managed Postgres providers (Render, Railway, RDS, ...) require SSL on
// any connection that isn't over their own private network — a local
// "postgres://...@localhost/..." never needs it, so key off the host
// instead of NODE_ENV (this also lets a one-off script on a dev machine
// point DATABASE_URL at the production database, e.g. to run a
// migration, without a separate SSL-only config path).
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
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
