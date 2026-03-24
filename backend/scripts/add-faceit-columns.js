require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

pool
  .query(`
    ALTER TABLE players
      ADD COLUMN IF NOT EXISTS faceit_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS faceit_elo INT,
      ADD COLUMN IF NOT EXISTS faceit_level INT
  `)
  .then(() => {
    console.log('Colonnes faceit ajoutees avec succes');
    pool.end();
  })
  .catch((e) => {
    console.error('Erreur migration:', e.message);
    pool.end();
    process.exit(1);
  });
