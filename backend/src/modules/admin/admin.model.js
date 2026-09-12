const { query } = require('../../config/db');

async function findByUsername(username) {
  const { rows } = await query('SELECT id, username, password_hash FROM admins WHERE username = $1', [username]);
  return rows[0] || null;
}

module.exports = { findByUsername };
