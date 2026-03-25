require('dotenv/config');
const { Pool } = require('pg');

// Ensure environment variables are loaded
console.log('DB Config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  passwordSet: !!process.env.DB_PASSWORD
});

const pool = new Pool({
  user: process.env.DB_USER || 'Zed_Is_Better',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'overwatch',
  password: process.env.DB_PASSWORD || 'Gosthw@tching_20040426!!',
  port: Number(process.env.DB_PORT || 5432),
});

async function run() {
  try {
    // Create coaching_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coaching_sessions (
        id SERIAL PRIMARY KEY,
        team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        coach_id INT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        topic VARCHAR(255) NOT NULL,
        scheduled_at TIMESTAMP,
        duration INT DEFAULT 60,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ coaching_sessions table created');

    // Create trainings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        created_by INT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        content TEXT NOT NULL,
        video_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ trainings table created');

    // Create absences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS absences (
        id SERIAL PRIMARY KEY,
        player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        team_id INT REFERENCES teams(id) ON DELETE SET NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason VARCHAR(255),
        approved_by INT REFERENCES app_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ absences table created');

    // Create vods table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vods (
        id SERIAL PRIMARY KEY,
        created_by INT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        team1_name VARCHAR(255),
        team2_name VARCHAR(255),
        team1_score INT,
        team2_score INT,
        map_name VARCHAR(255),
        vod_url VARCHAR(500) NOT NULL,
        duration INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ vods table created');

    await pool.query(`
      ALTER TABLE scrims
      ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb
    `);
    console.log('✓ scrims details column ensured');

    console.log('\n✅ All tables initialized successfully!');
    pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

run();
