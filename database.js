// database.js
// Uses SQLite (via better-sqlite3) — a real, file-based database.
// No separate database server needed to install; the file sunami.db
// is created automatically the first time the server runs.

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'sunami.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_type   TEXT NOT NULL,
    adults        INTEGER DEFAULT 0,
    kids          INTEGER DEFAULT 0,
    group_size    INTEGER DEFAULT 0,
    food_items    TEXT DEFAULT '[]',
    total_amount  INTEGER NOT NULL,
    visitor_name  TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_email TEXT,
    visit_date    TEXT NOT NULL,
    notes         TEXT,
    status        TEXT DEFAULT 'pending',
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_name  TEXT NOT NULL,
    reviewer_visit TEXT,
    rating         INTEGER NOT NULL,
    review_text    TEXT NOT NULL,
    approved       INTEGER DEFAULT 0,
    created_at     TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
