require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

const maps = [
  // Control
  { name: 'Antarctic Peninsula', type: 'Control',    code: 'antarctic_peninsula' },
  { name: 'Busan',               type: 'Control',    code: 'busan' },
  { name: 'Ilios',               type: 'Control',    code: 'ilios' },
  { name: 'Lijiang Tower',       type: 'Control',    code: 'lijiang_tower' },
  { name: 'Nepal',               type: 'Control',    code: 'nepal' },
  { name: 'Oasis',               type: 'Control',    code: 'oasis' },
  { name: 'Samoa',               type: 'Control',    code: 'samoa' },
  // Escort
  { name: 'Circuit Royal',       type: 'Escort',     code: 'circuit_royal' },
  { name: 'Dorado',              type: 'Escort',     code: 'dorado' },
  { name: 'Havana',              type: 'Escort',     code: 'havana' },
  { name: 'Junkertown',          type: 'Escort',     code: 'junkertown' },
  { name: 'Rialto',              type: 'Escort',     code: 'rialto' },
  { name: 'Route 66',            type: 'Escort',     code: 'route_66' },
  { name: 'Shambali Monastery',  type: 'Escort',     code: 'shambali' },
  // Hybrid
  { name: 'Blizzard World',      type: 'Hybrid',     code: 'blizzard_world' },
  { name: 'Eichenwalde',         type: 'Hybrid',     code: 'eichenwalde' },
  { name: 'Hollywood',           type: 'Hybrid',     code: 'hollywood' },
  { name: "King's Row",          type: 'Hybrid',     code: 'kings_row' },
  { name: 'Midtown',             type: 'Hybrid',     code: 'midtown' },
  { name: 'Numbani',             type: 'Hybrid',     code: 'numbani' },
  { name: 'Paraíso',             type: 'Hybrid',     code: 'paraiso' },
  // Push
  { name: 'Colosseo',            type: 'Push',       code: 'colosseo' },
  { name: 'Esperança',           type: 'Push',       code: 'esperanca' },
  { name: 'New Queen Street',    type: 'Push',       code: 'new_queen_street' },
  { name: 'Runasapi',            type: 'Push',       code: 'runasapi' },
  { name: 'Hanaoka',             type: 'Push',       code: 'hanaoka' },
  // Flashpoint
  { name: 'New Junk City',       type: 'Flashpoint', code: 'new_junk_city' },
  { name: 'Suravasa',            type: 'Flashpoint', code: 'suravasa' },
];

async function run() {
  // Ensure extra columns exist on the maps table
  await pool.query(`ALTER TABLE maps ADD COLUMN IF NOT EXISTS country   VARCHAR(100)`);
  await pool.query(`ALTER TABLE maps ADD COLUMN IF NOT EXISTS code      VARCHAR(100)`);
  await pool.query(`ALTER TABLE maps ADD COLUMN IF NOT EXISTS image_url TEXT`);
  console.log('Maps table columns ensured.');

  // Create per-user map pool junction table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_map_pools (
      user_id    INT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      map_id     INT NOT NULL REFERENCES maps(id)      ON DELETE CASCADE,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, map_id)
    )
  `);
  console.log('user_map_pools table ensured.');

  // Seed maps
  let inserted = 0;
  for (const map of maps) {
    const res = await pool.query(
      `INSERT INTO maps (name, type, code)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO NOTHING
       RETURNING id`,
      [map.name, map.type, map.code],
    );
    if (res.rowCount > 0) inserted++;
  }
  console.log(`Maps seeded: ${inserted} new / ${maps.length} total`);
  pool.end();
}

run().catch((e) => { console.error(e.message); pool.end(); process.exit(1); });
