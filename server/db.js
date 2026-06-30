import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "users.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    google_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    account TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

try {
  db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT`);
} catch {
  /* column exists */
}

export function findUserByGoogleId(googleId) {
  return db.prepare("SELECT id, email, name, created_at FROM users WHERE google_id = ?").get(googleId);
}

export function findOrCreateGoogleUser(email, name, googleId) {
  const existing = findUserByEmail(email);
  if (existing) {
    if (googleId && !existing.google_id) {
      db.prepare("UPDATE users SET google_id = ?, name = CASE WHEN name = '' THEN ? ELSE name END WHERE id = ?").run(
        googleId,
        name || "",
        existing.id
      );
    }
    return findUserById(existing.id);
  }
  const result = db
    .prepare("INSERT INTO users (email, password_hash, name, google_id) VALUES (?, '', ?, ?)")
    .run(email, name || "", googleId || null);
  return findUserById(result.lastInsertRowid);
}

export function findUserByEmail(email) {
  return db
    .prepare("SELECT id, email, password_hash, name, google_id, created_at FROM users WHERE email = ?")
    .get(email);
}

export function findUserById(id) {
  return db
    .prepare("SELECT id, email, name, google_id, password_hash, created_at FROM users WHERE id = ?")
    .get(id);
}

export function updateUserName(id, name) {
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, id);
  return findUserById(id);
}

export function updateUserPassword(id, passwordHash) {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
  return findUserById(id);
}

export function createUser(email, passwordHash, name = "") {
  const result = db
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
    .run(email, passwordHash, name);
  return findUserById(result.lastInsertRowid);
}

export function saveContactMessage({ name, email, account = "", subject, message }) {
  const result = db
    .prepare(
      "INSERT INTO contact_messages (name, email, account, subject, message) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name, email, account, subject, message);
  return result.lastInsertRowid;
}

export default db;
