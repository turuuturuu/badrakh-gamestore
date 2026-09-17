
const { Pool } = require('pg');

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


async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { pool, query, getClient };
