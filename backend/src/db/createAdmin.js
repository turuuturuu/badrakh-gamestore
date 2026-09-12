// Creates (or resets the password of) an admin account, using the
// project's own bcryptjs dependency to hash the password correctly —
// this replaces the old approach of embedding a pre-computed hash
// literal in schema.sql, which is impossible to eyeball-verify and
// easy to get wrong.
//
// Usage:
//   node src/db/createAdmin.js [username] [password]
//   npm run create-admin -- myAdminName aStrongerPassword
//
// With no arguments it upserts username "admin" / password "admin123"
// (the same default the README documents) — change the password
// immediately after first login in a real deployment.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');

async function main() {
  const [, , usernameArg, passwordArg] = process.argv;
  const username = usernameArg || 'admin';
  const password = passwordArg || 'admin123';

  const passwordHash = await bcrypt.hash(password, 10);

  await query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash]
  );

  console.log(`✔ Admin "${username}" is ready with the password you provided.`);
}

main()
  .catch((err) => {
    console.error('Failed to create/update admin:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
