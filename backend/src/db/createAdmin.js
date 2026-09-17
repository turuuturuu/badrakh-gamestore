
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
