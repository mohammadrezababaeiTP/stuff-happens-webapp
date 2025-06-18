import Database from 'better-sqlite3';
// This just opens (or creates) the SQLite database file
const db = new Database('database.sqlite');

// // Users table - holds all the user accounts (username, password, salt, etc.)
db.prepare(`
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    salt TEXT NOT NULL
  )
`).run();

// Cards table - this is all the possible game cards with their info
db.prepare(`
  CREATE TABLE IF NOT EXISTS Cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    bad_luck_index REAL NOT NULL UNIQUE,
    theme TEXT NOT NULL
  )
`).run();

// Games table - each game session for a user
db.prepare(`
  CREATE TABLE IF NOT EXISTS Games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    start_time TEXT DEFAULT CURRENT_TIMESTAMP,
    end_time TEXT,
    outcome TEXT CHECK(outcome IN ('win', 'lose', 'in-progress')) NOT NULL DEFAULT 'in-progress',
    FOREIGN KEY(user_id) REFERENCES Users(id)
  )
`).run();
// GameCards table - log of all cards played/used per game and per round
db.prepare(`
  CREATE TABLE IF NOT EXISTS GameCards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    card_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    won INTEGER NOT NULL CHECK(won IN (0, 1)),
    FOREIGN KEY(game_id) REFERENCES Games(id),
    FOREIGN KEY(card_id) REFERENCES Cards(id)
  )
`).run();
// Just a quick message so I know everything ran fine
console.log('✅ Database and tables created!');
