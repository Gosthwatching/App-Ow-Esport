require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.error('Usage: node scripts/promote-admin.js <username>');
    process.exit(1);
  }

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
  });

  try {
    const result = await pool.query(
      'UPDATE app_users SET "role" = $1 WHERE username = $2 RETURNING id, username, "role"',
      ['admin', username],
    );

    if (result.rowCount === 0) {
      console.error('User not found:', username);
      process.exit(2);
    }

    console.log(JSON.stringify(result.rows[0]));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
