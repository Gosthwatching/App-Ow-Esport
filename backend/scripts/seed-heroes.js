require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

const heroes = [
  // Tank
  { name: "D.Va",           role: "Tank",    code: "dva" },
  { name: "Doomfist",       role: "Tank",    code: "doomfist" },
  { name: "Hazard",         role: "Tank",    code: "hazard" },
  { name: "Junker Queen",   role: "Tank",    code: "junkerqueen" },
  { name: "Mauga",          role: "Tank",    code: "mauga" },
  { name: "Orisa",          role: "Tank",    code: "orisa" },
  { name: "Ramattra",       role: "Tank",    code: "ramattra" },
  { name: "Reinhardt",      role: "Tank",    code: "reinhardt" },
  { name: "Roadhog",        role: "Tank",    code: "roadhog" },
  { name: "Sigma",          role: "Tank",    code: "sigma" },
  { name: "Winston",        role: "Tank",    code: "winston" },
  { name: "Wrecking Ball",  role: "Tank",    code: "wreckingball" },
  { name: "Zarya",          role: "Tank",    code: "zarya" },
  // DPS
  { name: "Ashe",           role: "DPS",     code: "ashe" },
  { name: "Bastion",        role: "DPS",     code: "bastion" },
  { name: "Cassidy",        role: "DPS",     code: "cassidy" },
  { name: "Echo",           role: "DPS",     code: "echo" },
  { name: "Freja",          role: "DPS",     code: "freja" },
  { name: "Genji",          role: "DPS",     code: "genji" },
  { name: "Hanzo",          role: "DPS",     code: "hanzo" },
  { name: "Junkrat",        role: "DPS",     code: "junkrat" },
  { name: "Mei",            role: "DPS",     code: "mei" },
  { name: "Pharah",         role: "DPS",     code: "pharah" },
  { name: "Reaper",         role: "DPS",     code: "reaper" },
  { name: "Sojourn",        role: "DPS",     code: "sojourn" },
  { name: "Soldier: 76",    role: "DPS",     code: "soldier76" },
  { name: "Sombra",         role: "DPS",     code: "sombra" },
  { name: "Symmetra",       role: "DPS",     code: "symmetra" },
  { name: "Torbjörn",       role: "DPS",     code: "torbjorn" },
  { name: "Tracer",         role: "DPS",     code: "tracer" },
  { name: "Venture",        role: "DPS",     code: "venture" },
  { name: "Widowmaker",     role: "DPS",     code: "widowmaker" },
  // Support
  { name: "Ana",            role: "Support", code: "ana" },
  { name: "Baptiste",       role: "Support", code: "baptiste" },
  { name: "Brigitte",       role: "Support", code: "brigitte" },
  { name: "Illari",         role: "Support", code: "illari" },
  { name: "Juno",           role: "Support", code: "juno" },
  { name: "Kiriko",         role: "Support", code: "kiriko" },
  { name: "Lifeweaver",     role: "Support", code: "lifeweaver" },
  { name: "Lúcio",          role: "Support", code: "lucio" },
  { name: "Mercy",          role: "Support", code: "mercy" },
  { name: "Moira",          role: "Support", code: "moira" },
  { name: "Zenyatta",       role: "Support", code: "zenyatta" },
];

async function run() {
  await pool.query(`
    ALTER TABLE app_users ADD COLUMN IF NOT EXISTS faceit_nickname VARCHAR(255)
  `);
  console.log('Column faceit_nickname added (or already exists)');

  let inserted = 0;
  for (const hero of heroes) {
    const res = await pool.query(
      `INSERT INTO heroes (name, role, code, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`,
      [hero.name, hero.role, hero.code, `https://d15f34w2p8l1cc.cloudfront.net/overwatch/${hero.code}.png`],
    );
    if (res.rowCount > 0) inserted++;
  }
  console.log(`Heroes seeded: ${inserted} new / ${heroes.length} total`);
  pool.end();
}

run().catch((e) => { console.error(e.message); pool.end(); process.exit(1); });
