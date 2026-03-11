import Database from 'better-sqlite3';

const db = new Database('game.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE,
    country TEXT,
    password_hash TEXT,
    total_score INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    highest_score_beginner INTEGER DEFAULT 0,
    highest_score_intermediate INTEGER DEFAULT 0,
    highest_score_advanced INTEGER DEFAULT 0,
    plays_today INTEGER DEFAULT 0,
    last_play_date TEXT,
    is_guest INTEGER DEFAULT 0,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    score INTEGER,
    mode TEXT DEFAULT 'beginner',
    play_time INTEGER,
    device_type TEXT,
    timestamp TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Add columns if they don't exist (for existing databases)
try { db.exec("ALTER TABLE users ADD COLUMN highest_score_beginner INTEGER DEFAULT 0;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN highest_score_intermediate INTEGER DEFAULT 0;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN highest_score_advanced INTEGER DEFAULT 0;"); } catch (e) {}
try { db.exec("ALTER TABLE scores ADD COLUMN mode TEXT DEFAULT 'beginner';"); } catch (e) {}

export default db;
